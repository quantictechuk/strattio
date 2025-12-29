"""Competitor Analysis routes"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from datetime import datetime
import logging
from bson import ObjectId

from utils.serializers import serialize_doc, to_object_id
from utils.auth import decode_token
from utils.audit_logger import AuditLogger
from utils.dependencies import get_db
from agents.competitor_agent import CompetitorAgent

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

@router.get("/{plan_id}/competitors")
async def get_competitor_analysis(plan_id: str, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Get competitor analysis for a plan"""
    
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Check dedicated competitor collection first
    competitor_doc = await db.competitor_analyses.find_one({"plan_id": plan_id})
    
    if competitor_doc:
        return {
            "competitor_data": competitor_doc.get("data", {}),
            "content": "",
            "section_id": str(competitor_doc["_id"])
        }
    
    # Fallback: Check sections collection
    competitor_section = await db.sections.find_one({
        "plan_id": plan_id,
        "section_type": "competitor_analysis"
    })
    
    if competitor_section:
        return {
            "competitor_data": competitor_section.get("metadata", {}).get("competitor_data", {}),
            "content": competitor_section.get("content", ""),
            "section_id": str(competitor_section["_id"])
        }
    
    raise HTTPException(status_code=404, detail="Competitor analysis not found. Please regenerate the plan.")

@router.post("/{plan_id}/competitors/regenerate")
async def regenerate_competitor_analysis(plan_id: str, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Regenerate competitor analysis for a plan"""
    
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get research pack
    research_pack_doc = await db.research_packs.find_one({"plan_id": plan_id})
    
    if not research_pack_doc:
        raise HTTPException(
            status_code=400,
            detail="Plan must be generated first. Please generate the plan before regenerating competitor analysis."
        )
    
    research_pack = research_pack_doc.get("data", {})
    
    # Generate new competitor analysis
    competitor_agent = CompetitorAgent()
    competitor_data = await competitor_agent.generate_competitor_analysis(
        intake_data=plan.get("intake_data", {}),
        data_pack=research_pack
    )
    
    # Update or create competitor section
    competitor_section = await db.sections.find_one({
        "plan_id": plan_id,
        "section_type": "competitor_analysis"
    })
    
    competitor_content = competitor_agent.format_competitor_analysis_as_text(competitor_data)
    
    # Update or create in dedicated collection
    existing_competitor = await db.competitor_analyses.find_one({"plan_id": plan_id})
    competitor_doc = {
        "plan_id": plan_id,
        "user_id": user_id,
        "data": competitor_data,
        "updated_at": datetime.utcnow()
    }
    if existing_competitor:
        await db.competitor_analyses.update_one({"_id": existing_competitor["_id"]}, {"$set": competitor_doc})
    else:
        competitor_doc["created_at"] = datetime.utcnow()
        await db.competitor_analyses.insert_one(competitor_doc)
    
    # Also update/create section for backward compatibility
    if competitor_section:
        # Update existing section
        await db.sections.update_one(
            {"_id": competitor_section["_id"]},
            {"$set": {
                "content": competitor_content,
                "word_count": len(competitor_content.split()),
                "metadata.competitor_data": competitor_data,
                "metadata.regenerated_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow()
            }}
        )
    else:
        # Create new section
        await db.sections.insert_one({
            "plan_id": plan_id,
            "section_type": "competitor_analysis",
            "title": "Competitor Analysis",
            "content": competitor_content,
            "word_count": len(competitor_content.split()),
            "order_index": 11,
            "metadata": {
                "competitor_data": competitor_data,
                "generated_at": datetime.utcnow().isoformat()
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
    
    logger.info(f"Competitor analysis regenerated for plan {plan_id}")
    
    # Log activity
    await AuditLogger.log_activity(
        db=db,
        user_id=user_id,
        activity_type="competitor_regenerated",
        entity_type="plan",
        entity_id=plan_id,
        details={"competitor_section_id": str(competitor_section["_id"]) if competitor_section else "new"}
    )
    
    return {
        "success": True,
        "competitor_data": competitor_data,
        "content": competitor_content
    }
