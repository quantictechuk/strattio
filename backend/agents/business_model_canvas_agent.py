"""Business Model Canvas Agent - Generate Business Model Canvas data"""

from typing import Dict, List
from datetime import datetime
import os
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

class BusinessModelCanvasAgent:
    """Generates Business Model Canvas data based on business information"""
    
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY")
        self.model = "gpt-4o"
    
    async def generate_canvas(self, intake_data: Dict, data_pack: Dict, financial_pack: Dict) -> Dict:
        """
        Generate Business Model Canvas data
        
        Args:
            intake_data: Business intake information
            data_pack: Market research data
            financial_pack: Financial model data
            
        Returns:
            Dict with all 9 building blocks of the Business Model Canvas
        """
        try:
            business_name = intake_data.get("business_name", "the business")
            industry = intake_data.get("industry", "")
            business_description = intake_data.get("business_description", "")
            unique_value_prop = intake_data.get("unique_value_proposition", "")
            target_customers = intake_data.get("target_customers", "")
            revenue_model = intake_data.get("revenue_model", "")
            
            # Extract financial insights
            financial_insights = ""
            if financial_pack:
                pnl = financial_pack.get("pnl_annual", [])
                if pnl:
                    year1 = pnl[0] if len(pnl) > 0 else {}
                    revenue = year1.get("revenue", 0)
                    financial_insights = f"Year 1 Revenue: £{revenue:,.0f}. "
            
            prompt = f"""Generate a comprehensive Business Model Canvas for the following business.

BUSINESS INFORMATION:
- Business Name: {business_name}
- Industry: {industry}
- Description: {business_description}
- Unique Value Proposition: {unique_value_prop}
- Target Customers: {target_customers}
- Revenue Model: {revenue_model}

FINANCIAL DATA:
{financial_insights}

Generate a Business Model Canvas with all 9 building blocks:

1. KEY PARTNERS: Who are your key partners and suppliers? What key resources are you acquiring from them?
2. KEY ACTIVITIES: What key activities does your value proposition require?
3. KEY RESOURCES: What key resources does your value proposition require?
4. VALUE PROPOSITIONS: What value do you deliver to customers? What problems are you solving?
5. CUSTOMER RELATIONSHIPS: What type of relationship do you establish and maintain with customer segments?
6. CHANNELS: Through which channels do your customer segments want to be reached?
7. CUSTOMER SEGMENTS: Who are your most important customers?
8. COST STRUCTURE: What are the most important costs in your business model?
9. REVENUE STREAMS: For what value are customers willing to pay?

Format the response as JSON with this exact structure:
{{
  "key_partners": ["partner 1", "partner 2", ...],
  "key_activities": ["activity 1", "activity 2", ...],
  "key_resources": ["resource 1", "resource 2", ...],
  "value_propositions": ["value 1", "value 2", ...],
  "customer_relationships": ["relationship type 1", "relationship type 2", ...],
  "channels": ["channel 1", "channel 2", ...],
  "customer_segments": ["segment 1", "segment 2", ...],
  "cost_structure": ["cost 1", "cost 2", ...],
  "revenue_streams": ["revenue stream 1", "revenue stream 2", ...]
}}

Each array should have 3-5 items. Be specific to this business, not generic.
Base analysis on the provided data only."""

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
                
                canvas_data = json.loads(content)
                
                # Validate structure - ensure all 9 blocks exist
                required_blocks = [
                    "key_partners", "key_activities", "key_resources",
                    "value_propositions", "customer_relationships", "channels",
                    "customer_segments", "cost_structure", "revenue_streams"
                ]
                
                for block in required_blocks:
                    if block not in canvas_data:
                        canvas_data[block] = []
                    if not isinstance(canvas_data[block], list):
                        canvas_data[block] = []
                
                logger.info(f"Generated Business Model Canvas for {business_name}")
                return canvas_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse canvas JSON: {e}")
                logger.error(f"Response content: {content[:500]}")
                return self._generate_fallback_canvas(intake_data)
                
        except Exception as e:
            logger.error(f"Error generating canvas: {e}")
            return self._generate_fallback_canvas(intake_data)
    
    def _generate_fallback_canvas(self, intake_data: Dict) -> Dict:
        """Generate a basic canvas structure as fallback"""
        industry = intake_data.get("industry", "")
        unique_value_prop = intake_data.get("unique_value_proposition", "")
        
        return {
            "key_partners": [
                f"{industry} suppliers",
                "Technology partners",
                "Service providers"
            ],
            "key_activities": [
                "Product development",
                "Marketing and sales",
                "Customer support"
            ],
            "key_resources": [
                "Team expertise",
                "Technology platform",
                "Customer relationships"
            ],
            "value_propositions": [
                unique_value_prop or "Unique solution",
                "Quality service",
                "Competitive pricing"
            ],
            "customer_relationships": [
                "Personal assistance",
                "Self-service",
                "Community building"
            ],
            "channels": [
                "Online platform",
                "Direct sales",
                "Partner channels"
            ],
            "customer_segments": [
                intake_data.get("target_customers", "Target market"),
                "Early adopters",
                "Mainstream customers"
            ],
            "cost_structure": [
                "Personnel costs",
                "Technology infrastructure",
                "Marketing expenses"
            ],
            "revenue_streams": [
                "Subscription fees",
                "Transaction fees",
                "Premium services"
            ]
        }
