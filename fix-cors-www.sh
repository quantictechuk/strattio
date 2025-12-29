#!/bin/bash

# Fix CORS to include www.strattio.com
# The frontend is sending Origin: https://www.strattio.com but CORS_ORIGINS only has https://strattio.com

echo "🔧 Fixing CORS_ORIGINS to include www.strattio.com"
echo ""

cd backend

echo "Current CORS_ORIGINS:"
vercel env ls | grep CORS_ORIGINS

echo ""
echo "Setting CORS_ORIGINS to include both www and non-www versions..."
echo ""

# Set for production
echo "Setting for Production..."
echo "https://strattio-frontend.vercel.app,https://strattio.com,https://www.strattio.com,http://localhost:3000" | vercel env add CORS_ORIGINS production

# Set for preview
echo "Setting for Preview..."
echo "https://strattio-frontend.vercel.app,https://strattio.com,https://www.strattio.com,http://localhost:3000" | vercel env add CORS_ORIGINS preview

# Set for development
echo "Setting for Development..."
echo "https://strattio-frontend.vercel.app,https://strattio.com,https://www.strattio.com,http://localhost:3000" | vercel env add CORS_ORIGINS development

echo ""
echo "✅ CORS_ORIGINS updated!"
echo ""
echo "⚠️  IMPORTANT: You must redeploy the backend for changes to take effect:"
echo "   cd backend && vercel --prod"
echo ""
