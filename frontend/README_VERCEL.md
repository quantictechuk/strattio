# Deploying Strattio Frontend to Vercel

This guide explains how to deploy the Strattio frontend to Vercel.

## Prerequisites

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

## Deployment Steps

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Initialize Vercel Project
```bash
vercel
```

When prompted:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- Project name: **strattio-frontend**
- Directory: **./** (current directory)
- Override settings? **No**

### 3. Set Environment Variables

You need to set the backend URL:

```bash
vercel env add REACT_APP_BACKEND_URL production
```

When prompted, enter:
```
https://strattio-backend.vercel.app
```

**Important**: Set this for all environments (Production, Preview, Development).

### 4. Deploy to Production

```bash
vercel --prod
```

## Environment Variables

### Required:
- `REACT_APP_BACKEND_URL` - Backend API URL
  - Production: `https://strattio-backend.vercel.app`
  - Development: `http://localhost:8000`

## Project Structure

- `vercel.json` - Vercel configuration
- `package.json` - Dependencies and build scripts
- `build/` - Production build output (generated)

## Build Configuration

The frontend uses:
- **Framework**: Create React App (CRA) with CRACO
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Node Version**: Auto-detected (should be 18+)

## Routing

All routes are configured to serve `index.html` for client-side routing (React Router).

## Post-Deployment

After deployment, your frontend will be available at:
- `https://strattio-frontend.vercel.app`
- Or your custom domain if configured

### Update Backend CORS

Make sure your backend's `CORS_ORIGINS` environment variable includes your frontend URL:
```
CORS_ORIGINS=https://strattio-frontend.vercel.app,https://strattio.com,http://localhost:3000
```

### Update Google OAuth

Update your Google OAuth redirect URI in:
1. Google Cloud Console
2. Backend environment variable `GOOGLE_REDIRECT_URI`

To:
```
https://strattio-frontend.vercel.app/auth/google/callback
```

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for TypeScript/ESLint errors

### API Connection Issues
- Verify `REACT_APP_BACKEND_URL` is set correctly
- Check backend CORS settings include frontend URL
- Verify backend is deployed and accessible

### Routing Issues
- Ensure `vercel.json` has the rewrite rule for `/(.*)` → `/index.html`
- Check that React Router is configured correctly

## Updating Environment Variables

To update environment variables:

```bash
vercel env add REACT_APP_BACKEND_URL production
```

Or use the Vercel dashboard: https://vercel.com/dashboard

## Monitoring

- View logs: `vercel logs`
- Inspect deployment: `vercel inspect`
- View in dashboard: https://vercel.com/dashboard
