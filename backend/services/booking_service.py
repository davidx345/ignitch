"""
Booking Management Service
Handles campaign booking, scheduling, and validation
"""

from datetime import datetime, timedelta, time
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from models import Booking, Campaign, Billboard, BookingStatus, CampaignStatus
from services.payment_service import payment_service
from services.billboard_websocket import billboard_ws_manager
from database import get_db

class BookingConflictError(Exception):
    """Raised when booking conflicts with existing bookings"""
    pass

class BookingValidationError(Exception):
    """Raised when booking validation fails"""
    pass

class BookingService:
    """Service for managing campaign bookings and scheduling"""
    
    def __init__(self):
        self.minimum_booking_hours = 24  # Minimum 24 hours advance booking
        self.maximum_booking_days = 365  # Maximum 1 year advance booking
        
    def validate_booking_dates(
        self, 
        start_date: datetime, 
        end_date: datetime,
        billboard_id: int,
        db: Session,
        exclude_booking_id: Optional[int] = None
    ) -> Dict[str, any]:
        """Validate booking dates and check availability"""
        
        now = datetime.utcnow()
        
        # Basic date validation
        if start_date <= now + timedelta(hours=self.minimum_booking_hours):
            raise BookingValidationError(
                f"Booking must be at least {self.minimum_booking_hours} hours in advance"
            )
        
        if end_date <= start_date:
            raise BookingValidationError("End date must be after start date")
        
        if (end_date - start_date).days > self.maximum_booking_days:
            raise BookingValidationError(
                f"Booking cannot exceed {self.maximum_booking_days} days"
            )
        
        # Check for conflicts with existing bookings
        conflicts = self._check_booking_conflicts(
            billboard_id, start_date, end_date, db, exclude_booking_id
        )
        
        if conflicts:
            conflict_details = [
                {
                    "booking_id": conflict.booking_id,
                    "campaign_title": conflict.campaign.title if conflict.campaign else "Unknown",
                    "start_date": conflict.start_date.isoformat(),
                    "end_date": conflict.end_date.isoformat()
                }
                for conflict in conflicts
            ]
            raise BookingConflictError(f"Booking conflicts found: {conflict_details}")
        
        return {
            "valid": True,
            "duration_days": (end_date - start_date).days,
            "duration_hours": (end_date - start_date).total_seconds() / 3600
        }
    
    def _check_booking_conflicts(
        self,
        billboard_id: int,
        start_date: datetime,
        end_date: datetime,
        db: Session,
        exclude_booking_id: Optional[int] = None
    ) -> List[Booking]:
        """Check for conflicting bookings"""
        
        query = db.query(Booking).filter(
            Booking.billboard_id == billboard_id,
            Booking.status.in_([
                BookingStatus.CONFIRMED,
                BookingStatus.ACTIVE,
                BookingStatus.PENDING_PAYMENT
            ]),
            # Check for date overlap
            or_(
                and_(
                    Booking.start_date <= start_date,
                    Booking.end_date > start_date
                ),
                and_(
                    Booking.start_date < end_date,
                    Booking.end_date >= end_date
                ),
                and_(
                    Booking.start_date >= start_date,
                    Booking.end_date <= end_date
                )
            )
        )
        
        if exclude_booking_id:
            query = query.filter(Booking.id != exclude_booking_id)
        
        return query.all()
    
    def create_booking(
        self,
        campaign_id: str,
        db: Session
    ) -> Dict[str, any]:
        """Create a booking for an approved campaign"""
        
        # Get campaign
        campaign = db.query(Campaign).filter(
            Campaign.campaign_id == campaign_id
        ).first()
        
        if not campaign:
            raise BookingValidationError("Campaign not found")
        
        if campaign.status != CampaignStatus.APPROVED:
            raise BookingValidationError("Only approved campaigns can be booked")
        
        # Check if booking already exists
        existing_booking = db.query(Booking).filter(
            Booking.campaign_id == campaign.id
        ).first()
        
        if existing_booking:
            raise BookingValidationError("Booking already exists for this campaign")
        
        try:
            # Validate booking dates
            self.validate_booking_dates(
                campaign.start_date,
                campaign.end_date,
                campaign.billboard_id,
                db
            )
            
            # Create booking
            booking = Booking(
                booking_id=f"BOOK_{campaign.campaign_id}",
                campaign_id=campaign.id,
                billboard_id=campaign.billboard_id,
                advertiser_id=campaign.advertiser_id,
                start_date=campaign.start_date,
                end_date=campaign.end_date,
                duration_days=campaign.duration_days,
                total_amount=campaign.total_amount,
                status=BookingStatus.PENDING_PAYMENT
            )
            
            db.add(booking)
            db.commit()
            db.refresh(booking)
            
            # Initialize payment
            payment_result = payment_service.initialize_payment(
                amount=campaign.total_amount,
                email=campaign.advertiser.email,
                reference=f"booking_{booking.booking_id}",
                metadata={
                    "booking_id": booking.booking_id,
                    "campaign_id": campaign.campaign_id,
                    "billboard_id": campaign.billboard.billboard_id
                }
            )
            
            # Update booking with payment reference
            booking.payment_reference = payment_result["reference"]
            db.commit()
            
            return {
                "success": True,
                "booking_id": booking.booking_id,
                "payment_url": payment_result["authorization_url"],
                "amount": campaign.total_amount,
                "reference": payment_result["reference"]
            }
            
        except Exception as e:
            db.rollback()
            raise BookingValidationError(f"Failed to create booking: {str(e)}")
    
    def confirm_booking_payment(
        self,
        booking_id: str,
        payment_reference: str,
        db: Session
    ) -> Dict[str, any]:
        """Confirm booking payment and activate booking"""
        
        booking = db.query(Booking).filter(
            Booking.booking_id == booking_id
        ).first()
        
        if not booking:
            raise BookingValidationError("Booking not found")
        
        if booking.status != BookingStatus.PENDING_PAYMENT:
            raise BookingValidationError("Booking is not pending payment")
        
        try:
            # Verify payment
            payment_verified = payment_service.verify_payment(payment_reference)
            
            if not payment_verified["success"]:
                raise BookingValidationError("Payment verification failed")
            
            # Update booking status
            booking.status = BookingStatus.CONFIRMED
            booking.payment_confirmed_at = datetime.utcnow()
            booking.payment_amount = payment_verified["amount"] / 100  # Convert from kobo
            
            # Update campaign status
            campaign = booking.campaign
            campaign.status = CampaignStatus.SCHEDULED
            
            db.commit()
            
            return {
                "success": True,
                "booking_id": booking.booking_id,
                "status": "confirmed",
                "campaign_status": "scheduled",
                "start_date": booking.start_date.isoformat(),
                "end_date": booking.end_date.isoformat()
            }
            
        except Exception as e:
            db.rollback()
            raise BookingValidationError(f"Failed to confirm payment: {str(e)}")
    
    def activate_booking(
        self,
        booking_id: str,
        db: Session
    ) -> Dict[str, any]:
        """Activate booking when campaign start time arrives"""
        
        booking = db.query(Booking).filter(
            Booking.booking_id == booking_id
        ).first()
        
        if not booking:
            raise BookingValidationError("Booking not found")
        
        if booking.status != BookingStatus.CONFIRMED:
            raise BookingValidationError("Booking must be confirmed before activation")
        
        now = datetime.utcnow()
        if now < booking.start_date:
            raise BookingValidationError("Cannot activate booking before start date")
        
        try:
            # Update booking status
            booking.status = BookingStatus.ACTIVE
            booking.activated_at = now
            
            # Update campaign status
            campaign = booking.campaign
            campaign.status = CampaignStatus.LIVE
            campaign.deployed_at = now
            
            db.commit()
            
            # Deploy campaign to billboard
            deployment_result = billboard_ws_manager.deploy_campaign(
                booking.billboard.billboard_id,
                {
                    "campaign_id": campaign.campaign_id,
                    "title": campaign.title,
                    "creative_urls": campaign.creative_urls,
                    "content_type": campaign.content_type,
                    "duration_days": campaign.duration_days,
                    "special_instructions": campaign.special_instructions
                }
            )
            
            return {
                "success": True,
                "booking_id": booking.booking_id,
                "status": "active",
                "campaign_status": "live",
                "deployed": deployment_result["success"],
                "activated_at": now.isoformat()
            }
            
        except Exception as e:
            db.rollback()
            raise BookingValidationError(f"Failed to activate booking: {str(e)}")
    
    def complete_booking(
        self,
        booking_id: str,
        db: Session
    ) -> Dict[str, any]:
        """Complete booking when campaign end time arrives"""
        
        booking = db.query(Booking).filter(
            Booking.booking_id == booking_id
        ).first()
        
        if not booking:
            raise BookingValidationError("Booking not found")
        
        if booking.status != BookingStatus.ACTIVE:
            raise BookingValidationError("Booking must be active before completion")
        
        now = datetime.utcnow()
        if now < booking.end_date:
            raise BookingValidationError("Cannot complete booking before end date")
        
        try:
            # Update booking status
            booking.status = BookingStatus.COMPLETED
            booking.completed_at = now
            
            # Update campaign status
            campaign = booking.campaign
            campaign.status = CampaignStatus.COMPLETED
            campaign.completed_at = now
            
            db.commit()
            
            # Remove campaign from billboard
            removal_result = billboard_ws_manager.remove_campaign(
                booking.billboard.billboard_id,
                campaign.campaign_id
            )
            
            # Process payout to billboard owner
            payout_result = payment_service.process_payout(
                recipient_code=booking.billboard.owner.payout_recipient_code,
                amount=campaign.owner_payout,
                reason=f"Campaign payout for {campaign.campaign_id}"
            )
            
            return {
                "success": True,
                "booking_id": booking.booking_id,
                "status": "completed",
                "campaign_status": "completed",
                "removed_from_billboard": removal_result["success"],
                "payout_processed": payout_result["success"],
                "completed_at": now.isoformat()
            }
            
        except Exception as e:
            db.rollback()
            raise BookingValidationError(f"Failed to complete booking: {str(e)}")
    
    def cancel_booking(
        self,
        booking_id: str,
        reason: str,
        db: Session,
        refund_amount: Optional[float] = None
    ) -> Dict[str, any]:
        """Cancel booking with optional refund"""
        
        booking = db.query(Booking).filter(
            Booking.booking_id == booking_id
        ).first()
        
        if not booking:
            raise BookingValidationError("Booking not found")
        
        if booking.status in [BookingStatus.COMPLETED, BookingStatus.CANCELLED]:
            raise BookingValidationError("Cannot cancel completed or already cancelled booking")
        
        try:
            # Update booking status
            booking.status = BookingStatus.CANCELLED
            booking.cancelled_at = datetime.utcnow()
            booking.cancellation_reason = reason
            
            # Update campaign status
            campaign = booking.campaign
            campaign.status = CampaignStatus.CANCELLED
            
            # If booking was active, remove from billboard
            if booking.status == BookingStatus.ACTIVE:
                billboard_ws_manager.remove_campaign(
                    booking.billboard.billboard_id,
                    campaign.campaign_id
                )
            
            # Process refund if specified
            refund_processed = False
            if refund_amount and refund_amount > 0:
                refund_result = payment_service.process_refund(
                    transaction_reference=booking.payment_reference,
                    amount=refund_amount,
                    reason=f"Booking cancellation: {reason}"
                )
                refund_processed = refund_result["success"]
                booking.refund_amount = refund_amount if refund_processed else 0
            
            db.commit()
            
            return {
                "success": True,
                "booking_id": booking.booking_id,
                "status": "cancelled",
                "reason": reason,
                "refund_processed": refund_processed,
                "refund_amount": refund_amount or 0,
                "cancelled_at": booking.cancelled_at.isoformat()
            }
            
        except Exception as e:
            db.rollback()
            raise BookingValidationError(f"Failed to cancel booking: {str(e)}")
    
    def get_billboard_availability(
        self,
        billboard_id: str,
        start_date: datetime,
        end_date: datetime,
        db: Session
    ) -> Dict[str, any]:
        """Get billboard availability for date range"""
        
        billboard = db.query(Billboard).filter(
            Billboard.billboard_id == billboard_id
        ).first()
        
        if not billboard:
            raise BookingValidationError("Billboard not found")
        
        # Get existing bookings in date range
        existing_bookings = db.query(Booking).filter(
            Booking.billboard_id == billboard.id,
            Booking.status.in_([
                BookingStatus.CONFIRMED,
                BookingStatus.ACTIVE,
                BookingStatus.PENDING_PAYMENT
            ]),
            or_(
                and_(
                    Booking.start_date <= end_date,
                    Booking.end_date >= start_date
                )
            )
        ).all()
        
        # Calculate available time slots
        unavailable_periods = [
            {
                "start": booking.start_date.isoformat(),
                "end": booking.end_date.isoformat(),
                "campaign_title": booking.campaign.title if booking.campaign else "Unknown"
            }
            for booking in existing_bookings
        ]
        
        return {
            "billboard_id": billboard_id,
            "billboard_name": billboard.name,
            "requested_period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "is_available": len(existing_bookings) == 0,
            "unavailable_periods": unavailable_periods,
            "daily_rate": billboard.daily_rate,
            "estimated_cost": billboard.daily_rate * (end_date - start_date).days
        }

# Create service instance
booking_service = BookingService()
