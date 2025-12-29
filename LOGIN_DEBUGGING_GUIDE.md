# Login Debugging Guide

## ✅ Backend Status: WORKING

The backend login endpoint is **fully functional**:
- ✅ Endpoint accessible: `https://strattio-backend.vercel.app/api/auth/login`
- ✅ CORS configured correctly
- ✅ Authentication working (tested with `netstich@gmail.com`)
- ✅ Returns proper JWT tokens and user data

## 🔍 Frontend Login Issue

Since the backend works but frontend login fails, the issue is likely:

### Possible Causes:

1. **Frontend URL not in CORS_ORIGINS**
   - Check what URL your frontend is deployed on
   - Verify it's in backend's `CORS_ORIGINS` environment variable

2. **Browser CORS Error**
   - Check browser console for specific CORS errors
   - Look at Network tab → Request Headers → `Origin`
   - Verify the `Origin` header matches what's in `CORS_ORIGINS`

3. **Frontend Environment Variable**
   - Verify `REACT_APP_BACKEND_URL` is set correctly
   - Check if frontend was rebuilt after setting the variable

4. **Network/Connectivity**
   - Check if frontend can reach backend
   - Test from browser console:
     ```javascript
     fetch('https://strattio-backend.vercel.app/api/health')
       .then(r => r.json())
       .then(console.log)
     ```

## 🛠️ Debugging Steps

### Step 1: Check Frontend URL

**In Browser Console:**
```javascript
console.log('Frontend URL:', window.location.origin);
```

**Verify in Backend CORS_ORIGINS:**
```bash
cd backend
vercel env ls | grep CORS_ORIGINS
```

The frontend URL must be **exactly** in the CORS_ORIGINS list.

### Step 2: Test from Browser Console

**Open browser console on your frontend page and run:**
```javascript
// Test backend connection
fetch('https://strattio-backend.vercel.app/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend reachable:', data))
  .catch(err => console.error('❌ Backend unreachable:', err));

// Test login endpoint
fetch('https://strattio-backend.vercel.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': window.location.origin
  },
  body: JSON.stringify({
    email: 'netstich@gmail.com',
    password: 'GreatBD"1971*'
  })
})
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

### Step 3: Check Network Tab

1. Open browser DevTools → Network tab
2. Try to login from frontend
3. Look for the `/api/auth/login` request
4. Check:
   - **Request Headers**: What `Origin` is being sent?
   - **Response Headers**: Are CORS headers present?
   - **Status Code**: What's the HTTP status?
   - **Response**: What's the error message?

### Step 4: Verify Environment Variables

**Frontend:**
```bash
cd frontend
vercel env ls | grep REACT_APP_BACKEND_URL
```

**Backend:**
```bash
cd backend
vercel env ls | grep CORS_ORIGINS
```

## 📋 Common Issues & Solutions

### Issue: CORS 400/403 Error

**Symptom:** Preflight request fails with 400 or 403

**Solution:**
1. Add frontend URL to `CORS_ORIGINS`:
   ```bash
   cd backend
   vercel env add CORS_ORIGINS production
   # Enter: https://your-frontend-url.com,https://strattio-frontend.vercel.app,http://localhost:3000
   ```
2. Redeploy backend:
   ```bash
   vercel --prod
   ```

### Issue: "Unable to connect to server"

**Symptom:** Network error in console

**Solution:**
1. Verify `REACT_APP_BACKEND_URL` is set:
   ```bash
   cd frontend
   vercel env ls
   ```
2. Rebuild frontend (env vars are baked in at build time):
   ```bash
   vercel --prod
   ```

### Issue: Login works in curl but not frontend

**Symptom:** Backend test succeeds, frontend fails

**Solution:**
1. Check browser console for specific error
2. Compare request headers (curl vs browser)
3. Verify CORS_ORIGINS includes browser's origin
4. Check if frontend is making request correctly

## ✅ Verification Checklist

- [ ] Backend health endpoint works: `curl https://strattio-backend.vercel.app/api/health`
- [ ] Backend login works: `./test-login.sh netstich@gmail.com 'GreatBD"1971*'`
- [ ] Frontend URL is in `CORS_ORIGINS`
- [ ] `REACT_APP_BACKEND_URL` is set correctly
- [ ] Frontend was rebuilt after setting env vars
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows proper request/response

## 🎯 Quick Test

**Test login from browser console:**
```javascript
// Replace with your actual frontend URL
const FRONTEND_URL = window.location.origin;
const BACKEND_URL = 'https://strattio-backend.vercel.app';

fetch(`${BACKEND_URL}/api/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': FRONTEND_URL
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'netstich@gmail.com',
    password: 'GreatBD"1971*'
  })
})
  .then(r => r.json())
  .then(data => {
    if (data.access_token) {
      console.log('✅ Login successful!', data);
    } else {
      console.error('❌ Login failed:', data);
    }
  })
  .catch(err => console.error('❌ Error:', err));
```

If this works, the issue is in the frontend code. If it fails, check the error message for clues.

---

**Next Steps:**
1. Run the browser console test above
2. Check Network tab during login attempt
3. Share the specific error message you see
4. Verify frontend URL is in CORS_ORIGINS
