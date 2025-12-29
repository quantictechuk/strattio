"""AI-Powered Insights routes - Market analysis, risk assessment, growth strategies"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Optional
from datetime import datetime
import logging
import os

from utils.serializers import serialize_doc, to_object_id
from utils.dependencies import get_db
from utils.admin import get_current_user_id
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/plans/{plan_id}/insights")
async def get_ai_insights(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Get AI-powered insights for a plan"""
    
    # Get plan
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get plan data
    sections = await db.sections.find({"plan_id": plan_id}).sort("order_index", 1).to_list(None)
    financial_model = await db.financial_models.find_one({"plan_id": plan_id})
    research_pack = await db.research_packs.find_one({"plan_id": plan_id})
    intake_data = plan.get("intake_data", {})
    
    # Generate insights using AI
    insights = await _generate_insights(plan, sections, financial_model, research_pack, intake_data)
    
    # Store insights
    await db.plans.update_one(
        {"_id": to_object_id(plan_id)},
        {"$set": {"ai_insights": insights, "updated_at": datetime.utcnow()}}
    )
    
    return insights

async def _generate_insights(
    plan: Dict,
    sections: List[Dict],
    financial_model: Optional[Dict],
    research_pack: Optional[Dict],
    intake_data: Dict
) -> Dict:
    """Generate AI-powered insights"""
    
    try:
        business_name = intake_data.get("business_name", "Business")
        industry = intake_data.get("industry", "Unknown")
        description = intake_data.get("business_description", "")
        value_prop = intake_data.get("unique_value_proposition", "")
        target_customers = intake_data.get("target_customers", "")
        
        # Get section summaries
        exec_summary = next((s for s in sections if s.get("section_type") == "executive_summary"), None)
        market_analysis = next((s for s in sections if s.get("section_type") == "market_analysis"), None)
        risk_section = next((s for s in sections if "risk" in s.get("section_type", "").lower() or "risk" in s.get("title", "").lower()), None)
        
        # Get financial highlights
        financial_highlights = ""
        if financial_model:
            data = financial_model.get("data", {})
            pnl = data.get("pnl_monthly", [])
            if pnl:
                first_year_revenue = sum([m.get("revenue", 0) for m in pnl[:12]])
                financial_highlights = f"Year 1 Revenue: ${first_year_revenue:,.0f}. "
                break_even = data.get("break_even", {})
                if break_even and break_even.get("months_to_break_even"):
                    financial_highlights += f"Break-even: {break_even['months_to_break_even']} months. "
        
        # Get market data
        market_data = ""
        if research_pack:
            data = research_pack.get("data", {})
            market_size = data.get("market_size", {})
            if market_size:
                market_data = f"Market size: {market_size.get('value', 'N/A')}. "
            growth_rate = data.get("growth_rate", {})
            if growth_rate:
                market_data += f"Growth rate: {growth_rate.get('value', 'N/A')}%. "
        
        prompt = f"""Analyze this business plan and provide comprehensive AI-powered insights.

BUSINESS INFORMATION:
- Business Name: {business_name}
- Industry: {industry}
- Description: {description}
- Value Proposition: {value_prop}
- Target Customers: {target_customers}

FINANCIAL DATA:
{financial_highlights if financial_highlights else "Financial projections available"}

MARKET DATA:
{market_data if market_data else "Market research data available"}

EXECUTIVE SUMMARY:
{exec_summary.get('content', '')[:500] if exec_summary else 'N/A'}

MARKET ANALYSIS:
{market_analysis.get('content', '')[:500] if market_analysis else 'N/A'}

RISK ASSESSMENT:
{risk_section.get('content', '')[:500] if risk_section else 'N/A'}

Provide comprehensive insights in JSON format:
{{
  "market_opportunity": {{
    "size": "Market size assessment (e.g., 'Large', 'Medium', 'Small')",
    "growth_rate": number (percentage),
    "trends": ["trend 1", "trend 2", "trend 3"],
    "score": 0-100,
    "analysis": "Detailed market opportunity analysis"
  }},
  "risk_assessment": {{
    "overall_risk": "low" | "medium" | "high",
    "risks": [
      {{
        "category": "market" | "financial" | "operational" | "competitive" | "regulatory",
        "severity": "low" | "medium" | "high",
        "description": "Risk description",
        "mitigation": "Mitigation strategy"
      }}
    ]
  }},
  "funding_recommendation": {{
    "best_type": "bootstrapping" | "angel" | "venture_capital" | "bank_loan" | "crowdfunding" | "grants",
    "alternatives": ["alternative 1", "alternative 2"],
    "reasoning": "Why this funding type is recommended",
    "amount_suggestion": "Suggested funding amount if applicable"
  }},
  "growth_strategies": [
    {{
      "strategy": "Strategy name",
      "priority": "high" | "medium" | "low",
      "description": "Detailed strategy description",
      "expected_impact": "Expected impact on business"
    }}
  ],
  "competitive_intelligence": {{
    "market_position": "leader" | "challenger" | "follower" | "niche",
    "competitive_advantages": ["advantage 1", "advantage 2"],
    "threats": ["threat 1", "threat 2"],
    "recommendations": "Competitive positioning recommendations"
  }}
}}

Return ONLY valid JSON, no other text."""
        
        chat = LlmChat(
            api_key=os.environ.get("OPENAI_API_KEY"),
            session_id=f"ai_insights_{plan.get('_id')}",
            system_message="You are an expert business analyst. Provide comprehensive, actionable insights in JSON format only."
        ).with_model("openai", "gpt-4o")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse JSON
        import json
        import re
        
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            insights_data = json.loads(json_match.group())
            insights_data["last_updated"] = datetime.utcnow().isoformat()
            return insights_data
        else:
            # Fallback: create basic insights
            return _create_fallback_insights(intake_data, financial_model, research_pack)
            
    except Exception as e:
        logger.error(f"Error generating AI insights: {e}")
        return _create_fallback_insights(intake_data, financial_model, research_pack)

def _create_fallback_insights(intake_data: Dict, financial_model: Optional[Dict], research_pack: Optional[Dict]) -> Dict:
    """Create fallback insights if AI generation fails"""
    
    industry = intake_data.get("industry", "general")
    
    return {
        "market_opportunity": {
            "size": "Medium",
            "growth_rate": 5.0,
            "trends": ["Digital transformation", "Market growth", "Consumer demand"],
            "score": 65,
            "analysis": "The market shows moderate growth potential. Further research is recommended to identify specific opportunities."
        },
        "risk_assessment": {
            "overall_risk": "medium",
            "risks": [
                {
                    "category": "market",
                    "severity": "medium",
                    "description": "Market competition and demand uncertainty",
                    "mitigation": "Conduct thorough market research and develop a strong value proposition"
                },
                {
                    "category": "financial",
                    "severity": "medium",
                    "description": "Cash flow management and funding needs",
                    "mitigation": "Maintain detailed financial projections and secure adequate funding"
                }
            ]
        },
        "funding_recommendation": {
            "best_type": "bootstrapping",
            "alternatives": ["angel", "bank_loan"],
            "reasoning": "Based on the business model and financial projections, bootstrapping may be the most suitable initial funding approach.",
            "amount_suggestion": "Varies based on business needs"
        },
        "growth_strategies": [
            {
                "strategy": "Market Expansion",
                "priority": "high",
                "description": "Expand into new market segments or geographic areas",
                "expected_impact": "Significant revenue growth potential"
            },
            {
                "strategy": "Product Development",
                "priority": "medium",
                "description": "Develop new products or services to meet customer needs",
                "expected_impact": "Increased market share and customer retention"
            }
        ],
        "competitive_intelligence": {
            "market_position": "follower",
            "competitive_advantages": ["Unique value proposition", "Targeted customer focus"],
            "threats": ["Established competitors", "Market saturation"],
            "recommendations": "Focus on differentiation and niche market positioning to compete effectively."
        },
        "last_updated": datetime.utcnow().isoformat()
    }
