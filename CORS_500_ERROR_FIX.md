# CORS Preflight 500 Error Fix

## Problem
Frontend login was failing with:
```
Preflight response is not successful. Status code: 500
Fetch API cannot load https://strattio-backend.vercel.app/api/auth/login due to access control checks.
```

## Root Cause

The 500 error on OPTIONS (CORS preflight) requests was caused by:

1. **Middleware Order Issue**: CORS middleware was added AFTER routes were registered
   - In FastAPI/Starlette, middleware order matters
   - CORS middleware must be added BEFORE routes to properly intercept OPTIONS requests

2. **App State Initialization**: `app.state.db` was set AFTER routes were registered
   - Dependencies might try to access `app.state.db` during route registration
   - If not set early, could cause AttributeError

3. **Dependency Resolution**: FastAPI resolves dependencies even for OPTIONS requests
   - If `get_db()` fails during OPTIONS, it could cause 500 error
   - Need to ensure `getattr()` is used to safely access app.state

## Fixes Applied

### 1. Moved CORS Middleware Before Routes
**File:** `backend/server.py`

**Before:**
```python
# Routes registered first
app.include_router(api_router)

# CORS middleware added after (WRONG ORDER)
app.add_middleware(CORSMiddleware, ...)
```

**After:**
```python
# CORS middleware added FIRST (CORRECT ORDER)
app.add_middleware(CORSMiddleware, ...)

# Routes registered after middleware
app.include_router(api_router)
```

### 2. Set App State Early
**File:** `backend/server.py`

**Before:**
```python
# App created
app = FastAPI(...)

# Routes registered
app.include_router(api_router)

# App state set at the end (TOO LATE)
app.state.db = db
```

**After:**
```python
# App created
app = FastAPI(...)

# App state set IMMEDIATELY (BEFORE routes)
app.state.db = db
app.state.logger = logger

# Routes registered after
app.include_router(api_router)
```

### 3. Safe Attribute Access in Dependencies
**File:** `backend/utils/dependencies.py`

**Before:**
```python
def get_db(request: Request):
    db = request.app.state.db  # Could raise AttributeError
    if db is None:
        raise HTTPException(...)
    return db
```

**After:**
```python
def get_db(request: Request):
    db = getattr(request.app.state, 'db', None)  # Safe access
    if db is None:
        raise HTTPException(...)
    return db
```

## Why This Matters

### Middleware Order in FastAPI/Starlette

FastAPI processes requests through middleware in **reverse order** of registration:

```
Request → Middleware 3 → Middleware 2 → Middleware 1 → Route Handler
Response ← Middleware 3 ← Middleware 2 ← Middleware 1 ← Route Handler
```

For CORS to work correctly:
- CORS middleware must be the **last** middleware added (so it's the **first** to process requests)
- This allows it to intercept OPTIONS requests before they reach route handlers
- If routes are registered first, OPTIONS might try to resolve dependencies, causing errors

### OPTIONS Request Flow

**Correct Flow (After Fix):**
```
1. OPTIONS request arrives
2. CORS middleware intercepts it
3. Returns 200 with CORS headers
4. Request never reaches route handler
5. No dependencies resolved
```

**Incorrect Flow (Before Fix):**
```
1. OPTIONS request arrives
2. Routes try to handle it (CORS middleware not in path)
3. Dependencies get resolved (get_db() called)
4. Error occurs → 500 response
5. Browser blocks the actual POST request
```

## Testing

After deploying, test with:

```bash
# Test OPTIONS preflight
curl -X OPTIONS https://strattio-backend.vercel.app/api/auth/login \
  -H "Origin: https://strattio.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Should return 200 with CORS headers, not 500
```

## Key Takeaways

1. ✅ **Always add CORS middleware BEFORE registering routes**
2. ✅ **Set app.state early, before routes are registered**
3. ✅ **Use `getattr()` for safe attribute access in dependencies**
4. ✅ **Middleware order matters in FastAPI - last added = first executed**

## Files Changed

1. `backend/server.py` - Fixed middleware order and app.state initialization
2. `backend/utils/dependencies.py` - Added safe attribute access

---

**The login should now work correctly!** 🎉
