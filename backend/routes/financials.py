"""Financials routes"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import logging
from bson import ObjectId

from utils.serializers import serialize_doc, to_object_id
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

@router.get("/{plan_id}/financials")
async def get_financials(plan_id: str, user_id: str = Depends(get_current_user_id)):
    """Get financial model for a plan"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": to_object_id(plan_id), "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    financial_model = await db.financial_models.find_one({"plan_id": plan_id})
    if not financial_model:
        raise HTTPException(status_code=404, detail="Financial model not found")
    
    return serialize_doc(financial_model)

@router.get("/{plan_id}/financials/charts")
async def get_financial_charts_data(plan_id: str, user_id: str = Depends(get_current_user_id)):
    """Get financial data formatted for charts"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({"_id": to_object_id(plan_id), "user_id": user_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    financial_model = plan.get("financial_model", {})
    if not financial_model:
        raise HTTPException(status_code=404, detail="Financial model not found")
    
    # Extract data for charts
    pnl_annual = financial_model.get("pnl_annual", [])
    cashflow_annual = financial_model.get("cashflow_annual", [])
    kpis = financial_model.get("kpis", {})
    
    # Format for Recharts
    revenue_data = []
    profit_data = []
    cashflow_data = []
    
    for year_data in pnl_annual:
        year = year_data.get("year")
        revenue_data.append({
            "year": f"Year {year}",
            "revenue": round(year_data.get("revenue", 0), 0),
            "cogs": round(year_data.get("cogs", 0), 0),
            "gross_profit": round(year_data.get("gross_profit", 0), 0)
        })
        
        profit_data.append({
            "year": f"Year {year}",
            "gross_profit": round(year_data.get("gross_profit", 0), 0),
            "net_profit": round(year_data.get("net_profit", 0), 0),
            "total_opex": round(year_data.get("total_opex", 0), 0)
        })
    
    for year_data in cashflow_annual:
        year = year_data.get("year")
        cashflow_data.append({
            "year": f"Year {year}",
            "operating_cf": round(year_data.get("operating_cashflow", 0), 0),
            "net_cf": round(year_data.get("net_cashflow", 0), 0),
            "cumulative_cf": round(year_data.get("cumulative_cashflow", 0), 0)
        })
    
    return {
        "revenue_chart": revenue_data,
        "profit_chart": profit_data,
        "cashflow_chart": cashflow_data,
        "kpis": {
            "gross_margin": round(kpis.get("gross_margin_percent", 0), 1),
            "net_margin": round(kpis.get("net_margin_percent", 0), 1),
            "roi_year1": round(kpis.get("roi_year1_percent", 0), 1),
            "break_even_months": round(kpis.get("break_even_months", 0), 0)
        }
    }
