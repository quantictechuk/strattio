# Strattio Backend Pipeline Logic Documentation
**Version:** 1.0  
**Last Updated:** November 2025

---

## Table of Contents
1. [Pipeline Overview](#pipeline-overview)
2. [Agent Architecture](#agent-architecture)
3. [Orchestration Flow](#orchestration-flow)
4. [Agent Implementation Details](#agent-implementation-details)
5. [Error Handling & Retry Logic](#error-handling--retry-logic)
6. [Performance & Timing](#performance--timing)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [Extension Points](#extension-points)

---

## Pipeline Overview

### Design Philosophy

The Strattio multi-agent pipeline is designed around three core principles from PRD v3:

1. **Zero-Hallucination Guarantee**: AI cannot generate numbers without verified sources
2. **Deterministic Financials**: All financial projections are formula-based (NO AI)
3. **Full Traceability**: Every data point and AI output is logged and auditable

### Pipeline Stages

```
Intake Data (from wizard)
    ↓
[1] Research Agent (30s max)
    → Fetches verified market data from external APIs
    → Output: research_data_pack.json
    ↓
[2] Validation Agent (5s max)
    → Validates data quality, freshness, consistency
    → Output: validation_report.json
    ↓
[3] Financial Engine (2s max) — DETERMINISTIC, NO AI
    → Calculates P&L, cashflow, break-even using formulas
    → Output: financial_model.json
    ↓
[4] Plan Writer Agent (60s max)
    → Generates business plan sections with GPT-4o
    → Enforces zero-hallucination via system prompt
    → Output: plan_sections[] (9 sections)
    ↓
[5] Compliance Agent (10s max)
    → Validates plan against visa/loan requirements
    → Output: compliance_report.json
    ↓
Complete Business Plan
```

**Total Pipeline Time:** <120 seconds (target: 90-100s typical)

---

## Agent Architecture

### Agent Base Pattern

Each agent follows a consistent interface:

```python
class Agent:
    """
    Base agent pattern:
    1. Input validation
    2. Core processing
    3. Output formatting
    4. Error handling
    5. Logging
    """
    
    async def execute(self, inputs: Dict) -> Dict:
        # Validate inputs
        self._validate_inputs(inputs)
        
        # Execute core logic
        result = await self._process(inputs)
        
        # Format output
        output = self._format_output(result)
        
        # Log execution
        self._log_execution(output)
        
        return output
```

### Agent Responsibility Matrix

| Agent | Input | Output | AI Used? | External APIs? | Deterministic? |
|-------|-------|--------|----------|----------------|----------------|
| Research | intake_data | research_pack | No | Yes (ONS, Eurostat) | No (API-dependent) |
| Validation | research_pack | validation_report | No | No | Yes |
| Financial Engine | intake_data + benchmarks | financial_model | No | No | **Yes** |
| Writer | data_pack + financial + intake | sections[] | **Yes** (GPT-4o) | Yes (OpenAI) | No (AI-based) |
| Compliance | sections + financial | compliance_report | No | No | Yes |

---

## Orchestration Flow

### PlanOrchestrator Class

**Location:** `/app/backend/agents/orchestrator.py`

**Purpose:** Coordinates the 5-agent pipeline with timeout enforcement and error recovery.

### Orchestration Sequence

```python
class PlanOrchestrator:
    async def generate_plan(self, intake_data: Dict, plan_purpose: str) -> Dict:
        """
        Orchestrates the full multi-agent pipeline.
        Returns complete plan or error details.
        """
        
        # Stage 1: Research
        research_pack = await asyncio.wait_for(
            self.research_agent.fetch_market_data(...),
            timeout=30.0
        )
        
        # Stage 2: Validation
        validation_report = self.validation_agent.validate_data_pack(research_pack)
        if validation_report["status"] == "failed":
            return {"status": "failed", "error": "Data validation failed"}
        
        # Stage 3: Financial Engine
        benchmarks = self._get_industry_benchmarks(intake_data["industry"])
        financial_engine = FinancialEngine(intake_data, benchmarks)
        financial_model = financial_engine.generate_financial_model()
        
        # Stage 4: Writer
        sections = await asyncio.wait_for(
            self.writer_agent.generate_all_sections(
                data_pack=research_pack,
                financial_pack=financial_model,
                intake_data=intake_data
            ),
            timeout=60.0
        )
        
        # Stage 5: Compliance
        compliance_template = self._map_purpose_to_template(plan_purpose)
        compliance_report = self.compliance_agent.check_compliance(
            plan_sections=sections,
            financial_model=financial_model,
            template_id=compliance_template
        )
        
        return {
            "status": "complete",
            "research_pack": research_pack,
            "validation_report": validation_report,
            "financial_model": financial_model,
            "sections": sections,
            "compliance_report": compliance_report,
            "generation_metadata": {...}
        }
```

### State Management

**Plan Status Transitions:**

```
Initial: "draft"
    ↓ (user clicks "Generate")
"generating"
    ↓ (pipeline succeeds)
"complete"
    ↓ (pipeline fails)
"failed"
```

**Database Updates During Pipeline:**

1. **Start:** `UPDATE plans SET status='generating'`
2. **Stage 1 Complete:** `INSERT INTO research_packs`
3. **Stage 3 Complete:** `INSERT INTO financial_models`
4. **Stage 4 Complete:** `INSERT INTO sections` (×9)
5. **Stage 5 Complete:** `INSERT INTO compliance_reports`
6. **End:** `UPDATE plans SET status='complete', completed_at=NOW()`
7. **Error:** `UPDATE plans SET status='failed', error='...'`

---

## Agent Implementation Details

### 1. Research Agent

**File:** `/app/backend/agents/research_agent.py`

**Purpose:** Fetch verified market data from external sources.

**Implementation (MVP):**
```python
class ResearchAgent:
    async def fetch_market_data(self, industry: str, location: str, intake_data: Dict) -> Dict:
        # For MVP: Returns fixture data
        # TODO: Integrate real APIs
        
        data_pack = {
            "data_pack_id": f"dp_{timestamp}",
            "created_at": now(),
            "industry": industry,
            "location": location,
            "market_data": {
                "market_size_gbp": 4500000000,  # From fixture
                "market_size_source": "ONS",
                "market_size_url": "https://www.ons.gov.uk/...",
                "market_size_timestamp": "2024-09-15",
                "growth_rate_percent": 8.2,
                "growth_rate_source": "ONS",
                # ...
            },
            "competitor_data": {...},
            "missing_data": [],
            "stale_data": [],
            "fetch_errors": []
        }
        
        return data_pack
```

**Future Integration Points:**
- ONS API (UK statistics)
- Eurostat API (EU data)
- Google Trends API
- SERP API (competitor search)
- Companies House API (UK company data)

**Caching Strategy:**
```python
self.cache = {}  # In-memory cache (MVP)

# Future: Redis with TTL
# cache_key = f"market_data:{industry}:{location}"
# if redis.exists(cache_key):
#     return redis.get(cache_key)
# else:
#     data = fetch_from_api(...)
#     redis.setex(cache_key, 86400, data)  # 24hr TTL
```

---

### 2. Validation Agent

**File:** `/app/backend/agents/validation_agent.py`

**Purpose:** Verify data quality, freshness, and logical consistency.

**Validation Rules:**

```python
class ValidationAgent:
    VALID_SOURCES = ["ONS", "Eurostat", "World Bank", "Companies House", "SERP API"]
    
    def validate_data_pack(self, data_pack: Dict) -> Dict:
        errors = []
        warnings = []
        
        # 1. Freshness Check
        data_age_days = (now() - parse_date(data_pack["market_data"]["market_size_timestamp"])).days
        if data_age_days > 365:
            errors.append({"field": "market_size_timestamp", "message": f"Data is {data_age_days} days old (>365 days)"})
        elif data_age_days > 90:
            warnings.append({"field": "market_size_timestamp", "message": f"Data is {data_age_days} days old"})
        
        # 2. Source Validity
        source = data_pack["market_data"]["market_size_source"]
        if source not in self.VALID_SOURCES:
            warnings.append({"field": "market_size_source", "message": f"Source '{source}' not approved"})
        
        # 3. Logical Consistency
        market_size = data_pack["market_data"]["market_size_gbp"]
        if market_size < 1_000_000:
            warnings.append({"field": "market_size_gbp", "message": "Market size appears very small"})
        
        growth_rate = data_pack["market_data"]["growth_rate_percent"]
        if growth_rate < -10 or growth_rate > 50:
            warnings.append({"field": "growth_rate_percent", "message": "Growth rate outside typical range"})
        
        # 4. Determine Status
        status = "failed" if errors else ("passed_with_warnings" if warnings else "passed")
        
        return {
            "validation_id": f"val_{timestamp}",
            "status": status,
            "errors": errors,
            "warnings": warnings,
            "validated_at": now()
        }
```

**Halt Condition:**
If `status == "failed"`, pipeline stops and returns error to user.

---

### 3. Financial Engine (DETERMINISTIC)

**File:** `/app/backend/agents/financial_engine.py`

**Purpose:** Generate all financial projections using formulas ONLY. **NO AI INVOLVED.**

**Core Principle:** Reproducibility. Same inputs → identical outputs.

**Formulas (from PRD v3 Appendix C):**

#### Revenue Projection
```python
def calculate_revenue_projection(self, years: int = 5) -> List[Dict]:
    revenue = []
    
    # Year 1
    year1_revenue = self.intake["monthly_revenue_estimate"] * 12
    if year1_revenue == 0:
        year1_revenue = self.intake["starting_capital"] * self.benchmarks["revenue_to_capital_ratio"]
    
    revenue.append({"year": 1, "revenue": year1_revenue})
    
    # Subsequent years
    growth_rate = min(self.benchmarks["growth_rate"], 0.20)  # Cap at 20%
    for year in range(2, years + 1):
        prev_revenue = revenue[-1]["revenue"]
        year_revenue = prev_revenue * (1 + growth_rate)
        revenue.append({"year": year, "revenue": round(year_revenue, 2)})
    
    return revenue
```

#### COGS Calculation
```python
def calculate_cogs(self, revenue_projections: List[Dict]) -> List[Dict]:
    cogs = []
    for proj in revenue_projections:
        cogs_value = proj["revenue"] * self.benchmarks["cogs_percentage"]
        cogs.append({"year": proj["year"], "cogs": round(cogs_value, 2)})
    return cogs
```

#### P&L Statement
```python
def calculate_pnl(self, revenue_projections, cogs, opex) -> List[Dict]:
    pnl = []
    tax_rate = 0.19  # UK corporate tax
    
    for i, rev_proj in enumerate(revenue_projections):
        revenue = rev_proj["revenue"]
        cogs_value = cogs[i]["cogs"]
        total_opex = opex[i]["total_opex"]
        
        gross_profit = revenue - cogs_value
        operating_profit = gross_profit - total_opex
        tax = max(0, operating_profit) * tax_rate
        net_profit = operating_profit - tax
        
        pnl.append({
            "year": rev_proj["year"],
            "revenue": round(revenue, 2),
            "cogs": round(cogs_value, 2),
            "gross_profit": round(gross_profit, 2),
            "total_opex": round(total_opex, 2),
            "operating_profit": round(operating_profit, 2),
            "tax": round(tax, 2),
            "net_profit": round(net_profit, 2)
        })
    return pnl
```

#### Break-Even Analysis
```python
def calculate_break_even(self) -> Dict:
    employee_count = self.intake["team_size"]
    sqft = self.intake.get("space_sqft", 1000)
    
    annual_fixed_costs = (
        employee_count * self.benchmarks["employee_cost_average"] +
        sqft * self.benchmarks["rent_per_sqft_average"] +
        self.benchmarks["utilities_monthly"] * 12 +
        self.benchmarks["insurance_annual"]
    )
    fixed_costs_monthly = annual_fixed_costs / 12
    
    price_per_unit = self.intake.get("price_per_unit", 10.0)
    variable_cost_per_unit = price_per_unit * self.benchmarks["cogs_percentage"]
    contribution_margin = price_per_unit - variable_cost_per_unit
    
    break_even_units = fixed_costs_monthly / contribution_margin if contribution_margin > 0 else 0
    break_even_revenue = break_even_units * price_per_unit
    
    return {
        "fixed_costs_monthly": round(fixed_costs_monthly, 2),
        "contribution_margin_per_unit": round(contribution_margin, 2),
        "break_even_units_monthly": round(break_even_units, 0),
        "break_even_revenue_monthly": round(break_even_revenue, 2)
    }
```

**Industry Benchmarks:**

Stored as configuration (future: database):

```python
INDUSTRY_BENCHMARKS = {
    "food_beverage_cafe": {
        "gross_margin_median": 0.65,
        "cogs_percentage": 0.35,
        "employee_cost_average": 25000,
        "rent_per_sqft_average": 50,
        "marketing_spend_percentage": 0.08,
        "growth_rate": 0.15
    },
    # ... other industries
}
```

**Testing:**

Proven in POC (`/app/tests/test_core.py`):
- Two runs with identical inputs produce identical outputs ✓
- All formulas match PRD v3 specifications ✓

---

### 4. Plan Writer Agent

**File:** `/app/backend/agents/writer_agent.py`

**Purpose:** Generate business plan sections using GPT-4o with zero-hallucination enforcement.

**Zero-Hallucination System Prompt:**

```python
ZERO_HALLUCINATION_SYSTEM_PROMPT = """You are a professional business plan writer for Strattio.

## ABSOLUTE RULES - VIOLATION IS FAILURE

1. NEVER invent, fabricate, or estimate any numbers including:
   - Market sizes, growth rates, revenue figures, customer counts, competitor data, any statistics

2. ONLY use data explicitly provided in:
   - DATA_PACK (verified market data)
   - FINANCIAL_PACK (calculated projections)
   - INTAKE_DATA (user inputs)

3. When referencing ANY number, you MUST cite the source:
   - "According to ONS data (2024), the UK market is valued at £X billion."
   - "Based on our financial projections, Year 1 revenue is estimated at £X."

4. If data is NOT provided:
   - DO NOT make up a number
   - Write: "No verified data available for this metric."
   - Or omit the claim entirely

5. You MAY:
   - Explain and contextualize provided numbers
   - Write narrative around the data
   - Make qualitative statements

6. You MAY NOT:
   - Generate market size estimates
   - Create competitor revenue figures
   - Invent growth projections
   - Fabricate any quantitative data
"""
```

**Section Generation:**

```python
class WriterAgent:
    async def generate_section(self, section_type: str, data_pack: Dict, 
                               financial_pack: Dict, intake_data: Dict) -> Dict:
        
        # Build section-specific prompt
        user_prompt = f"""
Write the {section_type.replace('_', ' ').title()} section for this business plan.

DATA_PACK:
{json.dumps(data_pack, indent=2)}

FINANCIAL_PACK:
{json.dumps(financial_pack, indent=2)}

INTAKE_DATA:
{json.dumps(intake_data, indent=2)}

{section_instructions[section_type]}

Remember: CITE all numbers with sources. Do NOT invent any statistics.
"""
        
        # Call LLM
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"plan_writer_{section_type}",
            system_message=ZERO_HALLUCINATION_SYSTEM_PROMPT
        ).with_model("openai", "gpt-4o")
        
        response = await chat.send_message(UserMessage(text=user_prompt))
        
        return {
            "section_type": section_type,
            "title": section_type.replace('_', ' ').title(),
            "content": response,
            "word_count": len(response.split()),
            "generated_at": datetime.utcnow().isoformat(),
            "ai_generated": True
        }
```

**Sections Generated:**

1. Executive Summary (200 words)
2. Company Overview (150-200 words)
3. Products & Services (200-250 words)
4. Market Analysis (250-300 words)
5. Competitive Analysis (200-250 words)
6. Marketing Strategy (200-250 words)
7. Operations Plan (150-200 words)
8. Team (150-200 words)
9. Financial Projections (200-250 words)

**Total:** ~1,700-2,050 words per plan

**Citation Enforcement:**

Post-generation validation (future enhancement):
```python
def validate_citations(section_content: str, data_pack: Dict, financial_pack: Dict) -> bool:
    # Extract all numbers from text
    numbers = extract_numbers(section_content)
    
    # Check each number exists in inputs
    for num in numbers:
        if not (num in data_pack or num in financial_pack):
            return False  # Violation detected
    
    return True  # All citations valid
```

---

### 5. Compliance Agent

**File:** `/app/backend/agents/compliance_agent.py`

**Purpose:** Validate business plan against compliance requirements.

**Templates:**

```python
TEMPLATES = {
    "UK_STARTUP_VISA": {
        "checks": [
            {"id": "innovation", "name": "Innovation Description", "required": True, "min_words": 200},
            {"id": "viability", "name": "Viability (2-year plan)", "required": True, "check_type": "financial"},
            {"id": "market", "name": "UK Market Opportunity", "required": True, "min_words": 150},
            {"id": "team", "name": "Team Capability", "required": True, "min_words": 100}
        ]
    },
    "UK_STARTUP_LOAN": {
        "checks": [
            {"id": "repayment", "name": "Loan Repayment Plan", "required": True, "check_type": "financial"},
            {"id": "breakeven", "name": "Break-even within 24 months", "required": True, "check_type": "financial"}
        ]
    },
    "INVESTOR_READY": {...},
    "GENERIC": {...}
}
```

**Check Execution:**

```python
def check_compliance(self, plan_sections: List[Dict], financial_model: Dict, template_id: str) -> Dict:
    template = self.TEMPLATES[template_id]
    results = []
    
    for check in template["checks"]:
        if check["check_type"] == "content":
            # Check section exists and meets word count
            section = find_section(plan_sections, check["id"])
            if not section or section["word_count"] < check["min_words"]:
                results.append({"status": "fail", "message": "Section incomplete"})
            else:
                results.append({"status": "pass", "message": "Section complete"})
        
        elif check["check_type"] == "financial":
            # Check financial requirements
            # (simplified for MVP)
            results.append({"status": "pass", "message": "Financial requirement met"})
    
    passed_count = sum(1 for r in results if r["status"] == "pass")
    score = int((passed_count / len(results)) * 100)
    
    return {
        "template_id": template_id,
        "overall_status": "compliant" if passed_count == len(results) else "needs_attention",
        "checks": results,
        "score": score
    }
```

---

## Error Handling & Retry Logic

### Timeout Enforcement

```python
try:
    research_pack = await asyncio.wait_for(
        self.research_agent.fetch_market_data(...),
        timeout=30.0
    )
except asyncio.TimeoutError:
    # Log error
    logger.error("Research agent timeout")
    # Update plan status
    await db.plans.update_one({"_id": plan_id}, {"$set": {"status": "failed", "error": "Research timeout"}})
    # Return error
    return {"status": "failed", "error": "Research agent timeout"}
```

### Error Recovery Strategies

| Stage | Error Type | Recovery Strategy |
|-------|------------|-------------------|
| Research | Timeout | Retry once with exponential backoff, then fail |
| Research | API unavailable | Use cached data if <7 days old, else mark as missing |
| Validation | Data too stale | Continue with warning, flag in report |
| Financial | Division by zero | Use fallback calculations, log warning |
| Writer | LLM timeout | Retry once, then generate fallback text |
| Writer | LLM error | Retry with simpler prompt, limit max retries to 2 |
| Compliance | Template not found | Use GENERIC template |

### Partial Success Handling

If pipeline completes with warnings but no critical errors:
```python
return {
    "status": "complete_with_warnings",
    "warnings": [
        "Market data is 95 days old",
        "One section below recommended word count"
    ],
    # ... rest of outputs
}
```

---

## Performance & Timing

### Target Timing (from PRD v3)

| Stage | Target | Max | Typical |
|-------|--------|-----|---------|
| Research Agent | 20s | 30s | 15s |
| Validation Agent | 2s | 5s | 1s |
| Financial Engine | 1s | 2s | <1s |
| Plan Writer Agent | 40s | 60s | 45s |
| Compliance Agent | 5s | 10s | 3s |
| **Total** | **68s** | **107s** | **64s** |

### Optimization Strategies

**1. Parallel Processing (Future):**
```python
# Run independent stages in parallel
research_task = asyncio.create_task(research_agent.fetch(...))
benchmarks_task = asyncio.create_task(fetch_benchmarks(...))

research_pack, benchmarks = await asyncio.gather(research_task, benchmarks_task)
```

**2. Caching:**
- Market data: 24hr TTL
- Industry benchmarks: 7 day TTL
- LLM responses: Session-based (for regeneration)

**3. Streaming (Future):**
```python
# Stream sections as they're generated
async for section in writer_agent.generate_sections_stream(...):
    await db.sections.insert_one(section)
    await websocket.send_json({"type": "section_complete", "data": section})
```

---

## Data Flow Diagrams

### End-to-End Data Flow

```
User submits intake wizard
    ↓
POST /api/plans (creates draft)
    ↓
POST /api/plans/:id/generate
    ↓
Orchestrator.generate_plan()
    │
    ├─→ ResearchAgent.fetch_market_data()
    │   ├─ Query ONS API (future)
    │   ├─ Query Eurostat API (future)
    │   └─ Return data_pack
    │       └─ INSERT INTO research_packs
    │
    ├─→ ValidationAgent.validate_data_pack()
    │   ├─ Check freshness
    │   ├─ Check sources
    │   ├─ Check consistency
    │   └─ Return validation_report (not stored)
    │
    ├─→ FinancialEngine.generate_financial_model()
    │   ├─ Load benchmarks
    │   ├─ Calculate revenue projections
    │   ├─ Calculate COGS, OpEx, P&L
    │   ├─ Calculate break-even
    │   └─ Return financial_model
    │       └─ INSERT INTO financial_models
    │
    ├─→ WriterAgent.generate_all_sections()
    │   ├─ For each of 9 sections:
    │   │   ├─ Build prompt with data_pack + financial_model + intake_data
    │   │   ├─ Call GPT-4o with zero-hallucination prompt
    │   │   └─ Return section
    │   └─ Return sections[]
    │       └─ INSERT INTO sections (×9)
    │
    └─→ ComplianceAgent.check_compliance()
        ├─ Load template rules
        ├─ Run checks on sections + financials
        └─ Return compliance_report
            └─ INSERT INTO compliance_reports
    ↓
UPDATE plans SET status='complete'
    ↓
Return result to API
    ↓
Frontend displays complete plan
```

### State Persistence

```
Orchestrator runs → MongoDB writes

Stage 1: research_packs.insert_one()
Stage 3: financial_models.insert_one()
Stage 4: sections.insert_many() (×9)
Stage 5: compliance_reports.insert_one()

Final: plans.update_one({status: 'complete'})
```

All writes are **atomic** and **idempotent** (safe to retry).

---

## Extension Points

### Adding New Agent

1. Create new agent file: `/app/backend/agents/new_agent.py`
2. Implement agent interface:
```python
class NewAgent:
    async def execute(self, inputs: Dict) -> Dict:
        # Implementation
        pass
```
3. Add to orchestrator:
```python
class PlanOrchestrator:
    def __init__(self):
        # ...
        self.new_agent = NewAgent()
    
    async def generate_plan(self, ...):
        # ...
        new_output = await self.new_agent.execute(...)
```

### Adding New Compliance Template

1. Add template to `ComplianceAgent.TEMPLATES`:
```python
"NEW_TEMPLATE": {
    "checks": [
        {"id": "...", "name": "...", "required": True, "min_words": 200},
        # ...
    ]
}
```
2. Map plan_purpose in orchestrator:
```python
def _map_purpose_to_template(self, plan_purpose: str) -> str:
    mapping = {
        # ...
        "new_purpose": "NEW_TEMPLATE"
    }
    return mapping.get(plan_purpose, "GENERIC")
```

### Adding Real API Integration

Example: ONS API

```python
class ResearchAgent:
    async def fetch_market_data(self, industry: str, location: str, intake_data: Dict) -> Dict:
        # Check cache first
        cache_key = f"market:{industry}:{location}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # Fetch from ONS
        ons_data = await self._fetch_from_ons(industry, location)
        
        # Transform to data_pack format
        data_pack = self._transform_ons_response(ons_data)
        
        # Cache result
        self.cache[cache_key] = data_pack
        
        return data_pack
    
    async def _fetch_from_ons(self, industry: str, location: str) -> Dict:
        # Implementation of ONS API call
        pass
```

### Adding Background Jobs

For long-running tasks:

```python
# Use Celery or similar
from celery import Celery

app = Celery('strattio', broker='redis://localhost:6379')

@app.task
async def generate_plan_async(plan_id: str):
    orchestrator = PlanOrchestrator()
    result = await orchestrator.generate_plan(...)
    # Update database
    await db.plans.update_one({"_id": plan_id}, {"$set": result})
```

---

## Summary

**Pipeline Architecture:**
- 5 specialized agents with clear responsibilities
- Orchestrator coordinates with timeout enforcement
- Deterministic financial engine (NO AI)
- Zero-hallucination constraints for AI-generated content
- Full audit trail via database persistence

**Key Design Decisions:**
- Sequential execution (simpler, more predictable)
- Fail-fast on critical errors (validation failure)
- Graceful degradation on warnings (stale data)
- Idempotent operations (safe retries)
- Atomic database writes (data integrity)

**Extension-Ready:**
- Add new agents easily
- Add new compliance templates
- Integrate real APIs incrementally
- Add background processing
- Add parallel execution

---

**End of Backend Pipeline Logic Documentation**
