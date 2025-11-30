"""Enhanced Plan Writer Agent with template-based section generation"""

from typing import Dict, List
from datetime import datetime
import os
import logging
import re
from emergentintegrations.llm.chat import LlmChat, UserMessage
from .templates import TemplateFactory

logger = logging.getLogger(__name__)

ZERO_HALLUCINATION_PROMPT = """You are a professional business plan writer.

ABSOLUTE RULES:
1. NEVER invent statistics, market sizes, growth rates, or any numbers
2. ONLY use data from the information provided below
3. Cite all statistics: "According to [SOURCE], ..." or "Our financial projections show..."
4. If data is missing, write "Further research required" or omit the claim
5. NO placeholder text like DATA_PACK, INTAKE_DATA, [NAME], etc. - write complete content
6. Use exact numbers from the data provided
7. Write in professional business English

FORMAT: Professional, clear, suitable for business plan readers"""

class WriterAgent:
    def __init__(self):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        self.model = "gpt-4o"
    
    def _clean_output(self, text: str) -> str:
        """Remove placeholder tokens and clean output"""
        # Remove placeholder patterns
        patterns_to_remove = [
            r'\[INTAKE_DATA\]', r'\[DATA_PACK\]', r'\[FINANCIAL_PACK\]',
            r'\[FOUNDERS_NAME\]', r'\[BUSINESS_NAME\]', r'\[.*?\]',
            'INTAKE_DATA', 'DATA_PACK', 'FINANCIAL_PACK',
            r'\{INTAKE_DATA\}', r'\{DATA_PACK\}', r'\{FINANCIAL_PACK\}'
        ]
        
        cleaned = text
        for pattern in patterns_to_remove:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
        
        # Clean up extra whitespace
        cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)
        cleaned = cleaned.strip()
        
        return cleaned
    
    async def generate_section(self, section_type: str, data_pack: Dict, financial_pack: Dict, intake_data: Dict) -> Dict:
        """Generate section with plan-type specialization"""
        plan_purpose = intake_data.get("plan_purpose", "generic")
        business_name = intake_data.get("business_name", "the business")
        
        # Get market data
        market_data = data_pack.get("market_data", {})
        market_size = market_data.get("market_size_gbp", 0)
        growth_rate = market_data.get("growth_rate_percent", 0)
        market_source = market_data.get("market_size_source", "market research")
        
        # Get financials
        pnl = financial_pack.get("pnl_annual", [])
        year1 = pnl[0] if len(pnl) > 0 else {}
        revenue_y1 = year1.get("revenue", 0)
        net_profit_y1 = year1.get("net_profit", 0)
        opex_y1 = year1.get("total_opex", 0)
        
        # Build specialized prompt
        emphasis = PLAN_TYPE_EMPHASIS.get(plan_purpose, "business model and market opportunity")
        
        section_instructions = {
            "executive_summary": f"Write 200-250 words covering: (1) {business_name}'s core business, (2) market opportunity (£{market_size/1e9:.1f}B market, {growth_rate}% growth from {market_source}), (3) financial summary (Year 1: £{revenue_y1:,.0f} revenue, £{net_profit_y1:,.0f} profit), (4) key strengths. EMPHASIZE: {emphasis}.",
            
            "financial_projections": f"Write 200-250 words summarizing the financial model: (1) Revenue projections starting at £{revenue_y1:,.0f} Year 1, (2) Operating expenses of £{opex_y1:,.0f} annually based on actual planned costs, (3) Break-even analysis, (4) Key financial metrics. For {plan_purpose} plans, emphasize {emphasis}."
        }.get(section_type, f"Write 200-250 words for the {section_type.replace('_', ' ')} section.")
        
        prompt = f"""{ZERO_HALLUCINATION_PROMPT}

TASK: {section_instructions}

BUSINESS INFO:
• Name: {business_name}
• Industry: {intake_data.get('industry')}
• Location: {intake_data.get('location_city')}, {intake_data.get('location_country')}
• Description: {intake_data.get('business_description', 'N/A')}
• Value Proposition: {intake_data.get('unique_value_proposition', 'N/A')}

MARKET DATA:
• Market Size: £{market_size:,} ({market_source}, {market_data.get('market_size_timestamp', 'recent')})
• Growth Rate: {growth_rate}% ({market_data.get('growth_rate_source', 'N/A')})

FINANCIAL PROJECTIONS:
• Year 1 Revenue: £{revenue_y1:,.0f}
• Year 1 Net Profit: £{net_profit_y1:,.0f}
• Annual OpEx: £{opex_y1:,.0f}
• Monthly OpEx: £{opex_y1/12:,.0f}

Remember: Use these EXACT numbers. Cite sources. No placeholders!
"""
        
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"writer_{section_type}",
                system_message="You are a professional business plan writer. Follow all instructions precisely."
            ).with_model("openai", self.model)
            
            response = await chat.send_message(UserMessage(text=prompt))
            cleaned = self._clean_output(response)
            
            return {
                "section_type": section_type,
                "title": section_type.replace('_', ' ').title(),
                "content": cleaned,
                "word_count": len(cleaned.split()),
                "generated_at": datetime.utcnow().isoformat(),
                "ai_generated": True
            }
            
        except Exception as e:
            logger.error(f"Generation error for {section_type}: {e}")
            return {
                "section_type": section_type,
                "title": section_type.replace('_', ' ').title(),
                "content": f"{business_name}'s {section_type.replace('_', ' ')} information will be added here. Please review inputs and regenerate, or edit manually.",
                "word_count": 20,
                "generated_at": datetime.utcnow().isoformat(),
                "ai_generated": False,
                "error": str(e)
            }
    
    async def generate_all_sections(self, data_pack: Dict, financial_pack: Dict, intake_data: Dict) -> List[Dict]:
        """Generate all sections"""
        section_types = [
            "executive_summary", "company_overview", "products_services",
            "market_analysis", "competitive_analysis", "marketing_strategy",
            "operations_plan", "team", "financial_projections"
        ]
        
        sections = []
        for idx, section_type in enumerate(section_types):
            section = await self.generate_section(section_type, data_pack, financial_pack, intake_data)
            section["order_index"] = idx
            sections.append(section)
        
        return sections
