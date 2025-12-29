# Double Slash URL Fix

## Problem

Frontend login was failing with:
```
Fetch API cannot load https://strattio-backend.vercel.app//api/auth/login 
due to access control checks.
```

Notice the **double slash** (`//api`) in the URL, which is incorrect.

## Root Cause

The issue was caused by improper URL concatenation:
- If `API_URL` has a trailing slash: `https://strattio-backend.vercel.app/`
- And endpoint starts with slash: `/api/auth/login`
- Concatenation results in: `https://strattio-backend.vercel.app//api/auth/login` ❌

This can happen when:
1. Environment variable `REACT_APP_BACKEND_URL` is set with a trailing slash
2. URL construction doesn't normalize slashes properly
3. Multiple places construct URLs inconsistently

## Fixes Applied

### 1. Added URL Normalization Function
**File:** `frontend/src/lib/api.js`

**Added:**
```javascript
// Normalize API URL - remove trailing slash to prevent double slashes
const getApiUrl = () => {
  const url = process.env.REACT_APP_BACKEND_URL || 'https://strattio-backend.vercel.app';
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};

const API_URL = getApiUrl();

// Helper to build API URLs safely (prevents double slashes)
const buildApiUrl = (endpoint) => {
  // Remove leading slashes from endpoint
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  // Ensure single slash between base URL and endpoint
  return `${API_URL}/${cleanEndpoint}`;
};
```

### 2. Updated URL Construction in `apiRequest`
**Before:**
```javascript
const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
const url = `${API_URL}${normalizedEndpoint}`;
```

**After:**
```javascript
const url = buildApiUrl(endpoint); // Safe URL construction
```

### 3. Updated Token Refresh URL
**Before:**
```javascript
const response = await fetch(`${API_URL}/api/auth/refresh`, {
```

**After:**
```javascript
const response = await fetch(buildApiUrl('api/auth/refresh'), {
```

## How It Works

The `buildApiUrl()` helper function:
1. ✅ Removes trailing slashes from `API_URL`
2. ✅ Removes leading slashes from `endpoint`
3. ✅ Joins them with a single `/`
4. ✅ Handles edge cases (multiple slashes, no slashes, etc.)

**Examples:**
```javascript
API_URL = 'https://strattio-backend.vercel.app'
endpoint = '/api/auth/login'
→ buildApiUrl(endpoint) = 'https://strattio-backend.vercel.app/api/auth/login' ✅

API_URL = 'https://strattio-backend.vercel.app/'
endpoint = '/api/auth/login'
→ buildApiUrl(endpoint) = 'https://strattio-backend.vercel.app/api/auth/login' ✅

API_URL = 'https://strattio-backend.vercel.app'
endpoint = 'api/auth/login'
→ buildApiUrl(endpoint) = 'https://strattio-backend.vercel.app/api/auth/login' ✅
```

## Testing

After deploying, verify URLs are correct:

1. **Check browser console** - No double slashes in network requests
2. **Test login** - Should work without CORS errors
3. **Check Network tab** - All API calls should have correct URLs

## Files Changed

1. `frontend/src/lib/api.js` - Added URL normalization and `buildApiUrl()` helper

## Best Practices

✅ **DO:**
- Use a helper function to build URLs
- Normalize base URLs (remove trailing slashes)
- Normalize endpoints (remove leading slashes)
- Use consistent URL construction throughout the app

❌ **DON'T:**
- Concatenate URLs directly: `${API_URL}${endpoint}`
- Assume API_URL format (with/without trailing slash)
- Assume endpoint format (with/without leading slash)

---

**The login should now work with correct URLs!** 🎉
