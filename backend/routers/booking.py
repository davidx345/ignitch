"""
Booking Management Router
Handles booking creation, payment, and lifecycle management
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, validator
from datetime import datetime, timedelta

from database import get_db
from models import Booking, Campaign, Billboard, BookingStatus, CampaignStatus
from auth_enhanced import get_current_active_user
from services.booking_service import booking_service, BookingConflictError, BookingValidationError

router = APIRouter(prefix="/bookings", tags=["Booking Management"])

# Request/Response Models
class BookingCreateRequest(BaseModel):
    campaign_id: str

class BookingResponse(BaseModel):
    id: int
    booking_id: str
    campaign_id: str
    campaign_title: str
    billboard_id: str
    billboard_name: str
    start_date: datetime
    end_date: datetime
    duration_days: int
    total_amount: float
    status: str
    created_at: datetime
    payment_reference: Optional[str]
    
    class Config:
        from_attributes = True

class BookingDetailResponse(BookingResponse):
    advertiser_id: int
    payment_confirmed_at: Optional[datetime]
    payment_amount: Optional[float]
    activated_at: Optional[datetime]
    completed_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    cancellation_reason: Optional[str]
    refund_amount: Optional[float]

class AvailabilityRequest(BaseModel):
    billboard_id: str
    start_date: datetime
    end_date: datetime
    
    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('End date must be after start date')
        return v

class PaymentConfirmationRequest(BaseModel):
    booking_id: str
    payment_reference: str

@router.post("/create", response_model=Dict[str, Any])
async def create_booking(
    booking_data: BookingCreateRequest,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new booking for an approved campaign"""
    
    try:
        # Verify campaign ownership
        campaign = db.query(Campaign).filter(
            Campaign.campaign_id == booking_data.campaign_id,
            Campaign.advertiser_id == current_user.id
        ).first()
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found or access denied"
            )
        
        if campaign.status != CampaignStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Campaign must be approved to create booking. Current status: {campaign.status.value}"
            )
        
        # Create booking
        result = booking_service.create_booking(
            campaign_id=booking_data.campaign_id,
            db=db
        )
        
        return result
        
    except BookingConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except BookingValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create booking: {str(e)}"
        )

@router.post("/confirm-payment", response_model=Dict[str, Any])
async def confirm_booking_payment(
    payment_data: PaymentConfirmationRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Confirm booking payment and schedule campaign activation"""
    
    try:
        # Verify booking ownership
        booking = db.query(Booking).filter(
            Booking.booking_id == payment_data.booking_id,
            Booking.advertiser_id == current_user.id
        ).first()
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found or access denied"
            )
        
        # Confirm payment
        result = booking_service.confirm_booking_payment(
            booking_id=payment_data.booking_id,
            payment_reference=payment_data.payment_reference,
            db=db
        )
        
        # Schedule activation task if start date is in the future
        if booking.start_date > datetime.utcnow():
            background_tasks.add_task(
                schedule_booking_activation,
                booking.booking_id,
                booking.start_date
            )
        
        # Schedule completion task
        background_tasks.add_task(
            schedule_booking_completion,
            booking.booking_id,
            booking.end_date
        )
        
        return result
        
    except BookingValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to confirm payment: {str(e)}"
        )

@router.get("/", response_model=List[BookingResponse])
async def get_user_bookings(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's bookings"""
    
    query = db.query(Booking).filter(Booking.advertiser_id == current_user.id)
    
    # Filter by status if provided
    if status:
        try:
            status_enum = BookingStatus(status)
            query = query.filter(Booking.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}"
            )
    
    # Join with Campaign and Billboard
    bookings = query.join(Campaign).join(Billboard).offset(skip).limit(limit).all()
    
    # Convert to response format
    result = []
    for booking in bookings:
        result.append(BookingResponse(
            id=booking.id,
            booking_id=booking.booking_id,
            campaign_id=booking.campaign.campaign_id,
            campaign_title=booking.campaign.title,
            billboard_id=booking.billboard.billboard_id,
            billboard_name=booking.billboard.name,
            start_date=booking.start_date,
            end_date=booking.end_date,
            duration_days=booking.duration_days,
            total_amount=booking.total_amount,
            status=booking.status.value,
            created_at=booking.created_at,
            payment_reference=booking.payment_reference
        ))
    
    return result

@router.get("/{booking_id}", response_model=BookingDetailResponse)
async def get_booking_details(
    booking_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get detailed booking information"""
    
    booking = db.query(Booking).filter(
        Booking.booking_id == booking_id,
        Booking.advertiser_id == current_user.id
    ).join(Campaign).join(Billboard).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found or access denied"
        )
    
    return BookingDetailResponse(
        id=booking.id,
        booking_id=booking.booking_id,
        campaign_id=booking.campaign.campaign_id,
        campaign_title=booking.campaign.title,
        billboard_id=booking.billboard.billboard_id,
        billboard_name=booking.billboard.name,
        start_date=booking.start_date,
        end_date=booking.end_date,
        duration_days=booking.duration_days,
        total_amount=booking.total_amount,
        status=booking.status.value,
        created_at=booking.created_at,
        payment_reference=booking.payment_reference,
        advertiser_id=booking.advertiser_id,
        payment_confirmed_at=booking.payment_confirmed_at,
        payment_amount=booking.payment_amount,
        activated_at=booking.activated_at,
        completed_at=booking.completed_at,
        cancelled_at=booking.cancelled_at,
        cancellation_reason=booking.cancellation_reason,
        refund_amount=booking.refund_amount
    )

@router.post("/check-availability", response_model=Dict[str, Any])
async def check_billboard_availability(
    availability_data: AvailabilityRequest,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check billboard availability for specific dates"""
    
    try:
        result = booking_service.get_billboard_availability(
            billboard_id=availability_data.billboard_id,
            start_date=availability_data.start_date,
            end_date=availability_data.end_date,
            db=db
        )
        
        return result
        
    except BookingValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check availability: {str(e)}"
        )

@router.post("/{booking_id}/cancel", response_model=Dict[str, Any])
async def cancel_booking(
    booking_id: str,
    reason: str,
    refund_amount: Optional[float] = None,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel a booking with optional refund"""
    
    try:
        # Verify booking ownership
        booking = db.query(Booking).filter(
            Booking.booking_id == booking_id,
            Booking.advertiser_id == current_user.id
        ).first()
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found or access denied"
            )
        
        # Cancel booking
        result = booking_service.cancel_booking(
            booking_id=booking_id,
            reason=reason,
            db=db,
            refund_amount=refund_amount
        )
        
        return result
        
    except BookingValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel booking: {str(e)}"
        )

@router.post("/{booking_id}/activate", response_model=Dict[str, Any])
async def activate_booking_manually(
    booking_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Manually activate a booking (admin only or owner)"""
    
    try:
        # Verify booking ownership or admin access
        booking = db.query(Booking).filter(
            Booking.booking_id == booking_id
        ).first()
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Check if user is advertiser or admin
        if booking.advertiser_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Activate booking
        result = booking_service.activate_booking(
            booking_id=booking_id,
            db=db
        )
        
        return result
        
    except BookingValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to activate booking: {str(e)}"
        )

# Background task functions
async def schedule_booking_activation(booking_id: str, activation_time: datetime):
    """Background task to activate booking at scheduled time"""
    import asyncio
    from datetime import datetime
    
    # Wait until activation time
    wait_seconds = (activation_time - datetime.utcnow()).total_seconds()
    if wait_seconds > 0:
        await asyncio.sleep(wait_seconds)
    
    # Activate booking
    try:
        with next(get_db()) as db:
            booking_service.activate_booking(booking_id, db)
    except Exception as e:
        # Log error in production
        print(f"Failed to activate booking {booking_id}: {e}")

async def schedule_booking_completion(booking_id: str, completion_time: datetime):
    """Background task to complete booking at scheduled time"""
    import asyncio
    from datetime import datetime
    
    # Wait until completion time
    wait_seconds = (completion_time - datetime.utcnow()).total_seconds()
    if wait_seconds > 0:
        await asyncio.sleep(wait_seconds)
    
    # Complete booking
    try:
        with next(get_db()) as db:
            booking_service.complete_booking(booking_id, db)
    except Exception as e:
        # Log error in production
        print(f"Failed to complete booking {booking_id}: {e}")
