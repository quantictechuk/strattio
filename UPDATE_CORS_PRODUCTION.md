# Update CORS_ORIGINS for Production

## Issue
Production environment variable already exists. We need to update it to include `https://www.strattio.com`.

## Solution Options

### Option 1: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Select **strattio-backend** project
3. Go to **Settings** → **Environment Variables**
4. Find `CORS_ORIGINS` for **Production**
5. Click **Edit** or **Remove** then **Add**
6. Set value to:
   ```
   https://strattio-frontend.vercel.app,https://strattio.com,https://www.strattio.com,http://localhost:3000
   ```
7. Save

### Option 2: Via CLI (Remove and Re-add)

```bash
cd backend

# Remove existing production variable
vercel env rm CORS_ORIGINS production

# Add new one with www
echo "https://strattio-frontend.vercel.app,https://strattio.com,https://www.strattio.com,http://localhost:3000" | vercel env add CORS_ORIGINS production
```

## ⚠️ CRITICAL: Redeploy After Update

After updating, **you must redeploy**:

```bash
cd backend
vercel --prod
```

Or from dashboard:
1. Go to **Deployments**
2. Click **⋯** on latest deployment  
3. Click **Redeploy**

## Verify

After redeploy, test:

```bash
curl -X OPTIONS https://strattio-backend.vercel.app/api/auth/login \
  -H "Origin: https://www.strattio.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should return **200 OK** with `access-control-allow-origin: https://www.strattio.com`

---

**Status:**
- ✅ Preview: Updated
- ✅ Development: Updated  
- ⚠️ Production: Needs update (use dashboard or CLI)
