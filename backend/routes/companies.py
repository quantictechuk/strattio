"""Companies routes - Business/Company management"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Dict, List, Optional
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
# MODELS
# ============================================================================

class CompanyCreate(BaseModel):
    business_name: str
    industry: str
    location_country: str = "GB"
    location_city: str
    business_description: str
    unique_value_proposition: str
    target_customers: str
    revenue_model: List[str] = ["product_sales"]
    starting_capital: float = 50000
    currency: str = "GBP"
    monthly_revenue_estimate: float = 15000
    price_per_unit: float = 10
    units_per_month: float = 1500
    team_size: int = 3
    operating_expenses: Dict = {}

class CompanyUpdate(BaseModel):
    business_name: Optional[str] = None
    industry: Optional[str] = None
    location_country: Optional[str] = None
    location_city: Optional[str] = None
    business_description: Optional[str] = None
    unique_value_proposition: Optional[str] = None
    target_customers: Optional[str] = None
    revenue_model: Optional[List[str]] = None
    starting_capital: Optional[float] = None
    currency: Optional[str] = None
    monthly_revenue_estimate: Optional[float] = None
    price_per_unit: Optional[float] = None
    units_per_month: Optional[float] = None
    team_size: Optional[int] = None
    operating_expenses: Optional[Dict] = None

# ============================================================================
# ROUTES
# ============================================================================

@router.get("")
async def list_companies(user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """List all companies for a user"""
    
    companies = await db.companies.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    return {"companies": [serialize_doc(c) for c in companies]}

@router.post("")
async def create_company(company_data: CompanyCreate, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Create a new company"""
    
    # Check if company with same name already exists for this user
    existing = await db.companies.find_one({
        "user_id": user_id,
        "business_name": company_data.business_name
    })
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A company with this name already exists"
        )
    
    # Create company document
    company_doc = {
        "user_id": user_id,
        "business_name": company_data.business_name,
        "industry": company_data.industry,
        "location_country": company_data.location_country,
        "location_city": company_data.location_city,
        "business_description": company_data.business_description,
        "unique_value_proposition": company_data.unique_value_proposition,
        "target_customers": company_data.target_customers,
        "revenue_model": company_data.revenue_model,
        "starting_capital": company_data.starting_capital,
        "currency": company_data.currency,
        "monthly_revenue_estimate": company_data.monthly_revenue_estimate,
        "price_per_unit": company_data.price_per_unit,
        "units_per_month": company_data.units_per_month,
        "team_size": company_data.team_size,
        "operating_expenses": company_data.operating_expenses,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.companies.insert_one(company_doc)
    company_doc["_id"] = result.inserted_id
    
    logger.info(f"Company created: {company_data.business_name} for user {user_id}")
    
    return serialize_doc(company_doc)

@router.get("/{company_id}")
async def get_company(company_id: str, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Get a specific company"""
    
    company = await db.companies.find_one({
        "_id": to_object_id(company_id),
        "user_id": user_id
    })
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return serialize_doc(company)

@router.patch("/{company_id}")
async def update_company(
    company_id: str,
    company_data: CompanyUpdate,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Update a company"""
    
    company = await db.companies.find_one({
        "_id": to_object_id(company_id),
        "user_id": user_id
    })
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Build update dict (only include fields that are provided)
    update_data = {"updated_at": datetime.utcnow()}
    
    if company_data.business_name is not None:
        # Check if new name conflicts with existing company
        existing = await db.companies.find_one({
            "user_id": user_id,
            "business_name": company_data.business_name,
            "_id": {"$ne": to_object_id(company_id)}
        })
        if existing:
            raise HTTPException(
                status_code=400,
                detail="A company with this name already exists"
            )
        update_data["business_name"] = company_data.business_name
    
    # Add other fields if provided
    fields = [
        "industry", "location_country", "location_city", "business_description",
        "unique_value_proposition", "target_customers", "revenue_model",
        "starting_capital", "currency", "monthly_revenue_estimate",
        "price_per_unit", "units_per_month", "team_size", "operating_expenses"
    ]
    
    for field in fields:
        value = getattr(company_data, field, None)
        if value is not None:
            update_data[field] = value
    
    await db.companies.update_one(
        {"_id": to_object_id(company_id)},
        {"$set": update_data}
    )
    
    updated_company = await db.companies.find_one({"_id": to_object_id(company_id)})
    logger.info(f"Company updated: {company_id}")
    
    return serialize_doc(updated_company)

@router.delete("/{company_id}")
async def delete_company(company_id: str, user_id: str = Depends(get_current_user_id), db = Depends(get_db)):
    """Delete a company"""
    
    company = await db.companies.find_one({
        "_id": to_object_id(company_id),
        "user_id": user_id
    })
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    await db.companies.delete_one({"_id": to_object_id(company_id)})
    logger.info(f"Company deleted: {company_id}")
    
    return {"success": True, "message": "Company deleted successfully"}
