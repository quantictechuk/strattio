"""RevenueCat IAP integration routes for iOS subscriptions"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
import logging
import os
import hmac
import hashlib
import json

from utils.serializers import serialize_doc, to_object_id
from utils.dependencies import get_db
from utils.admin import get_current_user_id

router = APIRouter()
logger = logging.getLogger(__name__)

# RevenueCat webhook secret from environment
REVENUECAT_WEBHOOK_SECRET = os.environ.get("REVENUECAT_WEBHOOK_SECRET")

# Map RevenueCat product IDs to subscription tiers
# Update these with your actual App Store product IDs
REVENUECAT_PRODUCT_MAPPING = {
    "com.strattio.starter.monthly": "starter",
    "com.strattio.professional.monthly": "professional",
    "com.strattio.enterprise.monthly": "enterprise",
    # Add more product IDs as needed
}

# Map tiers to plan limits (same as Stripe)
TIER_PLAN_LIMITS = {
    "free": 1,
    "starter": 3,
    "professional": 999999,  # Unlimited
    "enterprise": 999999,    # Unlimited
}

class RevenueCatLinkRequest(BaseModel):
    revenucat_user_id: str

@router.post("/webhook/revenucat")
async def revenucat_webhook(request: Request, db = Depends(get_db)):
    """
    Handle RevenueCat webhook events for iOS subscriptions.
    Updates subscription tier in database when iOS user purchases.
    
    RevenueCat sends webhooks for:
    - INITIAL_PURCHASE: First subscription purchase
    - RENEWAL: Subscription renewed
    - CANCELLATION: Subscription cancelled
    - UNCANCELLATION: Cancelled subscription reactivated
    - BILLING_ISSUE: Payment failed
    - PRODUCT_CHANGE: User upgraded/downgraded
    """
    try:
        body = await request.body()
        body_str = body.decode('utf-8')
        
        # RevenueCat sends Authorization header with signature
        authorization = request.headers.get("Authorization", "")
        
        # Verify webhook signature
        if REVENUECAT_WEBHOOK_SECRET and not _verify_revenucat_signature(body, authorization):
            logger.warning("Invalid RevenueCat webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Parse event
        try:
            event = json.loads(body_str)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON")
        
        event_type = event.get("event", {}).get("type")
        app_user_id = event.get("event", {}).get("app_user_id")
        
        logger.info(f"RevenueCat webhook received: {event_type} for user {app_user_id}")
        
        # Handle subscription events
        if event_type in [
            "INITIAL_PURCHASE",
            "RENEWAL", 
            "CANCELLATION",
            "UNCANCELLATION",
            "BILLING_ISSUE",
            "PRODUCT_CHANGE"
        ]:
            await _process_subscription_event(event, db)
        else:
            logger.info(f"Unhandled RevenueCat event type: {event_type}")
        
        return {"status": "success", "event_type": event_type}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"RevenueCat webhook error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

async def _process_subscription_event(event: Dict, db):
    """Process RevenueCat subscription event and update database"""
    event_data = event.get("event", {})
    app_user_id = event_data.get("app_user_id")
    
    if not app_user_id:
        logger.warning("No app_user_id in RevenueCat event")
        return
    
    # Find user mapping (RevenueCat user ID -> your user_id)
    user_mapping = await db.revenucat_user_mappings.find_one({"revenucat_user_id": app_user_id})
    
    if not user_mapping:
        logger.warning(f"No user mapping found for RevenueCat user: {app_user_id}")
        # Try to find by original_app_user_id if set during login
        # RevenueCat allows setting original_app_user_id when calling logIn()
        # If you set it to your user_id, we can use it directly
        user_id = event_data.get("original_app_user_id")
        if not user_id:
            logger.error(f"Cannot process event: no user mapping for {app_user_id}")
            return
    else:
        user_id = user_mapping["user_id"]
    
    # Get subscription info from RevenueCat event
    entitlements = event_data.get("entitlements", {})
    product_id = event_data.get("product_id", "")
    event_type = event_data.get("type")
    
    # Determine tier from product ID or entitlements
    tier = "free"
    if product_id:
        tier = REVENUECAT_PRODUCT_MAPPING.get(product_id, "free")
    elif entitlements:
        # Check entitlements for active subscription
        for entitlement_id, entitlement_data in entitlements.items():
            if entitlement_data.get("is_active", False):
                # Map entitlement to tier (configure in RevenueCat dashboard)
                # Common pattern: entitlement_id matches tier name
                potential_tier = entitlement_id.lower()
                if potential_tier in TIER_PLAN_LIMITS:
                    tier = potential_tier
                    break
    
    # Determine status based on event type
    status = "active"
    if event_type == "CANCELLATION":
        status = "cancelled"
    elif event_type == "BILLING_ISSUE":
        status = "past_due"
    elif event_type in ["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE"]:
        status = "active"
    
    # Get plan limit based on tier
    plan_limit = TIER_PLAN_LIMITS.get(tier, 1)
    
    # Update subscription in database (same structure as Stripe)
    update_data = {
        "tier": tier,
        "status": status,
        "plan_limit": plan_limit,
        "revenucat_user_id": app_user_id,
        "revenucat_product_id": product_id if product_id else None,
        "updated_at": datetime.utcnow()
    }
    
    # Set period dates if available
    expires_date = event_data.get("expires_date")
    if expires_date:
        try:
            update_data["current_period_end"] = datetime.fromisoformat(expires_date.replace('Z', '+00:00'))
        except:
            pass
    
    purchase_date = event_data.get("purchase_date")
    if purchase_date:
        try:
            update_data["current_period_start"] = datetime.fromisoformat(purchase_date.replace('Z', '+00:00'))
        except:
            pass
    
    # Update or create subscription
    subscription = await db.subscriptions.find_one({"user_id": user_id})
    if subscription:
        await db.subscriptions.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        logger.info(f"Subscription updated for user {user_id}: tier={tier}, status={status}")
    else:
        # Create new subscription if doesn't exist
        update_data.update({
            "user_id": user_id,
            "plans_created_this_month": 0,
            "created_at": datetime.utcnow()
        })
        await db.subscriptions.insert_one(update_data)
        logger.info(f"Subscription created for user {user_id}: tier={tier}, status={status}")
    
    # Also update user's subscription_tier for consistency
    await db.users.update_one(
        {"_id": to_object_id(user_id)},
        {"$set": {"subscription_tier": tier, "updated_at": datetime.utcnow()}}
    )
    
    # Log payment transaction (for admin analytics)
    if event_type in ["INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE"]:
        transaction_doc = {
            "user_id": user_id,
            "payment_provider": "revenucat",
            "revenucat_user_id": app_user_id,
            "product_id": product_id,
            "tier": tier,
            "status": "completed",
            "payment_status": "paid",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.payment_transactions.insert_one(transaction_doc)

def _verify_revenucat_signature(body: bytes, authorization: str) -> bool:
    """
    Verify RevenueCat webhook signature.
    RevenueCat sends Authorization header with format: "Bearer <signature>"
    """
    if not REVENUECAT_WEBHOOK_SECRET:
        logger.warning("REVENUECAT_WEBHOOK_SECRET not set, skipping signature verification")
        return True  # Skip verification in development
    
    if not authorization:
        return False
    
    # Extract signature from "Bearer <signature>"
    try:
        _, signature = authorization.split(" ", 1)
    except ValueError:
        return False
    
    # RevenueCat uses HMAC SHA256
    expected_signature = hmac.new(
        REVENUECAT_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

@router.post("/link")
async def link_revenucat_user(
    link_data: RevenueCatLinkRequest,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """
    Link RevenueCat user ID to your user account.
    Call this after user logs in and RevenueCat is initialized in iOS app.
    """
    revenucat_user_id = link_data.revenucat_user_id
    
    # Check if mapping already exists
    existing = await db.revenucat_user_mappings.find_one({"revenucat_user_id": revenucat_user_id})
    if existing:
        if existing["user_id"] != user_id:
            raise HTTPException(
                status_code=400,
                detail="RevenueCat user already linked to another account"
            )
        return {"message": "Already linked", "user_id": user_id}
    
    # Create mapping
    mapping_doc = {
        "user_id": user_id,
        "revenucat_user_id": revenucat_user_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.revenucat_user_mappings.insert_one(mapping_doc)
    
    logger.info(f"RevenueCat user {revenucat_user_id} linked to user {user_id}")
    
    return {
        "message": "RevenueCat user linked successfully",
        "user_id": user_id,
        "revenucat_user_id": revenucat_user_id
    }

@router.get("/status")
async def get_revenucat_status(
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """
    Get RevenueCat subscription status for current user.
    Returns subscription info synced from RevenueCat webhooks.
    """
    subscription = await db.subscriptions.find_one({"user_id": user_id})
    
    if not subscription:
        return {
            "has_subscription": False,
            "tier": "free",
            "status": "active"
        }
    
    return {
        "has_subscription": True,
        "tier": subscription.get("tier", "free"),
        "status": subscription.get("status", "active"),
        "plan_limit": subscription.get("plan_limit", 1),
        "revenucat_user_id": subscription.get("revenucat_user_id"),
        "revenucat_product_id": subscription.get("revenucat_product_id"),
        "current_period_start": subscription.get("current_period_start"),
        "current_period_end": subscription.get("current_period_end")
    }
