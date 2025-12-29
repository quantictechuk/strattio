"""Exports routes - PDF generation"""

from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import logging
from datetime import datetime
import os
from bson import ObjectId
from pathlib import Path

from utils.serializers import serialize_doc, to_object_id
from utils.auth import decode_token
from utils.audit_logger import AuditLogger
from utils.pdf_generator import generate_business_plan_pdf
from utils.docx_generator import generate_business_plan_docx
from utils.markdown_generator import generate_business_plan_markdown
from utils.dependencies import get_db
import logging

logger = logging.getLogger(__name__)

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

class ExportCreate(BaseModel):
    plan_id: str
    format: str

@router.post("")
async def create_export(export_data: ExportCreate, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Create an export job and generate PDF"""
    
    plan_id = export_data.plan_id
    format = export_data.format
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": to_object_id(plan_id), "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Check if plan is complete
    if plan.get("status") != "complete":
        raise HTTPException(status_code=400, detail="Plan must be generated before exporting")
    
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
    
    # Validate format
    valid_formats = ["pdf", "docx", "markdown", "md"]
    if format not in valid_formats:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid format. Supported formats: {', '.join(valid_formats)}"
        )
    
    try:
        # Get plan sections
        sections = await db.sections.find({"plan_id": plan_id}).sort("order_index", 1).to_list(100)
        if not sections:
            raise HTTPException(status_code=400, detail="No sections found. Generate plan first.")
        
        # Get financial model
        financial_model = await db.financial_models.find_one({"plan_id": plan_id})
        
        plan_data_serialized = serialize_doc(plan)
        sections_data_serialized = [serialize_doc(s) for s in sections]
        financial_data_serialized = serialize_doc(financial_model) if financial_model else None
        
        # Generate export based on format
        if format == "pdf":
            logger.info(f"Generating PDF for plan {plan_id}")
            file_path = generate_business_plan_pdf(
                plan_data=plan_data_serialized,
                sections_data=sections_data_serialized,
                financial_data=financial_data_serialized
            )
        elif format == "docx":
            logger.info(f"Generating DOCX for plan {plan_id}")
            file_path = generate_business_plan_docx(
                plan_data=plan_data_serialized,
                sections_data=sections_data_serialized,
                financial_data=financial_data_serialized
            )
        elif format in ["markdown", "md"]:
            logger.info(f"Generating Markdown for plan {plan_id}")
            file_path = generate_business_plan_markdown(
                plan_data=plan_data_serialized,
                sections_data=sections_data_serialized,
                financial_data=financial_data_serialized
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")
        
        # Create export record
        export_doc = {
            "plan_id": plan_id,
            "user_id": user_id,
            "format": format,
            "status": "complete",
            "file_path": file_path,
            "file_name": os.path.basename(file_path),
            "download_count": 0,
            "created_at": datetime.utcnow()
        }
        
        result = await db.exports.insert_one(export_doc)
        export_doc["_id"] = result.inserted_id
        
        # Log activity
        await AuditLogger.log_activity(
            db=db,
            user_id=user_id,
            activity_type="export_created",
            entity_type="plan",
            entity_id=plan_id,
            details={"format": format, "file_name": export_doc["file_name"]}
        )
        
        logger.info(f"Export created: {export_doc['file_name']}")
        
        return serialize_doc(export_doc)
        
    except Exception as e:
        logger.error(f"Export generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate export: {str(e)}")

@router.get("/{export_id}/download")
async def download_export(export_id: str, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Download an export file"""
    
    export = await db.exports.find_one({"_id": to_object_id(export_id), "user_id": user_id})
    if not export:
        raise HTTPException(status_code=404, detail="Export not found")
    
    file_path = export.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Export file not found")
    
    # Increment download count
    await db.exports.update_one(
        {"_id": to_object_id(export_id)},
        {"$inc": {"download_count": 1}}
    )
    
    return FileResponse(
        path=file_path,
        filename=export.get("file_name", "business_plan.pdf"),
        media_type="application/pdf"
    )

@router.get("")
async def list_exports(user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """List all exports for current user"""
    
    exports = await db.exports.find({"user_id": user_id}).sort("created_at", -1).to_list(50)
    return {"exports": [serialize_doc(e) for e in exports]}
