# Fix Vercel Project Duplicates

## Problem
Two new duplicate projects were created:
- `frontend` (should be `strattio-frontend`)
- `backend` (should be `strattio-backend`)

## Solution: Clean Up and Re-link

### Step 1: Remove Local .vercel Links

```bash
# Remove any local .vercel directories
cd /Users/pinaki/Desktop/Development/strattio
rm -rf frontend/.vercel
rm -rf backend/.vercel
```

### Step 2: Link to Correct Projects

#### Frontend:
```bash
cd frontend
vercel link
# When prompted:
# - Select existing project: YES
# - Project name: strattio-frontend (NOT "frontend")
# - Root Directory: leave EMPTY (not "frontend")
```

#### Backend:
```bash
cd backend
vercel link
# When prompted:
# - Select existing project: YES
# - Project name: strattio-backend (NOT "backend")
# - Root Directory: leave EMPTY (not "backend")
```

### Step 3: Delete Duplicate Projects in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Find the duplicate projects:
   - `frontend` (delete this one)
   - `backend` (delete this one)
3. For each duplicate:
   - Click on the project
   - Go to **Settings** → **General**
   - Scroll to bottom
   - Click **Delete Project**
   - Confirm deletion

### Step 4: Verify Correct Projects Are Linked

#### Frontend:
```bash
cd frontend
cat .vercel/project.json
# Should show: "projectName": "strattio-frontend"
```

#### Backend:
```bash
cd backend
cat .vercel/project.json
# Should show: "projectName": "strattio-backend"
```

### Step 5: Verify Root Directory Settings

In Vercel Dashboard for each project:

**strattio-frontend:**
- Settings → General → Root Directory: **EMPTY** (not "frontend")

**strattio-backend:**
- Settings → General → Root Directory: **EMPTY** (not "backend")

### Step 6: Test Deployment

After fixing, test deployments:

```bash
# Frontend
cd frontend
vercel --prod

# Backend
cd backend
vercel --prod
```

## Important Notes

- **Root Directory** should be **EMPTY** for both projects since we're deploying from their respective directories
- The duplicate projects (`frontend` and `backend`) can be safely deleted
- Make sure Git integration is connected to the correct projects (`strattio-frontend` and `strattio-backend`)
