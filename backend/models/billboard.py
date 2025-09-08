"""
Billboard Database Models
Core database schema for billboard marketplace platform
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime

Base = declarative_base()

class BillboardStatus(enum.Enum):
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class BillboardType(enum.Enum):
    DIGITAL = "digital"
    STATIC = "static"
    LED = "led"
    VINYL = "vinyl"
    BACKLIT = "backlit"

class BillboardRegistration(Base):
    __tablename__ = "billboard_registrations"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(String(50), unique=True, index=True)
    
    # Company Information
    company_name = Column(String(200), nullable=False)
    contact_person = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    
    # Billboard Details
    billboard_name = Column(String(200), nullable=False)
    description = Column(Text)
    billboard_type = Column(Enum(BillboardType), default=BillboardType.DIGITAL)
    orientation = Column(String(20), default="landscape")  # landscape, portrait, square
    illuminated = Column(Boolean, default=True)
    width_feet = Column(Float, nullable=False)
    height_feet = Column(Float, nullable=False)
    
    # Location Information
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    country = Column(String(50), default="Nigeria")
    zip_code = Column(String(20))
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Pricing Information
    daily_rate = Column(Float, nullable=False)
    weekly_rate = Column(Float)
    monthly_rate = Column(Float)
    daily_impressions = Column(Integer)
    
    # Payment Information
    account_holder_name = Column(String(200), nullable=False)
    routing_number = Column(String(20), nullable=False)  # Bank code
    account_number = Column(String(20), nullable=False)
    account_type = Column(String(20), default="checking")
    
    # Media and Documentation
    photos = Column(JSON)  # Array of photo URLs
    documents = Column(JSON)  # Array of document URLs
    
    # Status and Workflow
    status = Column(Enum(BillboardStatus), default=BillboardStatus.PENDING_REVIEW)
    review_notes = Column(Text)
    approved_by = Column(Integer, ForeignKey("users.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    approved_at = Column(DateTime(timezone=True))
    
    # Relationships
    approved_by_user = relationship("User", back_populates="approved_billboards")

class Billboard(Base):
    __tablename__ = "billboards"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    billboard_id = Column(String(50), unique=True, index=True)  # Public facing ID
    registration_id = Column(Integer, ForeignKey("billboard_registrations.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Basic Information (copied from approved registration)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    billboard_type = Column(Enum(BillboardType))
    orientation = Column(String(20))
    illuminated = Column(Boolean)
    width_feet = Column(Float)
    height_feet = Column(Float)
    
    # Location
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(50))
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Pricing
    daily_rate = Column(Float)
    weekly_rate = Column(Float)
    monthly_rate = Column(Float)
    daily_impressions = Column(Integer)
    
    # Technical Information
    api_key = Column(String(100), unique=True)  # For billboard agent authentication
    last_heartbeat = Column(DateTime(timezone=True))
    is_online = Column(Boolean, default=False)
    agent_version = Column(String(20))
    
    # Media
    photos = Column(JSON)
    
    # Status
    status = Column(Enum(BillboardStatus), default=BillboardStatus.ACTIVE)
    
    # Performance Metrics
    total_bookings = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)
    average_rating = Column(Float)
    total_reviews = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    registration = relationship("BillboardRegistration", backref="approved_billboard")
    owner = relationship("User", back_populates="owned_billboards")
    campaigns = relationship("Campaign", back_populates="billboard")
    bookings = relationship("Booking", back_populates="billboard")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    username = Column(String(50), unique=True, index=True)
    full_name = Column(String(200))
    phone = Column(String(20))
    
    # Authentication
    hashed_password = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # User Roles
    is_admin = Column(Boolean, default=False)
    is_billboard_owner = Column(Boolean, default=False)
    is_advertiser = Column(Boolean, default=True)
    
    # Profile
    company_name = Column(String(200))
    profile_picture = Column(String(500))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    owned_billboards = relationship("Billboard", back_populates="owner")
    approved_billboards = relationship("BillboardRegistration", back_populates="approved_by_user")
    campaigns = relationship("Campaign", back_populates="advertiser")
    bookings = relationship("Booking", back_populates="advertiser")

# Export all models for easy imports
__all__ = [
    "Base",
    "BillboardRegistration", 
    "Billboard", 
    "User",
    "BillboardStatus",
    "BillboardType"
]
