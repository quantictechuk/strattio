# Check Vercel Git Integration

## Problem
Auto-deployment is not triggering when pushing to Git.

## Steps to Verify and Fix

### 1. Check Git Integration

1. Go to https://vercel.com/dashboard
2. Select **strattio-frontend** project
3. Go to **Settings** → **Git**
4. Verify:
   - **Repository**: Should show `quantictechuk/strattio`
   - **Production Branch**: Should be `main`
   - **Auto-deployments**: Should be **ENABLED**
   - **Root Directory**: Should be `frontend` (if shown here)

### 2. If Git Integration is Missing

If you don't see a connected repository:

1. Click **Connect Git Repository**
2. Select **GitHub**
3. Find and select `quantictechuk/strattio`
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Production Branch**: `main`
5. Click **Deploy**

### 3. Verify Root Directory (Again)

1. Go to **Settings** → **General**
2. Scroll to **Root Directory**
3. Make sure it says: `frontend` (exactly, no trailing slash)
4. Click **Save** if you made changes

### 4. Check Recent Deployments

1. Go to **Deployments** tab
2. Check if there's a deployment for commit `e8ebcc7`
3. If not, the Git webhook might not be working

### 5. Manual Trigger (If Needed)

If auto-deploy still doesn't work:

1. Go to **Deployments** tab
2. Click **Create Deployment**
3. Select:
   - **Branch**: `main`
   - **Root Directory**: `frontend`
4. Click **Deploy**

### 6. Check Webhook (Advanced)

If still not working, the GitHub webhook might be missing:

1. Go to your GitHub repo: https://github.com/quantictechuk/strattio
2. Go to **Settings** → **Webhooks**
3. Look for a Vercel webhook
4. If missing, Vercel should create it automatically when you connect Git

## Quick Test

After verifying settings, make another small change:

```bash
# This will trigger a new commit
echo "// Auto-deploy test" >> frontend/src/App.js
git add frontend/src/App.js
git commit -m "Test: Auto-deploy trigger"
git push origin main
```

Then check Vercel dashboard - should see new deployment within 1-2 minutes.
