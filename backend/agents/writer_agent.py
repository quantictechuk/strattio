"""Enhanced Plan Writer Agent with dynamic content and deep plan-type specialization"""

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
8. Reference the ACTUAL business name provided, not generic placeholders

FORMAT: Professional, clear, suitable for business plan readers"""

class WriterAgent:
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY")
        self.model = "gpt-4o"
    
    def _clean_output(self, text: str) -> str:
        """Remove placeholder tokens, error messages, and clean output"""
        # Remove placeholder patterns
        patterns_to_remove = [
            r'\[INTAKE_DATA\]', r'\[DATA_PACK\]', r'\[FINANCIAL_PACK\]',
            r'\[FOUNDERS_NAME\]', r'\[BUSINESS_NAME\]', r'\[LOCATION\]',
            r'\[BUSINESS_DESCRIPTION\]', r'\[INDUSTRY\]',
            'INTAKE_DATA', 'DATA_PACK', 'FINANCIAL_PACK',
            r'\{INTAKE_DATA\}', r'\{DATA_PACK\}', r'\{FINANCIAL_PACK\}',
            r'\{.*?_DATA\}', r'\{.*?_PACK\}',
            # Remove error messages
            r'Budget has been exceeded.*',
            r'API error.*',
            r'Error:.*',
            r'exceeded budget.*',
            # Remove leftover brackets with all caps
            r'\[[A-Z_]+\]'
        ]
        
        cleaned = text
        for pattern in patterns_to_remove:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
        
        # Remove any remaining square bracket placeholders
        cleaned = re.sub(r'\[([A-Z_\s]+)\]', '', cleaned)
        
        # Clean up extra whitespace
        cleaned = re.sub(r'\n\s*\n\s*\n+', '\n\n', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned)  # Normalize spaces
        cleaned = cleaned.strip()
        
        return cleaned
    
    def _contains_placeholders(self, text: str) -> bool:
        """Check if text contains placeholder patterns"""
        placeholder_patterns = [
            'DATA_PACK', 'FINANCIAL_PACK', 'INTAKE_DATA',
            '[BUSINESS_NAME]', '[FOUNDERS_NAME]', '[LOCATION]',
            'Budget has been exceeded', 'API error', 'exceeded budget'
        ]
        
        text_upper = text.upper()
        for pattern in placeholder_patterns:
            if pattern.upper() in text_upper:
                return True
        return False
    
    def _get_plan_type_specific_guidance(self, plan_purpose: str, section_type: str) -> str:
        """Get plan-type specific writing guidance for deeper specialization"""
        
        # Loan-specific guidance
        if plan_purpose == "loan":
            loan_guidance = {
                "executive_summary": "Emphasize loan viability: repayment capacity, break-even timeline, and low-risk nature of the business.",
                "financial_projections": "Focus on cash flow sustainability, loan repayment schedule, and affordability. Show clear path to profitability.",
                "business_model": "Explain how the business generates consistent cash flow to meet loan obligations.",
                "market_analysis": "Demonstrate stable market with predictable revenue opportunities.",
                "risk_analysis": "Address financial risks and show mitigation strategies that protect loan repayment ability."
            }
            return loan_guidance.get(section_type, "Frame content to demonstrate business viability and loan repayment capacity.")
        
        # Start-Up Visa specific guidance
        elif plan_purpose == "visa_startup":
            visa_guidance = {
                "executive_summary": "Lead with innovation claim, UK market opportunity, and scalability potential.",
                "business_model": "Emphasize viability in the UK market and sustainable revenue generation over 2+ years.",
                "market_analysis": "Deep focus on UK market specifically - size, trends, customer needs in UK context.",
                "products_services": "Highlight what makes this innovative and how it meets UK market needs.",
                "operations_plan": "Show practical feasibility of operating in the UK.",
                "team": "Demonstrate capability to execute in the UK market.",
                "risk_analysis": "Address UK-specific risks and mitigation."
            }
            return visa_guidance.get(section_type, "Frame content to demonstrate innovation, UK viability, and scalability for visa endorsement.")
        
        # Innovator Founder Visa specific guidance
        elif plan_purpose == "visa_innovator":
            innovator_guidance = {
                "executive_summary": "Strong innovation narrative with high-growth trajectory and investment readiness.",
                "business_model": "Show defensible model with IP protection and path to market leadership.",
                "market_analysis": "Large addressable market with internationalization potential beyond UK.",
                "products_services": "Emphasize significant innovation, IP strategy, and competitive moat.",
                "operations_plan": "Show scalable operations capable of high-growth execution.",
                "team": "Deep focus on founder credentials, track record, and capability to execute at scale.",
                "financial_projections": "Show aggressive but achievable growth trajectory suitable for institutional investment.",
                "risk_analysis": "Address scaling risks with clear mitigation strategies."
            }
            return innovator_guidance.get(section_type, "Frame content for high-growth, investment-ready business with significant innovation.")
        
        # Investor pitch specific guidance
        elif plan_purpose == "investor":
            investor_guidance = {
                "executive_summary": "Write as compelling investor pitch: problem, solution, market size, traction, ask.",
                "market_analysis": "Include TAM/SAM/SOM analysis, show large growing market with clear path to capture.",
                "business_model": "Focus on unit economics, scalability, capital efficiency, and attractive margins.",
                "products_services": "Emphasize competitive advantage, moat, and why customers will choose this solution.",
                "marketing_strategy": "Show CAC analysis, clear GTM strategy, and repeatable customer acquisition.",
                "team": "Highlight founder-market fit and why THIS team will win.",
                "financial_projections": "Show path to profitability, attractive returns, and efficient use of capital.",
                "risk_analysis": "Frame risks as manageable with clear mitigation - investors expect honesty."
            }
            return investor_guidance.get(section_type, "Frame content for investor audience: emphasize returns, traction, and competitive moat.")
        
        # Generic - neutral guidance
        else:
            return "Write in neutral, professional tone suitable for general business planning purposes."
    
    async def generate_section(self, section_type: str, data_pack: Dict, financial_pack: Dict, intake_data: Dict) -> Dict:
        """Generate section using template-based instructions with fully dynamic data"""
        plan_purpose = intake_data.get("plan_purpose", "generic")
        business_name = intake_data.get("business_name", "the business")
        
        # Get template configuration
        template_config = TemplateFactory.get_template(plan_purpose)
        section_def = TemplateFactory.get_section_definition(plan_purpose, section_type)
        
        if not section_def:
            logger.warning(f"Section {section_type} not found in template for {plan_purpose}")
            return {
                "section_type": section_type,
                "title": section_type.replace('_', ' ').title(),
                "content": "This section requires additional information. Please contact support or regenerate the plan.",
                "word_count": 0,
                "generated_at": datetime.utcnow().isoformat(),
                "ai_generated": False,
                "error": "Section not in template"
            }
        
        # Extract ALL user data comprehensively
        market_data = data_pack.get("market_data", {})
        market_size = market_data.get("market_size_gbp", 0)
        growth_rate = market_data.get("growth_rate_percent", 0)
        market_source = market_data.get("market_size_source", "market research")
        
        # Get complete financials from engine
        pnl = financial_pack.get("pnl_annual", [])
        cashflow = financial_pack.get("cashflow_annual", [])
        kpis = financial_pack.get("kpis", {})
        
        year1 = pnl[0] if len(pnl) > 0 else {}
        year2 = pnl[1] if len(pnl) > 1 else {}
        year3 = pnl[2] if len(pnl) > 2 else {}
        year5 = pnl[4] if len(pnl) > 4 else {}
        
        # Revenue trajectory
        revenue_y1 = year1.get("revenue", 0)
        revenue_y2 = year2.get("revenue", 0)
        revenue_y3 = year3.get("revenue", 0)
        revenue_y5 = year5.get("revenue", 0)
        
        # Profitability
        gross_profit_y1 = year1.get("gross_profit", 0)
        net_profit_y1 = year1.get("net_profit", 0)
        net_profit_y3 = year3.get("net_profit", 0)
        
        # Operating expenses (user-defined)
        opex_y1 = year1.get("total_opex", 0)
        opex_monthly = opex_y1 / 12 if opex_y1 > 0 else 0
        
        # Detailed OPEX breakdown from USER INPUT
        opex_data = intake_data.get("operating_expenses", {})
        opex_salaries = opex_data.get("salaries", 0)
        opex_marketing = opex_data.get("marketing", 0)
        opex_software = opex_data.get("software_tools", 0)
        opex_hosting = opex_data.get("hosting_domain", 0)
        opex_workspace = opex_data.get("workspace_utilities", 0)
        opex_misc = opex_data.get("miscellaneous", 0)
        
        # KPIs
        gross_margin = kpis.get("gross_margin_percent", 0)
        net_margin = kpis.get("net_margin_percent", 0)
        roi_y1 = kpis.get("roi_year1_percent", 0)
        break_even_months = kpis.get("break_even_months", 0)
        
        # Cashflow
        cf_y1 = cashflow[0] if len(cashflow) > 0 else {}
        net_cashflow_y1 = cf_y1.get("net_cashflow", 0)
        
        # Revenue model specifics
        price_per_unit = intake_data.get("price_per_unit", 0)
        units_per_month = intake_data.get("units_per_month", 0)
        starting_capital = intake_data.get("starting_capital", 0)
        
        # Get plan-type specific guidance for this section
        plan_guidance = self._get_plan_type_specific_guidance(plan_purpose, section_type)
        
        # Build comprehensive, dynamic prompt
        task_instructions = f"{section_def.instructions}\n\nTarget: {section_def.min_words}-{section_def.max_words} words.\nTone: {template_config.tone}\nEmphasis: {template_config.emphasis}\n\nPLAN-TYPE SPECIFIC GUIDANCE: {plan_guidance}"
        
        prompt = f"""{ZERO_HALLUCINATION_PROMPT}

CRITICAL INSTRUCTIONS:
1. Use ONLY the data provided below - NO hard-coded examples or generic companies
2. Reference "{business_name}" specifically throughout (not "the business" or "the company")
3. Use EXACT numbers from financial projections - verify every figure
4. Write for {template_config.template_name} with {template_config.tone} tone
5. Emphasize: {template_config.emphasis}
6. Apply plan-specific framing: {plan_guidance}

TASK: {task_instructions}

===== USER'S ACTUAL BUSINESS DATA =====

BUSINESS IDENTITY:
• Business Name: {business_name}
• Industry/Sector: {intake_data.get('industry', 'N/A')}
• Location: {intake_data.get('location_city', 'N/A')}, {intake_data.get('location_country', 'N/A')}
• Business Description: {intake_data.get('business_description', 'N/A')}
• Unique Value Proposition: {intake_data.get('unique_value_proposition', 'N/A')}
• Target Customers: {intake_data.get('target_customers', 'N/A')}

REVENUE MODEL:
• Revenue Streams: {', '.join(intake_data.get('revenue_model', []))}
• Pricing: £{price_per_unit:.2f} per unit
• Volume: {units_per_month:,} units/month
• Starting Capital: £{starting_capital:,}

MARKET INTELLIGENCE:
• Market Size: £{market_size:,.0f} ({market_source}, {market_data.get('market_size_timestamp', 'recent')})
• Market Growth Rate: {growth_rate:.1f}% annually ({market_data.get('growth_rate_source', 'N/A')})

FINANCIAL PROJECTIONS (from deterministic engine):
Revenue Trajectory:
• Year 1: £{revenue_y1:,.0f}
• Year 2: £{revenue_y2:,.0f}
• Year 3: £{revenue_y3:,.0f}
• Year 5: £{revenue_y5:,.0f}

Profitability:
• Gross Profit Y1: £{gross_profit_y1:,.0f}
• Net Profit Y1: £{net_profit_y1:,.0f}
• Net Profit Y3: £{net_profit_y3:,.0f}

Key Metrics:
• Gross Margin: {gross_margin:.1f}%
• Net Margin: {net_margin:.1f}%
• ROI Year 1: {roi_y1:.1f}%
• Break-even: Month {break_even_months:.0f}

USER-DEFINED OPERATING EXPENSES (Monthly):
• Salaries/Wages: £{opex_salaries:,.0f}
• Marketing/Advertising: £{opex_marketing:,.0f}
• Software/Tools: £{opex_software:,.0f}
• Hosting/Domain: £{opex_hosting:,.0f}
• Workspace/Utilities: £{opex_workspace:,.0f}
• Miscellaneous: £{opex_misc:,.0f}
• TOTAL Monthly OpEx: £{opex_monthly:,.0f}
• TOTAL Annual OpEx: £{opex_y1:,.0f}

CASHFLOW:
• Year 1 Net Cashflow: £{net_cashflow_y1:,.0f}

TEAM:
• Team Size: {intake_data.get('team_size', 'N/A')} people

===== END USER DATA =====

MANDATORY RULES:
- Use these EXACT numbers in your narrative
- Reference "{business_name}" specifically (not "the business" or generic examples)
- Cite data sources where mentioned (e.g., "According to {market_source}...")
- NO PLACEHOLDERS like [NAME], DATA_PACK, etc.
- NO hard-coded example companies or locations
- ALL figures must come from the data above
"""
        
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"writer_{section_type}_{plan_purpose}",
                system_message="You are a professional business plan writer. Write using ONLY the provided data. NO placeholders, NO generic examples, NO hard-coded content."
            ).with_model("openai", self.model)
            
            response = await chat.send_message(UserMessage(text=prompt))
            cleaned = self._clean_output(response)
            
            # Validate output doesn't contain placeholders
            if self._contains_placeholders(cleaned):
                logger.warning(f"Section {section_type} contains placeholders after generation")
            
            return {
                "section_type": section_type,
                "title": section_def.title,
                "content": cleaned,
                "word_count": len(cleaned.split()),
                "generated_at": datetime.utcnow().isoformat(),
                "ai_generated": True
            }
            
        except Exception as e:
            logger.error(f"Generation error for {section_type}: {e}")
            
            # Provide user-friendly fallback message
            fallback_content = f"""This section could not be generated automatically. 

To complete your {section_def.title}, please provide additional details or regenerate this section from the plan editor.

If this issue persists, please contact support."""
            
            return {
                "section_type": section_type,
                "title": section_def.title,
                "content": fallback_content,
                "word_count": len(fallback_content.split()),
                "generated_at": datetime.utcnow().isoformat(),
                "ai_generated": False,
                "requires_user_input": True
            }
    
    async def generate_all_sections(self, data_pack: Dict, financial_pack: Dict, intake_data: Dict) -> List[Dict]:
        """Generate all sections based on plan_purpose template"""
        plan_purpose = intake_data.get("plan_purpose", "generic")
        
        # Get all sections from template
        all_section_defs = TemplateFactory.get_all_sections_for_plan(plan_purpose)
        
        logger.info(f"Generating {len(all_section_defs)} sections for {plan_purpose} plan")
        
        sections = []
        for section_def in all_section_defs:
            section = await self.generate_section(
                section_def.section_type,
                data_pack,
                financial_pack,
                intake_data
            )
            section["order_index"] = section_def.order_index
            sections.append(section)
        
        return sections
