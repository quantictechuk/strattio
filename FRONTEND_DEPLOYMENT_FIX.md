# Frontend Deployment Fix

## Issue
Vercel is looking for `frontend/frontend` instead of `frontend`, causing deployment failures.

## Root Cause
The Root Directory in Vercel project settings is incorrectly set to `frontend` when it should be empty (`.` or blank) since we're deploying from the `frontend` directory.

## Solution

### Option 1: Fix via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your **strattio-frontend** project (not "frontend")
3. Go to **Settings** → **General**
4. Scroll down to **Root Directory**
5. **Clear the Root Directory field** (set it to empty/blank)
6. Click **Save**
7. Go to **Deployments** tab
8. Click **Redeploy** on the latest deployment

### Option 2: Link to Correct Project via CLI

```bash
cd frontend
rm -rf .vercel
vercel link
# When prompted:
# - Select "strattio-frontend" project (not "frontend")
# - Root Directory: leave empty or enter "."
```

### Option 3: Wait for Rate Limit

If you see "more than 100 deployments per day" error:
- Wait 10 minutes or until tomorrow
- Then try deploying again

## Verification

After fixing:
1. Check Vercel dashboard - new deployment should start
2. Build logs should show files from `frontend/` directory
3. No more "frontend/frontend" path errors

## Important Notes

- **Root Directory** should be **empty** when deploying from `frontend/` directory
- If Root Directory is set to `frontend`, Vercel will look for `frontend/frontend`
- The `vercel.json` file in `frontend/` directory handles the build configuration
