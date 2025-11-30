"""Authentication routes"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime
import logging

from utils.auth import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from utils.serializers import serialize_doc

router = APIRouter()
logger = logging.getLogger(__name__)

# Get db from app state (injected at runtime)
from server import db

# ============================================================================
# MODELS
# ============================================================================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

# ============================================================================
# ROUTES
# ============================================================================

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_doc = {
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "name": user_data.name,
        "role": "user",
        "subscription_tier": "free",
        "created_at": datetime.utcnow(),
        "email_verified": False
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    # Create tokens
    user_id = str(result.inserted_id)
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})
    
    # Create initial subscription record
    await db.subscriptions.insert_one({
        "user_id": user_id,
        "tier": "free",
        "status": "active",
        "plans_created_this_month": 0,
        "plan_limit": 1,
        "created_at": datetime.utcnow()
    })
    
    user_clean = serialize_doc(user_doc)
    del user_clean["password_hash"]
    
    logger.info(f"New user registered: {user_data.email}")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user_clean
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user"""
    
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create tokens
    user_id = str(user["_id"])
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})
    
    # Update last login
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login_at": datetime.utcnow()}}
    )
    
    user_clean = serialize_doc(user)
    del user_clean["password_hash"]
    
    logger.info(f"User logged in: {credentials.email}")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user_clean
    }

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    access_token = create_access_token({"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me")
async def get_current_user(authorization: str = None):
    """Get current user (placeholder - needs proper auth dependency)"""
    # For MVP: Simple implementation
    # In production: Use proper Depends(get_current_user) dependency
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        scheme, token = authorization.split()
        payload = decode_token(token)
        user_id = payload.get("sub")
        
        user = await db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_clean = serialize_doc(user)
        del user_clean["password_hash"]
        
        return user_clean
        
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
