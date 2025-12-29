"""SWOT Analysis Agent - Auto-generate SWOT matrix from business data"""

from typing import Dict, List
from datetime import datetime
import os
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

class SWOTAgent:
    """Generates SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis"""
    
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY")
        self.model = "gpt-4o"
    
    async def generate_swot(self, intake_data: Dict, data_pack: Dict, financial_pack: Dict) -> Dict:
        """
        Generate SWOT analysis based on business data
        
        Args:
            intake_data: Business intake information
            data_pack: Market research data
            financial_pack: Financial model data
            
        Returns:
            Dict with strengths, weaknesses, opportunities, threats
        """
        try:
            business_name = intake_data.get("business_name", "the business")
            industry = intake_data.get("industry", "")
            location = intake_data.get("location_city", "")
            business_description = intake_data.get("business_description", "")
            unique_value_prop = intake_data.get("unique_value_proposition", "")
            target_customers = intake_data.get("target_customers", "")
            
            # Extract financial insights
            financial_insights = ""
            if financial_pack:
                pnl = financial_pack.get("pnl_annual", [])
                if pnl:
                    year1 = pnl[0] if len(pnl) > 0 else {}
                    revenue = year1.get("revenue", 0)
                    net_profit = year1.get("net_profit", 0)
                    financial_insights = f"Year 1 Revenue: £{revenue:,.0f}, Net Profit: £{net_profit:,.0f}. "
            
            # Extract market data insights
            market_insights = ""
            if data_pack and isinstance(data_pack, dict):
                market_data = data_pack.get("market_data", [])
                if market_data:
                    insights = []
                    for item in market_data[:3]:  # Top 3 insights
                        metric = item.get("metric", "")
                        value = item.get("value", "")
                        if metric and value:
                            insights.append(f"{metric}: {value}")
                    if insights:
                        market_insights = "Market Data: " + "; ".join(insights) + ". "
            
            prompt = f"""Analyze the following business and generate a comprehensive SWOT analysis.

BUSINESS INFORMATION:
- Business Name: {business_name}
- Industry: {industry}
- Location: {location}
- Description: {business_description}
- Unique Value Proposition: {unique_value_prop}
- Target Customers: {target_customers}

FINANCIAL DATA:
{financial_insights}

MARKET DATA:
{market_insights}

Generate a SWOT analysis with:
1. STRENGTHS: 4-6 internal positive attributes, competitive advantages, resources, capabilities
2. WEAKNESSES: 4-6 internal limitations, areas for improvement, resource constraints
3. OPPORTUNITIES: 4-6 external favorable conditions, market trends, growth potential
4. THREATS: 4-6 external challenges, competitive pressures, market risks

Format the response as JSON with this exact structure:
{{
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "opportunities": ["opportunity 1", "opportunity 2", ...],
  "threats": ["threat 1", "threat 2", ...]
}}

Each item should be a concise, actionable statement (1-2 sentences max).
Be specific to this business, not generic.
Base analysis on the provided data only."""

            chat = LlmChat(api_key=self.api_key, model=self.model)
            response = await chat.send_message(UserMessage(content=prompt))
            
            # Parse JSON response
            import json
            try:
                # Extract JSON from response
                content = response.content.strip()
                # Remove markdown code blocks if present
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                content = content.strip()
                
                swot_data = json.loads(content)
                
                # Validate structure
                required_keys = ["strengths", "weaknesses", "opportunities", "threats"]
                for key in required_keys:
                    if key not in swot_data:
                        swot_data[key] = []
                    if not isinstance(swot_data[key], list):
                        swot_data[key] = []
                
                logger.info(f"Generated SWOT analysis for {business_name}")
                return swot_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse SWOT JSON: {e}")
                logger.error(f"Response content: {content[:500]}")
                # Return fallback SWOT
                return self._generate_fallback_swot(intake_data)
                
        except Exception as e:
            logger.error(f"Error generating SWOT: {e}")
            return self._generate_fallback_swot(intake_data)
    
    def _generate_fallback_swot(self, intake_data: Dict) -> Dict:
        """Generate a basic SWOT structure as fallback"""
        business_name = intake_data.get("business_name", "the business")
        industry = intake_data.get("industry", "")
        
        return {
            "strengths": [
                f"Clear business focus in {industry}",
                "Defined target market",
                "Unique value proposition",
                "Established business model"
            ],
            "weaknesses": [
                "Limited operating history",
                "Resource constraints",
                "Market penetration challenges",
                "Need for brand awareness"
            ],
            "opportunities": [
                f"Growing {industry} market",
                "Digital transformation trends",
                "Customer demand for solutions",
                "Partnership opportunities"
            ],
            "threats": [
                "Market competition",
                "Economic uncertainty",
                "Regulatory changes",
                "Technology disruption"
            ]
        }
    
    def format_swot_as_text(self, swot_data: Dict) -> str:
        """Format SWOT data as readable text for plan sections"""
        text = "## SWOT Analysis\n\n"
        
        text += "### Strengths\n"
        for i, strength in enumerate(swot_data.get("strengths", []), 1):
            text += f"{i}. {strength}\n"
        
        text += "\n### Weaknesses\n"
        for i, weakness in enumerate(swot_data.get("weaknesses", []), 1):
            text += f"{i}. {weakness}\n"
        
        text += "\n### Opportunities\n"
        for i, opportunity in enumerate(swot_data.get("opportunities", []), 1):
            text += f"{i}. {opportunity}\n"
        
        text += "\n### Threats\n"
        for i, threat in enumerate(swot_data.get("threats", []), 1):
            text += f"{i}. {threat}\n"
        
        return text
