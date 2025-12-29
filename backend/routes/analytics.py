"""Plan analytics routes - Track completion, quality, and progress metrics"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict
from datetime import datetime, timedelta
import logging
from bson import ObjectId

from utils.serializers import serialize_doc, to_object_id
from utils.dependencies import get_db
from utils.admin import get_current_user_id

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/plans/{plan_id}/analytics")
async def get_plan_analytics(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Get analytics for a specific plan"""
    
    # Get plan
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get all sections for this plan
    sections = await db.sections.find({"plan_id": plan_id}).sort("order_index", 1).to_list(None)
    
    # Get financial model
    financial_model = await db.financial_models.find_one({"plan_id": plan_id})
    
    # Calculate completion score
    total_sections = len(sections)
    completed_sections = sum(1 for s in sections if s.get("content") and len(s.get("content", "").strip()) > 50)
    completion_score = int((completed_sections / total_sections * 100)) if total_sections > 0 else 0
    
    # Calculate quality score
    quality_factors = {
        "section_length": 0,  # Average word count
        "financial_completeness": 0,  # Financial data filled
        "detail_level": 0,  # Citations and data points
        "user_engagement": 0  # User edits
    }
    
    # Section length factor (0-25 points)
    total_words = sum(s.get("word_count", 0) for s in sections)
    avg_words = total_words / total_sections if total_sections > 0 else 0
    # Target: 500 words per section average
    quality_factors["section_length"] = min(25, int((avg_words / 500) * 25))
    
    # Financial completeness factor (0-25 points)
    if financial_model:
        financial_data = financial_model.get("data", {})
        pnl = financial_data.get("pnl_monthly", [])
        cashflow = financial_data.get("cashflow_monthly", [])
        # Check if we have at least 12 months of data
        if len(pnl) >= 12 and len(cashflow) >= 12:
            quality_factors["financial_completeness"] = 25
        elif len(pnl) >= 6 and len(cashflow) >= 6:
            quality_factors["financial_completeness"] = 15
        else:
            quality_factors["financial_completeness"] = 5
    else:
        quality_factors["financial_completeness"] = 0
    
    # Detail level factor (0-25 points) - based on citations
    total_citations = sum(len(s.get("data_citations", [])) for s in sections)
    citations_per_section = total_citations / total_sections if total_sections > 0 else 0
    # Target: 3 citations per section
    quality_factors["detail_level"] = min(25, int((citations_per_section / 3) * 25))
    
    # User engagement factor (0-25 points) - based on edits
    edited_sections = sum(1 for s in sections if s.get("edited_by_user", False))
    edit_ratio = edited_sections / total_sections if total_sections > 0 else 0
    quality_factors["user_engagement"] = int(edit_ratio * 25)
    
    # Total quality score
    quality_score = sum(quality_factors.values())
    
    # Calculate time metrics
    created_at = plan.get("created_at", datetime.utcnow())
    updated_at = plan.get("updated_at", created_at)
    completed_at = plan.get("completed_at")
    
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
    
    time_to_first_edit = None
    if sections:
        first_section = min(sections, key=lambda s: s.get("created_at", datetime.utcnow()))
        first_edit_time = first_section.get("created_at")
        if first_edit_time:
            if isinstance(first_edit_time, str):
                first_edit_time = datetime.fromisoformat(first_edit_time.replace('Z', '+00:00'))
            time_to_first_edit = (first_edit_time - created_at).total_seconds() / 3600  # hours
    
    time_to_complete = None
    if completed_at:
        if isinstance(completed_at, str):
            completed_at = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
        time_to_complete = (completed_at - created_at).total_seconds() / 3600  # hours
    
    # Get industry for benchmarking (from intake_data)
    industry = plan.get("intake_data", {}).get("industry", "general")
    
    # Industry benchmarking (mock data for now - can be enhanced with real data)
    industry_benchmarks = {
        "average_completion_time": 24,  # hours
        "average_quality_score": 65,
        "average_completion_rate": 75
    }
    
    # Calculate analytics
    analytics = {
        "completion_score": completion_score,
        "quality_score": quality_score,
        "sections_completed": completed_sections,
        "total_sections": total_sections,
        "time_to_first_edit_hours": time_to_first_edit,
        "time_to_complete_hours": time_to_complete,
        "quality_breakdown": quality_factors,
        "industry": industry,
        "industry_benchmarks": industry_benchmarks,
        "vs_industry": {
            "completion_time": {
                "user": time_to_complete,
                "industry_avg": industry_benchmarks["average_completion_time"],
                "comparison": "faster" if time_to_complete and time_to_complete < industry_benchmarks["average_completion_time"] else "slower" if time_to_complete else None
            },
            "quality_score": {
                "user": quality_score,
                "industry_avg": industry_benchmarks["average_quality_score"],
                "comparison": "higher" if quality_score > industry_benchmarks["average_quality_score"] else "lower"
            },
            "completion_rate": {
                "user": completion_score,
                "industry_avg": industry_benchmarks["average_completion_rate"],
                "comparison": "higher" if completion_score > industry_benchmarks["average_completion_rate"] else "lower"
            }
        },
        "last_analyzed": datetime.utcnow().isoformat()
    }
    
    # Store analytics in plan document for caching
    await db.plans.update_one(
        {"_id": to_object_id(plan_id)},
        {"$set": {"analytics": analytics, "updated_at": datetime.utcnow()}}
    )
    
    return analytics
