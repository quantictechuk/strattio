"""Plans routes - Core plan management and generation"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
import logging
from bson import ObjectId

from utils.serializers import serialize_doc, to_object_id
from utils.auth import decode_token
from agents.orchestrator import PlanOrchestrator

router = APIRouter()
logger = logging.getLogger(__name__)

from server import db

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
# MODELS
# ============================================================================

class PlanCreate(BaseModel):
    name: str
    intake_data: Dict
    plan_purpose: str = "generic"

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None

# ============================================================================
# ROUTES
# ============================================================================

@router.get("")
async def list_plans(user_id: str = Depends(get_current_user_id)):
    """List all plans for a user"""
    
    plans = await db.plans.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    return {"plans": [serialize_doc(p) for p in plans]}

@router.post("")
async def create_plan(plan_data: PlanCreate, user_id: str = Depends(get_current_user_id)):
    """Create a new plan"""
    
    # Check subscription limits
    subscription = await db.subscriptions.find_one({"user_id": user_id})
    if not subscription:
        raise HTTPException(status_code=403, detail="No subscription found")
    
    # Check plan limit
    if subscription["plans_created_this_month"] >= subscription["plan_limit"]:
        raise HTTPException(
            status_code=403,
            detail=f"Plan limit reached. Upgrade to create more plans."
        )
    
    # Create plan document
    plan_doc = {
        "user_id": user_id,
        "name": plan_data.name,
        "status": "draft",
        "plan_purpose": plan_data.plan_purpose,
        "intake_data": plan_data.intake_data,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.plans.insert_one(plan_doc)
    plan_doc["_id"] = result.inserted_id
    
    # Increment usage
    await db.subscriptions.update_one(
        {"user_id": user_id},
        {"$inc": {"plans_created_this_month": 1}}
    )
    
    logger.info(f"Plan created: {plan_data.name} for user {user_id}")
    
    return serialize_doc(plan_doc)

@router.get("/{plan_id}")
async def get_plan(plan_id: str, user_id: str = Depends(get_current_user_id)):
    """Get a single plan"""
    
    plan = await db.plans.find_one({"_id": to_object_id(plan_id), "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return serialize_doc(plan)

@router.patch("/{plan_id}")
async def update_plan(plan_id: str, plan_update: PlanUpdate, user_id: str = Depends(get_current_user_id)):
    """Update plan metadata"""
    
    update_data = {k: v for k, v in plan_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.plans.update_one(
        {"_id": to_object_id(plan_id), "user_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    plan = await db.plans.find_one({"_id": to_object_id(plan_id)})
    return serialize_doc(plan)

@router.delete("/{plan_id}")
async def delete_plan(plan_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete a plan"""
    
    result = await db.plans.delete_one({"_id": to_object_id(plan_id), "user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Also delete related documents
    await db.plan_content.delete_many({"plan_id": plan_id})
    await db.sections.delete_many({"plan_id": plan_id})
    await db.financial_models.delete_many({"plan_id": plan_id})
    
    logger.info(f"Plan deleted: {plan_id}")
    
    return {"message": "Plan deleted successfully"}

@router.post("/{plan_id}/generate")
async def generate_plan(plan_id: str, user_id: str = Depends(get_current_user_id)):
    """Generate business plan content using multi-agent pipeline"""
    
    # Get plan
    plan = await db.plans.find_one({"_id": to_object_id(plan_id), "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Update status to generating
    await db.plans.update_one(
        {"_id": to_object_id(plan_id)},
        {"$set": {"status": "generating", "updated_at": datetime.utcnow()}}
    )
    
    try:
        # Run orchestrator
        orchestrator = PlanOrchestrator()
        result = await orchestrator.generate_plan(
            intake_data=plan["intake_data"],
            plan_purpose=plan.get("plan_purpose", "generic")
        )
        
        if result["status"] == "failed":
            await db.plans.update_one(
                {"_id": to_object_id(plan_id)},
                {"$set": {"status": "failed", "error": result.get("error")}}
            )
            raise HTTPException(status_code=500, detail=result.get("error", "Generation failed"))
        
        # Store results
        # 1. Research Pack
        await db.research_packs.insert_one({
            "plan_id": plan_id,
            "data": result["research_pack"],
            "created_at": datetime.utcnow()
        })
        
        # 2. Financial Model
        await db.financial_models.insert_one({
            "plan_id": plan_id,
            "data": result["financial_model"],
            "created_at": datetime.utcnow()
        })
        
        # 3. Sections
        for section in result["sections"]:
            section["plan_id"] = plan_id
            section["created_at"] = datetime.utcnow()
            await db.sections.insert_one(section)
        
        # 4. Compliance Report
        await db.compliance_reports.insert_one({
            "plan_id": plan_id,
            "data": result["compliance_report"],
            "created_at": datetime.utcnow()
        })
        
        # Update plan status
        await db.plans.update_one(
            {"_id": plan_id},
            {"$set": {
                "status": "complete",
                "completed_at": datetime.utcnow(),
                "generation_metadata": result["generation_metadata"]
            }}
        )
        
        logger.info(f"Plan generation complete: {plan_id}")
        
        return {
            "status": "complete",
            "plan_id": plan_id,
            "generation_metadata": result["generation_metadata"]
        }
        
    except Exception as e:
        logger.error(f"Generation error for plan {plan_id}: {e}")
        await db.plans.update_one(
            {"_id": plan_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{plan_id}/status")
async def get_generation_status(plan_id: str, user_id: str = Depends(get_current_user_id)):
    """Get plan generation status"""
    
    plan = await db.plans.find_one({"_id": plan_id, "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return {
        "plan_id": plan_id,
        "status": plan.get("status", "unknown"),
        "updated_at": serialize_doc(plan.get("updated_at", datetime.utcnow()))
    }

@router.post("/{plan_id}/duplicate")
async def duplicate_plan(plan_id: str, user_id: str = Depends(get_current_user_id)):
    """Clone/duplicate an existing plan"""
    
    # Get original plan
    original = await db.plans.find_one({"_id": plan_id, "user_id": user_id})
    if not original:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Create duplicate
    duplicate = {
        "user_id": user_id,
        "name": f"{original['name']} (Copy)",
        "status": "draft",
        "plan_purpose": original.get("plan_purpose", "generic"),
        "intake_data": original["intake_data"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.plans.insert_one(duplicate)
    duplicate["_id"] = result.inserted_id
    
    logger.info(f"Plan duplicated: {plan_id} -> {result.inserted_id}")
    
    return serialize_doc(duplicate)

