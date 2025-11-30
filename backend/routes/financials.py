"""Financials routes"""

from fastapi import APIRouter, HTTPException
import logging

from utils.serializers import serialize_doc

router = APIRouter()
logger = logging.getLogger(__name__)

from server import db

@router.get("/{plan_id}/financials")
async def get_financials(plan_id: str, user_id: str):
    """Get financial model for a plan"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": plan_id, "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    financial_model = await db.financial_models.find_one({"plan_id": plan_id})
    if not financial_model:
        raise HTTPException(status_code=404, detail="Financial model not found")
    
    return serialize_doc(financial_model)
