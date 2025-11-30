# STRATTIO - Merged Requirements Summary
**Generated:** December 2024  
**Sources:** PRD v4.0 (Master) + PRD v3.0 (Technical Appendix)  
**Status:** Awaiting Approval Before Development

---

## ✅ 1. MERGED UNDERSTANDING SUMMARY

### 1.1 Product Vision
**Strattio** is an AI-powered SaaS platform that generates **professional, investor-ready, loan-ready, and visa-ready business plans** with three critical guarantees:

1. **Zero-Hallucination Architecture** → All statistics sourced from verified APIs (ONS, Eurostat, etc.)
2. **Deterministic Financial Engine** → All financial numbers calculated via formulas (AI never generates numbers)
3. **Compliance-Ready Output** → Templates validated against UK visa/loan requirements

### 1.2 Core Problem Being Solved

| Problem | Strattio Solution |
|---------|-------------------|
| Business plans take 40-100+ hours | Automated generation in <30 minutes |
| AI tools hallucinate market data | Verified data pipeline with mandatory citations |
| Generic templates don't meet compliance | Purpose-built templates (UK visas, SBA loans, investors) |
| Financial projections error-prone | Deterministic formula engine |
| No validation of plan quality | Multi-agent validation + compliance checking |

### 1.3 Target Markets

| Segment | Size | Primary Use Case |
|---------|------|------------------|
| UK Entrepreneurs (Start-Up Loans) | 400K apps/year | Loan applications |
| UK Visa Applicants | 15K+ apps/year | Innovator Founder, Start-Up visas |
| US Entrepreneurs | 5.5M apps/year | First business plan |
| Business Consultants | 50K+ (UK/US) | Multi-client plan generation |
| Universities/Incubators | 4K+ institutions | Student cohort plans |

### 1.4 Revenue Model

| Tier | Price/Month | Key Features | Limits |
|------|-------------|--------------|--------|
| **Free** | £0 | Basic AI, 1 plan | Preview only, no export |
| **Starter** | £12 | Full AI, PDF export | 3 plans/month |
| **Professional** | £29 | Financials, pitch deck, compliance | Unlimited plans |
| **Enterprise** | £99 | Team seats, API, white-label | Unlimited + multi-client |
| **One-Time** | £49 | Single plan purchase | All Professional features |

### 1.5 Critical Architectural Constraints

**MUST NOT violate these principles:**

1. ❌ **AI NEVER generates financial numbers** → Always use formulas from PRD v3
2. ❌ **AI NEVER invents market statistics** → Only use data from verified APIs
3. ✅ **Every statistic MUST have source citation** → Include URL + timestamp
4. ✅ **All calculations MUST be reproducible** → Same inputs = identical outputs
5. ✅ **Missing data = explicit statement** → "No verified data available"

---

## ✅ 2. COMPLETE FEATURE/MODULE MAP

### 2.1 MVP Features (Weeks 1-12)

| Module | Description | Priority | Dependencies |
|--------|-------------|----------|--------------|
| **User Authentication** | Email, Google OAuth | P0 | — |
| **Smart Intake Wizard** | Chat-style business info collection | P0 | — |
| **AI Plan Generator** | Multi-agent pipeline (basic) | P0 | Intake Wizard |
| **Industry Templates** | 15+ pre-built templates | P0 | Plan Generator |
| **SWOT Generator** | Auto-generated SWOT analysis | P0 | Plan Generator |
| **Competitor Analysis** | Basic competitor identification | P0 | Plan Generator |
| **Section Editor** | Edit generated sections | P0 | Plan Generator |
| **Regenerate Controls** | Rewrite sections (shorter/longer/tone) | P0 | Section Editor |
| **PDF Export** | Styled PDF download | P0 | Plan Generator |
| **Plan Management** | Save, load, clone plans | P0 | — |
| **Subscription System** | Stripe integration | P0 | — |

**MVP Definition of Done:**
- User can signup → complete wizard → generate plan → edit sections → export PDF
- Subscription limits enforced (Free: 1 plan preview, Starter: 3 plans + PDF)

---

### 2.2 Phase 2 Features (Weeks 13-24)

| Module | Description | Priority | Dependencies |
|--------|-------------|----------|--------------|
| **Multi-Agent Pipeline (Full)** | 5-agent architecture | P0 | MVP |
| **Research Agent** | ONS, Eurostat, Google Trends API integration | P0 | — |
| **Validation Agent** | Data quality + consistency checks | P0 | Research Agent |
| **Financial Engine** | Deterministic P&L, cashflow, break-even | P0 | Validation Agent |
| **Plan Writer Agent** | Generate prose with zero-hallucination prompts | P0 | Financial Engine |
| **Compliance Agent** | Visa/loan template validation | P0 | Plan Writer |
| **Market Data Pipeline** | Verified stats with caching | P0 | Research Agent |
| **AI Plan Validator** | Realism + completeness checks | P0 | Plan Writer |
| **Visual Charts** | Revenue, profit, cashflow graphs | P1 | Financial Engine |
| **Business Model Canvas** | Auto-generated BMC | P1 | Plan Generator |
| **Pitch Deck Generator** | PowerPoint/PDF slides | P1 | Plan Generator |
| **Multi-Format Export** | DOCX, Google Docs, Notion, Markdown | P1 | — |
| **Compliance Templates** | UK Start-Up Visa, Innovator Visa, Loan formats | P0 | Compliance Agent |
| **Live AI Advisor Chat** | Contextual Q&A | P1 | — |
| **Professional Tier** | Enable all Professional features | P0 | — |

**Phase 2 Definition of Done:**
- Zero-hallucination verified (all stats have sources)
- Financial projections 100% formula-based
- Compliance checking functional for visa/loan templates
- Professional tier fully operational

---

### 2.3 Phase 3 Features (Weeks 25-36)

| Module | Description | Priority |
|--------|-------------|----------|
| **Team Collaboration** | Invite users, comments, permissions | P1 |
| **Real-time Editing** | Concurrent editing (basic) | P1 |
| **Comment Threads** | Section-level comments | P1 |
| **White-Label Exports** | Custom branding | P1 |
| **Scenario Planning** | What-if financial modeling | P1 |
| **Custom Assumptions** | User-adjustable financial inputs | P1 |
| **AI Pitch Script** | Speaking notes for presentations | P2 |
| **Bank Loan Proposal** | Specialized loan document | P1 |
| **Domain Checker** | Business name + domain availability | P2 |
| **AI Logo Generator** | Add-on service | P2 |
| **Activity Logs** | User action tracking | P1 |
| **Audit Trail** | Full change history | P1 |

---

### 2.4 Phase 4 Features (Weeks 37-48)

| Module | Description | Priority |
|--------|-------------|----------|
| **Organisation Accounts** | Multi-user teams | P0 |
| **Consultant Workspace** | Multi-client management | P0 |
| **Client Folders** | Organize plans by client | P0 |
| **Custom Template Library** | Org-specific templates | P1 |
| **Analytics Dashboard** | Usage + performance metrics | P1 |
| **Secure Document Sharing** | Time-limited links | P1 |
| **RESTful API** | Programmatic plan generation | P0 |
| **Webhooks** | Event notifications | P1 |
| **White-Label (Full)** | Complete branding customization | P1 |
| **SSO Integration** | SAML authentication | P2 |

---

## ✅ 3. TECHNICAL ARCHITECTURE SUMMARY

### 3.1 System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                             │
│        React 18 + Next.js 14 + TypeScript + Tailwind CSS          │
│                  (Hosted: Vercel / AWS Amplify)                    │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                │
│   Node.js + Express/Fastify + TypeScript                          │
│   Features: Auth, Rate Limiting, Request Validation               │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                    APPLICATION SERVICES                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ User Service│  │Plan Service │  │Export Service│               │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│  ┌─────────────┐  ┌─────────────┐                                 │
│  │Subscription │  │ Auth Service│                                 │
│  │  Service    │  │             │                                 │
│  └─────────────┘  └─────────────┘                                 │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│              MULTI-AGENT AI PIPELINE (Sequential)                  │
│                                                                    │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐      │
│  │   RESEARCH   │────▶│  VALIDATION  │────▶│  FINANCIAL   │      │
│  │    AGENT     │     │    AGENT     │     │   ENGINE     │      │
│  │              │     │              │     │ (NO AI!)     │      │
│  │ Fetch data   │     │ Verify data  │     │ Calculate    │      │
│  │ from APIs    │     │ quality      │     │ projections  │      │
│  └──────────────┘     └──────────────┘     └──────────────┘      │
│                                                    │               │
│                                                    ▼               │
│  ┌──────────────┐     ┌──────────────┐                            │
│  │  COMPLIANCE  │◀────│ PLAN WRITER  │                            │
│  │    AGENT     │     │    AGENT     │                            │
│  │              │     │              │                            │
│  │ Validate     │     │ Generate     │                            │
│  │ requirements │     │ narrative    │                            │
│  └──────────────┘     └──────────────┘                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  PostgreSQL  │  │    Redis     │  │  Pinecone    │             │
│  │  (Primary)   │  │   (Cache)    │  │  (Vectors)   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│  ┌──────────────┐                                                  │
│  │ S3 Storage   │                                                  │
│  │ (Exports)    │                                                  │
│  └──────────────┘                                                  │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│              EXTERNAL DATA SOURCES (Verified Only)                 │
│                                                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │   ONS  │ │Eurostat│ │ Google │ │  SERP  │ │Companies│         │
│  │   API  │ │  API   │ │ Trends │ │  API   │ │ House  │          │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2 Multi-Agent Pipeline Flow (from PRD v3)

**Stage 1: Research Agent**
- **Input:** IntakeData (industry, location, business_type)
- **Actions:**
  - Query ONS API for UK market statistics
  - Query Eurostat for EU comparisons
  - Query Google Trends for search demand
  - Query SERP API for competitor identification
  - Query Companies House for competitor financials
- **Output:** `research_data_pack.json` with sources + timestamps
- **Timeout:** 30 seconds
- **Fallback:** Mark missing data as "unavailable"

**Stage 2: Validation Agent**
- **Input:** `research_data_pack.json`
- **Checks:**
  - Data freshness (reject if >12 months old)
  - Source validity (only approved sources)
  - Logical consistency (growth_rate vs market_maturity)
  - Completeness (flag missing fields)
  - Outlier detection (>3 std dev from benchmarks)
- **Output:** `validated_data_pack.json` with warnings/errors
- **Failure Mode:** If critical data missing → halt pipeline

**Stage 3: Financial Engine (DETERMINISTIC - NO AI)**
- **Input:** `validated_data_pack.json` + `user_financials`
- **Calculations:** (from PRD v3 Appendix C)
  ```
  Revenue[year] = Revenue[year-1] × (1 + growth_rate)
  COGS = Revenue × industry_benchmark.cogs_percentage
  Gross_Profit = Revenue - COGS
  Operating_Expenses = salaries + rent + utilities + marketing
  Net_Profit = Gross_Profit - OpEx - Taxes
  Break_Even = Fixed_Costs / (Price - Variable_Cost)
  Cash_Flow = Net_Profit + Depreciation - CapEx - Δ_WorkingCap
  ```
- **Output:** `financial_model.json` with P&L, cashflow, break-even, KPIs
- **CRITICAL:** AI is NOT used for number generation

**Stage 4: Plan Writer Agent**
- **Input:** `validated_data_pack.json` + `financial_model.json` + `template_structure`
- **Constraints:**
  - ❌ MUST NOT invent statistics
  - ❌ MUST NOT generate financial numbers
  - ✅ MUST cite source for every statistic
  - ✅ MUST use template structure exactly
  - ✅ MUST use "No verified data available" for missing data
- **Output:** `plan_sections.json` with citations + word counts
- **System Prompt:** From PRD v3 Appendix D.1

**Stage 5: Compliance Agent**
- **Input:** `plan_sections.json` + `compliance_template`
- **Templates:**
  - UK_STARTUP_VISA
  - UK_INNOVATOR_VISA
  - UK_STARTUP_LOAN
  - INVESTOR_READY
  - GENERIC
- **Checks:** Required sections, minimum word counts, required data points, realism score, clarity score
- **Output:** `compliance_report.json` with overall_status + checklist

**Pipeline Timing Requirements:**
| Stage | Max Duration |
|-------|--------------|
| Research Agent | 30 seconds |
| Validation Agent | 5 seconds |
| Financial Engine | 2 seconds |
| Plan Writer Agent | 60 seconds |
| Compliance Agent | 10 seconds |
| **Total Pipeline** | **<120 seconds** |

---

### 3.3 Technology Stack (CONFIRMED)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Next.js 14 + TypeScript | Web application |
| **UI Framework** | Tailwind CSS + shadcn/ui | Component library |
| **Backend** | Node.js + Express/Fastify + TypeScript | API services |
| **Database** | PostgreSQL | Primary data store |
| **Cache** | Redis (AWS ElastiCache) | Sessions, rate limiting, data caching |
| **Vector DB** | Pinecone or pgvector | RAG context storage |
| **Storage** | AWS S3 (or MinIO) | Document storage, exports |
| **AI Text** | OpenAI GPT-4o / GPT-5 | Text generation |
| **AI Embeddings** | OpenAI text-embedding-3-large | Vector search |
| **Auth** | Clerk or Auth0 | Authentication + authorization |
| **Payments** | Stripe | Subscriptions + one-time payments |
| **Email** | Resend or SendGrid | Transactional emails |
| **Monitoring** | Sentry (errors) + Datadog (APM) | Observability |
| **Analytics** | PostHog | Product analytics |

---

## ✅ 4. UNIFIED DATA MODEL SUMMARY

### 4.1 Core Entities

**User**
- Fields: id, email, password_hash, name, auth_provider, organisation_id, role
- Relationships: owns Plans, belongs to Organisation, has Subscription

**Plan**
- Fields: id, user_id, organisation_id, name, status, compliance_type, intake_data (JSONB)
- Relationships: has PlanContent, has ResearchPack, has FinancialModel, has ComplianceReport
- Statuses: `draft`, `generating`, `complete`, `archived`

**IntakeData** (JSONB within Plan)
- business_name, industry_id, location_country, target_market, funding_goal, revenue_model
- Products/services description, unique value proposition, team size, founder background
- Financial inputs: starting_capital, monthly_revenue_estimate, price_per_unit

**ResearchPack**
- Fields: id, plan_id, raw_data (JSONB), quality_score, data_sources[], missing_data (JSONB)
- Contains: market_size, growth_rate, competitor_data, demographic_data, trend_data
- Each data point includes: value, source_name, source_url, timestamp, confidence

**FinancialModel**
- Fields: id, plan_id, inputs (JSONB), pnl_monthly, pnl_annual, cashflow_monthly, break_even, kpis
- Contains: P&L tables, cashflow statements, break-even analysis, KPI dashboard
- Formulas documented in `formulas_used` JSONB field

**PlanContent**
- Fields: id, plan_id, status, ai_model_used, prompt_version
- Has many PlanSections

**PlanSection**
- Fields: id, plan_content_id, section_type, title, content (markdown), word_count, data_citations (JSONB)
- Section types: executive_summary, company_overview, market_analysis, competitive_analysis, financial_projections, etc.

**ComplianceReport**
- Fields: id, plan_id, plan_purpose, overall_status, checks (JSONB), passed_count, failed_count
- Statuses: `compliant`, `needs_attention`, `non_compliant`

**Industry**
- Fields: id, name, parent_id, sic_code, naics_code, description
- Hierarchical structure (parent/child industries)

**IndustryBenchmark**
- Fields: industry_id, location, gross_margin_median, operating_expense_ratio, cogs_percentage, employee_cost_average
- Used by Financial Engine for projections

**Subscription**
- Fields: id, user_id, stripe_subscription_id, tier, status, current_period_end
- Tiers: `free`, `starter`, `professional`, `enterprise`

**Export**
- Fields: id, plan_id, user_id, format, s3_key, s3_url, download_count
- Formats: `pdf`, `docx`, `google_docs`, `notion`, `markdown`

**AuditLog**
- Fields: id, user_id, action, entity_type, entity_id, old_values (JSONB), new_values (JSONB), ip_address

### 4.2 Key Relationships

```
User ──< Plan ──< PlanContent ──< PlanSection
     │         │             └──< Citation
     │         ├──< ResearchPack ──< DataPoint
     │         ├──< FinancialModel
     │         ├──< ComplianceReport
     │         └──< Export
     │
     └──< Subscription
     └──< AuditLog

Organisation ──< User
             └──< Plan (team plans)

Plan ──< Collaborator ──> User
     └──< PlanVersion (version history)
```

---

## ✅ 5. ORDERED BUILD PLAN (MVP → ENTERPRISE)

### Phase 0: Foundation & Setup (Week 1)
**Goal:** Development environment + infrastructure

| Task | Description | Effort |
|------|-------------|--------|
| Project scaffolding | Initialize Next.js + Node.js + TypeScript | 1 day |
| Database setup | PostgreSQL + migrations framework | 1 day |
| Redis setup | Cache configuration | 0.5 day |
| AWS S3 setup | File storage bucket | 0.5 day |
| Authentication | Clerk/Auth0 integration | 1 day |
| Stripe setup | Webhook endpoints, product/price IDs | 1 day |
| CI/CD pipeline | GitHub Actions + deployment | 1 day |

---

### Phase 1: MVP (Weeks 2-12)
**Goal:** Core plan generation working end-to-end

#### Week 2-3: User Management
- [ ] User registration (email + Google OAuth)
- [ ] Login/logout flows
- [ ] Email verification
- [ ] JWT token generation
- [ ] Session management (Redis)
- [ ] User profile page

#### Week 4-6: Smart Intake Wizard
- [ ] Industry database seeding (500+ industries)
- [ ] Multi-step wizard UI (chat-style)
- [ ] Form validation + error handling
- [ ] Progress saving (auto-save every 500ms)
- [ ] Backward navigation without data loss
- [ ] Summary review screen
- [ ] IntakeData JSON storage

#### Week 7-10: AI Plan Generator (Basic - Single Agent)
- [ ] OpenAI API integration
- [ ] Basic plan template structure (15 templates)
- [ ] Section generation (executive summary, company overview, products, market analysis, competitive analysis, marketing plan, operations, team, financials)
- [ ] SWOT analysis generator
- [ ] Basic competitor analysis (without external APIs)
- [ ] Store PlanContent + PlanSections in database
- [ ] Generation status tracking

#### Week 11-12: Plan Editing & Export
- [ ] Section editor UI (rich text)
- [ ] Regenerate section controls (shorter/longer/tone)
- [ ] PDF export (Puppeteer or React-PDF)
- [ ] Plan dashboard (list, clone, delete)
- [ ] Version history (basic)

#### Week 12: Subscription & Limits
- [ ] Stripe subscription creation
- [ ] Free tier limits (1 plan, preview only)
- [ ] Starter tier (3 plans/month + PDF)
- [ ] Usage tracking
- [ ] Paywall modals
- [ ] Customer portal link

**MVP Launch Checklist:**
- [ ] User can signup → wizard → generate → edit → export PDF
- [ ] Subscription limits enforced
- [ ] Error logging (Sentry)
- [ ] Basic monitoring (Datadog)
- [ ] Landing page + pricing page
- [ ] Terms of Service + Privacy Policy

---

### Phase 2: Multi-Agent + Financials + Compliance (Weeks 13-24)
**Goal:** Zero-hallucination architecture + verified data

#### Week 13-15: Research Agent
- [ ] ONS API integration
  - [ ] Authentication
  - [ ] Industry dataset mapping (from PRD v3 Section 5.13)
  - [ ] Market size queries
  - [ ] Growth rate queries
- [ ] Eurostat API integration
- [ ] Google Trends API integration
- [ ] SERP API integration (competitor search)
- [ ] Companies House API integration
- [ ] Data caching strategy (Redis, 24hr TTL)
- [ ] ResearchPack database model
- [ ] DataPoint storage with sources

#### Week 16-17: Validation Agent
- [ ] Data freshness checks (reject >12 months)
- [ ] Source validity checks
- [ ] Logical consistency checks
- [ ] Outlier detection (>3 std dev)
- [ ] Completeness checks
- [ ] Warning/error generation
- [ ] Validation report storage

#### Week 18-20: Financial Engine (Deterministic)
- [ ] Industry benchmark database seeding
- [ ] Revenue projection formula implementation
- [ ] COGS calculation
- [ ] Operating expenses breakdown
- [ ] P&L statement generation (monthly + annual)
- [ ] Cashflow statement generation
- [ ] Break-even analysis
- [ ] KPI dashboard (gross margin, net margin, burn rate, runway)
- [ ] Scenario support (base, optimistic, conservative)
- [ ] FinancialModel database storage
- [ ] **VERIFY: Zero AI usage in calculations**

#### Week 21-22: Plan Writer Agent (Zero-Hallucination)
- [ ] Implement system prompt from PRD v3 Appendix D.1
- [ ] Template-driven section generation
- [ ] Data citation enforcement
- [ ] "No verified data available" handling
- [ ] Regeneration with different instructions
- [ ] Citation tracking (Citation table)
- [ ] **VERIFY: All numbers have sources**

#### Week 23: Compliance Agent
- [ ] Compliance template definitions:
  - [ ] UK_STARTUP_VISA checklist
  - [ ] UK_INNOVATOR_VISA checklist
  - [ ] UK_STARTUP_LOAN checklist
  - [ ] INVESTOR_READY checklist
- [ ] Automated compliance checking
- [ ] ComplianceReport generation
- [ ] Compliance score calculation
- [ ] Recommendation generation

#### Week 24: Phase 2 Features
- [ ] Visual charts (Chart.js or Recharts)
- [ ] Business Model Canvas generator
- [ ] Pitch Deck generator (12 slides)
- [ ] DOCX export (docx.js)
- [ ] Markdown export
- [ ] Professional tier activation
- [ ] AI Advisor Chat (basic, uses plan context)

**Phase 2 Launch Checklist:**
- [ ] Zero-hallucination verified (manual review of 50 plans)
- [ ] Financial projections audited by CPA
- [ ] Compliance templates validated with endorsing bodies
- [ ] All P0 features functional
- [ ] Performance: <120s generation time
- [ ] Error rate: <1%

---

### Phase 3: Collaboration + Premium (Weeks 25-36)
**Goal:** Team features + advanced tools

#### Week 25-27: Team Collaboration
- [ ] Collaborator invitations
- [ ] Role-based permissions (owner, editor, viewer)
- [ ] Comment threads on sections
- [ ] Activity feed
- [ ] Real-time presence indicators (Socket.io)
- [ ] Notification system

#### Week 28-30: White-Label & Customization
- [ ] Logo upload
- [ ] Color scheme customization
- [ ] White-label PDF templates
- [ ] Custom financial assumptions editor
- [ ] Scenario planning UI (what-if analysis)
- [ ] Version history with diff view

#### Week 31-33: Advanced Exports
- [ ] Google Docs API integration
- [ ] Notion API integration
- [ ] AI Pitch Script generator
- [ ] Bank Loan Proposal template
- [ ] Domain availability checker (using domain API)

#### Week 34-36: Polish & Optimization
- [ ] AI Logo Generator (add-on, £9)
- [ ] Activity logs dashboard
- [ ] Full audit trail
- [ ] Performance optimizations
- [ ] Mobile responsive improvements
- [ ] Accessibility (WCAG AA)

---

### Phase 4: Enterprise + API (Weeks 37-48)
**Goal:** Multi-tenant + programmatic access

#### Week 37-40: Organisation Accounts
- [ ] Organisation entity + database
- [ ] Multi-user teams
- [ ] Seat management
- [ ] Org-level subscription
- [ ] Billing per seat
- [ ] Team admin dashboard

#### Week 41-44: Consultant Workspace
- [ ] Client management module
- [ ] Client folders
- [ ] Per-client plan lists
- [ ] Client-specific templates
- [ ] Secure client sharing (time-limited links)
- [ ] Activity analytics per client

#### Week 45-47: RESTful API
- [ ] API authentication (API keys)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Rate limiting per API key
- [ ] Webhook support (plan.created, plan.generated, etc.)
- [ ] API usage dashboard

#### Week 48: Enterprise Features
- [ ] Custom template library (org-specific)
- [ ] SSO integration (SAML)
- [ ] Advanced analytics dashboard
- [ ] Full white-label (custom domain)
- [ ] Priority support system

---

## ✅ 6. OPEN QUESTIONS

### 6.1 Product Questions

| ID | Question | Impact | Priority |
|----|----------|--------|----------|
| **OQ-001** | What is the EXACT checklist for UK Innovator Founder Visa compliance? Need official endorsing body criteria document. | High | Critical |
| **OQ-002** | What is the EXACT checklist for UK Start-Up Loan compliance? Need British Business Bank official requirements. | High | Critical |
| **OQ-003** | Which specific ONS datasets contain industry market size data? Need API endpoint mapping. | High | Critical |
| **OQ-004** | What is the Eurostat API structure for UK-relevant data post-Brexit? Some datasets may no longer be accessible. | High | High |
| **OQ-005** | Should free tier show watermark on PDF preview, or just block download? | Medium | Medium |
| **OQ-006** | How many team seats included in Enterprise tier base price (£99/mo)? | Medium | Medium |
| **OQ-007** | What level of white-label customization: colors only, or logo + colors + fonts + custom domain? | Medium | Medium |
| **OQ-008** | Should consultant workspace allow clients to self-edit plans, or consultant-only editing? | Medium | Medium |
| **OQ-009** | What disclaimers are legally required for AI-generated financial projections? | High | Critical |
| **OQ-010** | Do we need professional indemnity insurance for business plan generation? | High | Critical |

### 6.2 Technical Questions

| ID | Question | Impact | Priority |
|----|----------|--------|----------|
| **OQ-011** | Pinecone vs pgvector for vector storage? Cost analysis needed. | Medium | High |
| **OQ-012** | Express vs Fastify for Node.js backend? Performance benchmarks needed. | Low | Low |
| **OQ-013** | What is acceptable AI generation time? 15s for MVP, but is 30s ok for full plan? | Medium | Medium |
| **OQ-014** | Should we implement streaming generation progress, or batch completion? | Medium | Medium |
| **OQ-015** | What is max file size for PDF exports? | Low | Low |
| **OQ-016** | Data retention policy for deleted plans? 90 days soft delete? | Medium | Medium |
| **OQ-017** | Should we support annual billing discounts? What percentage? | Medium | Medium |

### 6.3 Data Source Questions

| ID | Question | Impact | Priority |
|----|----------|--------|----------|
| **OQ-018** | What is the licensing status of ONS data for commercial use? Must verify. | Critical | Critical |
| **OQ-019** | What is the licensing status of Eurostat data for commercial use? Must verify. | Critical | Critical |
| **OQ-020** | Can we use Companies House data commercially without additional licensing? | High | High |
| **OQ-021** | What Google Trends API usage limits apply? Rate limits for commercial use? | High | High |
| **OQ-022** | What industry benchmarks source should we use? IBISWorld (expensive) vs Statista vs custom scraping? | High | High |
| **OQ-023** | How do we handle conflicting data from multiple sources (e.g., ONS vs Eurostat)? Primary source rule? | Medium | High |

### 6.4 Business Questions

| ID | Question | Impact | Priority |
|----|----------|--------|----------|
| **OQ-024** | What is target Customer Acquisition Cost (CAC) for each tier? Marketing budget allocation? | High | High |
| **OQ-025** | What marketing channels will drive initial user acquisition? SEO, PPC, content, partnerships? | High | High |
| **OQ-026** | Will we offer money-back guarantee? If so, for how long (30 days)? | Medium | Medium |
| **OQ-027** | What is support model: email only, live chat, phone for Enterprise? | Medium | Medium |
| **OQ-028** | Do we need UK solicitor review of Terms of Service and Privacy Policy? | High | Critical |

### 6.5 Architecture Questions

| ID | Question | Impact | Priority |
|----|----------|--------|----------|
| **OQ-029** | How do we handle partial generation failures? Retry entire pipeline or specific agent? | High | High |
| **OQ-030** | What happens if user's subscription expires mid-generation? Complete or halt? | Medium | Medium |
| **OQ-031** | Should we queue generation jobs if load is high, or reject requests? | High | High |
| **OQ-032** | What backup strategy for PostgreSQL? Continuous backup or daily snapshots? | High | High |

---

## ✅ 7. NEXT STEPS

### 7.1 Before Starting Development

**Must Complete:**
1. ✅ Read both PRDs (DONE)
2. ✅ Generate this summary document (DONE)
3. ⏳ **AWAITING USER APPROVAL** of this summary
4. ⏳ Resolve all CRITICAL priority open questions (OQ-001, OQ-002, OQ-009, OQ-010, OQ-018, OQ-019, OQ-028)
5. ⏳ Finalize tech stack choices (Clerk vs Auth0, Pinecone vs pgvector, Express vs Fastify)
6. ⏳ Obtain API keys:
   - OpenAI API key
   - ONS API key (if required)
   - Eurostat API key (if required)
   - Google Trends API credentials
   - SERP API key
   - Companies House API key
   - Stripe API keys (test + production)
   - Auth provider credentials (Clerk or Auth0)

### 7.2 Development Start Sequence

Once approved:
1. **Week 1:** Foundation setup (database, auth, payments, infrastructure)
2. **Week 2-12:** MVP development (user management → intake wizard → basic plan generation → export)
3. **Week 12:** MVP launch (beta)
4. **Week 13-24:** Phase 2 development (multi-agent pipeline, financials, compliance)
5. **Week 24:** Phase 2 launch (v1.0 production)

### 7.3 Success Criteria

**MVP Success:**
- Time to first plan: <30 minutes (signup to export)
- Plan completion rate: >65%
- Free to paid conversion: >8% (30-day cohort)
- Generation success rate: >95%
- User satisfaction: >4.0/5.0

**Phase 2 Success:**
- Zero hallucination rate: 0%
- Data citation rate: 100%
- Compliance pass rate: >70% (visa/loan plans)
- Financial accuracy: CPA verified
- Generation time: <120 seconds

---

## ✅ 8. RISKS & MITIGATION

### Critical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **ONS/Eurostat API changes** | High | Abstraction layer, fallback sources, monitoring |
| **AI model quality degradation** | High | Multi-model fallback, continuous monitoring |
| **Compliance template rejection** | Critical | Legal review, conservative claims, disclaimer language |
| **Data licensing issues** | Critical | Legal verification BEFORE Phase 2 start |
| **OpenAI API cost overruns** | Medium | Aggressive caching, prompt optimization, usage monitoring |

---

## 📋 DOCUMENT STATUS

- **PRD v4 (Master):** ✅ Fully Read
- **PRD v3 (Technical):** ✅ Fully Read
- **Summary Document:** ✅ Generated
- **Open Questions:** ⚠️ 32 identified, awaiting answers
- **Approval Status:** ⏳ **AWAITING USER APPROVAL**

---

**🚨 NO CODE WILL BE GENERATED UNTIL THIS SUMMARY IS APPROVED 🚨**

Please review this document carefully and:
1. Confirm understanding is correct
2. Prioritize open questions to resolve
3. Approve to proceed with development

