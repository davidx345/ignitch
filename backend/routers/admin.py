"""
Admin Router
Handles administrative functions for billboard marketplace
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from database import get_db
from models import (
    BillboardRegistration, Billboard, User,
    BillboardStatus, BillboardType
)
import schemas
from routers.auth import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])

# Response Models
class BillboardRegistrationResponse(BaseModel):
    id: int
    registration_id: str
    company_name: str
    contact_person: str
    phone: str
    email: str
    billboard_name: str
    billboard_type: str
    city: str
    state: str
    daily_rate: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ApprovalRequest(BaseModel):
    action: str  # "approve" or "reject"
    notes: Optional[str] = None

class ApprovalResponse(BaseModel):
    success: bool
    message: str
    billboard_id: Optional[str] = None

# Admin Dashboard Statistics
class AdminStats(BaseModel):
    total_registrations: int
    pending_registrations: int
    approved_billboards: int
    active_billboards: int
    total_campaigns: int
    monthly_revenue: float

@router.get("/stats", response_model=AdminStats)
async def get_admin_statistics(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""
    
    # Count registrations
    total_registrations = db.query(BillboardRegistration).count()
    pending_registrations = db.query(BillboardRegistration).filter(
        BillboardRegistration.status == BillboardStatus.PENDING_REVIEW
    ).count()
    
    # Count billboards
    approved_billboards = db.query(Billboard).count()
    active_billboards = db.query(Billboard).filter(
        Billboard.status == BillboardStatus.ACTIVE
    ).count()
    
    # TODO: Add campaign and revenue calculations when campaign model is ready
    total_campaigns = 0
    monthly_revenue = 0.0
    
    return AdminStats(
        total_registrations=total_registrations,
        pending_registrations=pending_registrations,
        approved_billboards=approved_billboards,
        active_billboards=active_billboards,
        total_campaigns=total_campaigns,
        monthly_revenue=monthly_revenue
    )

@router.get("/registrations", response_model=List[BillboardRegistrationResponse])
async def get_billboard_registrations(
    status: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all billboard registrations for admin review"""
    
    query = db.query(BillboardRegistration)
    
    # Filter by status if provided
    if status:
        try:
            status_enum = BillboardStatus(status)
            query = query.filter(BillboardRegistration.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}"
            )
    
    # Order by creation date (newest first)
    query = query.order_by(BillboardRegistration.created_at.desc())
    
    # Apply pagination
    registrations = query.offset(skip).limit(limit).all()
    
    return registrations

@router.get("/registrations/{registration_id}", response_model=BillboardRegistrationResponse)
async def get_registration_details(
    registration_id: str,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific registration"""
    
    registration = db.query(BillboardRegistration).filter(
        BillboardRegistration.registration_id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    return registration

@router.post("/registrations/{registration_id}/review", response_model=ApprovalResponse)
async def review_billboard_registration(
    registration_id: str,
    approval: ApprovalRequest,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Approve or reject a billboard registration"""
    
    # Get registration
    registration = db.query(BillboardRegistration).filter(
        BillboardRegistration.registration_id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    # Check if already processed
    if registration.status != BillboardStatus.PENDING_REVIEW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration already {registration.status.value}"
        )
    
    try:
        if approval.action == "approve":
            # Approve registration and create billboard
            billboard_id = await _approve_registration(registration, current_admin, approval.notes, db)
            
            return ApprovalResponse(
                success=True,
                message="Billboard registration approved successfully",
                billboard_id=billboard_id
            )
            
        elif approval.action == "reject":
            # Reject registration
            registration.status = BillboardStatus.REJECTED
            registration.review_notes = approval.notes
            registration.approved_by = current_admin.id
            registration.updated_at = datetime.utcnow()
            
            db.commit()
            
            return ApprovalResponse(
                success=True,
                message="Billboard registration rejected"
            )
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid action. Must be 'approve' or 'reject'"
            )
            
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing registration: {str(e)}"
        )

async def _approve_registration(
    registration: BillboardRegistration,
    admin: User,
    notes: Optional[str],
    db: Session
) -> str:
    """Internal function to approve registration and create billboard"""
    
    # Generate unique billboard ID
    billboard_id = f"BB_{registration.city[:3].upper()}_{str(uuid.uuid4())[:8].upper()}"
    
    # Generate API key for billboard agent
    api_key = f"sk_billboard_{str(uuid.uuid4()).replace('-', '')}"
    
    # Create billboard record
    new_billboard = Billboard(
        billboard_id=billboard_id,
        registration_id=registration.id,
        name=registration.billboard_name,
        description=registration.description,
        billboard_type=registration.billboard_type,
        orientation=registration.orientation,
        illuminated=registration.illuminated,
        width_feet=registration.width_feet,
        height_feet=registration.height_feet,
        address=registration.address,
        city=registration.city,
        state=registration.state,
        country=registration.country,
        latitude=registration.latitude,
        longitude=registration.longitude,
        daily_rate=registration.daily_rate,
        weekly_rate=registration.weekly_rate,
        monthly_rate=registration.monthly_rate,
        daily_impressions=registration.daily_impressions,
        photos=registration.photos,
        api_key=api_key,
        status=BillboardStatus.ACTIVE
    )
    
    # Find or create billboard owner user
    owner = db.query(User).filter(User.email == registration.email).first()
    if not owner:
        # Create new user for billboard owner
        owner = User(
            email=registration.email,
            username=registration.email.split('@')[0],
            full_name=registration.contact_person,
            phone=registration.phone,
            company_name=registration.company_name,
            is_billboard_owner=True,
            is_active=True,
            is_verified=True
        )
        db.add(owner)
        db.flush()  # Get user ID
    
    # Assign owner to billboard
    new_billboard.owner_id = owner.id
    
    # Update registration status
    registration.status = BillboardStatus.APPROVED
    registration.review_notes = notes
    registration.approved_by = admin.id
    registration.approved_at = datetime.utcnow()
    registration.updated_at = datetime.utcnow()
    
    # Save everything
    db.add(new_billboard)
    db.commit()
    
    print(f"✅ Billboard approved: {billboard_id}")
    print(f"   Owner: {registration.contact_person}")
    print(f"   Location: {registration.city}, {registration.state}")
    print(f"   API Key: {api_key}")
    
    return billboard_id

@router.get("/billboards", response_model=List[dict])
async def get_approved_billboards(
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all approved billboards"""
    
    query = db.query(Billboard)
    
    # Filter by status if provided
    if status:
        try:
            status_enum = BillboardStatus(status)
            query = query.filter(Billboard.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}"
            )
    
    billboards = query.offset(skip).limit(limit).all()
    
    # Convert to dict for response
    result = []
    for billboard in billboards:
        result.append({
            "id": billboard.id,
            "billboard_id": billboard.billboard_id,
            "name": billboard.name,
            "city": billboard.city,
            "state": billboard.state,
            "daily_rate": billboard.daily_rate,
            "status": billboard.status.value,
            "is_online": billboard.is_online,
            "last_heartbeat": billboard.last_heartbeat,
            "created_at": billboard.created_at
        })
    
    return result
