# Backend Deployment Issue - 404 Error

## Problem
Backend is returning 404 NOT_FOUND for all endpoints including `/api/health`.

## Possible Causes

### 1. Root Directory Not Set Correctly

The backend project in Vercel might have the wrong Root Directory setting.

**Check:**
1. Go to https://vercel.com/dashboard
2. Select **strattio-backend** project
3. Go to **Settings** → **General**
4. Check **Root Directory**
5. Should be: `backend` (NOT empty, NOT "backend/backend")

### 2. Backend Deployment Failed

Check if the backend actually deployed successfully:

1. Go to **Deployments** tab
2. Check the latest deployment
3. Look for build errors or runtime errors
4. Check the Function Logs for any errors

### 3. Vercel Function Not Found

The `api/index.py` file might not be in the right location or Vercel can't find it.

**Verify:**
- File exists at: `backend/api/index.py`
- `vercel.json` points to: `api/index.py`
- Root Directory is set to: `backend`

### 4. Python Runtime Issue

The backend might be crashing on startup. Check Function Logs in Vercel dashboard.

## Quick Fix Steps

### Step 1: Verify Root Directory
1. Vercel Dashboard → strattio-backend → Settings → General
2. Root Directory: `backend`
3. Save

### Step 2: Check Deployment Status
1. Go to Deployments tab
2. Check latest deployment status
3. If failed, check build logs

### Step 3: Manual Redeploy
1. Go to Deployments tab
2. Click **Redeploy** on latest deployment
3. Or create new deployment from `main` branch

### Step 4: Check Function Logs
1. Go to **Functions** tab (or check deployment logs)
2. Look for Python errors, import errors, or startup failures
3. Common issues:
   - Missing environment variables
   - Import errors
   - MongoDB connection failures

## Test After Fix

```bash
curl https://strattio-backend.vercel.app/api/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "strattio-api",
  "version": "1.0.0",
  "timestamp": "..."
}
```

## If Still Not Working

Check Vercel Function Logs for specific error messages. Common issues:
- `ModuleNotFoundError` - missing dependencies
- `ImportError` - path issues
- `MongoDB connection failed` - environment variable issue
- `AttributeError` - code error
