"""Investment Readiness Score routes - AI-powered plan scoring"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List
from datetime import datetime
import logging
import os

from utils.serializers import serialize_doc, to_object_id
from utils.dependencies import get_db
from utils.admin import get_current_user_id
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/plans/{plan_id}/readiness-score")
async def get_readiness_score(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Calculate investment readiness score for a plan"""
    
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
    compliance_report = await db.compliance_reports.find_one({"plan_id": plan_id})
    
    # Calculate base scores for each category
    breakdown = {}
    
    # 1. Executive Summary (20%)
    exec_summary = next((s for s in sections if s.get("section_type") == "executive_summary"), None)
    exec_score = 0
    if exec_summary:
        content = exec_summary.get("content", "")
        word_count = len(content.split())
        # Check for key elements
        has_vision = any(word in content.lower() for word in ["vision", "mission", "goal"])
        has_market = any(word in content.lower() for word in ["market", "opportunity", "demand"])
        has_financials = any(word in content.lower() for word in ["revenue", "profit", "funding", "investment"])
        has_team = any(word in content.lower() for word in ["team", "founder", "management"])
        
        exec_score = 20  # Base
        if word_count < 200:
            exec_score -= 5  # Too short
        if word_count > 1000:
            exec_score -= 3  # Too long
        if not has_vision:
            exec_score -= 3
        if not has_market:
            exec_score -= 3
        if not has_financials:
            exec_score -= 3
        if not has_team:
            exec_score -= 3
    breakdown["executive_summary"] = max(0, min(100, exec_score))
    
    # 2. Market Analysis (15%)
    market_section = next((s for s in sections if s.get("section_type") == "market_analysis"), None)
    market_score = 0
    if market_section:
        content = market_section.get("content", "")
        citations = len(market_section.get("data_citations", []))
        word_count = len(content.split())
        
        market_score = 15  # Base
        if citations >= 3:
            market_score += 3  # Good data sources
        if word_count >= 500:
            market_score += 2  # Comprehensive
        if word_count < 300:
            market_score -= 5  # Too brief
    breakdown["market_analysis"] = max(0, min(100, market_score))
    
    # 3. Financial Projections (25%)
    financial_score = 0
    if financial_model:
        financial_data = financial_model.get("data", {})
        pnl = financial_data.get("pnl_monthly", [])
        cashflow = financial_data.get("cashflow_monthly", [])
        break_even = financial_data.get("break_even", {})
        
        financial_score = 25  # Base
        if len(pnl) >= 12:
            financial_score += 5  # 12+ months of projections
        if len(cashflow) >= 12:
            financial_score += 5  # Cash flow projections
        if break_even and break_even.get("months_to_break_even"):
            financial_score += 5  # Break-even analysis
        if financial_data.get("kpis"):
            financial_score += 5  # KPIs included
    breakdown["financial_projections"] = max(0, min(100, financial_score))
    
    # 4. Team/Management (10%)
    team_section = next((s for s in sections if s.get("section_type") == "team"), None)
    team_score = 0
    if team_section:
        content = team_section.get("content", "")
        word_count = len(content.split())
        
        team_score = 10  # Base
        if word_count >= 300:
            team_score += 2  # Detailed
        if any(word in content.lower() for word in ["experience", "background", "qualification"]):
            team_score += 2  # Mentions experience
        if word_count < 150:
            team_score -= 5  # Too brief
    breakdown["team_management"] = max(0, min(100, team_score))
    
    # 5. Competitive Analysis (10%)
    # Handle multiple section type variations: competitive_analysis, competitor_analysis, competitors_analysis
    competitive_variations = ["competitive_analysis", "competitor_analysis", "competitors_analysis", "competition_analysis"]
    competitive_section = next(
        (s for s in sections 
         if s.get("section_type", "").lower().strip().replace(" ", "_") in competitive_variations
         or ("competitor" in s.get("section_type", "").lower() and "analysis" in s.get("section_type", "").lower())),
        None
    )
    competitive_score = 0
    if competitive_section:
        content = competitive_section.get("content", "")
        word_count = len(content.split())
        
        competitive_score = 10  # Base
        if word_count >= 400:
            competitive_score += 3  # Comprehensive
        if any(word in content.lower() for word in ["competitor", "competitive", "advantage", "differentiator"]):
            competitive_score += 2  # Mentions competition
        if word_count < 200:
            competitive_score -= 5  # Too brief
    breakdown["competitive_analysis"] = max(0, min(100, competitive_score))
    
    # 6. Risk Assessment (10%)
    risk_section = next((s for s in sections if "risk" in s.get("section_type", "").lower() or "risk" in s.get("title", "").lower()), None)
    risk_score = 0
    if risk_section:
        content = risk_section.get("content", "")
        word_count = len(content.split())
        
        risk_score = 10  # Base
        if word_count >= 300:
            risk_score += 3  # Detailed risk analysis
        if any(word in content.lower() for word in ["mitigation", "strategy", "solution"]):
            risk_score += 2  # Mentions mitigation
        if word_count < 150:
            risk_score -= 5  # Too brief
    else:
        # Check if risks are mentioned in other sections
        all_content = " ".join([s.get("content", "") for s in sections])
        if "risk" in all_content.lower():
            risk_score = 5  # Partial credit
    breakdown["risk_assessment"] = max(0, min(100, risk_score))
    
    # 7. Presentation Quality (10%)
    presentation_score = 10  # Base
    total_sections = len(sections)
    completed_sections = sum(1 for s in sections if s.get("content") and len(s.get("content", "").strip()) > 50)
    completion_rate = completed_sections / total_sections if total_sections > 0 else 0
    
    if completion_rate >= 0.9:
        presentation_score += 3  # Nearly complete
    elif completion_rate >= 0.7:
        presentation_score += 1  # Mostly complete
    elif completion_rate < 0.5:
        presentation_score -= 5  # Incomplete
    
    # Check for user edits (indicates polish)
    edited_sections = sum(1 for s in sections if s.get("edited_by_user", False))
    if edited_sections > 0:
        presentation_score += 2  # User has polished content
    
    breakdown["presentation"] = max(0, min(100, presentation_score))
    
    # Calculate overall score
    overall_score = sum(breakdown.values())
    
    # Use AI to generate recommendations
    recommendations = await _generate_recommendations(
        plan, sections, financial_model, breakdown, overall_score
    )
    
    # Store score
    score_data = {
        "overall_score": overall_score,
        "breakdown": breakdown,
        "recommendations": recommendations,
        "last_calculated": datetime.utcnow().isoformat()
    }
    
    await db.plans.update_one(
        {"_id": to_object_id(plan_id)},
        {"$set": {"readiness_score": score_data, "updated_at": datetime.utcnow()}}
    )
    
    return score_data

async def _generate_recommendations(
    plan: Dict,
    sections: List[Dict],
    financial_model: Dict,
    breakdown: Dict,
    overall_score: int
) -> List[Dict]:
    """Generate AI-powered recommendations for improving the plan"""
    
    try:
        # Build context
        section_summaries = []
        for section in sections[:10]:  # First 10 sections
            section_summaries.append({
                "type": section.get("section_type", ""),
                "title": section.get("title", ""),
                "word_count": len(section.get("content", "").split()),
                "has_citations": len(section.get("data_citations", [])) > 0
            })
        
        prompt = f"""Analyze this business plan and provide specific, actionable recommendations to improve its investment readiness.

Plan Context:
- Business: {plan.get("intake_data", {}).get("business_name", "Unknown")}
- Industry: {plan.get("intake_data", {}).get("industry", "Unknown")}
- Purpose: {plan.get("plan_purpose", "generic")}

Current Scores:
- Executive Summary: {breakdown.get("executive_summary", 0)}/100
- Market Analysis: {breakdown.get("market_analysis", 0)}/100
- Financial Projections: {breakdown.get("financial_projections", 0)}/100
- Team/Management: {breakdown.get("team_management", 0)}/100
- Competitive Analysis: {breakdown.get("competitive_analysis", 0)}/100
- Risk Assessment: {breakdown.get("risk_assessment", 0)}/100
- Presentation: {breakdown.get("presentation", 0)}/100
- Overall Score: {overall_score}/100

Section Overview:
{chr(10).join([f"- {s['title']}: {s['word_count']} words, citations: {s['has_citations']}" for s in section_summaries])}

Provide 5-7 specific recommendations in JSON format:
{{
  "recommendations": [
    {{
      "category": "executive_summary|market_analysis|financial_projections|team_management|competitive_analysis|risk_assessment|presentation",
      "priority": "high|medium|low",
      "issue": "Brief description of the issue",
      "suggestion": "Specific actionable suggestion to improve this area"
    }}
  ]
}}

Focus on:
1. Areas with scores below 70
2. Missing critical elements
3. Specific, implementable improvements
4. Prioritize high-impact changes

Return ONLY valid JSON, no other text."""
        
        chat = LlmChat(
            api_key=os.environ.get("OPENAI_API_KEY"),
            session_id=f"readiness_{plan.get('_id')}",
            system_message="You are an expert investment advisor. Provide specific, actionable recommendations in JSON format only."
        ).with_model("openai", "gpt-4o")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse JSON response
        import json
        import re
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            recommendations_data = json.loads(json_match.group())
            return recommendations_data.get("recommendations", [])
        else:
            # Fallback: create basic recommendations
            return _create_fallback_recommendations(breakdown, overall_score)
            
    except Exception as e:
        logger.error(f"Error generating AI recommendations: {e}")
        return _create_fallback_recommendations(breakdown, overall_score)

def _create_fallback_recommendations(breakdown: Dict, overall_score: int) -> List[Dict]:
    """Create fallback recommendations based on scores"""
    recommendations = []
    
    if breakdown.get("executive_summary", 0) < 70:
        recommendations.append({
            "category": "executive_summary",
            "priority": "high",
            "issue": "Executive summary needs improvement",
            "suggestion": "Ensure your executive summary includes: business vision, market opportunity, key financial highlights, and team overview. Aim for 300-500 words."
        })
    
    if breakdown.get("market_analysis", 0) < 70:
        recommendations.append({
            "category": "market_analysis",
            "priority": "high",
            "issue": "Market analysis lacks depth",
            "suggestion": "Add more market data with citations from reliable sources. Include market size, growth trends, and target customer demographics."
        })
    
    if breakdown.get("financial_projections", 0) < 70:
        recommendations.append({
            "category": "financial_projections",
            "priority": "high",
            "issue": "Financial projections incomplete",
            "suggestion": "Ensure you have at least 12 months of P&L and cash flow projections. Include break-even analysis and key financial KPIs."
        })
    
    if breakdown.get("risk_assessment", 0) < 70:
        recommendations.append({
            "category": "risk_assessment",
            "priority": "medium",
            "issue": "Risk assessment missing or incomplete",
            "suggestion": "Add a dedicated risk assessment section identifying key business risks and your mitigation strategies."
        })
    
    if overall_score < 60:
        recommendations.append({
            "category": "presentation",
            "priority": "high",
            "issue": "Overall plan completeness needs improvement",
            "suggestion": "Complete all plan sections and ensure each section has sufficient detail (300+ words minimum)."
        })
    
    return recommendations
