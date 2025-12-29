"""Compliance routes"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import logging
from bson import ObjectId

from utils.serializers import serialize_doc, to_object_id
from utils.auth import decode_token
from utils.dependencies import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

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

@router.get("/{plan_id}/compliance")
async def get_compliance_report(plan_id: str, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Get compliance report for a plan"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": to_object_id(plan_id), "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    report = await db.compliance_reports.find_one({"plan_id": plan_id})
    if not report:
        raise HTTPException(status_code=404, detail="Compliance report not found. Please generate the plan first.")
    
    # Ensure the report has the expected structure
    serialized = serialize_doc(report)
    
    # Validate that the data field exists
    if "data" not in serialized:
        logger.warning(f"Compliance report for plan {plan_id} missing 'data' field")
        raise HTTPException(
            status_code=500, 
            detail="Compliance report data is malformed. Please regenerate the plan."
        )
    
    # Return the serialized report (frontend expects complianceData.data)
    return serialized
