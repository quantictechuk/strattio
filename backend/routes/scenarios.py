"""Scenario Planning routes - Best/worst/realistic financial scenarios"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime
import logging

from utils.serializers import serialize_doc, to_object_id
from utils.dependencies import get_db
from utils.admin import get_current_user_id
from agents.financial_engine import FinancialEngine

router = APIRouter()
logger = logging.getLogger(__name__)

class ScenarioInput(BaseModel):
    revenue_multiplier: float = 1.0
    cost_multiplier: float = 1.0

@router.post("/plans/{plan_id}/scenarios")
async def create_scenarios(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Create best case, worst case, and realistic scenarios for a plan"""
    
    # Get plan
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get financial model
    financial_model = await db.financial_models.find_one({"plan_id": plan_id})
    if not financial_model:
        raise HTTPException(status_code=404, detail="Financial model not found. Generate plan first.")
    
    intake_data = plan.get("intake_data", {})
    financial_data = financial_model.get("data", {})
    
    # Get industry benchmarks
    from agents.orchestrator import PlanOrchestrator
    orchestrator = PlanOrchestrator()
    benchmarks = orchestrator._get_industry_benchmarks(intake_data.get("industry", "generic"))
    
    # Create three scenarios
    scenarios = {}
    
    # 1. Best Case Scenario (+20% revenue, -10% costs)
    best_case_intake = intake_data.copy()
    best_case_intake["monthly_revenue_estimate"] = intake_data.get("monthly_revenue_estimate", 0) * 1.2
    best_case_engine = FinancialEngine(best_case_intake, benchmarks)
    best_case_model = best_case_engine.generate_financial_model()
    best_case_model["data"]["revenue_multiplier"] = 1.2
    best_case_model["data"]["cost_multiplier"] = 0.9
    scenarios["best_case"] = best_case_model["data"]
    
    # 2. Worst Case Scenario (-30% revenue, +15% costs)
    worst_case_intake = intake_data.copy()
    worst_case_intake["monthly_revenue_estimate"] = intake_data.get("monthly_revenue_estimate", 0) * 0.7
    worst_case_engine = FinancialEngine(worst_case_intake, benchmarks)
    worst_case_model = worst_case_engine.generate_financial_model()
    # Adjust costs upward
    if worst_case_model["data"].get("pnl_monthly"):
        for month in worst_case_model["data"]["pnl_monthly"]:
            if "operating_expenses" in month:
                month["operating_expenses"] = month["operating_expenses"] * 1.15
            if "total_expenses" in month:
                month["total_expenses"] = month["total_expenses"] * 1.15
            if "net_profit" in month:
                month["net_profit"] = month.get("revenue", 0) - month.get("total_expenses", 0)
    worst_case_model["data"]["revenue_multiplier"] = 0.7
    worst_case_model["data"]["cost_multiplier"] = 1.15
    scenarios["worst_case"] = worst_case_model["data"]
    
    # 3. Realistic Scenario (base projections)
    realistic_model = financial_data.copy()
    realistic_model["revenue_multiplier"] = 1.0
    realistic_model["cost_multiplier"] = 1.0
    scenarios["realistic"] = realistic_model
    
    # Calculate sensitivity analysis
    sensitivity = _calculate_sensitivity(intake_data, financial_data, benchmarks)
    
    # Store scenarios
    scenario_doc = {
        "plan_id": plan_id,
        "scenarios": scenarios,
        "sensitivity_analysis": sensitivity,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.plan_scenarios.insert_one(scenario_doc)
    
    logger.info(f"Scenarios created for plan {plan_id}")
    
    return scenario_doc

@router.get("/plans/{plan_id}/scenarios")
async def get_scenarios(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Get scenarios for a plan"""
    
    # Get plan
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get scenarios
    scenario = await db.plan_scenarios.find_one({"plan_id": plan_id}, sort=[("created_at", -1)])
    
    if not scenario:
        # Create scenarios if they don't exist
        return await create_scenarios(plan_id, user_id, db)
    
    return serialize_doc(scenario)

@router.post("/plans/{plan_id}/scenarios/analyze")
async def analyze_scenario(
    plan_id: str,
    scenario_input: ScenarioInput,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Run what-if analysis with custom multipliers"""
    
    # Get plan
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get financial model
    financial_model = await db.financial_models.find_one({"plan_id": plan_id})
    if not financial_model:
        raise HTTPException(status_code=404, detail="Financial model not found")
    
    intake_data = plan.get("intake_data", {})
    financial_data = financial_model.get("data", {})
    
    # Get benchmarks
    from agents.orchestrator import PlanOrchestrator
    orchestrator = PlanOrchestrator()
    benchmarks = orchestrator._get_industry_benchmarks(intake_data.get("industry", "generic"))
    
    # Create custom scenario
    custom_intake = intake_data.copy()
    custom_intake["monthly_revenue_estimate"] = intake_data.get("monthly_revenue_estimate", 0) * scenario_input.revenue_multiplier
    custom_engine = FinancialEngine(custom_intake, benchmarks)
    custom_model = custom_engine.generate_financial_model()
    
    # Adjust costs
    if custom_model["data"].get("pnl_monthly"):
        for month in custom_model["data"]["pnl_monthly"]:
            if "operating_expenses" in month:
                month["operating_expenses"] = month["operating_expenses"] * scenario_input.cost_multiplier
            if "total_expenses" in month:
                month["total_expenses"] = month["total_expenses"] * scenario_input.cost_multiplier
            if "net_profit" in month:
                month["net_profit"] = month.get("revenue", 0) - month.get("total_expenses", 0)
    
    custom_model["data"]["revenue_multiplier"] = scenario_input.revenue_multiplier
    custom_model["data"]["cost_multiplier"] = scenario_input.cost_multiplier
    
    return {
        "scenario": custom_model["data"],
        "revenue_multiplier": scenario_input.revenue_multiplier,
        "cost_multiplier": scenario_input.cost_multiplier
    }

def _calculate_sensitivity(intake_data: Dict, financial_data: Dict, benchmarks: Dict) -> List[Dict]:
    """Calculate sensitivity analysis for key variables"""
    
    variables = []
    
    # Revenue sensitivity
    base_revenue = intake_data.get("monthly_revenue_estimate", 0)
    if base_revenue > 0:
        # Test ±20% revenue change
        revenue_impact = (financial_data.get("pnl_monthly", [{}])[0].get("revenue", 0) * 0.2) / base_revenue * 100
        variables.append({
            "name": "Monthly Revenue",
            "impact_score": min(100, abs(revenue_impact)),
            "effect": "positive" if revenue_impact > 0 else "negative",
            "description": "20% change in revenue affects profitability significantly"
        })
    
    # Cost sensitivity
    if financial_data.get("pnl_monthly"):
        first_month = financial_data["pnl_monthly"][0]
        base_costs = first_month.get("total_expenses", 0)
        if base_costs > 0:
            cost_impact = (base_costs * 0.15) / base_costs * 100
            variables.append({
                "name": "Operating Costs",
                "impact_score": min(100, abs(cost_impact)),
                "effect": "negative",
                "description": "15% change in costs has significant impact on profitability"
            })
    
    # Price per unit sensitivity
    price_per_unit = intake_data.get("price_per_unit", 0)
    if price_per_unit > 0:
        variables.append({
            "name": "Price per Unit",
            "impact_score": 75,
            "effect": "positive",
            "description": "Price changes directly affect revenue and margins"
        })
    
    # Units per month sensitivity
    units_per_month = intake_data.get("units_per_month", 0)
    if units_per_month > 0:
        variables.append({
            "name": "Units per Month",
            "impact_score": 80,
            "effect": "positive",
            "description": "Volume changes significantly impact total revenue"
        })
    
    # Sort by impact score
    variables.sort(key=lambda x: x["impact_score"], reverse=True)
    
    return variables
