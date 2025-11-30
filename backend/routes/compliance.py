"""Compliance routes"""

from fastapi import APIRouter, HTTPException
import logging

from utils.serializers import serialize_doc

router = APIRouter()
logger = logging.getLogger(__name__)

from server import db

@router.get("/{plan_id}/compliance")
async def get_compliance_report(plan_id: str, user_id: str):
    """Get compliance report for a plan"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": plan_id, "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    report = await db.compliance_reports.find_one({"plan_id": plan_id})
    if not report:
        raise HTTPException(status_code=404, detail="Compliance report not found")
    
    return serialize_doc(report)
