#!/bin/bash

# Vercel Environment Variables Verification Script
# This script helps verify that backend and frontend are configured correctly

set -e

echo "🔍 Vercel Environment Variables Verification"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed${NC}"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

# Check if jq is installed (optional, for JSON parsing)
HAS_JQ=false
if command -v jq &> /dev/null; then
    HAS_JQ=true
fi

echo -e "${YELLOW}📋 Backend Environment Variables (strattio-backend)${NC}"
echo "---------------------------------------------------"

if [ -d "backend" ]; then
    cd backend
    
    # Check CORS_ORIGINS
    echo -n "Checking CORS_ORIGINS... "
    CORS_ORIGINS=$(vercel env ls 2>/dev/null | grep CORS_ORIGINS || echo "")
    if [ -z "$CORS_ORIGINS" ]; then
        echo -e "${RED}❌ NOT SET${NC}"
    else
        echo -e "${GREEN}✓ Found${NC}"
        echo "  Value: $CORS_ORIGINS"
    fi
    
    # Check FRONTEND_URL
    echo -n "Checking FRONTEND_URL... "
    FRONTEND_URL=$(vercel env ls 2>/dev/null | grep FRONTEND_URL || echo "")
    if [ -z "$FRONTEND_URL" ]; then
        echo -e "${RED}❌ NOT SET${NC}"
    else
        echo -e "${GREEN}✓ Found${NC}"
        echo "  Value: $FRONTEND_URL"
    fi
    
    # Check MONGO_URL
    echo -n "Checking MONGO_URL... "
    MONGO_URL=$(vercel env ls 2>/dev/null | grep MONGO_URL || echo "")
    if [ -z "$MONGO_URL" ]; then
        echo -e "${RED}❌ NOT SET${NC}"
    else
        echo -e "${GREEN}✓ Found${NC}"
    fi
    
    # Check JWT_SECRET_KEY
    echo -n "Checking JWT_SECRET_KEY... "
    JWT_SECRET=$(vercel env ls 2>/dev/null | grep JWT_SECRET_KEY || echo "")
    if [ -z "$JWT_SECRET" ]; then
        echo -e "${RED}❌ NOT SET${NC}"
    else
        echo -e "${GREEN}✓ Found${NC}"
    fi
    
    cd ..
else
    echo -e "${RED}❌ Backend directory not found${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Frontend Environment Variables (strattio-frontend)${NC}"
echo "---------------------------------------------------"

if [ -d "frontend" ]; then
    cd frontend
    
    # Check REACT_APP_BACKEND_URL
    echo -n "Checking REACT_APP_BACKEND_URL... "
    BACKEND_URL=$(vercel env ls 2>/dev/null | grep REACT_APP_BACKEND_URL || echo "")
    if [ -z "$BACKEND_URL" ]; then
        echo -e "${RED}❌ NOT SET${NC}"
    else
        echo -e "${GREEN}✓ Found${NC}"
        echo "  Value: $BACKEND_URL"
    fi
    
    cd ..
else
    echo -e "${RED}❌ Frontend directory not found${NC}"
fi

echo ""
echo -e "${YELLOW}🌐 Testing Backend Connection${NC}"
echo "---------------------------------------------------"

# Test backend health endpoint
echo -n "Testing backend health endpoint... "
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://strattio-backend.vercel.app/api/health || echo "000")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Backend is healthy (200)${NC}"
    
    if [ "$HAS_JQ" = true ]; then
        echo "  Response:"
        curl -s https://strattio-backend.vercel.app/api/health | jq . 2>/dev/null || echo "  (Could not parse JSON)"
    fi
else
    echo -e "${RED}❌ Backend health check failed (HTTP $HEALTH_RESPONSE)${NC}"
fi

echo ""
echo -e "${YELLOW}🔒 Testing CORS Configuration${NC}"
echo "---------------------------------------------------"

# Test CORS preflight
echo -n "Testing CORS preflight... "
CORS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
    -H "Origin: https://strattio.com" \
    -H "Access-Control-Request-Method: POST" \
    https://strattio-backend.vercel.app/api/auth/login || echo "000")

if [ "$CORS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ CORS preflight successful (200)${NC}"
    
    # Check CORS headers
    echo "  CORS Headers:"
    curl -s -X OPTIONS \
        -H "Origin: https://strattio.com" \
        -H "Access-Control-Request-Method: POST" \
        https://strattio-backend.vercel.app/api/auth/login \
        -I 2>/dev/null | grep -i "access-control" || echo "    (No CORS headers found)"
else
    echo -e "${RED}❌ CORS preflight failed (HTTP $CORS_RESPONSE)${NC}"
    echo "  This usually means CORS_ORIGINS doesn't include your frontend URL"
fi

echo ""
echo -e "${YELLOW}✅ Verification Summary${NC}"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. If any variables are missing, set them with:"
echo "   cd backend && vercel env add VARIABLE_NAME production"
echo "   cd frontend && vercel env add VARIABLE_NAME production"
echo ""
echo "2. After setting variables, redeploy:"
echo "   cd backend && vercel --prod"
echo "   cd frontend && vercel --prod"
echo ""
echo "3. Verify CORS_ORIGINS includes your frontend URL:"
echo "   - Production: https://strattio.com (or your domain)"
echo "   - Vercel: https://strattio-frontend.vercel.app"
echo "   - Local: http://localhost:3000"
echo ""
echo "4. Verify REACT_APP_BACKEND_URL points to:"
echo "   - Production: https://strattio-backend.vercel.app"
echo ""
