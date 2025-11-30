# Business Plan Template System Documentation

## Overview

Strattio uses a sophisticated template-based system to generate meaningfully different business plans based on the user's selected `plan_purpose`. Each template inherits from a **Base Template** with 11 core sections, then applies type-specific overrides and adds additional required sections.

This ensures that:
- A UK Start-Up Loan plan emphasizes repayment capacity and cash flow
- A UK Start-Up Visa plan demonstrates innovation, viability, and scalability
- An Investor Pitch plan focuses on TAM/SAM/SOM, traction, and return opportunity

## Architecture

### Template Factory (`/app/backend/agents/templates.py`)

The template system is implemented through:

1. **`SectionDefinition`**: Defines a single section with title, instructions, word count targets
2. **`TemplateConfig`**: Complete configuration for a plan template (tone, emphasis, sections, overrides)
3. **`BaseTemplate`**: Base class with 11 core sections shared by all plans
4. **Specialized Template Classes**: Five plan-specific templates that inherit from BaseTemplate
5. **`TemplateFactory`**: Factory class to retrieve templates and section definitions

### Base Template - 11 Core Sections

All business plans include these foundational sections:

1. **Executive Summary** - Business overview, market opportunity, financial highlights
2. **Company Overview** - Mission, vision, legal structure, founding story
3. **Market Analysis** - Market size, growth trends, target segments
4. **Products & Services** - Detailed offerings, features, unique value proposition
5. **Business Model** - Revenue streams, pricing, cost structure
6. **Marketing & Sales Strategy** - Customer acquisition, sales process, growth
7. **Operations Plan** - Day-to-day operations, processes, technology
8. **Team & Roles** - Founder backgrounds, organizational structure
9. **Financial Forecasts** - Revenue projections, expenses, profitability
10. **Risk Analysis** - Key risks and mitigation strategies
11. **Appendix** - Sources, assumptions, supporting documents

## Template Specifications

### 1. General Business Plan (`generic`)

**Purpose**: Standard business plan suitable for general purposes

**Tone**: Neutral, professional

**Emphasis**: Clear business model, market opportunity, realistic projections

**Base Sections**: 11 (as-is, no overrides)

**Additional Sections**: None

**Total Sections**: 11

---

### 2. UK Start-Up Loan Application (`loan`)

**Purpose**: Must satisfy Start-Up Loan scheme requirements

**Tone**: Pragmatic, cashflow-focused, viability-driven

**Emphasis**: Repayment capacity, cash flow, break-even timeline, low risk

**Section Overrides**:
- **Executive Summary**: Highlights loan request and repayment capacity
- **Financial Projections**: Emphasizes cash flow and affordability

**Additional Sections**:
1. **Loan Request & Funding Breakdown** - Exact use of funds
2. **12-Month Survival Budget** - Founder living costs
3. **Repayment Plan & Affordability** - Loan repayment schedule
4. **Loan Eligibility & Compliance** - Start-Up Loan guidance alignment

**Total Sections**: 15

---

### 3. UK Start-Up Visa Plan (`visa_startup`)

**Purpose**: Must demonstrate innovation, viability, and scalability for endorsement

**Tone**: Innovation-focused, sustainable growth oriented, endorsement-aligned

**Emphasis**: Innovation, UK market opportunity, scalability, job creation

**Section Overrides**:
- **Executive Summary**: Emphasizes innovative concept and visa criteria
- **Business Model**: Focuses on UK market viability
- **Market Analysis**: Deep dive into UK market specifically

**Additional Sections**:
1. **Innovation** - Novel approach, technology, or business model
2. **Viability Assessment** - 2-year sustainability evidence
3. **Scalability Roadmap** - Growth plan and milestones
4. **UK Job Creation Plan** - Projected employment over 2-3 years
5. **Visa Compliance Checklist** - Home Office criteria confirmation

**Total Sections**: 16

---

### 4. UK Innovator Founder Visa Plan (`visa_innovator`)

**Purpose**: Higher tier - significant innovation, high growth, investment potential

**Tone**: High-growth oriented, investment-ready, innovation-leading

**Emphasis**: Significant innovation, scalability, IP strategy, UK job creation

**Section Overrides**:
- **Executive Summary**: Strong innovation claim with high-growth narrative
- **Business Model**: Defensible model with IP protection and competitive moat
- **Market Analysis**: Internationalization potential beyond UK
- **Team**: Emphasizes founder credentials and capability

**Additional Sections**:
1. **Innovation & IP Strategy** - Patents, trademarks, technology differentiation
2. **High-Growth Roadmap (3–5 Years)** - Aggressive scaling plan
3. **Investment Readiness Section** - Funding requirements and value proposition
4. **Founder Credentials & Capability** - Deep founder background
5. **Job Creation & National Benefit** - UK economic contribution
6. **Home Office Compliance Notes** - Innovator Founder criteria confirmation

**Total Sections**: 17

---

### 5. Investor Pitch / Fundraising Plan (`investor`)

**Purpose**: Investor-facing plan for angels, VCs, accelerators

**Tone**: Investor-focused, traction-driven, return-oriented, aggressive growth

**Emphasis**: TAM/SAM/SOM, traction, competitive moat, returns, exit strategy

**Section Overrides**:
- **Executive Summary**: Written as investor pitch with investment ask
- **Market Analysis**: Detailed TAM/SAM/SOM with market sizing
- **Products & Services**: Focus on competitive advantage and moat
- **Business Model**: Emphasizes unit economics and capital efficiency
- **Team**: Highlights founder-market fit and why this team will win

**Additional Sections**:
1. **Problem & Opportunity** - Problem being solved and market opportunity
2. **TAM / SAM / SOM** - Detailed market sizing with sources
3. **Traction & Metrics** - Current traction or projected milestones
4. **Go-To-Market Strategy** - CAC analysis and growth path
5. **Unit Economics** - CAC, LTV, LTV:CAC ratio, margins
6. **Funding Ask + Use of Funds** - Specific ask and use breakdown
7. **Exit Strategy** - Acquisition targets, IPO potential, comparables
8. **Investment Risk & Mitigation** - Key risks and mitigation

**Total Sections**: 19

## Implementation Details

### Writer Agent Integration

The **Writer Agent** (`/app/backend/agents/writer_agent.py`) uses the template system:

```python
from .templates import TemplateFactory

# Get template for plan_purpose
template_config = TemplateFactory.get_template(plan_purpose)

# Get section definition with overrides
section_def = TemplateFactory.get_section_definition(plan_purpose, section_type)

# Generate all sections for plan type
all_section_defs = TemplateFactory.get_all_sections_for_plan(plan_purpose)
```

Each section is generated with:
- Template-specific **instructions** (what to write)
- Template-specific **tone** (how to write it)
- Template-specific **emphasis** (what to highlight)
- **Word count targets** (min/max words)

### PDF Generator Integration

The **PDF Generator** (`/app/backend/utils/pdf_generator.py`) uses templates to:

1. Display the template name on the title page (e.g., "UK Start-Up Visa Plan")
2. Sort sections by `order_index` for proper ordering
3. Include all template-specific sections in the PDF

### Compliance Agent Integration

The **Compliance Agent** (`/app/backend/agents/compliance_agent.py`) generates specialized compliance sections:

- **Start-Up Visa**: `visa_compliance_checklist` content
- **Innovator Founder Visa**: `home_office_compliance` content  
- **Start-Up Loan**: `loan_eligibility` content

These are injected by the **Orchestrator** during plan generation.

## Section Ordering

Sections are ordered using the `order_index` property:

- Base sections: 0-10
- Additional sections: 11+ (varies by template)

The Writer Agent generates sections in order, ensuring proper flow in the final document.

## Template Selection Flow

```
User selects plan_purpose in Intake Wizard
    ↓
Stored in intake_data.plan_purpose
    ↓
Orchestrator passes to Writer Agent
    ↓
Writer Agent calls TemplateFactory.get_template(plan_purpose)
    ↓
Writer Agent generates all sections per template
    ↓
Compliance Agent injects compliance sections (if applicable)
    ↓
PDF Generator reflects template structure
```

## Extending the System

### Adding a New Template

1. Create a new template class in `/app/backend/agents/templates.py`:

```python
class NewTemplate(BaseTemplate):
    @classmethod
    def get_config(cls) -> TemplateConfig:
        config = super().get_config()
        config.template_id = "new_template"
        config.template_name = "New Template Name"
        config.tone = "desired tone"
        config.emphasis = "key emphasis points"
        
        # Define overrides
        config.section_overrides = {
            "executive_summary": {
                "instructions": "Custom instructions..."
            }
        }
        
        # Add additional sections
        config.additional_sections = [
            SectionDefinition(...)
        ]
        
        return config
```

2. Register in `TemplateFactory.TEMPLATES` dict

3. Add to `PLAN_PURPOSES` in frontend intake wizard

### Adding a New Section to Existing Template

Simply add to `additional_sections` list in the template's `get_config()` method with proper `order_index`.

## Testing

To verify templates work correctly:

```bash
cd /app/backend
python -c "
from agents.templates import TemplateFactory
config = TemplateFactory.get_template('investor')
sections = TemplateFactory.get_all_sections_for_plan('investor')
print(f'{config.template_name}: {len(sections)} sections')
"
```

## Benefits of Template System

✅ **Meaningful Differentiation**: Plans are truly different, not just minor rewording

✅ **Compliance-Ready**: Visa/loan plans include required sections automatically

✅ **Maintainable**: Easy to update instructions without touching core logic

✅ **Extensible**: New templates can be added without major refactoring

✅ **Type-Safe**: Clear structure with dataclasses prevents errors

✅ **DRY Principle**: Base template prevents duplication across plan types

## Summary

The template system is the backbone of Strattio's plan generation. It ensures that every plan type produces professional, purpose-specific output that meets the requirements of its intended audience (investors, lenders, immigration officers, or general business use).
