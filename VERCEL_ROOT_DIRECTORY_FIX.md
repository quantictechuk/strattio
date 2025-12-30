# Vercel Root Directory Configuration Fix

## Problem
Frontend deployment fails with:
```
npm error path /vercel/path1/package.json
npm error errno -2
npm error enoent Could not read package.json
```

This means Vercel is not looking in the `frontend/` directory.

## Solution

### Option 1: Set Root Directory in Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your **strattio-frontend** project
3. Go to **Settings** → **General**
4. Scroll down to **Root Directory**
5. Set Root Directory to: `frontend` (NOT empty, NOT "frontend/frontend")
6. Click **Save**
7. Go to **Deployments** tab
8. Click **Redeploy** on the latest deployment

### Option 2: Verify Project Configuration

Make sure:
- **Framework Preset**: Create React App
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (or leave default)
- **Output Directory**: `build`
- **Install Command**: `npm install --legacy-peer-deps`

### Option 3: Check Git Integration

1. Go to **Settings** → **Git**
2. Make sure:
   - Repository is connected: `quantictechuk/strattio`
   - Production Branch: `main`
   - Root Directory: `frontend` (if available here)

## Important Notes

- **Root Directory MUST be `frontend`** (not empty) when deploying from repository root
- If Root Directory is empty, Vercel looks in the repo root (where there's no package.json)
- If Root Directory is `frontend/frontend`, Vercel looks in wrong place
- The `frontend/vercel.json` file handles build settings, but Root Directory tells Vercel WHERE to look

## Verification

After setting Root Directory to `frontend`:
1. Trigger a new deployment
2. Check build logs - should show:
   - `Running "install" command: npm install --legacy-peer-deps`
   - Should find `package.json` in `/vercel/path1/frontend/package.json`
   - Build should succeed
