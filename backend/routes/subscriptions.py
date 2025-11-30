"""Subscriptions routes - Usage tracking and limits"""

from fastapi import APIRouter, HTTPException
import logging

from utils.serializers import serialize_doc

router = APIRouter()
logger = logging.getLogger(__name__)

from server import db

@router.get("/current")
async def get_current_subscription(user_id: str):
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
async def get_usage_stats(user_id: str):
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
