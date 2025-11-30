"""Financials routes"""

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

@router.get("/{plan_id}/financials")
async def get_financials(plan_id: str, user_id: str = Depends(get_current_user_id)):
    """Get financial model for a plan"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": plan_id, "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    financial_model = await db.financial_models.find_one({"plan_id": plan_id})
    if not financial_model:
        raise HTTPException(status_code=404, detail="Financial model not found")
    
    return serialize_doc(financial_model)
