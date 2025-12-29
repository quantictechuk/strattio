"""Admin utilities for role checking and permissions"""

from fastapi import HTTPException, Header, Depends
from typing import Optional
import logging

from utils.auth import decode_token
from utils.dependencies import get_db
from utils.serializers import to_object_id

logger = logging.getLogger(__name__)

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

async def get_current_admin_user(
    authorization: Optional[str] = Header(None),
    db = Depends(get_db)
):
    """Get current user and verify admin role - use as dependency"""
    try:
        user_id = await get_current_user_id(authorization)
        
        user = await db.users.find_one({"_id": to_object_id(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")
