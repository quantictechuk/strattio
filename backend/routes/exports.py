"""Exports routes - PDF generation"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import logging
from datetime import datetime
import os

from utils.serializers import serialize_doc

router = APIRouter()
logger = logging.getLogger(__name__)

from server import db

@router.post("/")
async def create_export(plan_id: str, format: str, user_id: str):
    """Create an export job"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": plan_id, "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Check subscription tier for format access
    subscription = await db.subscriptions.find_one({"user_id": user_id})
    if not subscription:
        raise HTTPException(status_code=403, detail="No subscription found")
    
    # Free tier: no exports
    if subscription["tier"] == "free" and format != "preview":
        raise HTTPException(
            status_code=403,
            detail="Upgrade to export plans. Free tier: preview only."
        )
    
    # Create export record
    export_doc = {
        "plan_id": plan_id,
        "user_id": user_id,
        "format": format,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    result = await db.exports.insert_one(export_doc)
    export_doc["_id"] = result.inserted_id
    
    # For MVP: Return placeholder
    # In full version: Generate actual PDF with ReportLab
    
    logger.info(f"Export created: {format} for plan {plan_id}")
    
    return serialize_doc(export_doc)

@router.get("/{export_id}/download")
async def download_export(export_id: str, user_id: str):
    """Download an export file"""
    
    export = await db.exports.find_one({"_id": export_id, "user_id": user_id})
    if not export:
        raise HTTPException(status_code=404, detail="Export not found")
    
    # For MVP: Return placeholder message
    # In full version: Serve actual file from storage
    
    return {
        "message": "Export download ready",
        "export_id": export_id,
        "format": export.get("format"),
        "download_url": f"/api/exports/{export_id}/file"
    }
