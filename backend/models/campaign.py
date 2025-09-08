"""
Campaign and Booking Database Models
Models for managing advertising campaigns and billboard bookings
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime

Base = declarative_base()

class CampaignStatus(enum.Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval" 
    APPROVED = "approved"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class BookingStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class Campaign(Base):
    __tablename__ = "campaigns"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(String(50), unique=True, index=True)
    advertiser_id = Column(Integer, ForeignKey("users.id"))
    billboard_id = Column(Integer, ForeignKey("billboards.id"))
    
    # Campaign Details
    title = Column(String(200), nullable=False)
    description = Column(Text)
    brand_name = Column(String(100))
    
    # Scheduling
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    duration_days = Column(Integer)
    
    # Content Information
    creative_urls = Column(JSON)  # Array of media file URLs
    content_type = Column(String(50))  # image, video, html
    special_instructions = Column(Text)
    
    # Pricing
    daily_rate = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False)
    owner_payout = Column(Float, nullable=False)
    
    # Status and Workflow
    status = Column(Enum(CampaignStatus), default=CampaignStatus.DRAFT)
    approval_notes = Column(Text)
    
    # Performance Metrics
    total_impressions = Column(Integer, default=0)
    estimated_impressions = Column(Integer)
    click_through_rate = Column(Float)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deployed_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    advertiser = relationship("User", back_populates="campaigns")
    billboard = relationship("Billboard", back_populates="campaigns")
    booking = relationship("Booking", back_populates="campaign", uselist=False)

class Booking(Base):
    __tablename__ = "bookings"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(String(50), unique=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    billboard_id = Column(Integer, ForeignKey("billboards.id"))
    advertiser_id = Column(Integer, ForeignKey("users.id"))
    
    # Booking Details
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    duration_days = Column(Integer, nullable=False)
    
    # Pricing Details
    daily_rate = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    # Payment Information
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_method = Column(String(50))
    payment_reference = Column(String(100))
    paid_at = Column(DateTime(timezone=True))
    
    # Booking Status
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    confirmation_code = Column(String(20))
    
    # Special Requirements
    special_requests = Column(Text)
    cancellation_reason = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    confirmed_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))
    
    # Relationships
    campaign = relationship("Campaign", back_populates="booking")
    billboard = relationship("Billboard", back_populates="bookings")
    advertiser = relationship("User", back_populates="bookings")

class Payment(Base):
    __tablename__ = "payments"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String(50), unique=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    
    # Payment Details
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="NGN")
    payment_method = Column(String(50))  # card, bank_transfer, paystack, etc.
    
    # Payment Gateway Information
    gateway_provider = Column(String(50))  # paystack, stripe, flutterwave
    gateway_reference = Column(String(100))
    gateway_response = Column(JSON)
    
    # Status
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    failure_reason = Column(Text)
    
    # Payout Information (for billboard owners)
    owner_payout_amount = Column(Float)
    owner_payout_status = Column(String(50), default="pending")
    owner_payout_reference = Column(String(100))
    owner_paid_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    processed_at = Column(DateTime(timezone=True))
    
    # Relationships
    booking = relationship("Booking", backref="payment")

class Analytics(Base):
    __tablename__ = "analytics"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    billboard_id = Column(Integer, ForeignKey("billboards.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True)
    
    # Metrics
    date = Column(DateTime(timezone=True), nullable=False)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    interactions = Column(Integer, default=0)
    
    # Environmental Data
    weather_condition = Column(String(50))
    temperature = Column(Float)
    visibility_score = Column(Float)  # 0-100
    
    # Traffic Data
    traffic_density = Column(String(20))  # low, medium, high
    pedestrian_count = Column(Integer)
    vehicle_count = Column(Integer)
    
    # System Health
    billboard_uptime = Column(Float)  # Percentage
    content_load_time = Column(Float)  # Seconds
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Export all models
__all__ = [
    "Campaign",
    "Booking", 
    "Payment",
    "Analytics",
    "CampaignStatus",
    "BookingStatus", 
    "PaymentStatus"
]
