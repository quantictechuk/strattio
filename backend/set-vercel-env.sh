#!/bin/bash
# Script to set all environment variables in Vercel

echo "Setting environment variables for strattio-backend..."
echo ""

cd "$(dirname "$0")"

# Read .env file and set variables
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  
  # Remove quotes from value if present
  value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/')
  
  echo "Setting $key..."
  echo "$value" | vercel env add "$key" production
  echo "$value" | vercel env add "$key" preview
  echo "$value" | vercel env add "$key" development
  echo ""
done < .env

echo "Done! All environment variables have been set."
echo ""
echo "Important: Update these for production:"
echo "  - CORS_ORIGINS: Add your frontend URL"
echo "  - GOOGLE_REDIRECT_URI: Update to production frontend URL"
echo "  - FRONTEND_URL: Update to production frontend URL"
echo ""
echo "After updating, redeploy: vercel --prod"
