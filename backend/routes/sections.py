"""Sections routes - View and edit plan sections"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
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

class SectionUpdate(BaseModel):
    content: str

@router.get("/{plan_id}/sections")
async def get_sections(plan_id: str, user_id: str = Depends(get_current_user_id)):
    """Get all sections for a plan"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": plan_id, "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    sections = await db.sections.find({"plan_id": plan_id}).sort("order_index", 1).to_list(100)
    
    return {"sections": [serialize_doc(s) for s in sections]}

@router.get("/{plan_id}/sections/{section_id}")
async def get_section(plan_id: str, section_id: str, user_id: str = Depends(get_current_user_id)):
    """Get a specific section"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": plan_id, "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    section = await db.sections.find_one({"_id": section_id, "plan_id": plan_id})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    return serialize_doc(section)

@router.patch("/{plan_id}/sections/{section_id}")
async def update_section(plan_id: str, section_id: str, section_update: SectionUpdate, user_id: str = Depends(get_current_user_id)):
    """Update section content"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": plan_id, "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    result = await db.sections.update_one(
        {"_id": section_id, "plan_id": plan_id},
        {"$set": {
            "content": section_update.content,
            "updated_at": datetime.utcnow(),
            "edited_by_user": True
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Section not found")
    
    section = await db.sections.find_one({"_id": section_id})
    return serialize_doc(section)

@router.post("/{plan_id}/sections/{section_id}/regenerate")
async def regenerate_section(plan_id: str, section_id: str, user_id: str = Depends(get_current_user_id)):
    """Regenerate a section using AI (simplified for MVP)"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": plan_id, "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # For MVP: Return placeholder
    # In full version: Call writer agent with regeneration options
    
    return {
        "message": "Section regeneration queued",
        "section_id": section_id
    }

