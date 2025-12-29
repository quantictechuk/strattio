"""Plan Comparison routes - Compare multiple plans side-by-side"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime
import logging

from utils.serializers import serialize_doc, to_object_id
from utils.dependencies import get_db
from utils.admin import get_current_user_id

router = APIRouter()
logger = logging.getLogger(__name__)

class PlanComparisonRequest(BaseModel):
    plan_ids: List[str]  # 2-4 plan IDs to compare

@router.post("/plans/compare")
async def compare_plans(
    comparison_request: PlanComparisonRequest,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Compare multiple plans side-by-side"""
    
    if len(comparison_request.plan_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 plans required for comparison")
    
    if len(comparison_request.plan_ids) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 plans can be compared at once")
    
    # Get all plans
    plans = []
    for plan_id in comparison_request.plan_ids:
        plan = await db.plans.find_one({
            "_id": to_object_id(plan_id),
            "user_id": user_id
        })
        if not plan:
            raise HTTPException(status_code=404, detail=f"Plan {plan_id} not found")
        plans.append(plan)
    
    # Get data for each plan
    comparison_data = []
    
    for plan in plans:
        plan_id = str(plan["_id"])
        
        # Get sections
        sections = await db.sections.find({"plan_id": plan_id}).to_list(None)
        total_sections = len(sections)
        completed_sections = sum(1 for s in sections if s.get("content") and len(s.get("content", "").strip()) > 50)
        
        # Get financial model
        financial_model = await db.financial_models.find_one({"plan_id": plan_id})
        financial_data = financial_model.get("data", {}) if financial_model else {}
        
        # Get analytics
        analytics = plan.get("analytics", {})
        
        # Get readiness score
        readiness_score = plan.get("readiness_score", {})
        
        # Calculate metrics
        pnl = financial_data.get("pnl_monthly", [])
        total_revenue = sum(m.get("revenue", 0) for m in pnl[:12]) if pnl else 0
        total_profit = sum(m.get("net_profit", 0) for m in pnl[:12]) if pnl else 0
        
        plan_comparison = {
            "plan_id": plan_id,
            "plan_name": plan.get("name", "Unnamed Plan"),
            "status": plan.get("status", "draft"),
            "created_at": plan.get("created_at"),
            "updated_at": plan.get("updated_at"),
            "completion": {
                "total_sections": total_sections,
                "completed_sections": completed_sections,
                "completion_rate": (completed_sections / total_sections * 100) if total_sections > 0 else 0
            },
            "analytics": {
                "completion_score": analytics.get("completion_score", 0),
                "quality_score": analytics.get("quality_score", 0)
            },
            "readiness_score": readiness_score.get("overall_score", 0),
            "financials": {
                "year1_revenue": total_revenue,
                "year1_profit": total_profit,
                "has_financials": financial_model is not None
            },
            "industry": plan.get("intake_data", {}).get("industry", "Unknown"),
            "business_name": plan.get("intake_data", {}).get("business_name", "Unknown")
        }
        
        comparison_data.append(plan_comparison)
    
    # Calculate differences
    differences = _calculate_differences(comparison_data)
    
    return {
        "plans": comparison_data,
        "differences": differences,
        "summary": _generate_summary(comparison_data)
    }

def _calculate_differences(plans: List[Dict]) -> Dict:
    """Calculate key differences between plans"""
    differences = {
        "completion": {},
        "quality": {},
        "readiness": {},
        "revenue": {},
        "profit": {}
    }
    
    if len(plans) < 2:
        return differences
    
    # Completion differences
    completion_scores = [p["analytics"]["completion_score"] for p in plans]
    differences["completion"] = {
        "min": min(completion_scores),
        "max": max(completion_scores),
        "range": max(completion_scores) - min(completion_scores),
        "avg": sum(completion_scores) / len(completion_scores)
    }
    
    # Quality differences
    quality_scores = [p["analytics"]["quality_score"] for p in plans]
    differences["quality"] = {
        "min": min(quality_scores),
        "max": max(quality_scores),
        "range": max(quality_scores) - min(quality_scores),
        "avg": sum(quality_scores) / len(quality_scores)
    }
    
    # Readiness differences
    readiness_scores = [p["readiness_score"] for p in plans]
    differences["readiness"] = {
        "min": min(readiness_scores),
        "max": max(readiness_scores),
        "range": max(readiness_scores) - min(readiness_scores),
        "avg": sum(readiness_scores) / len(readiness_scores)
    }
    
    # Revenue differences
    revenues = [p["financials"]["year1_revenue"] for p in plans if p["financials"]["has_financials"]]
    if revenues:
        differences["revenue"] = {
            "min": min(revenues),
            "max": max(revenues),
            "range": max(revenues) - min(revenues),
            "avg": sum(revenues) / len(revenues)
        }
    
    # Profit differences
    profits = [p["financials"]["year1_profit"] for p in plans if p["financials"]["has_financials"]]
    if profits:
        differences["profit"] = {
            "min": min(profits),
            "max": max(profits),
            "range": max(profits) - min(profits),
            "avg": sum(profits) / len(profits)
        }
    
    return differences

def _generate_summary(plans: List[Dict]) -> Dict:
    """Generate comparison summary"""
    best_completion = max(plans, key=lambda p: p["analytics"]["completion_score"])
    best_quality = max(plans, key=lambda p: p["analytics"]["quality_score"])
    best_readiness = max(plans, key=lambda p: p["readiness_score"])
    
    financial_plans = [p for p in plans if p["financials"]["has_financials"]]
    best_revenue = max(financial_plans, key=lambda p: p["financials"]["year1_revenue"]) if financial_plans else None
    best_profit = max(financial_plans, key=lambda p: p["financials"]["year1_profit"]) if financial_plans else None
    
    return {
        "best_completion": {
            "plan_name": best_completion["plan_name"],
            "score": best_completion["analytics"]["completion_score"]
        },
        "best_quality": {
            "plan_name": best_quality["plan_name"],
            "score": best_quality["analytics"]["quality_score"]
        },
        "best_readiness": {
            "plan_name": best_readiness["plan_name"],
            "score": best_readiness["readiness_score"]
        },
        "best_revenue": {
            "plan_name": best_revenue["plan_name"],
            "revenue": best_revenue["financials"]["year1_revenue"]
        } if best_revenue else None,
        "best_profit": {
            "plan_name": best_profit["plan_name"],
            "profit": best_profit["financials"]["year1_profit"]
        } if best_profit else None
    }
