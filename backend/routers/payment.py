"""
Payment Router
Handles payment processing for billboard bookings
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid

from database import get_db
from models import Booking, Payment, PaymentStatus, BookingStatus
from auth_enhanced import get_current_active_user
from services.payment_service import payment_service

router = APIRouter(prefix="/payment", tags=["Payment"])

# Request/Response Models
class PaymentInitRequest(BaseModel):
    booking_id: str
    payment_method: str = "card"  # card, bank_transfer

class PaymentInitResponse(BaseModel):
    success: bool
    payment_url: str
    reference: str
    amount: float

class PaymentCallbackRequest(BaseModel):
    reference: str
    status: str
    transaction_id: str

class PaymentStatusResponse(BaseModel):
    payment_id: str
    status: str
    amount: float
    currency: str
    reference: str
    paid_at: datetime = None

@router.post("/initialize", response_model=PaymentInitResponse)
async def initialize_payment(
    payment_request: PaymentInitRequest,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Initialize payment for a booking"""
    
    # Get booking
    booking = db.query(Booking).filter(
        Booking.booking_id == payment_request.booking_id,
        Booking.advertiser_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if booking is already paid
    if booking.payment_status == PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already paid"
        )
    
    try:
        # Create payment record
        payment_id = f"pay_{str(uuid.uuid4())[:12]}"
        
        payment_record = Payment(
            payment_id=payment_id,
            booking_id=booking.id,
            amount=booking.total_amount,
            currency="NGN",
            payment_method=payment_request.payment_method,
            gateway_provider="paystack",
            status=PaymentStatus.PENDING
        )
        
        db.add(payment_record)
        db.commit()
        db.refresh(payment_record)
        
        # Initialize payment with Paystack
        payment_intent = await payment_service.create_payment_intent(
            booking_id=payment_request.booking_id,
            amount_ngn=booking.total_amount,
            customer_email=current_user.email,
            metadata={
                "payment_id": payment_id,
                "user_id": current_user.id,
                "booking_id": booking.booking_id
            }
        )
        
        # Update payment record with gateway reference
        payment_record.gateway_reference = payment_intent["reference"]
        db.commit()
        
        return PaymentInitResponse(
            success=True,
            payment_url=payment_intent["authorization_url"],
            reference=payment_intent["reference"],
            amount=booking.total_amount
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize payment: {str(e)}"
        )

@router.post("/callback")
async def payment_callback(
    callback_data: PaymentCallbackRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Handle payment callback from Paystack"""
    
    try:
        # Verify payment with Paystack
        verification = await payment_service.verify_payment_completion(callback_data.reference)
        
        # Find payment record
        payment = db.query(Payment).filter(
            Payment.gateway_reference == callback_data.reference
        ).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment record not found"
            )
        
        # Update payment status
        if verification.success:
            payment.status = PaymentStatus.COMPLETED
            payment.processed_at = datetime.utcnow()
            payment.gateway_response = {"verification": verification.dict()}
            
            # Update booking status
            booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
            if booking:
                booking.payment_status = PaymentStatus.COMPLETED
                booking.status = BookingStatus.CONFIRMED
                booking.paid_at = datetime.utcnow()
                booking.confirmed_at = datetime.utcnow()
            
            # Process owner payout in background
            background_tasks.add_task(process_owner_payout, payment.id, db)
            
        else:
            payment.status = PaymentStatus.FAILED
            payment.failure_reason = verification.gateway_response
        
        db.commit()
        
        return {
            "success": verification.success,
            "message": "Payment processed successfully" if verification.success else "Payment failed",
            "reference": callback_data.reference
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing payment callback: {str(e)}"
        )

@router.get("/status/{payment_id}", response_model=PaymentStatusResponse)
async def get_payment_status(
    payment_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get payment status"""
    
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check if user owns this payment
    booking = db.query(Booking).filter(
        Booking.id == payment.booking_id,
        Booking.advertiser_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return PaymentStatusResponse(
        payment_id=payment.payment_id,
        status=payment.status.value,
        amount=payment.amount,
        currency=payment.currency,
        reference=payment.gateway_reference or "",
        paid_at=payment.processed_at
    )

async def process_owner_payout(payment_id: int, db: Session):
    """Background task to process payout to billboard owner"""
    
    try:
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            return
        
        booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
        if not booking:
            return
        
        # Calculate owner payout (80% of booking amount)
        payout_amount = booking.subtotal * 0.8
        
        # TODO: Implement actual payout to billboard owner
        # For now, just mark as pending payout
        payment.owner_payout_amount = payout_amount
        payment.owner_payout_status = "pending"
        
        db.commit()
        
        print(f"💰 Owner payout queued: ₦{payout_amount:,.2f} for booking {booking.booking_id}")
        
    except Exception as e:
        print(f"❌ Error processing owner payout: {e}")

@router.get("/methods")
async def get_payment_methods():
    """Get available payment methods"""
    
    return {
        "methods": [
            {
                "id": "card",
                "name": "Debit/Credit Card",
                "description": "Pay with Visa, Mastercard, or Verve",
                "supported_currencies": ["NGN"],
                "fees": "2.5% + ₦100"
            },
            {
                "id": "bank_transfer",
                "name": "Bank Transfer",
                "description": "Direct bank transfer",
                "supported_currencies": ["NGN"],
                "fees": "₦50"
            },
            {
                "id": "ussd",
                "name": "USSD",
                "description": "Pay with mobile banking USSD",
                "supported_currencies": ["NGN"],
                "fees": "₦50"
            }
        ],
        "currency": "NGN",
        "provider": "Paystack"
    }
