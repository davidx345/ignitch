from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date, datetime
import os
import uuid

from database import get_db
from models import User, BillboardOwner, Billboard, BillboardBooking, BillboardReview
from billboard_schemas.billboard_schemas import (
    BillboardOwnerOnboarding, BillboardOwnerProfile, OnboardingProgress,
    BillboardCreate, BillboardUpdate, BillboardResponse, BillboardSearchFilters, BillboardSearchResponse,
    BillboardBookingCreate, BillboardBookingResponse, BookingQuote,
    BillboardReviewCreate, BillboardReviewResponse,
    BillboardAnalyticsResponse, BillboardPerformanceReport,
    PaymentIntentCreate, PaymentIntentResponse
)
from services.billboard_service import BillboardService
from routers.auth import get_current_user

router = APIRouter(prefix="/api/billboards", tags=["billboards"])
security = HTTPBearer()

# Billboard Owner Endpoints
@router.post("/owner/onboard", response_model=BillboardOwnerProfile)
async def onboard_billboard_owner(
    owner_data: BillboardOwnerOnboarding,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Onboard a new billboard owner"""
    service = BillboardService(db)
    owner = await service.create_billboard_owner(current_user.id, owner_data)
    return owner

@router.get("/owner/profile", response_model=BillboardOwnerProfile)
async def get_owner_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get billboard owner profile"""
    owner = db.query(BillboardOwner).filter(
        BillboardOwner.user_id == current_user.id
    ).first()
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard owner profile not found"
        )
    
    return owner

@router.get("/owner/progress", response_model=OnboardingProgress)
async def get_onboarding_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get billboard owner onboarding progress"""
    service = BillboardService(db)
    progress = service.get_onboarding_progress(current_user.id)
    return progress

@router.get("/owner/dashboard")
async def get_owner_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get billboard owner dashboard statistics"""
    owner = db.query(BillboardOwner).filter(
        BillboardOwner.user_id == current_user.id
    ).first()
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard owner profile not found"
        )
    
    service = BillboardService(db)
    stats = service.get_owner_dashboard_stats(owner.id)
    return stats

# Billboard Management Endpoints
@router.post("/", response_model=BillboardResponse)
async def create_billboard(
    billboard_data: BillboardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new billboard listing"""
    owner = db.query(BillboardOwner).filter(
        BillboardOwner.user_id == current_user.id
    ).first()
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard owner profile required"
        )
    
    service = BillboardService(db)
    billboard = await service.create_billboard(owner.id, billboard_data)
    return billboard

@router.get("/my-billboards", response_model=List[BillboardResponse])
async def get_my_billboards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's billboard listings"""
    owner = db.query(BillboardOwner).filter(
        BillboardOwner.user_id == current_user.id
    ).first()
    
    if not owner:
        return []
    
    billboards = db.query(Billboard).filter(
        Billboard.owner_id == owner.id
    ).all()
    
    return billboards

@router.get("/search", response_model=BillboardSearchResponse)
async def search_billboards(
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    min_daily_rate: Optional[float] = Query(None),
    max_daily_rate: Optional[float] = Query(None),
    billboard_type: Optional[str] = Query(None),
    min_impressions: Optional[int] = Query(None),
    max_distance_miles: Optional[float] = Query(None),
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    available_from: Optional[date] = Query(None),
    available_to: Optional[date] = Query(None),
    min_rating: Optional[float] = Query(None),
    illuminated: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search billboards with filters"""
    filters = BillboardSearchFilters(
        city=city,
        state=state,
        min_daily_rate=min_daily_rate,
        max_daily_rate=max_daily_rate,
        billboard_type=billboard_type,
        min_impressions=min_impressions,
        max_distance_miles=max_distance_miles,
        latitude=latitude,
        longitude=longitude,
        available_from=available_from,
        available_to=available_to,
        min_rating=min_rating,
        illuminated=illuminated
    )
    
    service = BillboardService(db)
    result = service.search_billboards(filters, page, per_page)
    return result

@router.get("/{billboard_id}", response_model=BillboardResponse)
async def get_billboard(
    billboard_id: str,
    db: Session = Depends(get_db)
):
    """Get billboard details by ID"""
    billboard = db.query(Billboard).filter(
        Billboard.id == billboard_id,
        Billboard.is_active == True
    ).first()
    
    if not billboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard not found"
        )
    
    return billboard

@router.put("/{billboard_id}", response_model=BillboardResponse)
async def update_billboard(
    billboard_id: str,
    billboard_data: BillboardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update billboard listing"""
    owner = db.query(BillboardOwner).filter(
        BillboardOwner.user_id == current_user.id
    ).first()
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard owner profile not found"
        )
    
    billboard = db.query(Billboard).filter(
        Billboard.id == billboard_id,
        Billboard.owner_id == owner.id
    ).first()
    
    if not billboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard not found"
        )
    
    # Update fields
    update_data = billboard_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(billboard, field, value)
    
    db.commit()
    db.refresh(billboard)
    return billboard

@router.delete("/{billboard_id}")
async def delete_billboard(
    billboard_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete billboard listing"""
    owner = db.query(BillboardOwner).filter(
        BillboardOwner.user_id == current_user.id
    ).first()
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard owner profile not found"
        )
    
    billboard = db.query(Billboard).filter(
        Billboard.id == billboard_id,
        Billboard.owner_id == owner.id
    ).first()
    
    if not billboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard not found"
        )
    
    # Check for active bookings
    active_bookings = db.query(BillboardBooking).filter(
        BillboardBooking.billboard_id == billboard_id,
        BillboardBooking.status.in_(["approved", "active"])
    ).count()
    
    if active_bookings > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete billboard with active bookings"
        )
    
    # Soft delete
    billboard.is_active = False
    db.commit()
    
    return {"message": "Billboard deleted successfully"}

# Photo Upload Endpoints
@router.post("/{billboard_id}/photos")
async def upload_billboard_photo(
    billboard_id: str,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload photos for billboard"""
    owner = db.query(BillboardOwner).filter(
        BillboardOwner.user_id == current_user.id
    ).first()
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard owner profile not found"
        )
    
    billboard = db.query(Billboard).filter(
        Billboard.id == billboard_id,
        Billboard.owner_id == owner.id
    ).first()
    
    if not billboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard not found"
        )
    
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 photos allowed"
        )
    
    uploaded_urls = []
    upload_dir = "uploads/billboards"
    os.makedirs(upload_dir, exist_ok=True)
    
    for file in files:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} is not an image"
            )
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        uploaded_urls.append(f"/uploads/billboards/{unique_filename}")
    
    # Update billboard photos
    current_photos = billboard.photos or []
    billboard.photos = current_photos + uploaded_urls
    db.commit()
    
    return {"uploaded_photos": uploaded_urls}

# Booking Endpoints
@router.post("/bookings/quote", response_model=BookingQuote)
async def get_booking_quote(
    booking_data: BillboardBookingCreate,
    db: Session = Depends(get_db)
):
    """Get booking quote with pricing"""
    service = BillboardService(db)
    quote = await service.create_booking_quote(booking_data)
    return quote

@router.post("/bookings", response_model=BillboardBookingResponse)
async def create_booking(
    booking_data: BillboardBookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new billboard booking"""
    service = BillboardService(db)
    booking = await service.create_booking(current_user.id, booking_data)
    return booking

@router.get("/bookings/my-bookings", response_model=List[BillboardBookingResponse])
async def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's bookings"""
    bookings = db.query(BillboardBooking).filter(
        BillboardBooking.user_id == current_user.id
    ).order_by(BillboardBooking.created_at.desc()).all()
    
    return bookings

@router.get("/bookings/owner-bookings", response_model=List[BillboardBookingResponse])
async def get_owner_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get bookings for billboard owner's properties"""
    owner = db.query(BillboardOwner).filter(
        BillboardOwner.user_id == current_user.id
    ).first()
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard owner profile not found"
        )
    
    billboards = db.query(Billboard).filter(
        Billboard.owner_id == owner.id
    ).all()
    
    billboard_ids = [b.id for b in billboards]
    
    bookings = db.query(BillboardBooking).filter(
        BillboardBooking.billboard_id.in_(billboard_ids)
    ).order_by(BillboardBooking.created_at.desc()).all()
    
    return bookings

@router.get("/bookings/{booking_id}", response_model=BillboardBookingResponse)
async def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get booking details"""
    booking = db.query(BillboardBooking).filter(
        BillboardBooking.id == booking_id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user has access to this booking
    is_customer = booking.user_id == current_user.id
    
    owner = db.query(BillboardOwner).filter(
        BillboardOwner.user_id == current_user.id
    ).first()
    
    is_owner = False
    if owner:
        billboard = db.query(Billboard).filter(
            Billboard.id == booking.billboard_id,
            Billboard.owner_id == owner.id
        ).first()
        is_owner = billboard is not None
    
    if not (is_customer or is_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return booking

@router.put("/bookings/{booking_id}/approve")
async def approve_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve booking (billboard owner only)"""
    owner = db.query(BillboardOwner).filter(
        BillboardOwner.user_id == current_user.id
    ).first()
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard owner profile not found"
        )
    
    booking = db.query(BillboardBooking).filter(
        BillboardBooking.id == booking_id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Verify owner owns the billboard
    billboard = db.query(Billboard).filter(
        Billboard.id == booking.billboard_id,
        Billboard.owner_id == owner.id
    ).first()
    
    if not billboard:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    booking.owner_approved = True
    booking.owner_approved_at = datetime.utcnow()
    
    # If payment is also complete, set to approved
    if booking.payment_status == "paid":
        booking.status = "approved"
    
    db.commit()
    
    return {"message": "Booking approved successfully"}

@router.put("/bookings/{booking_id}/reject")
async def reject_booking(
    booking_id: str,
    reason: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject booking (billboard owner only)"""
    owner = db.query(BillboardOwner).filter(
        BillboardOwner.user_id == current_user.id
    ).first()
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard owner profile not found"
        )
    
    booking = db.query(BillboardBooking).filter(
        BillboardBooking.id == booking_id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Verify owner owns the billboard
    billboard = db.query(Billboard).filter(
        Billboard.id == booking.billboard_id,
        Billboard.owner_id == owner.id
    ).first()
    
    if not billboard:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    booking.status = "rejected"
    booking.owner_notes = reason
    db.commit()
    
    return {"message": "Booking rejected"}

# Payment Endpoints
@router.post("/bookings/{booking_id}/payment", response_model=PaymentIntentResponse)
async def create_payment_intent(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create payment intent for booking"""
    service = BillboardService(db)
    payment_data = await service.create_payment_intent(booking_id, current_user.id)
    return payment_data

@router.post("/webhooks/stripe")
async def handle_stripe_webhook(
    payload: bytes,
    signature: str = None,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events"""
    # Implement Stripe webhook handling
    # This is where you'd confirm payments, handle refunds, etc.
    pass

# Review Endpoints
@router.post("/reviews", response_model=BillboardReviewResponse)
async def create_review(
    review_data: BillboardReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a billboard review"""
    # Verify user has a completed booking for this billboard
    booking = db.query(BillboardBooking).filter(
        BillboardBooking.id == review_data.booking_id,
        BillboardBooking.user_id == current_user.id,
        BillboardBooking.status == "completed"
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Completed booking not found"
        )
    
    # Check if review already exists
    existing_review = db.query(BillboardReview).filter(
        BillboardReview.booking_id == review_data.booking_id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review already exists for this booking"
        )
    
    review = BillboardReview(
        booking_id=review_data.booking_id,
        billboard_id=booking.billboard_id,
        user_id=current_user.id,
        rating=review_data.rating,
        review_text=review_data.review_text,
        would_recommend=review_data.would_recommend,
        location_rating=review_data.location_rating,
        visibility_rating=review_data.visibility_rating,
        traffic_rating=review_data.traffic_rating,
        owner_communication_rating=review_data.owner_communication_rating
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return review

@router.get("/{billboard_id}/reviews", response_model=List[BillboardReviewResponse])
async def get_billboard_reviews(
    billboard_id: str,
    db: Session = Depends(get_db)
):
    """Get reviews for a billboard"""
    reviews = db.query(BillboardReview).filter(
        BillboardReview.billboard_id == billboard_id
    ).order_by(BillboardReview.created_at.desc()).all()
    
    return reviews

# Analytics Endpoints
@router.get("/{billboard_id}/analytics")
async def get_billboard_analytics(
    billboard_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get billboard analytics (owner only)"""
    owner = db.query(BillboardOwner).filter(
        BillboardOwner.user_id == current_user.id
    ).first()
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard owner profile not found"
        )
    
    # Verify owner owns the billboard
    billboard = db.query(Billboard).filter(
        Billboard.id == billboard_id,
        Billboard.owner_id == owner.id
    ).first()
    
    if not billboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard not found"
        )
    
    service = BillboardService(db)
    analytics = service.get_billboard_analytics(billboard_id, start_date, end_date)
    
    return analytics
