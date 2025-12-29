"""Support ticket routes - User and admin ticket management"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum
import logging
from bson import ObjectId

from utils.serializers import serialize_doc, to_object_id
from utils.dependencies import get_db
from utils.admin import get_current_admin_user, get_current_user_id

router = APIRouter()
logger = logging.getLogger(__name__)

# ============================================================================
# MODELS
# ============================================================================

class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TicketCreate(BaseModel):
    subject: str
    description: str
    priority: TicketPriority = TicketPriority.MEDIUM
    category: Optional[str] = None

class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    assigned_to: Optional[str] = None  # admin user_id

class TicketResponse(BaseModel):
    message: str
    is_internal: bool = False  # Internal notes visible only to admins

# ============================================================================
# USER TICKET ROUTES
# ============================================================================

@router.post("/tickets")
async def create_ticket(
    ticket_data: TicketCreate,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Create a new support ticket"""
    
    logger.info(f"Ticket created by user: {user_id}")
    
    # Validate subject and description
    if not ticket_data.subject or len(ticket_data.subject.strip()) < 3:
        raise HTTPException(status_code=400, detail="Subject must be at least 3 characters")
    if not ticket_data.description or len(ticket_data.description.strip()) < 10:
        raise HTTPException(status_code=400, detail="Description must be at least 10 characters")
    
    # Create ticket document
    ticket_doc = {
        "user_id": user_id,
        "subject": ticket_data.subject.strip(),
        "description": ticket_data.description.strip(),
        "priority": ticket_data.priority.value,
        "category": ticket_data.category or "general",
        "status": TicketStatus.OPEN.value,
        "assigned_to": None,
        "responses": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "resolved_at": None
    }
    
    result = await db.tickets.insert_one(ticket_doc)
    ticket_doc["_id"] = result.inserted_id
    
    logger.info(f"Ticket created: {result.inserted_id} by user: {user_id}")
    
    return serialize_doc(ticket_doc)

@router.get("/tickets")
async def list_user_tickets(
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db),
    status: Optional[str] = None
):
    """List tickets for the current user"""
    
    query = {"user_id": user_id}
    if status:
        query["status"] = status
    
    tickets = await db.tickets.find(query).sort("created_at", -1).to_list(None)
    
    tickets_list = []
    for ticket in tickets:
        ticket_clean = serialize_doc(ticket)
        # Get assigned admin name if assigned
        if ticket.get("assigned_to"):
            admin = await db.users.find_one({"_id": to_object_id(ticket["assigned_to"])})
            if admin:
                ticket_clean["assigned_admin"] = {
                    "id": str(admin["_id"]),
                    "name": admin.get("name", "Unknown"),
                    "email": admin.get("email", "")
                }
        tickets_list.append(ticket_clean)
    
    return {
        "tickets": tickets_list,
        "total": len(tickets_list)
    }

@router.get("/tickets/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Get a specific ticket"""
    
    ticket = await db.tickets.find_one({
        "_id": to_object_id(ticket_id),
        "user_id": user_id
    })
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket_clean = serialize_doc(ticket)
    
    # Get assigned admin info if assigned
    if ticket.get("assigned_to"):
        admin = await db.users.find_one({"_id": to_object_id(ticket["assigned_to"])})
        if admin:
            ticket_clean["assigned_admin"] = {
                "id": str(admin["_id"]),
                "name": admin.get("name", "Unknown"),
                "email": admin.get("email", "")
            }
    
    # Get user info
    user = await db.users.find_one({"_id": to_object_id(user_id)})
    if user:
        ticket_clean["user"] = {
            "id": str(user["_id"]),
            "name": user.get("name", "Unknown"),
            "email": user.get("email", "")
        }
    
    return ticket_clean

@router.post("/tickets/{ticket_id}/respond")
async def respond_to_ticket(
    ticket_id: str,
    response_data: TicketResponse,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Add a response to a ticket (user response)"""
    
    ticket = await db.tickets.find_one({
        "_id": to_object_id(ticket_id),
        "user_id": user_id
    })
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket.get("status") == TicketStatus.CLOSED.value:
        raise HTTPException(status_code=400, detail="Cannot respond to a closed ticket")
    
    # Get user info
    user = await db.users.find_one({"_id": to_object_id(user_id)})
    
    response_doc = {
        "message": response_data.message.strip(),
        "user_id": user_id,
        "user_name": user.get("name", "User") if user else "User",
        "user_email": user.get("email", "") if user else "",
        "is_internal": False,  # User responses are never internal
        "created_at": datetime.utcnow()
    }
    
    # Update ticket
    update_data = {
        "$push": {"responses": response_doc},
        "$set": {"updated_at": datetime.utcnow()}
    }
    
    # If ticket was resolved, reopen it when user responds
    if ticket.get("status") == TicketStatus.RESOLVED.value:
        update_data["$set"]["status"] = TicketStatus.OPEN.value
        update_data["$set"]["resolved_at"] = None
    
    await db.tickets.update_one(
        {"_id": to_object_id(ticket_id)},
        update_data
    )
    
    logger.info(f"Response added to ticket {ticket_id} by user {user_id}")
    
    return {"message": "Response added successfully"}

# ============================================================================
# ADMIN TICKET ROUTES
# ============================================================================

@router.get("/admin/tickets")
async def list_all_tickets(
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db),
    status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """List all tickets (admin only)"""
    
    logger.info(f"Admin tickets list requested by: {admin_user.get('email')}")
    
    query = {}
    if status:
        query["status"] = status
    if assigned_to:
        query["assigned_to"] = assigned_to
    if priority:
        query["priority"] = priority
    
    # Get total count
    total = await db.tickets.count_documents(query)
    
    # Get tickets
    tickets = await db.tickets.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    
    tickets_list = []
    for ticket in tickets:
        ticket_clean = serialize_doc(ticket)
        
        # Get user info
        user = await db.users.find_one({"_id": to_object_id(ticket["user_id"])})
        if user:
            ticket_clean["user"] = {
                "id": str(user["_id"]),
                "name": user.get("name", "Unknown"),
                "email": user.get("email", "")
            }
        
        # Get assigned admin info
        if ticket.get("assigned_to"):
            admin = await db.users.find_one({"_id": to_object_id(ticket["assigned_to"])})
            if admin:
                ticket_clean["assigned_admin"] = {
                    "id": str(admin["_id"]),
                    "name": admin.get("name", "Unknown"),
                    "email": admin.get("email", "")
                }
        
        tickets_list.append(ticket_clean)
    
    return {
        "tickets": tickets_list,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/admin/tickets/{ticket_id}")
async def get_ticket_admin(
    ticket_id: str,
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Get a specific ticket (admin view with all details)"""
    
    ticket = await db.tickets.find_one({"_id": to_object_id(ticket_id)})
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket_clean = serialize_doc(ticket)
    
    # Get user info
    user = await db.users.find_one({"_id": to_object_id(ticket["user_id"])})
    if user:
        ticket_clean["user"] = {
            "id": str(user["_id"]),
            "name": user.get("name", "Unknown"),
            "email": user.get("email", ""),
            "subscription_tier": user.get("subscription_tier", "free")
        }
    
    # Get assigned admin info
    if ticket.get("assigned_to"):
        admin = await db.users.find_one({"_id": to_object_id(ticket["assigned_to"])})
        if admin:
            ticket_clean["assigned_admin"] = {
                "id": str(admin["_id"]),
                "name": admin.get("name", "Unknown"),
                "email": admin.get("email", "")
            }
    
    return ticket_clean

@router.patch("/admin/tickets/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    ticket_update: TicketUpdate,
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Update ticket (status, priority, assignment)"""
    
    ticket = await db.tickets.find_one({"_id": to_object_id(ticket_id)})
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    update_data = {"updated_at": datetime.utcnow()}
    
    if ticket_update.status:
        update_data["status"] = ticket_update.status.value
        if ticket_update.status.value == TicketStatus.RESOLVED.value:
            update_data["resolved_at"] = datetime.utcnow()
        elif ticket_update.status.value == TicketStatus.CLOSED.value:
            update_data["resolved_at"] = datetime.utcnow()
        else:
            update_data["resolved_at"] = None
    
    if ticket_update.priority:
        update_data["priority"] = ticket_update.priority.value
    
    if ticket_update.assigned_to is not None:
        if ticket_update.assigned_to:
            # Verify assigned user is an admin
            assigned_admin = await db.users.find_one({
                "_id": to_object_id(ticket_update.assigned_to),
                "role": "admin"
            })
            if not assigned_admin:
                raise HTTPException(status_code=400, detail="Assigned user must be an admin")
            update_data["assigned_to"] = ticket_update.assigned_to
        else:
            # Unassign ticket
            update_data["assigned_to"] = None
    
    await db.tickets.update_one(
        {"_id": to_object_id(ticket_id)},
        {"$set": update_data}
    )
    
    logger.info(f"Ticket {ticket_id} updated by admin {admin_user.get('email')}")
    
    return {"message": "Ticket updated successfully"}

@router.post("/admin/tickets/{ticket_id}/respond")
async def respond_to_ticket_admin(
    ticket_id: str,
    response_data: TicketResponse,
    admin_user = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Add a response to a ticket (admin response)"""
    
    ticket = await db.tickets.find_one({"_id": to_object_id(ticket_id)})
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket.get("status") == TicketStatus.CLOSED.value:
        raise HTTPException(status_code=400, detail="Cannot respond to a closed ticket")
    
    response_doc = {
        "message": response_data.message.strip(),
        "user_id": str(admin_user["_id"]),
        "user_name": admin_user.get("name", "Admin"),
        "user_email": admin_user.get("email", ""),
        "is_internal": response_data.is_internal,
        "is_admin": True,
        "created_at": datetime.utcnow()
    }
    
    # Update ticket
    update_data = {
        "$push": {"responses": response_doc},
        "$set": {"updated_at": datetime.utcnow()}
    }
    
    # Auto-assign to responding admin if not assigned
    if not ticket.get("assigned_to"):
        update_data["$set"]["assigned_to"] = str(admin_user["_id"])
    
    # If ticket was open, move to in_progress when admin responds
    if ticket.get("status") == TicketStatus.OPEN.value:
        update_data["$set"]["status"] = TicketStatus.IN_PROGRESS.value
    
    await db.tickets.update_one(
        {"_id": to_object_id(ticket_id)},
        update_data
    )
    
    logger.info(f"Admin response added to ticket {ticket_id} by {admin_user.get('email')}")
    
    return {"message": "Response added successfully"}
