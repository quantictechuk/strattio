"""Business Plan Template System - Base and Specialized Templates"""

from typing import Dict, List
from dataclasses import dataclass, field

@dataclass
class SectionDefinition:
    """Definition of a business plan section"""
    section_type: str
    title: str
    order_index: int
    instructions: str
    min_words: int = 200
    max_words: int = 300
    required: bool = True

@dataclass
class TemplateConfig:
    """Configuration for a business plan template"""
    template_id: str
    template_name: str
    tone: str
    emphasis: str
    base_sections: List[SectionDefinition] = field(default_factory=list)
    additional_sections: List[SectionDefinition] = field(default_factory=list)
    section_overrides: Dict[str, Dict] = field(default_factory=dict)


class BaseTemplate:
    """
    Base Template - 11 Core Sections shared across all plans
    """
    
    BASE_SECTIONS = [
        SectionDefinition(
            section_type="executive_summary",
            title="Executive Summary",
            order_index=0,
            instructions="Concise overview of business, market opportunity, financial highlights, and key strengths.",
            min_words=200,
            max_words=300
        ),
        SectionDefinition(
            section_type="company_overview",
            title="Company Overview",
            order_index=1,
            instructions="Company description, mission, vision, legal structure, location, and founding story.",
            min_words=200,
            max_words=300
        ),
        SectionDefinition(
            section_type="market_analysis",
            title="Market Analysis",
            order_index=2,
            instructions="Market size, growth trends, target market segments, and market opportunity.",
            min_words=200,
            max_words=300
        ),
        SectionDefinition(
            section_type="products_services",
            title="Products & Services",
            order_index=3,
            instructions="Detailed description of products/services, features, benefits, and unique value proposition.",
            min_words=200,
            max_words=300
        ),
        SectionDefinition(
            section_type="business_model",
            title="Business Model",
            order_index=4,
            instructions="Revenue streams, pricing strategy, cost structure, and how the business makes money.",
            min_words=200,
            max_words=300
        ),
        SectionDefinition(
            section_type="marketing_strategy",
            title="Marketing & Sales Strategy",
            order_index=5,
            instructions="Customer acquisition channels, marketing tactics, sales process, and growth strategy.",
            min_words=200,
            max_words=300
        ),
        SectionDefinition(
            section_type="operations_plan",
            title="Operations Plan",
            order_index=6,
            instructions="Day-to-day operations, key processes, technology stack, suppliers, and operational infrastructure.",
            min_words=200,
            max_words=300
        ),
        SectionDefinition(
            section_type="team",
            title="Team & Roles",
            order_index=7,
            instructions="Founder and team backgrounds, roles, relevant experience, and organizational structure.",
            min_words=200,
            max_words=300
        ),
        SectionDefinition(
            section_type="financial_projections",
            title="Financial Forecasts",
            order_index=8,
            instructions="Revenue projections, operating expenses, profitability timeline, and key financial metrics.",
            min_words=200,
            max_words=300
        ),
        SectionDefinition(
            section_type="risk_analysis",
            title="Risk Analysis",
            order_index=9,
            instructions="Key business risks, market risks, competitive risks, and mitigation strategies.",
            min_words=200,
            max_words=250
        ),
        SectionDefinition(
            section_type="appendix",
            title="Appendix",
            order_index=10,
            instructions="Data sources, assumptions, supporting documents, and references.",
            min_words=100,
            max_words=200
        )
    ]
    
    @classmethod
    def get_config(cls) -> TemplateConfig:
        """Get template configuration"""
        return TemplateConfig(
            template_id="base",
            template_name="Base Template",
            tone="professional",
            emphasis="business model and market opportunity",
            base_sections=cls.BASE_SECTIONS,
            additional_sections=[],
            section_overrides={}
        )


class GeneralBusinessPlanTemplate(BaseTemplate):
    """
    General Business Plan Template
    Uses base template as-is with neutral tone
    """
    
    @classmethod
    def get_config(cls) -> TemplateConfig:
        config = super().get_config()
        config.template_id = "generic"
        config.template_name = "General Business Plan"
        config.tone = "neutral, professional"
        config.emphasis = "clear business model, market opportunity, realistic projections"
        
        # No additional sections needed
        config.additional_sections = []
        
        # No overrides needed - base template is sufficient
        config.section_overrides = {}
        
        return config


class UKStartUpLoanTemplate(BaseTemplate):
    """
    UK Start-Up Loan Application Template
    Emphasis on repayment capacity and cash flow
    """
    
    @classmethod
    def get_config(cls) -> TemplateConfig:
        config = super().get_config()
        config.template_id = "loan"
        config.template_name = "UK Start-Up Loan Application"
        config.tone = "pragmatic, cashflow-focused, viability-driven"
        config.emphasis = "repayment capacity, cash flow, break-even timeline, low risk, business viability"
        
        # Section overrides for loan focus
        config.section_overrides = {
            "executive_summary": {
                "instructions": "Overview highlighting loan request amount, business viability, and repayment capacity. Emphasize cashflow sustainability and break-even timeline."
            },
            "financial_projections": {
                "instructions": "Detailed financial projections emphasizing positive cash flow, break-even analysis, and loan repayment schedule. Show affordability of repayments."
            }
        }
        
        # Additional sections required for Start-Up Loan
        config.additional_sections = [
            SectionDefinition(
                section_type="loan_request",
                title="Loan Request & Funding Breakdown",
                order_index=11,
                instructions="Exact loan amount requested, detailed breakdown of how funds will be used (equipment, marketing, working capital, etc.). Be specific with amounts.",
                min_words=150,
                max_words=250
            ),
            SectionDefinition(
                section_type="survival_budget",
                title="12-Month Survival Budget",
                order_index=12,
                instructions="Founder's personal living costs and how they will be covered during the first 12 months. Show business can sustain founder.",
                min_words=150,
                max_words=200
            ),
            SectionDefinition(
                section_type="repayment_plan",
                title="Repayment Plan & Affordability",
                order_index=13,
                instructions="Detailed loan repayment schedule based on projected cash flows. Demonstrate affordability and ability to meet repayment obligations.",
                min_words=200,
                max_words=300
            ),
            SectionDefinition(
                section_type="loan_eligibility",
                title="Loan Eligibility & Compliance",
                order_index=14,
                instructions="Confirmation of eligibility criteria: UK-based business, business age, sector alignment. Reference Start-Up Loan guidance compliance.",
                min_words=100,
                max_words=150
            )
        ]
        
        return config


class UKStartUpVisaTemplate(BaseTemplate):
    """
    UK Start-Up Visa Plan Template
    Must demonstrate innovation, viability, and scalability
    """
    
    @classmethod
    def get_config(cls) -> TemplateConfig:
        config = super().get_config()
        config.template_id = "visa_startup"
        config.template_name = "UK Start-Up Visa Plan"
        config.tone = "innovation-focused, sustainable growth oriented, endorsement-aligned"
        config.emphasis = "innovation, UK market opportunity, scalability, job creation, viability"
        
        # Section overrides for visa requirements
        config.section_overrides = {
            "executive_summary": {
                "instructions": "Emphasize the innovative concept, UK market viability, and scalability potential. Highlight how this business meets Start-Up Visa innovation criteria."
            },
            "business_model": {
                "instructions": "Focus on UK market viability and sustainable revenue model. Demonstrate the business can operate successfully in the UK."
            },
            "market_analysis": {
                "instructions": "Deep dive into UK market opportunity specifically. Show understanding of UK market dynamics and customer needs."
            }
        }
        
        # Additional sections required for Start-Up Visa
        config.additional_sections = [
            SectionDefinition(
                section_type="innovation_section",
                title="Innovation",
                order_index=11,
                instructions="Detailed description of what makes this business innovative. Explain the novel approach, technology, process, or business model. Reference specific innovations.",
                min_words=250,
                max_words=350
            ),
            SectionDefinition(
                section_type="viability_assessment",
                title="Viability Assessment",
                order_index=12,
                instructions="Evidence that the business is viable in the UK market for at least 2 years. Include financial sustainability, market demand, and operational feasibility.",
                min_words=200,
                max_words=300
            ),
            SectionDefinition(
                section_type="scalability_roadmap",
                title="Scalability Roadmap",
                order_index=13,
                instructions="Clear plan for how the business will scale over time. Include growth milestones, expansion strategy, and long-term vision.",
                min_words=200,
                max_words=300
            ),
            SectionDefinition(
                section_type="uk_job_creation",
                title="UK Job Creation Plan",
                order_index=14,
                instructions="Projected job creation over 2-3 years. Include roles, timing, and contribution to UK economy.",
                min_words=150,
                max_words=250
            ),
            SectionDefinition(
                section_type="visa_compliance_checklist",
                title="Visa Compliance Checklist",
                order_index=15,
                instructions="Confirmation that the business meets all Start-Up Visa criteria: innovation, viability, scalability. Reference Home Office guidance.",
                min_words=150,
                max_words=200
            )
        ]
        
        return config


class UKInnovatorFounderVisaTemplate(BaseTemplate):
    """
    UK Innovator Founder Visa Plan Template
    Higher bar: significant innovation, high growth potential, investment readiness
    """
    
    @classmethod
    def get_config(cls) -> TemplateConfig:
        config = super().get_config()
        config.template_id = "visa_innovator"
        config.template_name = "UK Innovator Founder Visa Plan"
        config.tone = "high-growth oriented, investment-ready, innovation-leading"
        config.emphasis = "significant innovation, scalability, viability, high-growth trajectory, UK job creation, IP strategy"
        
        # Section overrides for higher visa tier
        config.section_overrides = {
            "executive_summary": {
                "instructions": "Strong innovation claim with high-growth narrative. Position as investment-ready opportunity with significant UK economic contribution potential."
            },
            "business_model": {
                "instructions": "Demonstrate defensible business model with IP protection, technology moat, and long-term competitive advantage. Show path to market leadership."
            },
            "market_analysis": {
                "instructions": "Include internationalization potential beyond UK. Show large addressable market and path to market dominance."
            },
            "team": {
                "instructions": "Emphasize founder credentials, relevant expertise, track record, and capability to execute at scale. Highlight why this team can succeed."
            }
        }
        
        # Additional sections required for Innovator Founder Visa
        config.additional_sections = [
            SectionDefinition(
                section_type="innovation_ip_strategy",
                title="Innovation & IP Strategy",
                order_index=11,
                instructions="Detailed innovation claim with IP protection strategy (patents, trademarks, trade secrets). Explain technology differentiation and defensibility.",
                min_words=300,
                max_words=400
            ),
            SectionDefinition(
                section_type="high_growth_roadmap",
                title="High-Growth Roadmap (3–5 Years)",
                order_index=12,
                instructions="Aggressive growth plan with clear milestones. Include scaling strategy, market expansion (UK and international), and path to significant revenue.",
                min_words=250,
                max_words=350
            ),
            SectionDefinition(
                section_type="investment_readiness",
                title="Investment Readiness Section",
                order_index=13,
                instructions="Demonstrate readiness for institutional investment. Include funding requirements, use of funds, traction achieved, and investor value proposition.",
                min_words=250,
                max_words=350
            ),
            SectionDefinition(
                section_type="founder_credentials",
                title="Founder Credentials & Capability",
                order_index=14,
                instructions="Deep dive into founder background, relevant experience, achievements, education, and why this team has the capability to execute successfully.",
                min_words=250,
                max_words=350
            ),
            SectionDefinition(
                section_type="uk_job_creation_plan",
                title="Job Creation & National Benefit",
                order_index=15,
                instructions="Detailed UK job creation projections (3-5 years). Include economic contribution, skills transfer, and benefits to UK economy beyond direct employment.",
                min_words=200,
                max_words=300
            ),
            SectionDefinition(
                section_type="home_office_compliance",
                title="Home Office Compliance Notes",
                order_index=16,
                instructions="Confirmation of meeting all Innovator Founder Visa criteria: innovation, viability, scalability, £50k+ funding requirement, endorsement alignment.",
                min_words=150,
                max_words=200
            )
        ]
        
        return config


class InvestorPitchTemplate(BaseTemplate):
    """
    Investor Pitch / Fundraising Plan Template
    Focus on return opportunity, traction, and competitive moat
    """
    
    @classmethod
    def get_config(cls) -> TemplateConfig:
        config = super().get_config()
        config.template_id = "investor"
        config.template_name = "Investor Pitch / Fundraising Plan"
        config.tone = "investor-focused, traction-driven, return-oriented, aggressive growth"
        config.emphasis = "TAM/SAM/SOM, traction, competitive moat, returns, exit strategy, unit economics"
        
        # Section overrides for investor focus
        config.section_overrides = {
            "executive_summary": {
                "instructions": "Written as an investor pitch. Lead with problem/opportunity, solution, market size, traction, and investment ask. Make it compelling."
            },
            "market_analysis": {
                "instructions": "Include detailed TAM/SAM/SOM analysis with market sizing. Show large, growing market with clear path to capture meaningful share."
            },
            "products_services": {
                "instructions": "Focus on competitive advantage, moat, defensibility, and why customers will choose this solution. Include proof points if available."
            },
            "business_model": {
                "instructions": "Emphasize unit economics, scalability, and path to profitability. Show attractive margins and capital efficiency."
            },
            "team": {
                "instructions": "Highlight founder-market fit, relevant experience, advisory board, and why this team will win. Investors bet on teams."
            }
        }
        
        # Additional sections required for Investor Pitch
        config.additional_sections = [
            SectionDefinition(
                section_type="problem_opportunity",
                title="Problem & Opportunity",
                order_index=11,
                instructions="Clearly articulate the problem being solved and the market opportunity. Make it compelling and urgent. Show why now is the right time.",
                min_words=200,
                max_words=300
            ),
            SectionDefinition(
                section_type="tam_sam_som",
                title="TAM / SAM / SOM",
                order_index=12,
                instructions="Detailed market sizing: Total Addressable Market, Serviceable Addressable Market, Serviceable Obtainable Market. Include sources and assumptions.",
                min_words=200,
                max_words=300
            ),
            SectionDefinition(
                section_type="traction_metrics",
                title="Traction & Metrics",
                order_index=13,
                instructions="Current traction: users, revenue, partnerships, milestones achieved. If pre-revenue, show projected milestones and proof of concept.",
                min_words=200,
                max_words=300
            ),
            SectionDefinition(
                section_type="go_to_market",
                title="Go-To-Market Strategy",
                order_index=14,
                instructions="Detailed customer acquisition strategy with CAC analysis. Show clear, repeatable path to growth. Include key channels and tactics.",
                min_words=200,
                max_words=300
            ),
            SectionDefinition(
                section_type="unit_economics",
                title="Unit Economics",
                order_index=15,
                instructions="Breakdown of unit economics: CAC, LTV, LTV:CAC ratio, payback period, gross margins. Show business economics are attractive.",
                min_words=200,
                max_words=300
            ),
            SectionDefinition(
                section_type="funding_ask",
                title="Funding Ask + Use of Funds",
                order_index=16,
                instructions="Specific funding amount requested, use of funds breakdown (product, marketing, team, etc.), and milestones to be achieved with this capital.",
                min_words=200,
                max_words=300
            ),
            SectionDefinition(
                section_type="exit_strategy",
                title="Exit Strategy",
                order_index=17,
                instructions="Potential exit opportunities: acquisition targets, IPO potential, comparable exits. Show investor return opportunity.",
                min_words=150,
                max_words=250
            ),
            SectionDefinition(
                section_type="investment_risks",
                title="Investment Risk & Mitigation",
                order_index=18,
                instructions="Key investment risks (market, execution, competition) and mitigation strategies. Be honest but confident.",
                min_words=200,
                max_words=300
            )
        ]
        
        return config


class TemplateFactory:
    """Factory to get the appropriate template based on plan_purpose"""
    
    TEMPLATES = {
        "generic": GeneralBusinessPlanTemplate,
        "loan": UKStartUpLoanTemplate,
        "visa_startup": UKStartUpVisaTemplate,
        "visa_innovator": UKInnovatorFounderVisaTemplate,
        "investor": InvestorPitchTemplate
    }
    
    @classmethod
    def get_template(cls, plan_purpose: str) -> TemplateConfig:
        """
        Get template configuration for given plan_purpose
        
        Args:
            plan_purpose: One of 'generic', 'loan', 'visa_startup', 'visa_innovator', 'investor'
        
        Returns:
            TemplateConfig with complete section definitions
        """
        template_class = cls.TEMPLATES.get(plan_purpose, GeneralBusinessPlanTemplate)
        return template_class.get_config()
    
    @classmethod
    def get_all_sections_for_plan(cls, plan_purpose: str) -> List[SectionDefinition]:
        """
        Get complete ordered list of all sections for a given plan type
        
        Returns:
            List of SectionDefinition objects in order
        """
        config = cls.get_template(plan_purpose)
        
        # Start with base sections
        all_sections = config.base_sections.copy()
        
        # Add additional sections
        all_sections.extend(config.additional_sections)
        
        # Sort by order_index to ensure proper ordering
        all_sections.sort(key=lambda x: x.order_index)
        
        return all_sections
    
    @classmethod
    def get_section_definition(cls, plan_purpose: str, section_type: str) -> SectionDefinition:
        """
        Get specific section definition with any overrides applied
        
        Returns:
            SectionDefinition with overrides applied
        """
        config = cls.get_template(plan_purpose)
        all_sections = cls.get_all_sections_for_plan(plan_purpose)
        
        # Find the section
        section = next((s for s in all_sections if s.section_type == section_type), None)
        
        if not section:
            return None
        
        # Apply overrides if they exist
        if section_type in config.section_overrides:
            overrides = config.section_overrides[section_type]
            # Create a copy and apply overrides
            section = SectionDefinition(
                section_type=section.section_type,
                title=overrides.get('title', section.title),
                order_index=section.order_index,
                instructions=overrides.get('instructions', section.instructions),
                min_words=overrides.get('min_words', section.min_words),
                max_words=overrides.get('max_words', section.max_words),
                required=overrides.get('required', section.required)
            )
        
        return section
