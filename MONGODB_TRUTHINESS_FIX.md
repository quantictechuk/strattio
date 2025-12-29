# MongoDB Truthiness Check Fix

## Problem

Application startup was failing with:
```
NotImplementedError: Database objects do not implement truth value testing or bool(). 
Please compare with None instead: database is not None
```

## Root Cause

MongoDB's `Database` objects (from PyMongo/Motor) **do not support truthiness testing**. You cannot use:
- ❌ `if not db:`
- ❌ `if db:`
- ❌ `bool(db)`

Instead, you must explicitly compare with `None`:
- ✅ `if db is None:`
- ✅ `if db is not None:`

## Fixes Applied

### 1. Startup Event Check
**File:** `backend/server.py` (line 133)

**Before:**
```python
@app.on_event("startup")
async def startup_event():
    if not db:  # ❌ Raises NotImplementedError
        logger.warning("MongoDB not configured...")
        return
```

**After:**
```python
@app.on_event("startup")
async def startup_event():
    if db is None:  # ✅ Correct way to check
        logger.warning("MongoDB not configured...")
        return
```

### 2. Shutdown Event Check
**File:** `backend/server.py` (line 164)

**Before:**
```python
@app.on_event("shutdown")
async def shutdown_event():
    if client:  # ⚠️ Potentially problematic
        client.close()
```

**After:**
```python
@app.on_event("shutdown")
async def shutdown_event():
    if client is not None:  # ✅ Explicit None check
        client.close()
```

## Why This Happens

PyMongo/Motor Database objects intentionally don't implement `__bool__()` to prevent accidental truthiness checks. This is a design decision to make developers be explicit about their intent:

- **Implicit check** (`if not db:`): Ambiguous - are you checking if it exists, or if it's truthy?
- **Explicit check** (`if db is None:`): Clear intent - you're checking if the database object exists

## Best Practices

When working with MongoDB objects in Python:

✅ **DO:**
```python
if db is None:
    # Handle missing database

if db is not None:
    # Use database
```

❌ **DON'T:**
```python
if not db:  # ❌ NotImplementedError
if db:      # ❌ NotImplementedError
bool(db)    # ❌ NotImplementedError
```

## Files Changed

1. `backend/server.py` - Fixed truthiness checks in startup and shutdown events

---

**The application should now start correctly on Vercel!** 🎉
