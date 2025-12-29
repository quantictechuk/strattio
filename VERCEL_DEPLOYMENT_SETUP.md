# Vercel Deployment Setup Guide

## Problem
When pushing to git, Vercel tries to build from the root directory, but:
- Frontend code is in `frontend/` directory
- Backend code is in `backend/` directory
- This causes "package.json not found" errors

## Solution: Configure Root Directory in Vercel

You need to configure **two separate Vercel projects** (one for frontend, one for backend) with the correct Root Directory settings.

### Step 1: Frontend Project Configuration

1. Go to your **Frontend Vercel project** dashboard
2. Navigate to **Settings** → **General**
3. Scroll down to **Root Directory**
4. Set Root Directory to: `frontend`
5. Click **Save**

**Build Settings should be:**
- Framework Preset: Create React App
- Root Directory: `frontend`
- Build Command: `npm run build` (or leave default)
- Output Directory: `build`
- Install Command: `npm install --legacy-peer-deps` (if needed)

### Step 2: Backend Project Configuration

1. Go to your **Backend Vercel project** dashboard
2. Navigate to **Settings** → **General**
3. Scroll down to **Root Directory**
4. Set Root Directory to: `backend`
5. Click **Save**

**Build Settings should be:**
- Framework Preset: Other
- Root Directory: `backend`
- Build Command: (leave empty - Python doesn't need build)
- Output Directory: (leave empty)
- Install Command: `pip install -r requirements.txt`

### Step 3: Git Integration

For each project:

1. Go to **Settings** → **Git**
2. Connect your GitHub repository: `quantictechuk/strattio`
3. Set **Production Branch** to: `main`
4. Enable **Automatic deployments from Git**
5. **IMPORTANT**: Make sure the Root Directory is set correctly (as above)

### Step 4: Verify Configuration

After setting Root Directory:

1. Make a test commit and push to `main`
2. Check Vercel dashboard - you should see:
   - Frontend project building from `frontend/` directory
   - Backend project building from `backend/` directory
3. Both should deploy successfully

## Alternative: Monorepo Configuration (Advanced)

If you want a single Vercel project that handles both frontend and backend, you would need to use Vercel's monorepo features, but this is more complex and not recommended for separate deployments.

## Troubleshooting

### Frontend still fails with "package.json not found"
- Double-check Root Directory is set to `frontend` (not `/frontend` or `./frontend`)
- Make sure the Git repository is connected correctly
- Try redeploying manually after setting Root Directory

### Backend not deploying
- Check that you have a separate Vercel project for backend
- Verify Root Directory is set to `backend`
- Check that `backend/api/index.py` exists (this is the entry point)
- Verify `backend/vercel.json` exists

### Both projects deploying from root
- This means Root Directory is not set or is set incorrectly
- Go to Settings → General → Root Directory for each project
- Set it explicitly to `frontend` or `backend`

## Current Project Structure

```
strattio/
├── frontend/
│   ├── package.json
│   ├── vercel.json
│   └── ...
├── backend/
│   ├── requirements.txt
│   ├── vercel.json
│   ├── api/
│   │   └── index.py
│   └── ...
└── ...
```

## Quick Checklist

- [ ] Frontend Vercel project: Root Directory = `frontend`
- [ ] Backend Vercel project: Root Directory = `backend`
- [ ] Both projects connected to `quantictechuk/strattio` GitHub repo
- [ ] Both projects set to deploy from `main` branch
- [ ] Automatic deployments enabled for both projects
