# Strattio Build Plan (Concise)

Problem Statement: Build an enterprise-grade AI-powered business plan platform with zero-hallucination architecture, multi-agent pipeline, and deterministic financial engine on the provided stack (FastAPI + React + MongoDB), faithfully mapping PRD v4 (product) and PRD v3 (technical logic) to our stack.

POC Required: Yes (LLM integration + deterministic financial engine + verified data fetch + citation guardrails)

Tech Stack (adapted to template):
- Frontend: React 18 + Vite + JS (shadcn/ui). All API calls → REACT_APP_BACKEND_URL + "/api"
- Backend: FastAPI (Python), JWT auth, rate limiting, background tasks
- DB: MongoDB (collections mirroring PRD entities)
- Storage: Local/S3-compatible (for exports when enabled)
- AI: OpenAI (Emergent Universal LLM key)

---

## Phase 1 — Core POC (Isolation-First)

Objectives
- Prove core: (a) LLM writer respects zero-hallucination + citations, (b) deterministic financial engine formulas, (c) research fetch + validation, (d) end-to-end JSON artifacts.
- One python script (tests/test_core.py) to validate all integrations deterministically.

Implementation Steps
1) Integration Playbooks (via agent): OpenAI text (writer), ONS/Eurostat data access, Companies House, SERP API, Stripe (later). Capture required keys; plan to use Emergent LLM key for OpenAI only.
2) Create tests/test_core.py covering:
   - test_llm_writer_zero_halluc(): Build prompt with DATA_PACK + FINANCIAL_PACK; ensure numbers used exist in inputs; assert citations present; temperature=0.
   - test_financial_engine_formulas(): Implement pure-python deterministic functions per PRD v3 (revenue, COGS, OpEx, P&L, CF, breakeven, KPIs) and assert reproducibility + expected values for fixtures.
   - test_market_data_fetch_validate(): Fetch a small, public metric (Eurostat/World Bank public endpoint as fallback), normalize to data_point schema, validate timestamp < 12 months, include source_url.
   - test_citation_guardrails(): Scan generated text for digits; assert all referenced numbers exist in union of DATA_PACK/FINANCIAL_PACK; else fail.
   - test_outputs_shapes(): Ensure research_data_pack.json, validated_data_pack.json, financial_model.json, plan_sections.json shapes match PRD.
3) Run tests → Fix until green. If external API blocked, allow cached-fixture mode and mark as "fetched_from_cache" with source.
4) Record artifacts under /app/tests/poc_artifacts/*.json for traceability; log prompts and responses.

Next Actions
- Retrieve Emergent LLM key automatically; confirm limited, low-cost run.
- Select a public data endpoint for POC (Eurostat/World Bank) and prepare one cached fixture.
- Lock prompt template (Appendix D) for zero-hallucination.

Success Criteria
- All POC tests pass twice in a row with identical outputs (reproducibility).
- Writer output contains citations for every statistic or explicit "No verified data available".
- Financial engine returns exact, asserted values for fixtures.
- Data pack includes valid source_url and timestamp; validation passes or passes_with_warnings.

User Stories (POC)
1. As a founder, I can run a script that generates an Executive Summary grounded in provided data with citations.
2. As a reviewer, I can see a deterministic P&L and break-even computed without AI.
3. As a PM, I can verify no number appears in text unless present in inputs.
4. As a data analyst, I can see a research pack with source URLs and timestamps.
5. As an engineer, rerunning the script with the same inputs yields identical outputs.

---

## Phase 2 — Full App Development (MVP → Enterprise in one cohesive build)

Objectives
- Build the complete Strattio app per PRD v4 (structure) and PRD v3 (formulas/agents) on FastAPI + MongoDB.
- Multi-agent pipeline operational: Research → Validation → Financial Engine → Writer → Compliance.
- Beautiful, usable UI with intake wizard, editor, financials, compliance, exports, subscriptions.

Implementation Steps
A) Backend (FastAPI)
- Core setup: load_dotenv early; connect MONGO_URL; /api prefix; healthcheck.
- Auth: Email/password JWT (signup, login, refresh, me); optional test-bypass for QA; role field.
- Models/Collections: users, plans, sections, research_packs, data_points, financial_models, compliance_reports, exports, subscriptions, organisations, collaborators, plan_versions, templates, audit_logs. Implement serialize_doc for ObjectId/datetime.
- Multi-Agent Orchestrator: POST /api/plans/{id}/generate triggers pipeline with timing caps; status polling.
  • Research Agent: fetch ONS/Eurostat/Trends/Companies House/SERP via provider modules; Redis-like in-memory cache shim (TTL); store ResearchPack + DataPoints.
  • Validation Agent: apply freshness, source, logic/outlier, completeness rules; persist report.
  • Financial Engine: deterministic formulas only; generate monthly/annual P&L, CF, breakeven, KPIs; persist.
  • Writer Agent: OpenAI with zero-hallucination prompt; citations enforced; store Sections + Citation docs.
  • Compliance Agent: rules per template (UK_STARTUP_VISA, UK_INNOVATOR_VISA, UK_STARTUP_LOAN, INVESTOR_READY, GENERIC); generate ComplianceReport.
- Endpoints (v1 subset mapped to PRD, all under /api):
  • Auth: /auth/register, /auth/login, /auth/refresh, /auth/me
  • Plans: list/create/get/update/delete/duplicate, /generate, /status
  • Sections: list/get/update, /regenerate
  • Financials: get, patch inputs, recalc
  • Research: get, refresh
  • Compliance: get, /check, list templates
  • Exports: create/list/download (PDF first using pure-python ReportLab; later DOCX/MD)
  • Subscriptions: current, checkout (placeholder until Stripe keys), usage
- Exports: implement PDF (ReportLab or WeasyPrint if available); upload locally first; S3-ready interface.
- Observability: request_id in responses, structured errors; audit logs on key actions.

B) Frontend (React + Vite)
- Pages/Routes: Home, Auth (Sign in/Up), Dashboard, Intake Wizard (chat-style), Plan Editor (sections list + editor + regenerate), Financials (tables + charts), Compliance Report, Exports, Settings.
- Components: ChatSteps, SectionCard, RichTextEditor, CitationsList, AssumptionsForm, Charts (Recharts), ComplianceChecklist, ExportModal, PaywallModal.
- Data layer: fetch with REACT_APP_BACKEND_URL; optimistic saves; loading/error states; data-testid on interactives.
- UX: shadcn/ui theme; non-transparent backgrounds; responsive, accessible.

C) Integrations & Keys
- Use integration playbooks for: OpenAI (text), Stripe (subs), ONS/Eurostat/Companies House/SERP/Trends.
- Use Emergent LLM key for OpenAI only. Request other API keys from user as needed; support cached-fixture mode if unavailable.

D) Design
- Call design_agent for guidelines; implement polished UI consistent across pages.

E) Testing & Hardening
- Lint backend (ruff) and frontend (eslint). Build check via esbuild bundle.
- Testing via testing_agent_v3: cover wizard, generation, editing, financials view, compliance, export, paywall.
- Fix all issues until green. Re-run.

Next Actions
- Acquire or confirm keys (OpenAI via Emergent; others optional for Phase 2 using cache-fixture fallback).
- Implement backend-first with orchestrated pipeline; then connect frontend; then exports; then subscriptions.
- Run testing_agent_v3 end-to-end and address defects; review supervisor logs.

Success Criteria
- User can: signup → complete intake → generate → edit/regenerate → view financials → run compliance → export PDF (tier-checked).
- Zero-hallucination: all cited stats have sources; missing stats explicitly stated.
- Deterministic financials: identical outputs on identical inputs; math validated.
- API responds under target latencies; no red-screen errors; all routes use /api.
- All interactive elements have data-testid; lint/build pass.

User Stories (App)
1. As a new user, I can complete a guided intake and see a summary of my inputs before generating.
2. As a founder, I can generate a complete plan and edit any section inline with change tracking.
3. As a user, I can regenerate a section as shorter/longer/formal/casual and compare diffs.
4. As a professional user, I can view and edit financial assumptions, recalc, and see charts.
5. As a visa applicant, I can run a compliance check and get a checklist with fixes.
6. As a user, I can export a PDF (or see a paywall if on Free tier) and download it.
7. As a consultant, I can duplicate a plan to start a variant quickly.
8. As an auditor, I can open a section and see which data points (with URLs) are cited.

Risks & Mitigation (concise)
- External API limits → cache + fixtures + retries with backoff.
- LLM drift → prompt versioning + validation agent + regeneration rules.
- PDF deps/platform limits → use pure-python ReportLab initially.
- Keys unavailable → fixture-first mode with clear UX messages.
- Performance under load → background tasks + pagination + simple caching.

Phase Closeouts
- Phase 1: All POC tests pass and artifacts saved.
- Phase 2: All user stories covered and verified by testing_agent_v3; "Phase 2: End to End Testing using Testing Agent." recorded.
