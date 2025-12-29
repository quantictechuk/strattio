# WWW CORS Issue Fix

## Problem Identified

The frontend is sending requests with `Origin: https://www.strattio.com` (with `www.`), but the backend's `CORS_ORIGINS` only includes `https://strattio.com` (without `www.`).

**CORS requires an exact match**, so the preflight request fails with 400.

## Root Cause

- Frontend URL: `https://www.strattio.com` (with `www.`)
- CORS_ORIGINS: `https://strattio.com` (without `www.`)
- Result: ❌ CORS preflight fails (400 error)

## Solution

Add `https://www.strattio.com` to `CORS_ORIGINS`:

```
CORS_ORIGINS=https://strattio-frontend.vercel.app,https://strattio.com,https://www.strattio.com,http://localhost:3000
```

## Steps to Fix

### Option 1: Use the Script (Recommended)

```bash
./fix-cors-www.sh
```

### Option 2: Manual Update

```bash
cd backend

# Update for all environments
echo "https://strattio-frontend.vercel.app,https://strattio.com,https://www.strattio.com,http://localhost:3000" | vercel env add CORS_ORIGINS production

echo "https://strattio-frontend.vercel.app,https://strattio.com,https://www.strattio.com,http://localhost:3000" | vercel env add CORS_ORIGINS preview

echo "https://strattio-frontend.vercel.app,https://strattio.com,https://www.strattio.com,http://localhost:3000" | vercel env add CORS_ORIGINS development
```

### Option 3: Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select **strattio-backend** project
3. Go to **Settings** → **Environment Variables**
4. Find `CORS_ORIGINS`
5. Update value to: `https://strattio-frontend.vercel.app,https://strattio.com,https://www.strattio.com,http://localhost:3000`
6. Make sure it's set for Production, Preview, and Development

## ⚠️ IMPORTANT: Redeploy Backend

After updating the environment variable, you **must redeploy** for changes to take effect:

```bash
cd backend
vercel --prod
```

Or trigger redeploy from Vercel dashboard:
1. Go to **Deployments**
2. Click **⋯** on latest deployment
3. Click **Redeploy**

## Verification

After redeploying, test the CORS preflight:

```bash
curl -X OPTIONS https://strattio-backend.vercel.app/api/auth/login \
  -H "Origin: https://www.strattio.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should return **200 OK** with CORS headers.

## Why This Happens

When you access your site via:
- `https://strattio.com` → Origin header is `https://strattio.com`
- `https://www.strattio.com` → Origin header is `https://www.strattio.com`

These are **different origins** from CORS perspective, so both must be in `CORS_ORIGINS`.

## Best Practice

Include both www and non-www versions in CORS_ORIGINS:
```
https://strattio.com,https://www.strattio.com
```

Or set up a redirect so all traffic goes to one version (www or non-www).

---

**After fixing and redeploying, login should work!** 🎉
