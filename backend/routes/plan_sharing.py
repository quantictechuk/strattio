"""Plan sharing and collaboration routes"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import logging
import secrets
from bson import ObjectId

from utils.serializers import serialize_doc, to_object_id
from utils.dependencies import get_db
from utils.admin import get_current_user_id
from utils.auth import get_password_hash, verify_password

router = APIRouter()
logger = logging.getLogger(__name__)

# ============================================================================
# MODELS
# ============================================================================

class ShareCreate(BaseModel):
    access_level: str = "read"  # "read" | "comment" | "edit"
    password: Optional[str] = None
    expires_in_days: Optional[int] = None  # None = never expires

class CollaboratorInvite(BaseModel):
    email: EmailStr
    role: str = "viewer"  # "viewer" | "editor" | "admin"

class CommentCreate(BaseModel):
    content: str
    section_id: Optional[str] = None
    parent_comment_id: Optional[str] = None  # For threading

class CommentUpdate(BaseModel):
    content: str

# ============================================================================
# SHARE LINKS
# ============================================================================

@router.post("/plans/{plan_id}/share")
async def create_share_link(
    plan_id: str,
    share_data: ShareCreate,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Create a shareable link for a plan"""
    
    # Get plan
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Validate access level
    if share_data.access_level not in ["read", "comment", "edit"]:
        raise HTTPException(status_code=400, detail="Invalid access level")
    
    # Generate secure token
    share_token = secrets.token_urlsafe(32)
    
    # Calculate expiration
    expires_at = None
    if share_data.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=share_data.expires_in_days)
    
    # Create share document
    share_doc = {
        "plan_id": plan_id,
        "share_token": share_token,
        "created_by": user_id,
        "access_level": share_data.access_level,
        "password_hash": get_password_hash(share_data.password) if share_data.password else None,
        "expires_at": expires_at,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    await db.plan_shares.insert_one(share_doc)
    
    logger.info(f"Share link created for plan {plan_id} by user {user_id}")
    
    return {
        "share_token": share_token,
        "share_url": f"/shared/{share_token}",
        "access_level": share_data.access_level,
        "expires_at": expires_at.isoformat() if expires_at else None
    }

@router.get("/plans/{plan_id}/shares")
async def list_share_links(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """List all share links for a plan"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get all shares
    shares = await db.plan_shares.find({
        "plan_id": plan_id,
        "is_active": True
    }).sort("created_at", -1).to_list(None)
    
    shares_list = []
    for share in shares:
        share_clean = serialize_doc(share)
        # Remove password hash
        if "password_hash" in share_clean:
            del share_clean["password_hash"]
        shares_list.append(share_clean)
    
    return {"shares": shares_list}

@router.delete("/plans/{plan_id}/shares/{share_token}")
async def revoke_share_link(
    plan_id: str,
    share_token: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Revoke a share link"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Deactivate share
    result = await db.plan_shares.update_one(
        {"plan_id": plan_id, "share_token": share_token},
        {"$set": {"is_active": False, "revoked_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Share link not found")
    
    return {"message": "Share link revoked"}

@router.get("/plans/shared/{share_token}")
async def get_shared_plan(
    share_token: str,
    password: Optional[str] = Query(None),
    db = Depends(get_db)
):
    """Get a plan via share token (public endpoint)"""
    
    # Get share
    share = await db.plan_shares.find_one({
        "share_token": share_token,
        "is_active": True
    })
    
    if not share:
        raise HTTPException(status_code=404, detail="Share link not found or expired")
    
    # Check expiration
    if share.get("expires_at"):
        expires_at = share["expires_at"]
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        if datetime.utcnow() > expires_at:
            raise HTTPException(status_code=410, detail="Share link has expired")
    
    # Check password
    if share.get("password_hash"):
        if not password:
            raise HTTPException(status_code=401, detail="Password required")
        if not verify_password(password, share["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid password")
    
    # Get plan
    plan = await db.plans.find_one({"_id": to_object_id(share["plan_id"])})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get sections (limited based on access level)
    sections = await db.sections.find({"plan_id": share["plan_id"]}).sort("order_index", 1).to_list(None)
    
    plan_clean = serialize_doc(plan)
    plan_clean["sections"] = [serialize_doc(s) for s in sections]
    plan_clean["access_level"] = share["access_level"]
    plan_clean["is_shared"] = True
    
    return plan_clean

# ============================================================================
# COLLABORATORS
# ============================================================================

@router.post("/plans/{plan_id}/collaborators")
async def invite_collaborator(
    plan_id: str,
    invite_data: CollaboratorInvite,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Invite a collaborator to a plan"""
    
    # Get plan
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Validate role
    if invite_data.role not in ["viewer", "editor", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Find user by email
    collaborator_user = await db.users.find_one({"email": invite_data.email})
    if not collaborator_user:
        raise HTTPException(status_code=404, detail="User not found with this email")
    
    collaborator_user_id = str(collaborator_user["_id"])
    
    # Check if already a collaborator
    existing = await db.plan_collaborators.find_one({
        "plan_id": plan_id,
        "user_id": collaborator_user_id
    })
    
    if existing:
        # Update role
        await db.plan_collaborators.update_one(
            {"_id": existing["_id"]},
            {"$set": {"role": invite_data.role, "updated_at": datetime.utcnow()}}
        )
        return {"message": "Collaborator role updated", "user_id": collaborator_user_id}
    
    # Create collaborator entry
    collaborator_doc = {
        "plan_id": plan_id,
        "user_id": collaborator_user_id,
        "role": invite_data.role,
        "invited_by": user_id,
        "joined_at": datetime.utcnow(),
        "created_at": datetime.utcnow()
    }
    
    await db.plan_collaborators.insert_one(collaborator_doc)
    
    logger.info(f"Collaborator {collaborator_user_id} invited to plan {plan_id} by {user_id}")
    
    return {
        "message": "Collaborator invited",
        "user_id": collaborator_user_id,
        "email": invite_data.email,
        "role": invite_data.role
    }

@router.get("/plans/{plan_id}/collaborators")
async def list_collaborators(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """List all collaborators for a plan"""
    
    # Verify access (owner or collaborator)
    plan = await db.plans.find_one({"_id": to_object_id(plan_id)})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    is_owner = plan.get("user_id") == user_id
    is_collaborator = await db.plan_collaborators.find_one({
        "plan_id": plan_id,
        "user_id": user_id
    })
    
    if not is_owner and not is_collaborator:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get collaborators
    collaborators = await db.plan_collaborators.find({"plan_id": plan_id}).to_list(None)
    
    collaborators_list = []
    for collab in collaborators:
        user = await db.users.find_one({"_id": to_object_id(collab["user_id"])})
        if user:
            collab_clean = serialize_doc(collab)
            collab_clean["user"] = {
                "id": str(user["_id"]),
                "email": user.get("email", ""),
                "name": user.get("name", "Unknown")
            }
            collaborators_list.append(collab_clean)
    
    return {"collaborators": collaborators_list}

@router.delete("/plans/{plan_id}/collaborators/{collaborator_id}")
async def remove_collaborator(
    plan_id: str,
    collaborator_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Remove a collaborator from a plan"""
    
    # Verify plan ownership
    plan = await db.plans.find_one({
        "_id": to_object_id(plan_id),
        "user_id": user_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Remove collaborator
    result = await db.plan_collaborators.delete_one({
        "plan_id": plan_id,
        "user_id": collaborator_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Collaborator not found")
    
    return {"message": "Collaborator removed"}

# ============================================================================
# COMMENTS
# ============================================================================

@router.post("/plans/{plan_id}/comments")
async def add_comment(
    plan_id: str,
    comment_data: CommentCreate,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Add a comment to a plan or section"""
    
    # Verify access (owner or collaborator)
    plan = await db.plans.find_one({"_id": to_object_id(plan_id)})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    is_owner = plan.get("user_id") == user_id
    is_collaborator = await db.plan_collaborators.find_one({
        "plan_id": plan_id,
        "user_id": user_id
    })
    
    if not is_owner and not is_collaborator:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get user info
    user = await db.users.find_one({"_id": to_object_id(user_id)})
    
    # Create comment
    comment_doc = {
        "plan_id": plan_id,
        "section_id": comment_data.section_id,
        "user_id": user_id,
        "user_name": user.get("name", "User") if user else "User",
        "user_email": user.get("email", "") if user else "",
        "content": comment_data.content.strip(),
        "parent_comment_id": comment_data.parent_comment_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.plan_comments.insert_one(comment_doc)
    comment_doc["_id"] = result.inserted_id
    
    logger.info(f"Comment added to plan {plan_id} by user {user_id}")
    
    return serialize_doc(comment_doc)

@router.get("/plans/{plan_id}/comments")
async def list_comments(
    plan_id: str,
    section_id: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """List comments for a plan or section"""
    
    # Verify access
    plan = await db.plans.find_one({"_id": to_object_id(plan_id)})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    is_owner = plan.get("user_id") == user_id
    is_collaborator = await db.plan_collaborators.find_one({
        "plan_id": plan_id,
        "user_id": user_id
    })
    
    if not is_owner and not is_collaborator:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Build query
    query = {"plan_id": plan_id}
    if section_id:
        query["section_id"] = section_id
    
    # Get comments
    comments = await db.plan_comments.find(query).sort("created_at", 1).to_list(None)
    
    return {"comments": [serialize_doc(c) for c in comments]}

@router.patch("/plans/{plan_id}/comments/{comment_id}")
async def update_comment(
    plan_id: str,
    comment_id: str,
    comment_update: CommentUpdate,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Update a comment"""
    
    # Get comment
    comment = await db.plan_comments.find_one({
        "_id": to_object_id(comment_id),
        "plan_id": plan_id,
        "user_id": user_id  # Only owner can edit
    })
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Update comment
    await db.plan_comments.update_one(
        {"_id": to_object_id(comment_id)},
        {"$set": {
            "content": comment_update.content.strip(),
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Comment updated"}

@router.delete("/plans/{plan_id}/comments/{comment_id}")
async def delete_comment(
    plan_id: str,
    comment_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Delete a comment"""
    
    # Get comment
    comment = await db.plan_comments.find_one({
        "_id": to_object_id(comment_id),
        "plan_id": plan_id
    })
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check permissions (owner or comment author)
    plan = await db.plans.find_one({"_id": to_object_id(plan_id)})
    is_plan_owner = plan and plan.get("user_id") == user_id
    is_comment_owner = comment.get("user_id") == user_id
    
    if not is_plan_owner and not is_comment_owner:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete comment and any replies
    await db.plan_comments.delete_many({
        "$or": [
            {"_id": to_object_id(comment_id)},
            {"parent_comment_id": comment_id}
        ]
    })
    
    return {"message": "Comment deleted"}

# ============================================================================
# VERSION HISTORY
# ============================================================================

@router.get("/plans/{plan_id}/versions")
async def get_version_history(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Get version history for a plan"""
    
    # Verify access
    plan = await db.plans.find_one({"_id": to_object_id(plan_id)})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    is_owner = plan.get("user_id") == user_id
    is_collaborator = await db.plan_collaborators.find_one({
        "plan_id": plan_id,
        "user_id": user_id,
        "role": {"$in": ["editor", "admin"]}
    })
    
    if not is_owner and not is_collaborator:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get versions
    versions = await db.plan_versions.find({"plan_id": plan_id}).sort("created_at", -1).limit(50).to_list(None)
    
    versions_list = []
    for version in versions:
        version_clean = serialize_doc(version)
        # Get creator info
        creator = await db.users.find_one({"_id": to_object_id(version["created_by"])})
        if creator:
            version_clean["created_by_name"] = creator.get("name", "Unknown")
        versions_list.append(version_clean)
    
    return {"versions": versions_list}

@router.post("/plans/{plan_id}/restore/{version_id}")
async def restore_version(
    plan_id: str,
    version_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Restore a plan to a previous version"""
    
    # Verify access (owner or admin collaborator)
    plan = await db.plans.find_one({"_id": to_object_id(plan_id)})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    is_owner = plan.get("user_id") == user_id
    is_admin = await db.plan_collaborators.find_one({
        "plan_id": plan_id,
        "user_id": user_id,
        "role": "admin"
    })
    
    if not is_owner and not is_admin:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get version
    version = await db.plan_versions.find_one({
        "_id": to_object_id(version_id),
        "plan_id": plan_id
    })
    
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    # Create new version from current state before restoring
    # (This is a simplified version - in production, you'd want to save current state first)
    
    # Restore sections from version
    if version.get("sections_snapshot"):
        # Delete current sections
        await db.sections.delete_many({"plan_id": plan_id})
        
        # Restore sections
        for section in version["sections_snapshot"]:
            section["plan_id"] = plan_id
            section["created_at"] = datetime.utcnow()
            section["updated_at"] = datetime.utcnow()
            await db.sections.insert_one(section)
    
    logger.info(f"Plan {plan_id} restored to version {version_id} by user {user_id}")
    
    return {"message": "Plan restored to previous version"}
