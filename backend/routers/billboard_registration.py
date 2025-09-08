"""
Billboard Registration Router
Handles billboard owner registration and onboarding for Nigeria market
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from database import get_db
import schemas
from datetime import datetime

router = APIRouter(prefix="/billboards", tags=["Billboard Registration"])

class BillboardRegistrationRequest(BaseModel):
    # Company Information
    company_name: str
    contact_person: str
    phone: str
    email: EmailStr
    
    # Billboard Details
    billboard_name: str
    description: Optional[str] = None
    billboard_type: str = "digital"  # digital, static, vinyl, backlit
    orientation: str = "landscape"   # landscape, portrait, square
    illuminated: bool = True
    width_feet: float
    height_feet: float
    
    # Location Information
    address: str
    city: str
    state: str
    zip_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Pricing & Performance
    daily_rate: float
    weekly_rate: Optional[float] = None
    monthly_rate: Optional[float] = None
    daily_impressions: Optional[int] = None
    
    # Payment Information
    account_holder_name: str
    routing_number: str  # Bank code in Nigeria
    account_number: str
    account_type: str = "checking"  # checking/current or savings
    
    # Photos
    photos: Optional[List[str]] = []

class BillboardRegistrationResponse(BaseModel):
    success: bool
    message: str
    registration_id: Optional[str] = None
    status: str = "pending_review"

@router.post("/register", response_model=BillboardRegistrationResponse)
async def register_billboard(
    registration: BillboardRegistrationRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new billboard for Nigeria market
    """
    try:
        # Validate Nigeria-specific requirements
        if not registration.phone.startswith('+234'):
            if not registration.phone.startswith('234'):
                if not registration.phone.startswith('0'):
                    registration.phone = '+234' + registration.phone
                else:
                    registration.phone = '+234' + registration.phone[1:]
            else:
                registration.phone = '+' + registration.phone
        
        # Calculate derived rates if not provided
        if not registration.weekly_rate:
            registration.weekly_rate = registration.daily_rate * 6.5  # 7% discount for weekly
        
        if not registration.monthly_rate:
            registration.monthly_rate = registration.daily_rate * 28  # 10% discount for monthly
        
        # Create registration record (you'll need to create this table)
        registration_data = {
            "company_name": registration.company_name,
            "contact_person": registration.contact_person,
            "phone": registration.phone,
            "email": registration.email,
            "billboard_name": registration.billboard_name,
            "description": registration.description,
            "billboard_type": registration.billboard_type,
            "orientation": registration.orientation,
            "illuminated": registration.illuminated,
            "width_feet": registration.width_feet,
            "height_feet": registration.height_feet,
            "address": registration.address,
            "city": registration.city,
            "state": registration.state,
            "zip_code": registration.zip_code,
            "latitude": registration.latitude,
            "longitude": registration.longitude,
            "daily_rate": registration.daily_rate,
            "weekly_rate": registration.weekly_rate,
            "monthly_rate": registration.monthly_rate,
            "daily_impressions": registration.daily_impressions,
            "account_holder_name": registration.account_holder_name,
            "routing_number": registration.routing_number,
            "account_number": registration.account_number,
            "account_type": registration.account_type,
            "photos": registration.photos,
            "status": "pending_review",
            "created_at": datetime.utcnow(),
            "country": "Nigeria"
        }
        
        # For now, we'll just log the registration
        # In production, save to database
        print(f"New billboard registration received:")
        print(f"Company: {registration.company_name}")
        print(f"Billboard: {registration.billboard_name}")
        print(f"Location: {registration.city}, {registration.state}")
        print(f"Contact: {registration.email}, {registration.phone}")
        print(f"Rate: ₦{registration.daily_rate}/day")
        
        # Generate a simple registration ID
        import uuid
        registration_id = str(uuid.uuid4())[:8].upper()
        
        return BillboardRegistrationResponse(
            success=True,
            message=f"Billboard registration submitted successfully! Registration ID: {registration_id}. "
                   f"Our team will review your submission and contact you within 2-3 business days.",
            registration_id=registration_id,
            status="pending_review"
        )
        
    except Exception as e:
        print(f"Error in billboard registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit billboard registration: {str(e)}"
        )

@router.get("/registration-status/{registration_id}")
async def get_registration_status(
    registration_id: str,
    db: Session = Depends(get_db)
):
    """
    Check the status of a billboard registration
    """
    # For now, return mock status
    # In production, query from database
    return {
        "registration_id": registration_id,
        "status": "pending_review",
        "message": "Your billboard registration is under review. We will contact you soon.",
        "submitted_at": datetime.utcnow().isoformat(),
        "estimated_review_time": "2-3 business days"
    }

@router.get("/registration-requirements")
async def get_registration_requirements():
    """
    Get Nigeria-specific billboard registration requirements
    """
    return {
        "requirements": {
            "documents": [
                "Business registration certificate (CAC)",
                "Tax identification number (TIN)",
                "Billboard location permit",
                "Insurance certificate",
                "Photos of billboard (front view, location context)"
            ],
            "minimum_rates": {
                "digital_billboard": "₦30,000/day",
                "static_billboard": "₦15,000/day",
                "led_screen": "₦50,000/day"
            },
            "supported_locations": [
                "Lagos State", "FCT (Abuja)", "Rivers State", "Kano State",
                "Oyo State", "Delta State", "Kaduna State", "Anambra State"
            ],
            "payment_methods": [
                "Bank transfer (Nigerian banks)",
                "Mobile money (coming soon)",
                "Cryptocurrency (coming soon)"
            ],
            "approval_process": [
                "Initial review (1-2 days)",
                "Location verification (2-3 days)",
                "Contract signing",
                "Platform onboarding",
                "Go live"
            ]
        },
        "contact": {
            "email": "billboards@adflow.ng",
            "phone": "+234 (0) 1234 5678",
            "whatsapp": "+234 (0) 9876 5432"
        }
    }
