"""Business Model Canvas routes"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from datetime import datetime
import logging
from bson import ObjectId

from utils.serializers import serialize_doc, to_object_id
from utils.auth import decode_token
from utils.audit_logger import AuditLogger
from utils.dependencies import get_db
from agents.business_model_canvas_agent import BusinessModelCanvasAgent

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

@router.get("/{plan_id}/canvas")
async def get_canvas(plan_id: str, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Get Business Model Canvas for a plan"""
    
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Check if canvas exists
    canvas_doc = await db.business_model_canvas.find_one({"plan_id": plan_id})
    
    if not canvas_doc:
        raise HTTPException(status_code=404, detail="Business Model Canvas not found. Please generate it first.")
    
    return {
        "canvas_data": canvas_doc.get("data", {}),
        "generated_at": canvas_doc.get("generated_at"),
        "canvas_id": str(canvas_doc["_id"])
    }

@router.post("/{plan_id}/canvas/generate")
async def generate_canvas(plan_id: str, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Generate Business Model Canvas for a plan"""
    
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
            detail="Plan must be generated first. Please generate the plan before creating the canvas."
        )
    
    research_pack = research_pack_doc.get("data", {})
    financial_model = financial_model_doc.get("data", {})
    
    # Generate canvas
    canvas_agent = BusinessModelCanvasAgent()
    canvas_data = await canvas_agent.generate_canvas(
        intake_data=plan.get("intake_data", {}),
        data_pack=research_pack,
        financial_pack=financial_model
    )
    
    # Save or update canvas
    existing_canvas = await db.business_model_canvas.find_one({"plan_id": plan_id})
    
    canvas_doc = {
        "plan_id": plan_id,
        "user_id": user_id,
        "data": canvas_data,
        "generated_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    if existing_canvas:
        await db.business_model_canvas.update_one(
            {"_id": existing_canvas["_id"]},
            {"$set": canvas_doc}
        )
        canvas_doc["_id"] = existing_canvas["_id"]
    else:
        canvas_doc["created_at"] = datetime.utcnow()
        result = await db.business_model_canvas.insert_one(canvas_doc)
        canvas_doc["_id"] = result.inserted_id
    
    # Log activity
    await AuditLogger.log_activity(
        db=db,
        user_id=user_id,
        activity_type="canvas_generated",
        entity_type="plan",
        entity_id=plan_id,
        details={"canvas_id": str(canvas_doc["_id"])}
    )
    
    logger.info(f"Business Model Canvas generated for plan {plan_id}")
    
    return {
        "success": True,
        "canvas_data": canvas_data,
        "canvas_id": str(canvas_doc["_id"])
    }
