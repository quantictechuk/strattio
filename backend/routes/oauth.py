"""Google OAuth routes"""

from fastapi import APIRouter, HTTPException, Depends, Header, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import logging
import os
from urllib.parse import urlencode
import httpx
from bson import ObjectId

from utils.auth import create_access_token, create_refresh_token
from utils.serializers import serialize_doc, to_object_id
from utils.audit_logger import AuditLogger
from utils.dependencies import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/google/callback")

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

@router.get("/google")
async def google_oauth_start():
    """Initiate Google OAuth flow"""
    
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables."
        )
    
    # Build authorization URL
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    
    auth_url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    
    return RedirectResponse(url=auth_url)

@router.get("/google/callback")
async def google_oauth_callback(
    code: Optional[str] = Query(None),
    error: Optional[str] = Query(None)
):
    """Handle Google OAuth callback"""
    
    if error:
        logger.error(f"Google OAuth error: {error}")
        # Redirect to frontend with error
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(url=f"{frontend_url}/login?error=oauth_failed")
    
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")
    
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth not configured"
        )
    
    try:
        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": GOOGLE_REDIRECT_URI
                }
            )
            
            if token_response.status_code != 200:
                logger.error(f"Token exchange failed: {token_response.text}")
                raise HTTPException(status_code=400, detail="Failed to exchange authorization code")
            
            token_data = token_response.json()
            access_token_google = token_data.get("access_token")
            
            if not access_token_google:
                raise HTTPException(status_code=400, detail="No access token received")
            
            # Get user info from Google
            user_info_response = await client.get(
                GOOGLE_USER_INFO_URL,
                headers={"Authorization": f"Bearer {access_token_google}"}
            )
            
            if user_info_response.status_code != 200:
                logger.error(f"User info fetch failed: {user_info_response.text}")
                raise HTTPException(status_code=400, detail="Failed to fetch user information")
            
            user_info = user_info_response.json()
            google_id = user_info.get("id")
            email = user_info.get("email")
            name = user_info.get("name", "")
            picture = user_info.get("picture")
            
            if not email:
                raise HTTPException(status_code=400, detail="Email not provided by Google")
            
            # Check if user exists
            user = await db.users.find_one({"email": email})
            
            if user:
                # Existing user - check if Google auth is linked
                if user.get("auth_provider") != "google" or user.get("auth_provider_id") != google_id:
                    # Link Google account
                    await db.users.update_one(
                        {"_id": user["_id"]},
                        {"$set": {
                            "auth_provider": "google",
                            "auth_provider_id": google_id,
                            "avatar_url": picture,
                            "updated_at": datetime.utcnow()
                        }}
                    )
                
                user_id = str(user["_id"])
            else:
                # New user - create account
                user_doc = {
                    "email": email,
                    "name": name,
                    "avatar_url": picture,
                    "auth_provider": "google",
                    "auth_provider_id": google_id,
                    "role": "user",
                    "subscription_tier": "free",
                    "email_verified": True,  # Google emails are verified
                    "created_at": datetime.utcnow(),
                    "last_login_at": datetime.utcnow()
                }
                
                result = await db.users.insert_one(user_doc)
                user_doc["_id"] = result.inserted_id
                user_id = str(result.inserted_id)
                
                # Create initial subscription
                await db.subscriptions.insert_one({
                    "user_id": user_id,
                    "tier": "free",
                    "status": "active",
                    "plans_created_this_month": 0,
                    "plan_limit": 1,
                    "created_at": datetime.utcnow()
                })
                
                # Log activity
                await AuditLogger.log_activity(
                    db=db,
                    user_id=user_id,
                    activity_type="user_registered",
                    entity_type="user",
                    entity_id=user_id,
                    details={"email": email, "name": name, "provider": "google"}
                )
            
            # Create JWT tokens
            jwt_access_token = create_access_token({"sub": user_id})
            jwt_refresh_token = create_refresh_token({"sub": user_id})
            
            # Update last login
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"last_login_at": datetime.utcnow()}}
            )
            
            # Log activity
            await AuditLogger.log_activity(
                db=db,
                user_id=user_id,
                activity_type="user_logged_in",
                entity_type="user",
                entity_id=user_id,
                details={"email": email, "provider": "google"}
            )
            
            # Get user data
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            user_clean = serialize_doc(user)
            if "password_hash" in user_clean:
                del user_clean["password_hash"]
            
            # Redirect to frontend with tokens
            frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
            
            # Store tokens in query params (frontend will handle storing them)
            # In production, use secure httpOnly cookies instead
            redirect_url = f"{frontend_url}/?token={jwt_access_token}&refresh={jwt_refresh_token}"
            
            return RedirectResponse(url=redirect_url)
            
    except httpx.HTTPError as e:
        logger.error(f"HTTP error during OAuth: {e}")
        raise HTTPException(status_code=500, detail="OAuth authentication failed")
    except Exception as e:
        logger.error(f"OAuth error: {e}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")
