"""Admin routes - Backoffice panel for monitoring and user management"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import logging
from bson import ObjectId

from utils.serializers import serialize_doc, to_object_id
from utils.auth import get_password_hash, verify_password
from utils.dependencies import get_db
from utils.admin import get_current_admin_user, get_current_user_id

router = APIRouter()
logger = logging.getLogger(__name__)

# ============================================================================
# MODELS
# ============================================================================

class AdminPasswordChange(BaseModel):
    user_id: str
    new_password: str

class UserPasswordChange(BaseModel):
    new_password: str

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

# ============================================================================
# ANALYTICS ROUTES
# ============================================================================

@router.get("/analytics/overview")
async def get_analytics_overview(
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Get overview analytics for admin dashboard"""
    
    logger.info(f"Admin analytics overview requested by: {admin_user.get('email')}")
    
    # User metrics
    total_users = await db.users.count_documents({})
    users_this_month = await db.users.count_documents({
        "created_at": {"$gte": datetime.utcnow() - timedelta(days=30)}
    })
    users_this_week = await db.users.count_documents({
        "created_at": {"$gte": datetime.utcnow() - timedelta(days=7)}
    })
    
    # Plan metrics
    total_plans = await db.plans.count_documents({})
    plans_this_month = await db.plans.count_documents({
        "created_at": {"$gte": datetime.utcnow() - timedelta(days=30)}
    })
    plans_failed = await db.plans.count_documents({"status": "failed"})
    plans_completed = await db.plans.count_documents({"status": "completed"})
    plans_generating = await db.plans.count_documents({"status": "generating"})
    
    # Subscription metrics
    subscription_counts = {}
    for tier in ["free", "starter", "professional", "enterprise"]:
        count = await db.subscriptions.count_documents({"tier": tier, "status": "active"})
        subscription_counts[tier] = count
    
    total_active_subscriptions = await db.subscriptions.count_documents({"status": "active"})
    
    # Revenue metrics (from payment transactions)
    revenue_pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {
            "_id": None,
            "total_revenue": {"$sum": "$amount"},
            "transaction_count": {"$sum": 1}
        }}
    ]
    revenue_data = await db.payment_transactions.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_data[0]["total_revenue"] / 100 if revenue_data else 0  # Convert from cents
    total_transactions = revenue_data[0]["transaction_count"] if revenue_data else 0
    
    # Monthly revenue
    monthly_revenue_pipeline = [
        {"$match": {
            "status": "completed",
            "created_at": {"$gte": datetime.utcnow() - timedelta(days=30)}
        }},
        {"$group": {
            "_id": None,
            "monthly_revenue": {"$sum": "$amount"}
        }}
    ]
    monthly_revenue_data = await db.payment_transactions.aggregate(monthly_revenue_pipeline).to_list(1)
    monthly_revenue = monthly_revenue_data[0]["monthly_revenue"] / 100 if monthly_revenue_data else 0
    
    # Conversion rate (users with active paid subscriptions / total users)
    paid_subscriptions = await db.subscriptions.count_documents({
        "status": "active",
        "tier": {"$in": ["starter", "professional", "enterprise"]}
    })
    conversion_rate = (paid_subscriptions / total_users * 100) if total_users > 0 else 0
    
    return {
        "users": {
            "total": total_users,
            "this_month": users_this_month,
            "this_week": users_this_week
        },
        "plans": {
            "total": total_plans,
            "this_month": plans_this_month,
            "completed": plans_completed,
            "failed": plans_failed,
            "generating": plans_generating
        },
        "subscriptions": {
            "total_active": total_active_subscriptions,
            "by_tier": subscription_counts,
            "paid_count": paid_subscriptions
        },
        "revenue": {
            "total": round(total_revenue, 2),
            "monthly": round(monthly_revenue, 2),
            "transaction_count": total_transactions
        },
        "conversion_rate": round(conversion_rate, 2)
    }

@router.get("/analytics/users")
async def get_user_analytics(
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Get detailed user analytics"""
    
    # Users by subscription tier
    users_by_tier = {}
    for tier in ["free", "starter", "professional", "enterprise"]:
        count = await db.users.count_documents({"subscription_tier": tier})
        users_by_tier[tier] = count
    
    # Users by auth provider
    users_by_provider = {}
    email_users = await db.users.count_documents({"auth_provider": {"$exists": False}})
    google_users = await db.users.count_documents({"auth_provider": "google"})
    users_by_provider["email"] = email_users
    users_by_provider["google"] = google_users
    
    # Users with verified emails
    verified_users = await db.users.count_documents({"email_verified": True})
    unverified_users = await db.users.count_documents({"email_verified": False})
    
    # Recent signups (last 30 days, grouped by day)
    signups_pipeline = [
        {"$match": {"created_at": {"$gte": datetime.utcnow() - timedelta(days=30)}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    recent_signups = await db.users.aggregate(signups_pipeline).to_list(None)
    
    return {
        "by_tier": users_by_tier,
        "by_provider": users_by_provider,
        "verification": {
            "verified": verified_users,
            "unverified": unverified_users
        },
        "recent_signups": recent_signups
    }

@router.get("/analytics/revenue")
async def get_revenue_analytics(
    days: int = 30,
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Get revenue analytics"""
    
    # Revenue by day
    revenue_pipeline = [
        {"$match": {
            "status": "completed",
            "created_at": {"$gte": datetime.utcnow() - timedelta(days=days)}
        }},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "revenue": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    daily_revenue = await db.payment_transactions.aggregate(revenue_pipeline).to_list(None)
    
    # Format revenue (convert from cents)
    for item in daily_revenue:
        item["revenue"] = round(item["revenue"] / 100, 2)
    
    # Revenue by subscription tier
    tier_revenue_pipeline = [
        {"$match": {"status": "completed"}},
        {"$lookup": {
            "from": "subscriptions",
            "localField": "subscription_id",
            "foreignField": "_id",
            "as": "subscription"
        }},
        {"$unwind": {"path": "$subscription", "preserveNullAndEmptyArrays": True}},
        {"$group": {
            "_id": "$subscription.tier",
            "revenue": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }}
    ]
    tier_revenue = await db.payment_transactions.aggregate(tier_revenue_pipeline).to_list(None)
    
    # Format tier revenue
    for item in tier_revenue:
        item["revenue"] = round(item["revenue"] / 100, 2)
    
    return {
        "daily_revenue": daily_revenue,
        "by_tier": tier_revenue
    }

# ============================================================================
# USER MANAGEMENT ROUTES
# ============================================================================

@router.get("/users")
async def list_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """List all users with pagination and search"""
    
    query = {}
    if search:
        query = {
            "$or": [
                {"email": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}}
            ]
        }
    
    users = await db.users.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    total = await db.users.count_documents(query)
    
    # Get subscription info for each user
    for user in users:
        user_id = str(user["_id"])
        subscription = await db.subscriptions.find_one({"user_id": user_id})
        user["subscription"] = serialize_doc(subscription) if subscription else None
        
        # Get plan count
        plan_count = await db.plans.count_documents({"user_id": user_id})
        user["plan_count"] = plan_count
        
        # Remove sensitive data
        if "password_hash" in user:
            del user["password_hash"]
    
    # Serialize users
    serialized_users = [serialize_doc(u) for u in users]
    
    logger.info(f"Admin: Listed {len(serialized_users)} users (total: {total}, skip: {skip}, limit: {limit})")
    
    return {
        "users": serialized_users,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Get detailed user information"""
    
    user = await db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get subscription
    subscription = await db.subscriptions.find_one({"user_id": user_id})
    
    # Get plans
    plans = await db.plans.find({"user_id": user_id}).sort("created_at", -1).to_list(None)
    
    # Get payment transactions
    transactions = await db.payment_transactions.find({"user_id": user_id}).sort("created_at", -1).limit(10).to_list(None)
    
    user_clean = serialize_doc(user)
    if "password_hash" in user_clean:
        del user_clean["password_hash"]
    
    return {
        "user": user_clean,
        "subscription": serialize_doc(subscription) if subscription else None,
        "plans": [serialize_doc(p) for p in plans],
        "recent_transactions": [serialize_doc(t) for t in transactions]
    }

@router.post("/users/{user_id}/password")
async def change_user_password(
    user_id: str,
    password_data: AdminPasswordChange,
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Change a user's password (admin only)"""
    
    if user_id != password_data.user_id:
        raise HTTPException(status_code=400, detail="User ID mismatch")
    
    user = await db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if len(password_data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    await db.users.update_one(
        {"_id": to_object_id(user_id)},
        {"$set": {
            "password_hash": get_password_hash(password_data.new_password),
            "updated_at": datetime.utcnow()
        }}
    )
    
    logger.info(f"Admin changed password for user: {user_id}")
    
    return {"message": "Password changed successfully"}

@router.post("/admin/password")
async def change_admin_password(
    password_data: UserPasswordChange,
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Change admin's own password"""
    
    if len(password_data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    await db.users.update_one(
        {"_id": admin_user["_id"]},
        {"$set": {
            "password_hash": get_password_hash(password_data.new_password),
            "updated_at": datetime.utcnow()
        }}
    )
    
    logger.info(f"Admin changed own password: {admin_user['email']}")
    
    return {"message": "Password changed successfully"}

# ============================================================================
# ADMIN USER MANAGEMENT ROUTES
# ============================================================================

@router.get("/admins")
async def list_admins(
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """List all admin users"""
    
    logger.info(f"Admin list requested by: {admin_user.get('email')}")
    
    # Find all users with admin role
    admin_users = await db.users.find({"role": "admin"}).to_list(None)
    
    # Serialize and clean up
    admins_list = []
    for admin in admin_users:
        admin_clean = serialize_doc(admin)
        # Remove sensitive data
        if "password_hash" in admin_clean:
            del admin_clean["password_hash"]
        admins_list.append(admin_clean)
    
    return {
        "admins": admins_list,
        "total": len(admins_list)
    }

@router.post("/admins")
async def create_admin(
    admin_data: AdminCreate,
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Create a new admin user"""
    
    logger.info(f"Admin creation requested by: {admin_user.get('email')} for email: {admin_data.email}")
    
    # Validate password
    if len(admin_data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": admin_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create admin user
    admin_doc = {
        "email": admin_data.email,
        "password_hash": get_password_hash(admin_data.password),
        "name": admin_data.name or admin_data.email.split("@")[0],
        "role": "admin",
        "subscription_tier": "enterprise",
        "email_verified": False,  # Admin can verify later
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(admin_doc)
    admin_doc["_id"] = result.inserted_id
    
    # Create subscription for admin
    await db.subscriptions.insert_one({
        "user_id": str(result.inserted_id),
        "tier": "enterprise",
        "status": "active",
        "plans_created_this_month": 0,
        "plan_limit": 999,
        "created_at": datetime.utcnow()
    })
    
    logger.info(f"Admin user created: {admin_data.email} by {admin_user.get('email')}")
    
    # Return created admin (without password hash)
    admin_clean = serialize_doc(admin_doc)
    if "password_hash" in admin_clean:
        del admin_clean["password_hash"]
    
    return admin_clean
