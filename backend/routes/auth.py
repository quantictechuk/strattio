"""Authentication routes"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
import logging
from bson import ObjectId

from utils.auth import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from utils.serializers import serialize_doc, to_object_id
from utils.audit_logger import AuditLogger
from utils.dependencies import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

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
async def register(user_data: UserRegister, db = Depends(get_db)):
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
    
    # Log activity
    await AuditLogger.log_activity(
        db=db,
        user_id=user_id,
        activity_type="user_registered",
        entity_type="user",
        entity_id=user_id,
        details={"email": user_data.email, "name": user_data.name}
    )
    
    logger.info(f"New user registered: {user_data.email}")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user_clean
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db = Depends(get_db)):
    """Login user"""
    
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if user signed up with OAuth (no password_hash)
    if not user.get("password_hash"):
        auth_provider = user.get("auth_provider", "Google")
        raise HTTPException(
            status_code=400,
            detail=f"This account was created using {auth_provider} sign-in. Please use {auth_provider} to sign in instead."
        )
    
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
    
    # Log activity
    await AuditLogger.log_activity(
        db=db,
        user_id=user_id,
        activity_type="user_logged_in",
        entity_type="user",
        entity_id=user_id,
        details={"email": credentials.email}
    )
    
    logger.info(f"User logged in: {credentials.email}")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user_clean
    }

@router.post("/refresh")
async def refresh_token(refresh_token: str, db = Depends(get_db)):
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

async def get_current_user_id(authorization: Optional[str] = Header(None)):
    """Extract user_id from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != 'bearer':
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        return user_id
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

@router.get("/me")
async def get_me(authorization: Optional[str] = Header(None), db = Depends(get_db)):
    """Get current user"""
    
    user_id = await get_current_user_id(authorization)
    
    user = await db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_clean = serialize_doc(user)
    if "password_hash" in user_clean:
        del user_clean["password_hash"]
    
    return user_clean

class UserUpdate(BaseModel):
    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

@router.patch("/me")
async def update_me(
    user_update: UserUpdate,
    authorization: Optional[str] = Header(None),
    db = Depends(get_db)
):
    """Update current user profile"""
    
    user_id = await get_current_user_id(authorization)
    
    user = await db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {"updated_at": datetime.utcnow()}
    
    if user_update.name is not None:
        update_data["name"] = user_update.name
    if user_update.first_name is not None:
        update_data["first_name"] = user_update.first_name
    if user_update.last_name is not None:
        update_data["last_name"] = user_update.last_name
    
    await db.users.update_one(
        {"_id": to_object_id(user_id)},
        {"$set": update_data}
    )
    
    # Return updated user
    updated_user = await db.users.find_one({"_id": to_object_id(user_id)})
    user_clean = serialize_doc(updated_user)
    if "password_hash" in user_clean:
        del user_clean["password_hash"]
    
    logger.info(f"User profile updated: {user_id}")
    
    return user_clean

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.patch("/me/password")
async def change_password(
    password_data: PasswordChange,
    authorization: Optional[str] = Header(None),
    db = Depends(get_db)
):
    """Change user password"""
    
    user_id = await get_current_user_id(authorization)
    
    user = await db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user has a password (not OAuth-only user)
    if not user.get("password_hash"):
        raise HTTPException(
            status_code=400,
            detail="Password change not available for OAuth users"
        )
    
    # Verify current password
    if not verify_password(password_data.current_password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    # Validate new password
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters"
        )
    
    # Update password
    await db.users.update_one(
        {"_id": to_object_id(user_id)},
        {"$set": {
            "password_hash": get_password_hash(password_data.new_password),
            "updated_at": datetime.utcnow()
        }}
    )
    
    logger.info(f"Password changed for user: {user_id}")
    
    return {"message": "Password changed successfully"}

@router.delete("/me")
async def delete_account(
    authorization: Optional[str] = Header(None),
    db = Depends(get_db)
):
    """Delete user account and all associated data"""
    
    user_id = await get_current_user_id(authorization)
    
    user = await db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    logger.info(f"Deleting account and all data for user: {user_id}")
    
    # Delete all user-related data
    # 1. Plans (and their related data will be handled by cascade or separate deletion)
    plans = await db.plans.find({"user_id": user_id}).to_list(None)
    plan_ids = [to_object_id(plan["_id"]) for plan in plans]
    
    if plan_ids:
        # Delete sections
        await db.sections.delete_many({"plan_id": {"$in": plan_ids}})
        # Delete research packs
        await db.research_packs.delete_many({"plan_id": {"$in": plan_ids}})
        # Delete financial models
        await db.financial_models.delete_many({"plan_id": {"$in": plan_ids}})
        # Delete compliance reports
        await db.compliance_reports.delete_many({"plan_id": {"$in": plan_ids}})
        # Delete exports
        await db.exports.delete_many({"plan_id": {"$in": plan_ids}})
        # Delete SWOT analyses
        await db.swot_analyses.delete_many({"plan_id": {"$in": plan_ids}})
        # Delete competitor analyses
        await db.competitor_analyses.delete_many({"plan_id": {"$in": plan_ids}})
        # Delete business model canvas
        await db.business_model_canvas.delete_many({"plan_id": {"$in": plan_ids}})
        # Delete plans
        await db.plans.delete_many({"user_id": user_id})
    
    # 2. Companies
    await db.companies.delete_many({"user_id": user_id})
    
    # 3. Subscriptions
    await db.subscriptions.delete_many({"user_id": user_id})
    
    # 4. Payment transactions
    await db.payment_transactions.delete_many({"user_id": user_id})
    
    # 5. Audit logs
    await db.audit_logs.delete_many({"user_id": user_id})
    
    # 6. Finally, delete the user
    await db.users.delete_one({"_id": to_object_id(user_id)})
    
    logger.info(f"Account and all data deleted for user: {user_id}")
    
    return {"message": "Account and all associated data deleted successfully"}
