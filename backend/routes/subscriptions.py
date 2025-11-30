"""Subscriptions routes - Usage tracking and limits"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import logging

from utils.serializers import serialize_doc
from utils.auth import decode_token

router = APIRouter()
logger = logging.getLogger(__name__)

from server import db

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

@router.get("/current")
async def get_current_subscription(user_id: str = Depends(get_current_user_id)):
    """Get current user subscription"""
    
    subscription = await db.subscriptions.find_one({"user_id": user_id})
    if not subscription:
        # Create default free subscription
        subscription = {
            "user_id": user_id,
            "tier": "free",
            "status": "active",
            "plans_created_this_month": 0,
            "plan_limit": 1
        }
        await db.subscriptions.insert_one(subscription)
    
    return serialize_doc(subscription)

@router.get("/usage")
async def get_usage_stats(user_id: str = Depends(get_current_user_id)):
    """Get usage statistics"""
    
    subscription = await db.subscriptions.find_one({"user_id": user_id})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    plans_count = await db.plans.count_documents({"user_id": user_id})
    
    return {
        "tier": subscription.get("tier", "free"),
        "plans_created_this_month": subscription.get("plans_created_this_month", 0),
        "plan_limit": subscription.get("plan_limit", 1),
        "total_plans": plans_count,
        "usage_percentage": int((subscription.get("plans_created_this_month", 0) / subscription.get("plan_limit", 1)) * 100)
    }
