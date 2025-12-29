"""Audit Logs routes"""

from fastapi import APIRouter, HTTPException, Depends, Header, Query
from typing import Optional
from datetime import datetime
import logging
from bson import ObjectId

from utils.serializers import serialize_doc, to_object_id
from utils.auth import decode_token
from utils.audit_logger import AuditLogger
from utils.dependencies import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

# ============================================================================
# DEPENDENCY: Get Current User
# ============================================================================

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

# ============================================================================
# ROUTES
# ============================================================================

@router.get("")
async def get_activities(
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    activity_type: Optional[str] = None,
    entity_type: Optional[str] = None
):
    """Get activity logs for the current user"""
    
    logs = await AuditLogger.get_user_activities(
        db=db,
        user_id=user_id,
        limit=limit,
        skip=skip,
        activity_type=activity_type,
        entity_type=entity_type
    )
    
    return {
        "activities": logs,
        "total": len(logs),
        "limit": limit,
        "skip": skip
    }

@router.get("/entity/{entity_type}/{entity_id}")
async def get_entity_activities(
    entity_type: str,
    entity_id: str,
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(50, ge=1, le=100)
):
    """Get activity logs for a specific entity"""
    
    # Verify user has access to this entity
    # For plans, check ownership
    if entity_type == "plan":
        plan = await db.plans.find_one({
            "_id": to_object_id(entity_id),
            "user_id": user_id
        })
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found or access denied")
    
    logs = await AuditLogger.get_entity_activities(
        db=db,
        entity_type=entity_type,
        entity_id=entity_id,
        limit=limit
    )
    
    return {
        "activities": logs,
        "total": len(logs),
        "entity_type": entity_type,
        "entity_id": entity_id
    }

@router.get("/stats")
async def get_activity_stats(
    user_id: str = Depends(get_current_user_id),
    days: int = Query(30, ge=1, le=365)
):
    """Get activity statistics for the user"""
    
    from datetime import timedelta
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Get activity counts by type
    pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "timestamp": {"$gte": cutoff_date}
            }
        },
        {
            "$group": {
                "_id": "$activity_type",
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {"count": -1}
        }
    ]
    
    activity_counts = await db.audit_logs.aggregate(pipeline).to_list(100)
    
    # Get total activities
    total_count = await db.audit_logs.count_documents({
        "user_id": user_id,
        "timestamp": {"$gte": cutoff_date}
    })
    
    return {
        "total_activities": total_count,
        "period_days": days,
        "activity_breakdown": [
            {
                "activity_type": item["_id"],
                "activity_name": AuditLogger.ACTIVITY_TYPES.get(item["_id"], item["_id"]),
                "count": item["count"]
            }
            for item in activity_counts
        ]
    }
