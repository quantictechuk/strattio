# Strattio API Contract Reference
**Version:** 1.0  
**Base URL:** `http://0.0.0.0:8001/api`  
**Last Updated:** November 2025

---

## Table of Contents
1. [Authentication](#authentication)
2. [Plans](#plans)
3. [Sections](#sections)
4. [Financials](#financials)
5. [Compliance](#compliance)
6. [Exports](#exports)
7. [Subscriptions](#subscriptions)
8. [Error Codes](#error-codes)

---

## Global Patterns

### Headers
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Response Format
**Success:**
```json
{
  "data": { ... },
  "meta": {
    "request_id": "uuid",
    "timestamp": "ISO8601"
  }
}
```

**Error:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

---

## Authentication

### POST /api/auth/register
**Purpose:** Register new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response:** 200 OK
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "subscription_tier": "free",
    "created_at": "2025-11-30T12:00:00Z"
  }
}
```

**Errors:**
- 400: Email already registered
- 422: Validation error

---

### POST /api/auth/login
**Purpose:** Authenticate user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:** 200 OK (same format as register)

**Errors:**
- 401: Invalid credentials

---

### POST /api/auth/refresh
**Purpose:** Refresh access token

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response:** 200 OK
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

---

### GET /api/auth/me
**Purpose:** Get current user

**Headers:** `Authorization: Bearer <token>`

**Response:** 200 OK
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "subscription_tier": "free",
  "created_at": "2025-11-30T12:00:00Z"
}
```

---

## Plans

### GET /api/plans
**Purpose:** List user's plans

**Query Params:**
- `user_id` (required): User ID
- `status` (optional): Filter by status
- `limit` (optional): Max results (default: 100)

**Response:** 200 OK
```json
{
  "plans": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Coffee Shop Business Plan",
      "status": "complete",
      "plan_purpose": "loan",
      "created_at": "2025-11-30T12:00:00Z",
      "updated_at": "2025-11-30T12:05:00Z",
      "completed_at": "2025-11-30T12:05:00Z"
    }
  ]
}
```

---

### POST /api/plans
**Purpose:** Create new plan

**Request:**
```json
{
  "name": "Coffee Shop Business Plan",
  "plan_purpose": "loan",
  "intake_data": {
    "business_name": "Sarah's Coffee House",
    "industry": "food_beverage_cafe",
    "location_country": "GB",
    "location_city": "London",
    "starting_capital": 50000,
    "currency": "GBP",
    "monthly_revenue_estimate": 15000,
    "team_size": 3
    // ... additional fields
  }
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Coffee Shop Business Plan",
  "status": "draft",
  "plan_purpose": "loan",
  "intake_data": { ... },
  "created_at": "2025-11-30T12:00:00Z"
}
```

**Errors:**
- 403: Plan limit reached
- 422: Validation error

---

### GET /api/plans/:id
**Purpose:** Get single plan

**Response:** 200 OK
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Coffee Shop Business Plan",
  "status": "complete",
  "plan_purpose": "loan",
  "intake_data": { ... },
  "generation_metadata": {
    "duration_seconds": 87.3,
    "started_at": "2025-11-30T12:00:00Z",
    "completed_at": "2025-11-30T12:01:27Z"
  },
  "created_at": "2025-11-30T12:00:00Z",
  "completed_at": "2025-11-30T12:01:27Z"
}
```

---

### POST /api/plans/:id/generate
**Purpose:** Generate business plan content

**Response:** 200 OK
```json
{
  "status": "complete",
  "plan_id": "uuid",
  "generation_metadata": {
    "duration_seconds": 87.3,
    "started_at": "2025-11-30T12:00:00Z",
    "completed_at": "2025-11-30T12:01:27Z",
    "pipeline_version": "1.0"
  }
}
```

**Errors:**
- 404: Plan not found
- 500: Generation failed

---

### GET /api/plans/:id/status
**Purpose:** Poll generation status

**Response:** 200 OK
```json
{
  "plan_id": "uuid",
  "status": "generating",
  "updated_at": "2025-11-30T12:00:30Z"
}
```

**Statuses:**
- `draft`: Not yet generated
- `generating`: Pipeline running
- `complete`: Successfully generated
- `failed`: Generation error

---

### POST /api/plans/:id/duplicate
**Purpose:** Clone existing plan

**Response:** 201 Created (same format as create)

---

### DELETE /api/plans/:id
**Purpose:** Delete plan

**Response:** 200 OK
```json
{
  "message": "Plan deleted successfully"
}
```

---

## Sections

### GET /api/plans/:plan_id/sections
**Purpose:** Get all plan sections

**Response:** 200 OK
```json
{
  "sections": [
    {
      "id": "uuid",
      "plan_id": "uuid",
      "section_type": "executive_summary",
      "title": "Executive Summary",
      "content": "Sarah's Coffee House, located in London...",
      "word_count": 207,
      "order_index": 0,
      "ai_generated": true,
      "edited_by_user": false,
      "created_at": "2025-11-30T12:01:00Z"
    },
    // ... 8 more sections
  ]
}
```

---

### GET /api/plans/:plan_id/sections/:section_id
**Purpose:** Get single section

**Response:** 200 OK (single section object)

---

### PATCH /api/plans/:plan_id/sections/:section_id
**Purpose:** Update section content

**Request:**
```json
{
  "content": "Updated content here..."
}
```

**Response:** 200 OK (updated section object)

---

### POST /api/plans/:plan_id/sections/:section_id/regenerate
**Purpose:** Regenerate section with AI

**Request (optional):**
```json
{
  "options": {
    "tone": "formal",
    "length": "longer"
  }
}
```

**Response:** 202 Accepted
```json
{
  "message": "Section regeneration queued",
  "section_id": "uuid"
}
```

---

## Financials

### GET /api/plans/:plan_id/financials
**Purpose:** Get financial model

**Response:** 200 OK
```json
{
  "id": "uuid",
  "plan_id": "uuid",
  "data": {
    "pnl_annual": [
      {
        "year": 1,
        "revenue": 180000,
        "cogs": 63000,
        "gross_profit": 117000,
        "total_opex": 156400,
        "operating_profit": -39400,
        "tax": 0,
        "net_profit": -39400
      },
      // ... years 2-5
    ],
    "break_even": {
      "fixed_costs_monthly": 11083.33,
      "contribution_margin_per_unit": 2.92,
      "break_even_units_monthly": 3789,
      "break_even_revenue_monthly": 17051.28
    },
    "kpis": {
      "gross_margin_percent": 65.0,
      "net_margin_percent": -21.89,
      "roi_year1_percent": -78.8
    }
  },
  "created_at": "2025-11-30T12:01:20Z"
}
```

---

## Compliance

### GET /api/plans/:plan_id/compliance
**Purpose:** Get compliance report

**Response:** 200 OK
```json
{
  "id": "uuid",
  "plan_id": "uuid",
  "data": {
    "template_id": "UK_STARTUP_LOAN",
    "overall_status": "compliant",
    "checks": [
      {
        "rule_id": "repayment",
        "name": "Loan Repayment Plan",
        "status": "pass",
        "message": "Financial requirement met"
      },
      {
        "rule_id": "breakeven",
        "name": "Break-even within 24 months",
        "status": "pass",
        "message": "Financial projections reviewed"
      }
    ],
    "passed_count": 2,
    "failed_count": 0,
    "score": 100
  },
  "created_at": "2025-11-30T12:01:25Z"
}
```

---

## Exports

### POST /api/exports
**Purpose:** Create export job

**Request:**
```json
{
  "plan_id": "uuid",
  "format": "pdf",
  "user_id": "uuid"
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "plan_id": "uuid",
  "user_id": "uuid",
  "format": "pdf",
  "status": "pending",
  "created_at": "2025-11-30T12:05:00Z"
}
```

**Errors:**
- 403: Tier does not allow this export format

---

### GET /api/exports/:id/download
**Purpose:** Get download link

**Response:** 200 OK
```json
{
  "message": "Export download ready",
  "export_id": "uuid",
  "format": "pdf",
  "download_url": "/api/exports/uuid/file"
}
```

---

## Subscriptions

### GET /api/subscriptions/current
**Purpose:** Get user subscription

**Query Params:**
- `user_id` (required)

**Response:** 200 OK
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "tier": "free",
  "status": "active",
  "plans_created_this_month": 1,
  "plan_limit": 1,
  "created_at": "2025-11-30T12:00:00Z"
}
```

---

### GET /api/subscriptions/usage
**Purpose:** Get usage statistics

**Query Params:**
- `user_id` (required)

**Response:** 200 OK
```json
{
  "tier": "free",
  "plans_created_this_month": 1,
  "plan_limit": 1,
  "total_plans": 3,
  "usage_percentage": 100
}
```

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `BAD_REQUEST` | Invalid request format |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Insufficient permissions or limit reached |
| 404 | `NOT_FOUND` | Resource not found |
| 422 | `VALIDATION_ERROR` | Request validation failed |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Temporary unavailability |

---

**End of API Contract Reference**
