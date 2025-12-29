./verify-vercel-env.sh# Vercel Environment Variables Verification Guide

This document helps you verify that both backend and frontend are correctly configured to communicate with each other.

## 🔍 Quick Verification Checklist

### Backend Environment Variables (strattio-backend)

**Required for Backend ↔ Frontend Communication:**

| Variable | Expected Value | Purpose |
|----------|---------------|---------|
| `CORS_ORIGINS` | `https://strattio.com,https://strattio-frontend.vercel.app,http://localhost:3000` | Allows frontend to make API calls |
| `FRONTEND_URL` | `https://strattio.com` | Used for redirects and OAuth callbacks |

**Other Required Variables:**

| Variable | Purpose |
|----------|---------|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |
| `JWT_SECRET_KEY` | JWT token signing |
| `OPENAI_API_KEY` | AI content generation |
| `STRIPE_API_KEY` | Payment processing |
| `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Email sending |
| `SUPPORT_EMAIL` | Support email address |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |

### Frontend Environment Variables (strattio-frontend)

**Required for Frontend ↔ Backend Communication:**

| Variable | Expected Value | Purpose |
|----------|---------------|---------|
| `REACT_APP_BACKEND_URL` | `https://strattio-backend.vercel.app` | Backend API endpoint |

## 🔗 Critical Connection Points

### 1. CORS Configuration (Backend → Frontend)

**Backend `CORS_ORIGINS` must include:**
- ✅ Your production frontend URL: `https://strattio.com` (or your domain)
- ✅ Your Vercel frontend URL: `https://strattio-frontend.vercel.app`
- ✅ Local development: `http://localhost:3000`

**Example:**
```
CORS_ORIGINS=https://strattio.com,https://strattio-frontend.vercel.app,http://localhost:3000
```

**⚠️ Important:**
- No trailing slashes
- Must match exactly (including `https://` vs `http://`)
- Case-sensitive
- Comma-separated, no spaces (or spaces will be stripped by our code)

### 2. Backend URL (Frontend → Backend)

**Frontend `REACT_APP_BACKEND_URL` must be:**
- ✅ `https://strattio-backend.vercel.app` (production)
- ✅ `http://localhost:8000` (local development)

**⚠️ Important:**
- No trailing slash (our code handles this)
- Must be accessible from frontend's origin

### 3. OAuth Redirect URI (Backend → Frontend)

**Backend `GOOGLE_REDIRECT_URI` must match:**
- ✅ Your frontend URL + `/auth/google/callback`
- ✅ Example: `https://strattio.com/auth/google/callback`

**Also update in Google Cloud Console:**
- Go to Google Cloud Console → APIs & Services → Credentials
- Update authorized redirect URIs to match

## 📋 Step-by-Step Verification

### Step 1: Check Backend Environment Variables

```bash
# Navigate to backend directory
cd backend

# List all environment variables
vercel env ls

# Check specific variable
vercel env pull .env.vercel
cat .env.vercel | grep CORS_ORIGINS
cat .env.vercel | grep FRONTEND_URL
```

**Verify:**
- [ ] `CORS_ORIGINS` includes your frontend URL
- [ ] `FRONTEND_URL` matches your production frontend URL
- [ ] All other required variables are set

### Step 2: Check Frontend Environment Variables

```bash
# Navigate to frontend directory
cd frontend

# List all environment variables
vercel env ls

# Check specific variable
vercel env pull .env.vercel
cat .env.vercel | grep REACT_APP_BACKEND_URL
```

**Verify:**
- [ ] `REACT_APP_BACKEND_URL` is set to `https://strattio-backend.vercel.app`
- [ ] Variable is set for Production, Preview, and Development environments

### Step 3: Test the Connection

**Test Backend Health:**
```bash
curl https://strattio-backend.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "strattio-api",
  "version": "1.0.0",
  "timestamp": "..."
}
```

**Test CORS Preflight:**
```bash
curl -X OPTIONS https://strattio-backend.vercel.app/api/auth/login \
  -H "Origin: https://strattio.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Expected:**
- Status: `200 OK`
- Headers include: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`

## 🛠️ Setting/Updating Environment Variables

### Backend (strattio-backend)

**Via CLI:**
```bash
cd backend

# Set CORS_ORIGINS (replace with your actual frontend URL)
vercel env add CORS_ORIGINS production
# Enter: https://strattio.com,https://strattio-frontend.vercel.app,http://localhost:3000

# Set FRONTEND_URL
vercel env add FRONTEND_URL production
# Enter: https://strattio.com

# Repeat for preview and development environments
vercel env add CORS_ORIGINS preview
vercel env add CORS_ORIGINS development
```

**Via Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select **strattio-backend** project
3. Go to **Settings** → **Environment Variables**
4. Add/update variables
5. Select environments: Production, Preview, Development

### Frontend (strattio-frontend)

**Via CLI:**
```bash
cd frontend

# Set backend URL
vercel env add REACT_APP_BACKEND_URL production
# Enter: https://strattio-backend.vercel.app

# Repeat for preview and development
vercel env add REACT_APP_BACKEND_URL preview
vercel env add REACT_APP_BACKEND_URL development
# For development, you might want: http://localhost:8000
```

**Via Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select **strattio-frontend** project
3. Go to **Settings** → **Environment Variables**
4. Add `REACT_APP_BACKEND_URL`
5. Set value: `https://strattio-backend.vercel.app`
6. Select all environments

## 🔄 After Updating Environment Variables

**Important:** Environment variables require a redeploy to take effect!

```bash
# Backend
cd backend
vercel --prod

# Frontend
cd frontend
vercel --prod
```

Or trigger redeploy from Vercel dashboard:
1. Go to project → **Deployments**
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**

## 🐛 Common Issues

### Issue: CORS 400 Error

**Symptoms:**
- Preflight request returns 400
- Browser console shows CORS error

**Solution:**
1. Check `CORS_ORIGINS` includes your frontend URL exactly
2. Verify no trailing slashes
3. Check origin header in browser Network tab
4. Redeploy backend after changes

### Issue: Frontend Can't Connect to Backend

**Symptoms:**
- Network error in console
- "Unable to connect to server" message

**Solution:**
1. Verify `REACT_APP_BACKEND_URL` is set correctly
2. Check backend is deployed and accessible
3. Test backend health endpoint directly
4. Redeploy frontend after changes

### Issue: OAuth Redirect Not Working

**Symptoms:**
- Google OAuth redirects to wrong URL
- Redirect URI mismatch error

**Solution:**
1. Check `GOOGLE_REDIRECT_URI` in backend matches frontend URL
2. Update Google Cloud Console authorized redirect URIs
3. Ensure `FRONTEND_URL` is set correctly

## 📊 Verification Script

Run this script to verify all environment variables:

```bash
#!/bin/bash

echo "=== Backend Environment Variables ==="
cd backend
vercel env ls

echo ""
echo "=== Frontend Environment Variables ==="
cd ../frontend
vercel env ls

echo ""
echo "=== Testing Backend Health ==="
curl -s https://strattio-backend.vercel.app/api/health | jq .

echo ""
echo "=== Testing CORS ==="
curl -s -X OPTIONS https://strattio-backend.vercel.app/api/auth/login \
  -H "Origin: https://strattio.com" \
  -H "Access-Control-Request-Method: POST" \
  -I | grep -i "access-control"
```

## ✅ Final Checklist

Before considering setup complete:

- [ ] Backend `CORS_ORIGINS` includes frontend URL
- [ ] Backend `FRONTEND_URL` matches production frontend URL
- [ ] Frontend `REACT_APP_BACKEND_URL` points to backend
- [ ] All variables set for Production, Preview, and Development
- [ ] Backend health endpoint returns 200
- [ ] CORS preflight returns 200
- [ ] Both projects redeployed after env changes
- [ ] Login works from frontend
- [ ] OAuth redirect works (if using)

---

**Need Help?** Check Vercel logs:
```bash
# Backend logs
cd backend && vercel logs

# Frontend logs  
cd frontend && vercel logs
```
