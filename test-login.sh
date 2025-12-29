#!/bin/bash

# Test Login Endpoint Script
# Usage: ./test-login.sh <email> <password>

if [ $# -lt 2 ]; then
    echo "Usage: $0 <email> <password>"
    echo "Example: $0 pinakidebapu@gmail.com 'GreatBD\"1971*'"
    exit 1
fi

EMAIL="$1"
PASSWORD="$2"
BACKEND_URL="https://strattio-backend.vercel.app"

echo "Testing login endpoint..."
echo "Email: $EMAIL"
echo "Backend: $BACKEND_URL"
echo ""

# Create JSON payload using jq to properly escape special characters
if command -v jq &> /dev/null; then
    JSON_PAYLOAD=$(jq -n --arg email "$EMAIL" --arg password "$PASSWORD" '{email: $email, password: $password}')
else
    # Fallback: manually escape JSON (basic escaping)
    ESCAPED_EMAIL=$(echo "$EMAIL" | sed 's/"/\\"/g')
    ESCAPED_PASSWORD=$(echo "$PASSWORD" | sed 's/"/\\"/g' | sed 's/\\/\\\\/g')
    JSON_PAYLOAD="{\"email\":\"$ESCAPED_EMAIL\",\"password\":\"$ESCAPED_PASSWORD\"}"
fi

# Test the login endpoint
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -H "Origin: https://strattio.com" \
    -d "$JSON_PAYLOAD")

# Extract HTTP code and body
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

echo "Response:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Login successful!"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ Invalid credentials (user doesn't exist or wrong password)"
elif [ "$HTTP_CODE" = "400" ]; then
    echo "❌ Bad request (check email/password format)"
else
    echo "❌ Unexpected response"
fi
