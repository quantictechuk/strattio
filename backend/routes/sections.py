"""Sections routes - View and edit plan sections"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import logging
from bson import ObjectId

from utils.serializers import serialize_doc, to_object_id
from utils.auth import decode_token
from utils.audit_logger import AuditLogger
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

class SectionUpdate(BaseModel):
    content: str

class RegenerationOptions(BaseModel):
    tone: Optional[str] = None  # "formal", "casual", "technical"
    length: Optional[str] = None  # "shorter", "longer", "same"
    emphasis: Optional[str] = None  # Custom emphasis
    additional_instructions: Optional[str] = None

@router.get("/{plan_id}/sections")
async def get_sections(plan_id: str, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Get all sections for a plan"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": to_object_id(plan_id), "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    sections = await db.sections.find({"plan_id": plan_id}).sort("order_index", 1).to_list(100)
    
    return {"sections": [serialize_doc(s) for s in sections]}

@router.get("/{plan_id}/sections/{section_id}")
async def get_section(plan_id: str, section_id: str, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Get a specific section"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": to_object_id(plan_id), "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    section = await db.sections.find_one({"_id": to_object_id(section_id), "plan_id": plan_id})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    return serialize_doc(section)

@router.patch("/{plan_id}/sections/{section_id}")
async def update_section(plan_id: str, section_id: str, section_update: SectionUpdate, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Update section content"""
    
    try:
        # Verify plan ownership
        plan = await db.plans.find_one({"_id": to_object_id(plan_id), "user_id": user_id})
        if not plan:
            logger.warning(f"Plan not found: {plan_id} for user {user_id}")
            raise HTTPException(status_code=404, detail="Plan not found")
        
        # Convert section_id to ObjectId
        section_object_id = to_object_id(section_id)
        logger.info(f"Updating section {section_id} (ObjectId: {section_object_id}) for plan {plan_id}")
        
        # Update section
        result = await db.sections.update_one(
            {"_id": section_object_id, "plan_id": plan_id},
            {"$set": {
                "content": section_update.content,
                "updated_at": datetime.utcnow(),
                "edited_by_user": True
            }}
        )
        
        if result.matched_count == 0:
            logger.warning(f"Section not found: {section_id} for plan {plan_id}")
            # Try to find section to see if it exists but with different plan_id
            section_check = await db.sections.find_one({"_id": section_object_id})
            if section_check:
                logger.warning(f"Section exists but plan_id mismatch. Section plan_id: {section_check.get('plan_id')}, requested: {plan_id}")
            raise HTTPException(status_code=404, detail="Section not found")
        
        logger.info(f"Section updated successfully: {section_id}")
        section = await db.sections.find_one({"_id": section_object_id})
        return serialize_doc(section)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating section {section_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update section: {str(e)}")

@router.post("/{plan_id}/sections/{section_id}/regenerate")
async def regenerate_section(
    plan_id: str, 
    section_id: str, 
    options: RegenerationOptions,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Regenerate a section with custom options (tone, length, emphasis)"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": to_object_id(plan_id), "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get existing section
    section = await db.sections.find_one({"_id": to_object_id(section_id), "plan_id": plan_id})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Get plan data for regeneration
    intake_data = plan.get("intake_data", {})
    
    # Get research and financial data
    research_pack = plan.get("research_pack", {})
    financial_model = plan.get("financial_model", {})
    
    # Import writer agent
    from agents.writer_agent import WriterAgent
    
    try:
        writer = WriterAgent()
        
        # Apply regeneration options
        if options.tone:
            # Modify tone in prompt
            pass
        
        if options.length:
            # Adjust word count targets
            pass
        
        # Regenerate section
        new_section_data = await writer.generate_section(
            section_type=section.get("section_type"),
            data_pack=research_pack,
            financial_pack=financial_model,
            intake_data=intake_data
        )
        
        # Save regenerated content
        await db.sections.update_one(
            {"_id": to_object_id(section_id)},
            {"$set": {
                "content": new_section_data.get("content"),
                "word_count": new_section_data.get("word_count"),
                "regenerated_at": datetime.utcnow(),
                "regeneration_count": section.get("regeneration_count", 0) + 1
            }}
        )
        
        updated_section = await db.sections.find_one({"_id": to_object_id(section_id)})
        
        # Log activity
        await AuditLogger.log_activity(
            db=db,
            user_id=user_id,
            activity_type="section_regenerated",
            entity_type="section",
            entity_id=section_id,
            details={
                "plan_id": plan_id,
                "section_type": section.get("section_type"),
                "options": {
                    "tone": options.tone,
                    "length": options.length
                }
            }
        )
        
        return {
            "success": True,
            "section": serialize_doc(updated_section)
        }
        
    except Exception as e:
        logger.error(f"Regeneration error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to regenerate section: {str(e)}")

