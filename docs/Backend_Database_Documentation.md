# Strattio Backend Database Documentation
**Version:** 1.0  
**Database:** MongoDB  
**Last Updated:** November 2025

---

## Table of Contents
1. [Overview](#overview)
2. [Collections Schema](#collections-schema)
3. [Data Relationships](#data-relationships)
4. [Indexes](#indexes)
5. [Data Flow](#data-flow)
6. [Validation Rules](#validation-rules)
7. [Migration Considerations](#migration-considerations)

---

## Overview

**Database Name:** `strattio_db`  
**Purpose:** Store all user data, business plans, AI-generated content, financial models, and subscription information.

**Design Principles:**
- JSON-friendly documents for flexibility with AI outputs
- Embedded documents for frequently accessed related data
- References for one-to-many relationships
- Strict validation at application level
- Audit trail via timestamps and metadata fields

---

## Collections Schema

### 1. `users`
**Purpose:** Store user authentication and profile information.

```javascript
{
  _id: ObjectId,                    // Auto-generated
  email: String,                    // Unique, indexed
  password_hash: String,            // Bcrypt hashed
  name: String,
  avatar_url: String | null,
  auth_provider: String,            // "email" | "google" | "linkedin"
  auth_provider_id: String | null,
  email_verified: Boolean,          // Default: false
  role: String,                     // "user" | "consultant" | "admin"
  subscription_tier: String,        // "free" | "starter" | "professional" | "enterprise"
  created_at: Date,
  updated_at: Date,
  last_login_at: Date | null,
  settings: Object,                 // User preferences (JSON)
  metadata: Object                  // Additional data (JSON)
}
```

**Indexes:**
- `email` (unique)
- `created_at` (descending)

**Validation:**
- `email`: Valid email format, lowercase
- `password_hash`: Never returned in API responses
- `role`: Enum validation
- `subscription_tier`: Must match available tiers

---

### 2. `subscriptions`
**Purpose:** Track user subscription status and usage limits.

```javascript
{
  _id: ObjectId,
  user_id: String,                  // Reference to users._id
  tier: String,                     // "free" | "starter" | "professional" | "enterprise"
  status: String,                   // "active" | "cancelled" | "past_due" | "trialing"
  stripe_subscription_id: String | null,
  stripe_customer_id: String | null,
  plans_created_this_month: Number, // Usage counter
  plan_limit: Number,               // Based on tier
  current_period_start: Date | null,
  current_period_end: Date | null,
  cancel_at_period_end: Boolean,    // Default: false
  created_at: Date,
  updated_at: Date,
  metadata: Object
}
```

**Tier Limits:**
| Tier | plan_limit | Features |
|------|------------|----------|
| free | 1 | Preview only, no exports |
| starter | 3 | PDF export |
| professional | Unlimited | All exports, financials, compliance |
| enterprise | Unlimited | + Team, API, white-label |

**Indexes:**
- `user_id` (unique)
- `stripe_subscription_id`

---

### 3. `plans`
**Purpose:** Store business plan metadata and orchestration state.

```javascript
{
  _id: ObjectId,
  user_id: String,                  // Reference to users._id
  organisation_id: String | null,   // For enterprise (future)
  name: String,                     // Plan name
  status: String,                   // "draft" | "generating" | "complete" | "failed" | "archived"
  plan_purpose: String,             // "generic" | "loan" | "visa_startup" | "visa_innovator" | "investor"
  compliance_type: String,          // Mapped from plan_purpose
  intake_data: Object,              // Full wizard responses (JSON)
  current_version: Number,          // Version counter
  created_at: Date,
  updated_at: Date,
  completed_at: Date | null,        // When generation finished
  generation_metadata: Object,      // Pipeline timing, versions, etc.
  error: String | null,             // If status=failed
  settings: Object,                 // Plan-specific settings
  metadata: Object
}
```

**Status Flow:**
```
draft → generating → complete
                  ↘ failed
```

**intake_data Structure:**
```javascript
{
  business_name: String,
  industry: String,
  location_country: String,         // ISO 3166-1 alpha-2
  location_city: String,
  business_description: String,
  unique_value_proposition: String,
  target_customers: String,
  revenue_model: Array<String>,
  starting_capital: Number,
  currency: String,                 // "GBP" | "USD" | "EUR"
  monthly_revenue_estimate: Number,
  price_per_unit: Number,
  units_per_month: Number,
  team_size: Number,
  founder_background: String,
  // ... additional industry-specific fields
}
```

**Indexes:**
- `user_id` + `created_at` (compound, descending)
- `status`

---

### 4. `sections`
**Purpose:** Store individual business plan sections (generated content).

```javascript
{
  _id: ObjectId,
  plan_id: String,                  // Reference to plans._id
  section_type: String,             // "executive_summary" | "company_overview" | etc.
  title: String,                    // Human-readable title
  content: String,                  // Markdown or plain text
  word_count: Number,
  order_index: Number,              // Display order (0-based)
  ai_generated: Boolean,            // true if AI wrote it
  edited_by_user: Boolean,          // true if user modified
  last_edited_by: String | null,    // user_id
  created_at: Date,
  updated_at: Date,
  generation_metadata: Object,      // Model version, prompt version, etc.
  data_citations: Array,            // Array of citation objects
  metadata: Object
}
```

**Section Types:**
- `executive_summary`
- `company_overview`
- `products_services`
- `market_analysis`
- `competitive_analysis`
- `marketing_strategy`
- `operations_plan`
- `team`
- `financial_projections`

**data_citations Structure:**
```javascript
[
  {
    cited_text: String,             // The text containing the citation
    source_name: String,            // "ONS" | "Eurostat" | etc.
    source_url: String,
    source_date: String,            // ISO date
    data_value: String,             // The actual value cited
    data_type: String               // "market_size" | "growth_rate" | etc.
  }
]
```

**Indexes:**
- `plan_id` + `order_index` (compound)
- `section_type`

---

### 5. `research_packs`
**Purpose:** Store verified market data fetched by Research Agent.

```javascript
{
  _id: ObjectId,
  plan_id: String,                  // Reference to plans._id
  version: Number,                  // Increments on refresh
  status: String,                   // "pending" | "complete" | "failed"
  data: Object,                     // Full research pack (see structure below)
  quality_score: Number | null,     // 0-100
  data_sources: Array<String>,      // ["ONS", "Eurostat", ...]
  missing_data: Array,              // Fields that couldn't be retrieved
  retrieved_at: Date,
  expires_at: Date | null,          // Data freshness expiry
  metadata: Object
}
```

**data Structure (from PRD v3):**
```javascript
{
  data_pack_id: String,
  created_at: String,               // ISO timestamp
  industry: String,
  location: String,
  market_data: {
    market_size_gbp: Number,
    market_size_source: String,
    market_size_url: String,
    market_size_timestamp: String,  // ISO date
    growth_rate_percent: Number,
    growth_rate_source: String,
    growth_rate_url: String,
    growth_rate_timestamp: String
  },
  competitor_data: {
    top_competitors: Array<Object>,
    competitor_count_estimate: Number,
    competitor_count_source: String
  },
  missing_data: Array<String>,
  stale_data: Array<String>,
  fetch_errors: Array<Object>
}
```

**Indexes:**
- `plan_id`
- `retrieved_at` (descending)

---

### 6. `financial_models`
**Purpose:** Store deterministic financial projections (NO AI).

```javascript
{
  _id: ObjectId,
  plan_id: String,                  // Reference to plans._id
  version: Number,
  data: Object,                     // Full financial model (see structure below)
  created_at: Date,
  updated_at: Date,
  metadata: Object
}
```

**data Structure (from FinancialEngine):**
```javascript
{
  pnl_annual: [
    {
      year: Number,
      revenue: Number,
      cogs: Number,
      gross_profit: Number,
      total_opex: Number,
      operating_profit: Number,
      tax: Number,
      net_profit: Number
    },
    // ... 5 years
  ],
  break_even: {
    fixed_costs_monthly: Number,
    contribution_margin_per_unit: Number,
    break_even_units_monthly: Number,
    break_even_revenue_monthly: Number
  },
  kpis: {
    gross_margin_percent: Number,
    net_margin_percent: Number,
    roi_year1_percent: Number
  },
  formulas_used: [
    {
      metric: String,
      formula: String
    }
  ]
}
```

**Indexes:**
- `plan_id`

---

### 7. `compliance_reports`
**Purpose:** Store compliance validation results.

```javascript
{
  _id: ObjectId,
  plan_id: String,                  // Reference to plans._id
  template_id: String,              // "UK_STARTUP_VISA" | "UK_STARTUP_LOAN" | etc.
  version: Number,
  data: Object,                     // Full compliance report (see structure below)
  created_at: Date,
  metadata: Object
}
```

**data Structure (from ComplianceAgent):**
```javascript
{
  compliance_report_id: String,
  template_id: String,
  overall_status: String,           // "compliant" | "needs_attention" | "non_compliant"
  checks: [
    {
      rule_id: String,
      name: String,
      status: String,               // "pass" | "fail"
      message: String,
      suggestion: String | null
    }
  ],
  passed_count: Number,
  failed_count: Number,
  score: Number,                    // 0-100
  generated_at: String              // ISO timestamp
}
```

**Indexes:**
- `plan_id`

---

### 8. `exports`
**Purpose:** Track plan export jobs and downloads.

```javascript
{
  _id: ObjectId,
  plan_id: String,                  // Reference to plans._id
  user_id: String,                  // Reference to users._id
  format: String,                   // "pdf" | "docx" | "google_docs" | "notion" | "markdown"
  template_id: String | null,
  s3_key: String | null,            // Storage path
  s3_url: String | null,            // Signed URL
  file_size: Number | null,         // Bytes
  page_count: Number | null,
  download_count: Number,           // Default: 0
  status: String,                   // "pending" | "complete" | "failed"
  created_at: Date,
  expires_at: Date | null,          // Signed URL expiry
  options: Object,                  // White-label settings, etc.
  metadata: Object
}
```

**Indexes:**
- `plan_id`
- `user_id` + `created_at` (compound)

---

### 9. `audit_logs`
**Purpose:** Track all significant user and system actions.

```javascript
{
  _id: ObjectId,
  user_id: String | null,           // null for system actions
  organisation_id: String | null,
  plan_id: String | null,
  action: String,                   // "plan.created" | "section.edited" | etc.
  resource_type: String,            // "plan" | "section" | "user" | etc.
  resource_id: String,
  old_value: Object | null,
  new_value: Object | null,
  ip_address: String | null,
  user_agent: String | null,
  created_at: Date,
  metadata: Object
}
```

**Action Types:**
- `plan.created`
- `plan.generated`
- `plan.updated`
- `plan.deleted`
- `section.edited`
- `section.regenerated`
- `export.created`
- `subscription.updated`
- `user.login`
- `user.registered`

**Indexes:**
- `user_id` + `created_at` (compound, descending)
- `plan_id`
- `action`

---

## Data Relationships

### Entity Relationship Diagram (Text)

```
User (1) ──────< (M) Plan
  │                  │
  │                  ├──< (M) Section
  │                  │
  │                  ├──< (1) ResearchPack
  │                  │
  │                  ├──< (1) FinancialModel
  │                  │
  │                  ├──< (1) ComplianceReport
  │                  │
  │                  └──< (M) Export
  │
  └──< (1) Subscription

User ──────< (M) AuditLog
Plan ──────< (M) AuditLog
```

### Referential Integrity

**Enforced at Application Level:**
- When a `plan` is deleted:
  - Delete all related `sections`
  - Delete related `research_pack`
  - Delete related `financial_model`
  - Delete related `compliance_report`
  - Keep `exports` (for audit trail)
  - Keep `audit_logs` (for audit trail)

- When a `user` is deleted:
  - Soft delete: Set `user.deleted_at` timestamp
  - Keep all `plans` but anonymize
  - Keep `audit_logs` for compliance

---

## Indexes

### Performance-Critical Indexes

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ created_at: -1 })

// Plans
db.plans.createIndex({ user_id: 1, created_at: -1 })
db.plans.createIndex({ status: 1 })

// Sections
db.sections.createIndex({ plan_id: 1, order_index: 1 })
db.sections.createIndex({ section_type: 1 })

// Subscriptions
db.subscriptions.createIndex({ user_id: 1 }, { unique: true })
db.subscriptions.createIndex({ stripe_subscription_id: 1 })

// Research Packs
db.research_packs.createIndex({ plan_id: 1 })
db.research_packs.createIndex({ retrieved_at: -1 })

// Financial Models
db.financial_models.createIndex({ plan_id: 1 })

// Compliance Reports
db.compliance_reports.createIndex({ plan_id: 1 })

// Exports
db.exports.createIndex({ plan_id: 1 })
db.exports.createIndex({ user_id: 1, created_at: -1 })

// Audit Logs
db.audit_logs.createIndex({ user_id: 1, created_at: -1 })
db.audit_logs.createIndex({ plan_id: 1 })
db.audit_logs.createIndex({ action: 1 })
```

---

## Data Flow

### 1. User Registration Flow
```
1. POST /api/auth/register
2. Create document in `users` collection
3. Create document in `subscriptions` collection (tier=free)
4. Return JWT tokens
```

### 2. Plan Generation Flow
```
1. POST /api/plans (create draft plan)
   → Insert into `plans` (status=draft)

2. POST /api/plans/:id/generate
   → Update `plans` (status=generating)
   → Run PlanOrchestrator pipeline:
      a. ResearchAgent → Insert into `research_packs`
      b. ValidationAgent → (validates in-memory)
      c. FinancialEngine → Insert into `financial_models`
      d. WriterAgent → Insert into `sections` (9 sections)
      e. ComplianceAgent → Insert into `compliance_reports`
   → Update `plans` (status=complete)

3. User views plan via frontend
   → GET /api/plans/:id
   → GET /api/plans/:id/sections
   → GET /api/plans/:id/financials
   → GET /api/plans/:id/compliance
```

### 3. Export Flow
```
1. POST /api/exports (format=pdf)
   → Check subscription tier
   → Insert into `exports` (status=pending)
   → Generate PDF (future: background job)
   → Update `exports` (status=complete, s3_url)

2. GET /api/exports/:id/download
   → Return signed S3 URL or file stream
```

---

## Validation Rules

### Application-Level Validation

**Users:**
- Email: Must be valid email, lowercase, unique
- Password: Min 8 characters, must hash before storage
- Role: Must be in ["user", "consultant", "admin"]

**Plans:**
- Name: 1-200 characters
- Status: Must be in ["draft", "generating", "complete", "failed", "archived"]
- intake_data: Must include required fields per plan_purpose

**Sections:**
- section_type: Must be valid type from predefined list
- content: Min 10 characters
- order_index: Must be unique per plan

**Subscriptions:**
- tier: Must match ["free", "starter", "professional", "enterprise"]
- plans_created_this_month: Must be >= 0
- plan_limit: Must be > 0

---

## Migration Considerations

### Future PostgreSQL Migration Path

**1. Schema Mapping:**

| MongoDB Collection | PostgreSQL Table | Changes Needed |
|--------------------|------------------|----------------|
| users | users | Add SERIAL id, map ObjectId to UUID |
| subscriptions | subscriptions | Add foreign key to users(id) |
| plans | plans | Add foreign key to users(id) |
| sections | sections | Add foreign key to plans(id) |
| research_packs | research_packs | Store `data` as JSONB |
| financial_models | financial_models | Store `data` as JSONB |
| compliance_reports | compliance_reports | Store `data` as JSONB |
| exports | exports | Add foreign keys |
| audit_logs | audit_logs | Store values as JSONB |

**2. Key Changes:**
- Replace `_id` (ObjectId) with `id` (UUID)
- Add explicit foreign key constraints
- Convert embedded documents to JSONB columns
- Add `CHECK` constraints for enum fields
- Implement triggers for `updated_at` timestamps

**3. Data Integrity:**
- Add `ON DELETE CASCADE` for plan → sections
- Add `ON DELETE SET NULL` for user references in audit logs
- Implement row-level security (RLS) for multi-tenancy

**4. Migration Steps:**
```sql
-- Example: users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('user', 'consultant', 'admin')),
  subscription_tier VARCHAR(50) CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

**5. Repository Pattern:**
Implement abstract repository interface:
```typescript
interface PlanRepository {
  findById(id: string): Promise<Plan | null>;
  findByUserId(userId: string): Promise<Plan[]>;
  create(plan: CreatePlanDto): Promise<Plan>;
  update(id: string, data: UpdatePlanDto): Promise<Plan>;
  delete(id: string): Promise<void>;
}
```

Then implement `MongoDBPlanRepository` and `PostgreSQLPlanRepository` separately.

---

## Summary

**Current Implementation:**
- MongoDB with 9 collections
- JSON-friendly for AI outputs
- Application-level validation
- Strategic indexes for performance
- Clear data flow patterns

**Strengths:**
- Flexible schema for evolving AI outputs
- Fast development iteration
- Natural fit for nested/embedded data
- Easy horizontal scaling

**Trade-offs:**
- No built-in referential integrity
- Requires careful application-level validation
- Query complexity for multi-collection joins

**Migration Path:**
- Well-defined mapping to PostgreSQL
- Repository pattern enables seamless swap
- JSONB columns preserve flexibility
- Can be done incrementally (collection by collection)

---

**End of Backend Database Documentation**
