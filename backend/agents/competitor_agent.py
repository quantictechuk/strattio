"""Competitor Analysis Agent - Identify competitors and analyze market positioning"""

from typing import Dict, List
from datetime import datetime
import os
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

class CompetitorAgent:
    """Generates competitor analysis based on business data"""
    
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY")
        self.model = "gpt-4o"
    
    async def generate_competitor_analysis(self, intake_data: Dict, data_pack: Dict) -> Dict:
        """
        Generate competitor analysis based on business data
        
        Args:
            intake_data: Business intake information
            data_pack: Market research data
            
        Returns:
            Dict with competitors list and analysis
        """
        try:
            business_name = intake_data.get("business_name", "the business")
            industry = intake_data.get("industry", "")
            location = intake_data.get("location_city", "")
            business_description = intake_data.get("business_description", "")
            unique_value_prop = intake_data.get("unique_value_proposition", "")
            target_customers = intake_data.get("target_customers", "")
            
            # Extract market insights
            market_insights = ""
            if data_pack and isinstance(data_pack, dict):
                market_data = data_pack.get("market_data", [])
                if market_data:
                    insights = []
                    for item in market_data[:5]:  # Top 5 insights
                        metric = item.get("metric", "")
                        value = item.get("value", "")
                        if metric and value:
                            insights.append(f"{metric}: {value}")
                    if insights:
                        market_insights = "Market Context: " + "; ".join(insights) + ". "
            
            prompt = f"""Analyze the competitive landscape for the following business and generate a comprehensive competitor analysis.

BUSINESS INFORMATION:
- Business Name: {business_name}
- Industry: {industry}
- Location: {location}
- Description: {business_description}
- Unique Value Proposition: {unique_value_prop}
- Target Customers: {target_customers}

MARKET DATA:
{market_insights}

Generate a competitor analysis with:
1. COMPETITORS: 3-5 main competitors (real or representative companies in this industry/location)
   For each competitor, provide:
   - Company name (realistic name if specific company unknown)
   - Market position (e.g., "Market Leader", "Established Player", "Emerging Competitor")
   - Key strengths
   - Key weaknesses
   - Pricing strategy (if applicable)
   - Market share estimate (if applicable)

2. COMPETITIVE ADVANTAGES: 3-5 ways this business differentiates from competitors

3. MARKET POSITIONING: How this business positions itself relative to competitors

4. COMPETITIVE THREATS: 3-4 main competitive threats

Format the response as JSON with this exact structure:
{{
  "competitors": [
    {{
      "name": "Competitor Name",
      "market_position": "Market Leader",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "pricing_strategy": "Premium pricing",
      "market_share": "~30%"
    }}
  ],
  "competitive_advantages": ["advantage 1", "advantage 2", ...],
  "market_positioning": "Description of how the business positions itself",
  "competitive_threats": ["threat 1", "threat 2", ...]
}}

Be specific to this business and industry, not generic.
Base analysis on the provided data and realistic industry knowledge."""

            chat = LlmChat(api_key=self.api_key, model=self.model)
            response = await chat.send_message(UserMessage(content=prompt))
            
            # Parse JSON response
            import json
            try:
                content = response.content.strip()
                # Remove markdown code blocks if present
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                content = content.strip()
                
                competitor_data = json.loads(content)
                
                # Validate structure
                if "competitors" not in competitor_data:
                    competitor_data["competitors"] = []
                if "competitive_advantages" not in competitor_data:
                    competitor_data["competitive_advantages"] = []
                if "market_positioning" not in competitor_data:
                    competitor_data["market_positioning"] = ""
                if "competitive_threats" not in competitor_data:
                    competitor_data["competitive_threats"] = []
                
                logger.info(f"Generated competitor analysis for {business_name}")
                return competitor_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse competitor JSON: {e}")
                logger.error(f"Response content: {content[:500]}")
                return self._generate_fallback_competitor_analysis(intake_data)
                
        except Exception as e:
            logger.error(f"Error generating competitor analysis: {e}")
            return self._generate_fallback_competitor_analysis(intake_data)
    
    def _generate_fallback_competitor_analysis(self, intake_data: Dict) -> Dict:
        """Generate a basic competitor structure as fallback"""
        industry = intake_data.get("industry", "")
        
        return {
            "competitors": [
                {
                    "name": f"Established {industry} Company A",
                    "market_position": "Market Leader",
                    "strengths": ["Brand recognition", "Established customer base"],
                    "weaknesses": ["Higher prices", "Less innovation"],
                    "pricing_strategy": "Premium",
                    "market_share": "~25%"
                },
                {
                    "name": f"Emerging {industry} Company B",
                    "market_position": "Emerging Competitor",
                    "strengths": ["Innovation", "Agility"],
                    "weaknesses": ["Limited resources", "Small market share"],
                    "pricing_strategy": "Competitive",
                    "market_share": "~10%"
                }
            ],
            "competitive_advantages": [
                "Unique value proposition",
                "Targeted customer focus",
                "Competitive pricing"
            ],
            "market_positioning": f"Positioned as a focused {industry} solution provider",
            "competitive_threats": [
                "Market competition",
                "Price pressure",
                "New entrants"
            ]
        }
    
    def format_competitor_analysis_as_text(self, competitor_data: Dict) -> str:
        """Format competitor data as readable text for plan sections"""
        text = "## Competitor Analysis\n\n"
        
        # Competitors
        text += "### Main Competitors\n\n"
        for i, competitor in enumerate(competitor_data.get("competitors", []), 1):
            text += f"#### {i}. {competitor.get('name', 'Competitor')}\n"
            text += f"**Market Position:** {competitor.get('market_position', 'N/A')}\n\n"
            
            if competitor.get('strengths'):
                text += "**Strengths:**\n"
                for strength in competitor['strengths']:
                    text += f"- {strength}\n"
                text += "\n"
            
            if competitor.get('weaknesses'):
                text += "**Weaknesses:**\n"
                for weakness in competitor['weaknesses']:
                    text += f"- {weakness}\n"
                text += "\n"
            
            if competitor.get('pricing_strategy'):
                text += f"**Pricing Strategy:** {competitor['pricing_strategy']}\n\n"
            
            if competitor.get('market_share'):
                text += f"**Market Share:** {competitor['market_share']}\n\n"
        
        # Competitive Advantages
        text += "### Our Competitive Advantages\n\n"
        for i, advantage in enumerate(competitor_data.get("competitive_advantages", []), 1):
            text += f"{i}. {advantage}\n"
        
        # Market Positioning
        if competitor_data.get("market_positioning"):
            text += "\n### Market Positioning\n\n"
            text += f"{competitor_data['market_positioning']}\n\n"
        
        # Competitive Threats
        text += "\n### Competitive Threats\n\n"
        for i, threat in enumerate(competitor_data.get("competitive_threats", []), 1):
            text += f"{i}. {threat}\n"
        
        return text
