"""SWOT Analysis routes"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from datetime import datetime
import logging
from bson import ObjectId

from utils.serializers import serialize_doc, to_object_id
from utils.auth import decode_token
from utils.audit_logger import AuditLogger
from utils.dependencies import get_db
from agents.swot_agent import SWOTAgent

router = APIRouter()
logger = logging.getLogger(__name__)

# ============================================================================
# DEPENDENCY: Get Current User
# ============================================================================

async def get_current_user_id(authorization: Optional[str] = Header(None)):
    """Extract user_id from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != 'bearer':
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        return user_id
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

# ============================================================================
# ROUTES
# ============================================================================

@router.get("/{plan_id}/swot")
async def get_swot(plan_id: str, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Get SWOT analysis for a plan"""
    
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Check dedicated SWOT collection first
    swot_doc = await db.swot_analyses.find_one({"plan_id": plan_id})
    
    if swot_doc:
        return {
            "swot_data": swot_doc.get("data", {}),
            "content": "",
            "section_id": str(swot_doc["_id"])
        }
    
    # Fallback: Check sections collection
    swot_section = await db.sections.find_one({
        "plan_id": plan_id,
        "section_type": "swot_analysis"
    })
    
    if swot_section:
        return {
            "swot_data": swot_section.get("metadata", {}).get("swot_data", {}),
            "content": swot_section.get("content", ""),
            "section_id": str(swot_section["_id"])
        }
    
    raise HTTPException(status_code=404, detail="SWOT analysis not found. Please regenerate the plan.")

@router.post("/{plan_id}/swot/regenerate")
async def regenerate_swot(plan_id: str, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Regenerate SWOT analysis for a plan"""
    
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get research pack and financial model
    research_pack_doc = await db.research_packs.find_one({"plan_id": plan_id})
    financial_model_doc = await db.financial_models.find_one({"plan_id": plan_id})
    
    if not research_pack_doc or not financial_model_doc:
        raise HTTPException(
            status_code=400,
            detail="Plan must be generated first. Please generate the plan before regenerating SWOT."
        )
    
    research_pack = research_pack_doc.get("data", {})
    financial_model = financial_model_doc.get("data", {})
    
    # Generate new SWOT
    swot_agent = SWOTAgent()
    swot_data = await swot_agent.generate_swot(
        intake_data=plan.get("intake_data", {}),
        data_pack=research_pack,
        financial_pack=financial_model
    )
    
    # Update or create SWOT section
    swot_section = await db.sections.find_one({
        "plan_id": plan_id,
        "section_type": "swot_analysis"
    })
    
    swot_content = swot_agent.format_swot_as_text(swot_data)
    
    # Update or create in dedicated collection
    existing_swot = await db.swot_analyses.find_one({"plan_id": plan_id})
    swot_doc = {
        "plan_id": plan_id,
        "user_id": user_id,
        "data": swot_data,
        "updated_at": datetime.utcnow()
    }
    if existing_swot:
        await db.swot_analyses.update_one({"_id": existing_swot["_id"]}, {"$set": swot_doc})
    else:
        swot_doc["created_at"] = datetime.utcnow()
        await db.swot_analyses.insert_one(swot_doc)
    
    # Also update/create section for backward compatibility
    if swot_section:
        await db.sections.update_one(
            {"_id": swot_section["_id"]},
            {"$set": {
                "content": swot_content,
                "word_count": len(swot_content.split()),
                "metadata.swot_data": swot_data,
                "metadata.regenerated_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow()
            }}
        )
    else:
        await db.sections.insert_one({
            "plan_id": plan_id,
            "section_type": "swot_analysis",
            "title": "SWOT Analysis",
            "content": swot_content,
            "word_count": len(swot_content.split()),
            "order_index": 10,
            "metadata": {
                "swot_data": swot_data,
                "generated_at": datetime.utcnow().isoformat()
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
    
    logger.info(f"SWOT analysis regenerated for plan {plan_id}")
    
    # Log activity
    await AuditLogger.log_activity(
        db=db,
        user_id=user_id,
        activity_type="swot_regenerated",
        entity_type="plan",
        entity_id=plan_id,
        details={"swot_section_id": str(swot_section["_id"]) if swot_section else "new"}
    )
    
    return {
        "success": True,
        "swot_data": swot_data,
        "content": swot_content
    }
