# Strattio Migration Guide: MongoDB → PostgreSQL
**Version:** 1.0  
**Last Updated:** November 2025

---

## Table of Contents
1. [Overview](#overview)
2. [Why Migrate?](#why-migrate)
3. [Migration Strategy](#migration-strategy)
4. [Schema Mapping](#schema-mapping)
5. [Data Migration Steps](#data-migration-steps)
6. [Code Changes Required](#code-changes-required)
7. [Testing Plan](#testing-plan)
8. [Rollback Plan](#rollback-plan)

---

## Overview

**Current State:** MongoDB (document-based, flexible schema)  
**Target State:** PostgreSQL (relational, ACID-compliant, strict schema)

**Migration Complexity:** Medium  
**Estimated Effort:** 2-3 weeks (including testing)

**Key Considerations:**
- Preserve all existing data
- Maintain API compatibility (no breaking changes)
- Zero downtime migration (blue-green deployment)
- JSONB columns for flexibility where needed

---

## Why Migrate?

### Benefits of PostgreSQL

1. **Referential Integrity:** Built-in foreign key constraints
2. **ACID Compliance:** Stronger consistency guarantees
3. **Query Performance:** Better for complex joins and aggregations
4. **Ecosystem:** Rich tooling (pg_dump, pg_restore, replicas)
5. **Compliance:** Easier audit trails and row-level security
6. **Cost:** Potentially lower at scale vs MongoDB Atlas

### Trade-offs

| Aspect | MongoDB (Current) | PostgreSQL (Target) |
|--------|-------------------|---------------------|
| Schema flexibility | High | Medium (JSONB helps) |
| Nested data | Native | JSONB columns |
| Horizontal scaling | Easier (sharding) | Harder (partitioning) |
| Developer speed | Faster iteration | More upfront planning |
| Data integrity | Application-level | Database-level |

---

## Migration Strategy

### Approach: Dual-Write + Repository Pattern

**Phase 1: Prepare (Week 1)**
1. Set up PostgreSQL database
2. Create schema (DDL scripts)
3. Implement repository pattern
4. Add PostgreSQL repository implementations
5. Unit test repositories

**Phase 2: Dual-Write (Week 2)**
1. Deploy code that writes to both databases
2. Monitor for errors
3. Backfill historical data (MongoDB → PostgreSQL)
4. Verify data consistency

**Phase 3: Read Migration (Week 3)**
1. Switch reads to PostgreSQL (gradual rollout)
2. Monitor performance
3. Compare query results (MongoDB vs PostgreSQL)
4. Fix discrepancies

**Phase 4: Cleanup (Week 4)**
1. Remove MongoDB writes
2. Decommission MongoDB (after retention period)
3. Remove MongoDB-specific code

---

## Schema Mapping

### 1. users Collection → Table

**MongoDB:**
```javascript
{
  _id: ObjectId,
  email: String,
  password_hash: String,
  name: String,
  role: String,
  subscription_tier: String,
  created_at: Date,
  settings: Object,
  metadata: Object
}
```

**PostgreSQL:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('user', 'consultant', 'admin')) NOT NULL DEFAULT 'user',
  subscription_tier VARCHAR(50) CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')) NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. plans Collection → Table

**PostgreSQL:**
```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('draft', 'generating', 'complete', 'failed', 'archived')) NOT NULL DEFAULT 'draft',
  plan_purpose VARCHAR(50) CHECK (plan_purpose IN ('generic', 'loan', 'visa_startup', 'visa_innovator', 'investor')) NOT NULL DEFAULT 'generic',
  intake_data JSONB NOT NULL,
  generation_metadata JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_plans_user_id ON plans(user_id, created_at DESC);
CREATE INDEX idx_plans_status ON plans(status);
```

---

### 3. sections Collection → Table

**PostgreSQL:**
```sql
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  section_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  word_count INT NOT NULL DEFAULT 0,
  order_index INT NOT NULL,
  ai_generated BOOLEAN NOT NULL DEFAULT TRUE,
  edited_by_user BOOLEAN NOT NULL DEFAULT FALSE,
  generation_metadata JSONB,
  data_citations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(plan_id, order_index)
);

CREATE INDEX idx_sections_plan_id ON sections(plan_id, order_index);
CREATE INDEX idx_sections_type ON sections(section_type);
```

---

### 4. research_packs Collection → Table

**PostgreSQL:**
```sql
CREATE TABLE research_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  data JSONB NOT NULL,
  quality_score INT CHECK (quality_score >= 0 AND quality_score <= 100),
  data_sources TEXT[],
  missing_data JSONB DEFAULT '[]',
  retrieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(plan_id, version)
);

CREATE INDEX idx_research_packs_plan_id ON research_packs(plan_id);
CREATE INDEX idx_research_packs_retrieved_at ON research_packs(retrieved_at DESC);
```

---

### 5. financial_models Collection → Table

**PostgreSQL:**
```sql
CREATE TABLE financial_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(plan_id, version)
);

CREATE INDEX idx_financial_models_plan_id ON financial_models(plan_id);
```

---

### 6. Complete Schema Script

See: `/app/migrations/postgres_schema.sql` (to be created)

---

## Data Migration Steps

### Step 1: Export from MongoDB

```bash
# Export all collections to JSON
mongodump --uri="mongodb://localhost:27017/strattio_db" --out=/tmp/mongodb_backup

# Convert to JSON for easier processing
mongosh --eval "db.users.find().forEach(printjson)" > users.json
mongosh --eval "db.plans.find().forEach(printjson)" > plans.json
# ... etc
```

### Step 2: Transform Data

```python
# migrate.py
import json
import psycopg2
from bson import ObjectId
from datetime import datetime

def transform_user(mongo_doc):
    """Transform MongoDB user to PostgreSQL format"""
    return {
        'id': str(mongo_doc['_id']),
        'email': mongo_doc['email'],
        'password_hash': mongo_doc['password_hash'],
        'name': mongo_doc.get('name'),
        'role': mongo_doc.get('role', 'user'),
        'subscription_tier': mongo_doc.get('subscription_tier', 'free'),
        'created_at': mongo_doc['created_at'],
        'settings': json.dumps(mongo_doc.get('settings', {})),
        'metadata': json.dumps(mongo_doc.get('metadata', {}))
    }

def migrate_users(mongo_data, pg_conn):
    """Migrate users collection"""
    cursor = pg_conn.cursor()
    
    for doc in mongo_data:
        transformed = transform_user(doc)
        cursor.execute("""
            INSERT INTO users (id, email, password_hash, name, role, subscription_tier, created_at, settings, metadata)
            VALUES (%(id)s, %(email)s, %(password_hash)s, %(name)s, %(role)s, %(subscription_tier)s, %(created_at)s, %(settings)s::jsonb, %(metadata)s::jsonb)
            ON CONFLICT (id) DO NOTHING
        """, transformed)
    
    pg_conn.commit()

# Run migrations
if __name__ == '__main__':
    pg_conn = psycopg2.connect("postgresql://user:password@localhost/strattio_db")
    
    with open('users.json') as f:
        users = json.load(f)
        migrate_users(users, pg_conn)
    
    # ... migrate other collections
    
    pg_conn.close()
```

### Step 3: Verify Data Integrity

```sql
-- Check row counts match
SELECT COUNT(*) FROM users; -- Should match MongoDB count
SELECT COUNT(*) FROM plans;
SELECT COUNT(*) FROM sections;

-- Check foreign key integrity
SELECT COUNT(*) FROM plans WHERE user_id NOT IN (SELECT id FROM users); -- Should be 0

-- Spot check specific records
SELECT * FROM users WHERE email = 'test@example.com';
```

---

## Code Changes Required

### Repository Pattern Implementation

**Abstract Interface:**

```python
# repositories/base.py
from abc import ABC, abstractmethod
from typing import List, Optional, Dict

class PlanRepository(ABC):
    @abstractmethod
    async def find_by_id(self, plan_id: str) -> Optional[Dict]:
        pass
    
    @abstractmethod
    async def find_by_user_id(self, user_id: str) -> List[Dict]:
        pass
    
    @abstractmethod
    async def create(self, plan_data: Dict) -> Dict:
        pass
    
    @abstractmethod
    async def update(self, plan_id: str, update_data: Dict) -> Dict:
        pass
    
    @abstractmethod
    async def delete(self, plan_id: str) -> bool:
        pass
```

**MongoDB Implementation:**

```python
# repositories/mongodb.py
from repositories.base import PlanRepository
from motor.motor_asyncio import AsyncIOMotorClient

class MongoDBPlanRepository(PlanRepository):
    def __init__(self, db):
        self.collection = db.plans
    
    async def find_by_id(self, plan_id: str) -> Optional[Dict]:
        return await self.collection.find_one({"_id": plan_id})
    
    async def find_by_user_id(self, user_id: str) -> List[Dict]:
        return await self.collection.find({"user_id": user_id}).to_list(100)
    
    # ... other methods
```

**PostgreSQL Implementation:**

```python
# repositories/postgresql.py
from repositories.base import PlanRepository
import asyncpg

class PostgreSQLPlanRepository(PlanRepository):
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool
    
    async def find_by_id(self, plan_id: str) -> Optional[Dict]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM plans WHERE id = $1",
                plan_id
            )
            return dict(row) if row else None
    
    async def find_by_user_id(self, user_id: str) -> List[Dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM plans WHERE user_id = $1 ORDER BY created_at DESC",
                user_id
            )
            return [dict(row) for row in rows]
    
    # ... other methods
```

**Dependency Injection:**

```python
# server.py
from repositories.mongodb import MongoDBPlanRepository
from repositories.postgresql import PostgreSQLPlanRepository
import os

DATABASE_TYPE = os.environ.get('DATABASE_TYPE', 'mongodb')  # 'mongodb' or 'postgresql'

if DATABASE_TYPE == 'mongodb':
    plan_repo = MongoDBPlanRepository(db)
elif DATABASE_TYPE == 'postgresql':
    pg_pool = await asyncpg.create_pool(os.environ['POSTGRES_URL'])
    plan_repo = PostgreSQLPlanRepository(pg_pool)

# Use in routes
app.state.plan_repo = plan_repo
```

---

## Testing Plan

### Unit Tests

```python
# tests/test_repositories.py
import pytest

@pytest.mark.parametrize("repo_type", ["mongodb", "postgresql"])
async def test_create_plan(repo_type):
    repo = get_repository(repo_type)
    
    plan_data = {
        "user_id": "test-user-id",
        "name": "Test Plan",
        "status": "draft",
        "intake_data": {}
    }
    
    plan = await repo.create(plan_data)
    
    assert plan["id"] is not None
    assert plan["name"] == "Test Plan"
```

### Integration Tests

```python
# tests/test_migration.py
async def test_data_consistency():
    """Verify MongoDB and PostgreSQL have same data"""
    
    mongo_plans = await mongo_repo.find_all()
    pg_plans = await pg_repo.find_all()
    
    assert len(mongo_plans) == len(pg_plans)
    
    for mongo_plan, pg_plan in zip(mongo_plans, pg_plans):
        assert mongo_plan["name"] == pg_plan["name"]
        assert mongo_plan["status"] == pg_plan["status"]
```

### Performance Tests

```python
import time

async def benchmark_query(repo, query_name, query_func):
    start = time.time()
    result = await query_func(repo)
    duration = time.time() - start
    
    print(f"{query_name}: {duration:.3f}s")
    return result

# Compare query performance
await benchmark_query(mongo_repo, "MongoDB list plans", lambda r: r.find_by_user_id(user_id))
await benchmark_query(pg_repo, "PostgreSQL list plans", lambda r: r.find_by_user_id(user_id))
```

---

## Rollback Plan

### Emergency Rollback Steps

If critical issues arise during migration:

1. **Immediate:** Set `DATABASE_TYPE=mongodb` in environment
2. **Redeploy:** Previous version of application
3. **Verify:** MongoDB still has all data
4. **Investigate:** Root cause of migration failure
5. **Fix:** Address issues before retry

### Data Retention

- Keep MongoDB running for 30 days post-migration
- Daily backups of both databases during transition
- Verify data consistency daily

### Monitoring

```python
# Add monitoring for dual-write consistency
import logging

async def create_plan_dual_write(plan_data):
    # Write to both databases
    mongo_result = await mongo_repo.create(plan_data)
    pg_result = await pg_repo.create(plan_data)
    
    # Compare results
    if mongo_result["id"] != pg_result["id"]:
        logging.error(f"Dual-write inconsistency detected: {mongo_result['id']} != {pg_result['id']}")
        # Alert ops team
    
    return pg_result  # Return PostgreSQL result (primary)
```

---

## Summary

**Migration Checklist:**

- [ ] Create PostgreSQL schema
- [ ] Implement repository pattern
- [ ] Write unit tests for repositories
- [ ] Deploy dual-write code
- [ ] Backfill historical data
- [ ] Verify data consistency
- [ ] Switch reads to PostgreSQL (gradual)
- [ ] Monitor performance and errors
- [ ] Remove MongoDB writes
- [ ] Decommission MongoDB (after 30 days)

**Estimated Timeline:** 3-4 weeks

**Risk Level:** Medium  
**Mitigation:** Repository pattern + dual-write + gradual rollout

---

**End of Migration Guide**
