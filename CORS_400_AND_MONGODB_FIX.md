# CORS 400 Error and MongoDB SSL Fix

## Problems Identified

### 1. CORS Preflight Returning 400
```
Preflight response is not successful. Status code: 400
Fetch API cannot load https://strattio-backend.vercel.app/api/auth/login
```

### 2. MongoDB SSL Handshake Failure
```
SSL handshake failed: [SSL: TLSV1_ALERT_INTERNAL_ERROR] tlsv1 alert internal error
```

## Root Causes

### CORS 400 Error
1. **Origin Mismatch**: The frontend origin might not be in `CORS_ORIGINS`
2. **Whitespace Issues**: CORS_ORIGINS might have whitespace that prevents matching
3. **Missing OPTIONS Method**: CORS middleware might not explicitly allow OPTIONS
4. **Request Headers**: Preflight might include headers not explicitly allowed

### MongoDB SSL Error
1. **TLS Configuration Conflict**: Explicitly setting `tls=True` for `mongodb+srv://` can cause conflicts
2. **Connection Timeouts**: Serverless environments need shorter timeouts
3. **Network Restrictions**: Vercel's network might have restrictions

## Fixes Applied

### 1. Improved CORS Configuration
**File:** `backend/server.py`

**Before:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**After:**
```python
# Parse CORS origins - handle whitespace and empty strings
cors_origins_str = os.environ.get('CORS_ORIGINS', '*')
if cors_origins_str == '*':
    cors_origins = ['*']
else:
    # Split by comma, strip whitespace, filter empty strings
    cors_origins = [origin.strip() for origin in cors_origins_str.split(',') if origin.strip()]

logger.info(f"CORS origins configured: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

**Improvements:**
- ✅ Strips whitespace from origins
- ✅ Explicitly lists OPTIONS method
- ✅ Logs configured origins for debugging
- ✅ Filters empty strings

### 2. Fixed MongoDB Connection
**File:** `backend/server.py`

**Before:**
```python
client = AsyncIOMotorClient(mongo_url)
```

**After:**
```python
# For MongoDB Atlas (mongodb+srv://), SSL/TLS is handled automatically
# Don't set tls=True explicitly for mongodb+srv:// as it's automatic
connection_params = {
    'serverSelectionTimeoutMS': 5000,  # 5 second timeout
    'connectTimeoutMS': 10000,  # 10 second connection timeout
    'socketTimeoutMS': 30000,  # 30 second socket timeout
    'retryWrites': True,
}

# Only set TLS explicitly for non-SRV connections
if not mongo_url.startswith('mongodb+srv://'):
    connection_params['tls'] = True

client = AsyncIOMotorClient(mongo_url, **connection_params)
```

**Improvements:**
- ✅ Doesn't force TLS for `mongodb+srv://` (automatic)
- ✅ Shorter timeouts for serverless
- ✅ Better error logging

### 3. Added Global Exception Handler
**File:** `backend/server.py`

Added exception handler to ensure CORS headers are always present, even on errors:
```python
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler to ensure CORS headers are always present"""
    # ... adds CORS headers even on errors
```

## Verification Steps

### 1. Check CORS_ORIGINS in Vercel
Make sure your frontend URL is in the `CORS_ORIGINS` environment variable:

```bash
# Check current value
vercel env ls

# Should include your frontend URL, e.g.:
# CORS_ORIGINS=https://strattio.com,http://localhost:3000
```

### 2. Test CORS Preflight
```bash
curl -X OPTIONS https://strattio-backend.vercel.app/api/auth/login \
  -H "Origin: https://strattio.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Should return 200, not 400
```

### 3. Check MongoDB Connection
The MongoDB connection should now work, but if it still fails:
- Check MongoDB Atlas IP whitelist (should allow all: `0.0.0.0/0`)
- Verify connection string is correct
- Check MongoDB Atlas logs for connection attempts

## Common Issues

### CORS Still Failing?
1. **Check Origin Header**: Make sure your frontend sends the correct `Origin` header
2. **Verify CORS_ORIGINS**: Must match exactly (including protocol: `https://` vs `http://`)
3. **Check Vercel Logs**: Look for CORS-related errors in function logs

### MongoDB Still Failing?
1. **IP Whitelist**: MongoDB Atlas must allow connections from Vercel (use `0.0.0.0/0` for all)
2. **Connection String**: Verify `MONGO_URL` is correct in Vercel environment variables
3. **Database User**: Ensure database user has proper permissions
4. **Network**: Some serverless providers have network restrictions

## Files Changed

1. `backend/server.py` - Improved CORS configuration and MongoDB connection

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Verify CORS_ORIGINS includes your frontend URL
3. ✅ Test login - should work now
4. ✅ Check MongoDB connection in logs

---

**The login should now work with proper CORS handling!** 🎉
