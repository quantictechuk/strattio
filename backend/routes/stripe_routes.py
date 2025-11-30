"""Stripe payment integration routes"""

from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
import logging
import os

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)

from utils.serializers import serialize_doc, to_object_id
from utils.auth import decode_token

router = APIRouter()
logger = logging.getLogger(__name__)

from server import db

# Stripe API Key from environment
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")

# Subscription tier pricing (FIXED - never accept from frontend)
SUBSCRIPTION_PACKAGES = {
    "starter": {
        "name": "Starter",
        "amount": 12.00,
        "currency": "gbp",
        "plan_limit": 3,
        "features": ["3 plans/month", "PDF export", "Full AI", "SWOT analysis"]
    },
    "professional": {
        "name": "Professional",
        "amount": 29.00,
        "currency": "gbp",
        "plan_limit": 999999,  # Unlimited
        "features": ["Unlimited plans", "All exports", "Financials", "Compliance", "Pitch deck"]
    },
    "enterprise": {
        "name": "Enterprise",
        "amount": 99.00,
        "currency": "gbp",
        "plan_limit": 999999,
        "features": ["Everything in Professional", "Team seats", "API access", "White-label"]
    }
}

async def get_current_user_id(authorization: Optional[str] = Header(None)):
    """Extract user_id from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split()
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")

class CheckoutRequest(BaseModel):
    package_id: str
    origin_url: str

@router.post("/checkout/session")
async def create_checkout_session(checkout_req: CheckoutRequest, user_id: str = Depends(get_current_user_id)):
    """
    Create Stripe checkout session for subscription upgrade.
    SECURITY: Amount is determined server-side from SUBSCRIPTION_PACKAGES.
    """
    
    # Validate package
    if checkout_req.package_id not in SUBSCRIPTION_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid subscription package")
    
    package = SUBSCRIPTION_PACKAGES[checkout_req.package_id]
    
    # Get user info
    user = await db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Build dynamic success/cancel URLs from frontend origin
    # Use CHECKOUT_SESSION_ID as placeholder (Stripe will replace it)
    success_url = f"{checkout_req.origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.origin_url}/subscription/cancel"
    
    # Create webhook URL (use request to get actual host)
    # For now, use a placeholder - will be configured in Stripe dashboard
    webhook_url = f"{checkout_req.origin_url}/api/webhook/stripe"
    
    try:
        # Initialize Stripe checkout
        stripe_checkout = StripeCheckout(
            api_key=STRIPE_API_KEY,
            webhook_url=webhook_url
        )
        
        # Create checkout session request
        session_request = CheckoutSessionRequest(
            amount=package["amount"],
            currency=package["currency"],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user_id,
                "user_email": user.get("email"),
                "package_id": checkout_req.package_id,
                "tier": checkout_req.package_id,
                "plan_limit": str(package["plan_limit"])
            },
            payment_methods=["card"]
        )
        
        # Create checkout session
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(session_request)
        
        # MANDATORY: Create payment transaction record
        transaction_doc = {
            "user_id": user_id,
            "user_email": user.get("email"),
            "session_id": session.session_id,
            "package_id": checkout_req.package_id,
            "tier": checkout_req.package_id,
            "amount": package["amount"],
            "currency": package["currency"],
            "payment_status": "pending",
            "status": "initiated",
            "metadata": session_request.metadata,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.payment_transactions.insert_one(transaction_doc)
        
        logger.info(f"Checkout session created for user {user_id}: {session.session_id}")
        
        return {
            "url": session.url,
            "session_id": session.session_id
        }
        
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

@router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Get checkout session status and update subscription if paid.
    Implements polling mechanism as per playbook.
    """
    
    try:
        # Initialize Stripe
        stripe_checkout = StripeCheckout(
            api_key=STRIPE_API_KEY,
            webhook_url=""  # Not needed for status check
        )
        
        # Get status from Stripe
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Find transaction record
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Verify user owns this transaction
        if transaction.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
        
        # Check if already processed (prevent double-processing)
        if transaction.get("payment_status") == "paid" and transaction.get("processed") == True:
            logger.info(f"Payment already processed for session {session_id}")
            return serialize_doc(transaction)
        
        # Update transaction record
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": status.payment_status,
                "status": status.status,
                "amount_total": status.amount_total,
                "currency": status.currency,
                "updated_at": datetime.utcnow()
            }}
        )
        
        # If payment successful and not yet processed, upgrade subscription
        if status.payment_status == "paid" and not transaction.get("processed"):
            logger.info(f"Processing successful payment for session {session_id}")
            
            # Get package details from metadata
            tier = status.metadata.get("tier") or transaction.get("tier")
            plan_limit = int(status.metadata.get("plan_limit", "999999"))
            
            # Update subscription
            await db.subscriptions.update_one(
                {"user_id": user_id},
                {"$set": {
                    "tier": tier,
                    "status": "active",
                    "plan_limit": plan_limit,
                    "stripe_session_id": session_id,
                    "current_period_start": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }}
            )
            
            # Mark transaction as processed
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "processed": True,
                    "processed_at": datetime.utcnow()
                }}
            )
            
            logger.info(f"Subscription upgraded to {tier} for user {user_id}")
        
        # Return updated transaction
        updated_transaction = await db.payment_transactions.find_one({"session_id": session_id})
        return serialize_doc(updated_transaction)
        
    except Exception as e:
        logger.error(f"Error checking checkout status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events.
    """
    
    try:
        # Get request body and signature
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        # Initialize Stripe
        stripe_checkout = StripeCheckout(
            api_key=STRIPE_API_KEY,
            webhook_url=""  # Not needed
        )
        
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        logger.info(f"Webhook received: {webhook_response.event_type} - {webhook_response.event_id}")
        
        # Process based on event type
        if webhook_response.event_type == "checkout.session.completed":
            # Update transaction status
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "payment_status": webhook_response.payment_status,
                    "webhook_received": True,
                    "webhook_event_id": webhook_response.event_id,
                    "updated_at": datetime.utcnow()
                }}
            )
        
        return {"status": "success", "event_type": webhook_response.event_type}
        
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
