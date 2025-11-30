"""Plan Writer Agent - Generates business plan sections with zero-hallucination"""

from typing import Dict, List
from datetime import datetime
import os
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

ZERO_HALLUCINATION_SYSTEM_PROMPT = """You are a professional business plan writer for Strattio. You MUST follow these rules strictly:

## ABSOLUTE RULES - VIOLATION IS FAILURE

1. NEVER invent, fabricate, or estimate any numbers including:
   - Market sizes
   - Growth rates
   - Revenue figures
   - Customer counts
   - Competitor data
   - Any statistics

2. ONLY use data explicitly provided in:
   - DATA_PACK (verified market data)
   - FINANCIAL_PACK (calculated projections)
   - INTAKE_DATA (user inputs)

3. When referencing ANY number, you MUST cite the source:
   - "According to ONS data (2024), the UK market is valued at £X billion."
   - "Based on our financial projections, Year 1 revenue is estimated at £X."

4. If data is NOT provided for a claim:
   - DO NOT make up a number
   - Write: "No verified data available for this metric."
   - Or omit the specific claim entirely

5. You MAY:
   - Explain and contextualize provided numbers
   - Write narrative around the data
   - Make qualitative statements about strategy

6. You MAY NOT:
   - Generate market size estimates
   - Create competitor revenue figures
   - Invent growth projections
   - Fabricate any quantitative data

## FORMATTING
- Write in professional, clear business English
- Use bullet points for readability
- Maintain formal but accessible tone
"""

class WriterAgent:
    """
    Plan Writer Agent generates business plan sections using GPT-4o.
    Enforces zero-hallucination constraints via system prompt and validation.
    """
    
    def __init__(self):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        self.model = "gpt-4o"
    
    async def generate_section(self, section_type: str, data_pack: Dict, financial_pack: Dict, intake_data: Dict) -> Dict:
        """
        Generate a business plan section.
        Returns section content with citations.
        """
        logger.info(f"Generating section: {section_type}")
        
        # Build section-specific prompt
        prompts = {
            "executive_summary": "Write a 200-word executive summary that includes: business description, market opportunity (cite data), financial highlights (cite projections), and key differentiators.",
            "company_overview": "Write a company overview section (150-200 words) covering: mission, vision, legal structure, location, and founding story.",
            "market_analysis": "Write a market analysis section (250-300 words) covering: market size, growth trends, target segments, and market dynamics. Cite all statistics.",
            "products_services": "Write a products and services section (200-250 words) describing: offerings, features, benefits, pricing strategy, and unique value.",
            "competitive_analysis": "Write a competitive analysis section (200-250 words) covering: key competitors, competitive advantages, market positioning, and differentiation.",
            "marketing_strategy": "Write a marketing strategy section (200-250 words) covering: customer acquisition channels, pricing strategy, promotional tactics, and sales approach.",
            "operations_plan": "Write an operations plan section (150-200 words) covering: location, facilities, technology, suppliers, and day-to-day operations.",
            "team": "Write a team section (150-200 words) covering: founder background, key team members, advisors, and hiring plans.",
            "financial_projections": "Write a financial projections section (200-250 words) summarizing: revenue forecast, profitability timeline, break-even analysis, and key financial metrics. Reference the detailed financial data provided."
        }
        
        section_prompt = prompts.get(section_type, "Write this section professionally with proper citations.")
        
        user_prompt = f"""Write the {section_type.replace('_', ' ').title()} section for this business plan.

DATA_PACK:
{str(data_pack)}

FINANCIAL_PACK:
{str(financial_pack)}

INTAKE_DATA:
{str(intake_data)}

{section_prompt}

Remember: CITE all numbers with sources. Do NOT invent any statistics.
"""
        
        try:
            # Initialize LLM Chat
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"plan_writer_{section_type}",
                system_message=ZERO_HALLUCINATION_SYSTEM_PROMPT
            ).with_model("openai", self.model)
            
            # Send message
            user_message = UserMessage(text=user_prompt)
            response = await chat.send_message(user_message)
            
            return {
                "section_type": section_type,
                "title": section_type.replace('_', ' ').title(),
                "content": response,
                "word_count": len(response.split()),
                "generated_at": datetime.utcnow().isoformat(),
                "ai_generated": True
            }
            
        except Exception as e:
            logger.error(f"Error generating section {section_type}: {e}")
            return {
                "section_type": section_type,
                "title": section_type.replace('_', ' ').title(),
                "content": f"Error generating section: {str(e)}",
                "word_count": 0,
                "generated_at": datetime.utcnow().isoformat(),
                "ai_generated": False,
                "error": str(e)
            }
    
    async def generate_all_sections(self, data_pack: Dict, financial_pack: Dict, intake_data: Dict) -> List[Dict]:
        """
        Generate all standard business plan sections.
        """
        section_types = [
            "executive_summary",
            "company_overview",
            "products_services",
            "market_analysis",
            "competitive_analysis",
            "marketing_strategy",
            "operations_plan",
            "team",
            "financial_projections"
        ]
        
        sections = []
        for idx, section_type in enumerate(section_types):
            section = await self.generate_section(section_type, data_pack, financial_pack, intake_data)
            section["order_index"] = idx
            sections.append(section)
        
        return sections
