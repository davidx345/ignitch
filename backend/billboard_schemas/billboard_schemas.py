from pydantic import BaseModel, validator, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum

# Enums for type safety
class BillboardType(str, Enum):
    DIGITAL = "digital"
    STATIC = "static"
    LED = "led"
    VINYL = "vinyl"

class Orientation(str, Enum):
    LANDSCAPE = "landscape"
    PORTRAIT = "portrait"
    SQUARE = "square"

class BookingStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"
    FAILED = "failed"

class OwnerStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    SUSPENDED = "suspended"

# Billboard Owner Schemas
class BillboardOwnerOnboarding(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=100)
    contact_person: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., regex=r'^\+?1?\d{9,15}$')
    email: str = Field(..., regex=r'^[^@]+@[^@]+\.[^@]+$')
    address: str = Field(..., min_length=10, max_length=200)
    business_license: Optional[str] = None
    tax_id: Optional[str] = None

class BillboardOwnerProfile(BaseModel):
    id: str
    user_id: str
    company_name: str
    contact_person: str
    phone: str
    email: str
    address: str
    business_license: Optional[str]
    tax_id: Optional[str]
    commission_rate: float
    status: OwnerStatus
    onboarding_completed: bool
    stripe_account_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BankAccountDetails(BaseModel):
    account_holder_name: str
    routing_number: str
    account_number: str
    account_type: str = Field(..., regex=r'^(checking|savings)$')

# Billboard Schemas
class BillboardCreate(BaseModel):
    name: str = Field(..., min_length=5, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    address: str = Field(..., min_length=10, max_length=200)
    city: str = Field(..., min_length=2, max_length=50)
    state: str = Field(..., min_length=2, max_length=50)
    zip_code: str = Field(..., regex=r'^\d{5}(-\d{4})?$')
    country: str = Field(default="US", max_length=2)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    
    # Billboard specifications
    width_feet: float = Field(..., gt=0, le=100)
    height_feet: float = Field(..., gt=0, le=100)
    billboard_type: BillboardType
    orientation: Orientation
    illuminated: bool = False
    double_sided: bool = False
    
    # Pricing
    daily_rate: float = Field(..., gt=0, le=10000)
    weekly_rate: float = Field(..., gt=0, le=50000)
    monthly_rate: float = Field(..., gt=0, le=200000)
    minimum_booking_days: int = Field(default=7, ge=1, le=365)
    
    # Performance metrics
    daily_impressions: int = Field(..., gt=0, le=1000000)
    traffic_count: Optional[int] = Field(None, ge=0)
    demographics: Optional[Dict[str, Any]] = None
    
    # Media
    photos: List[str] = Field(default=[], max_items=10)
    location_photos: List[str] = Field(default=[], max_items=5)
    specs_document: Optional[str] = None
    
    # Settings
    requires_approval: bool = True
    content_restrictions: Optional[List[str]] = None
    blackout_dates: Optional[List[date]] = None

    @validator('weekly_rate')
    def weekly_rate_should_be_discounted(cls, v, values):
        if 'daily_rate' in values and v >= values['daily_rate'] * 7:
            raise ValueError('Weekly rate should be less than 7x daily rate')
        return v

    @validator('monthly_rate')
    def monthly_rate_should_be_discounted(cls, v, values):
        if 'daily_rate' in values and v >= values['daily_rate'] * 30:
            raise ValueError('Monthly rate should be less than 30x daily rate')
        return v

class BillboardUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=5, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    daily_rate: Optional[float] = Field(None, gt=0, le=10000)
    weekly_rate: Optional[float] = Field(None, gt=0, le=50000)
    monthly_rate: Optional[float] = Field(None, gt=0, le=200000)
    minimum_booking_days: Optional[int] = Field(None, ge=1, le=365)
    daily_impressions: Optional[int] = Field(None, gt=0, le=1000000)
    traffic_count: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    requires_approval: Optional[bool] = None
    content_restrictions: Optional[List[str]] = None
    blackout_dates: Optional[List[date]] = None

class BillboardResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    description: Optional[str]
    address: str
    city: str
    state: str
    zip_code: str
    country: str
    latitude: float
    longitude: float
    
    # Specifications
    width_feet: float
    height_feet: float
    billboard_type: BillboardType
    orientation: Orientation
    illuminated: bool
    double_sided: bool
    
    # Pricing
    daily_rate: float
    weekly_rate: float
    monthly_rate: float
    minimum_booking_days: int
    
    # Performance
    daily_impressions: int
    traffic_count: Optional[int]
    demographics: Optional[Dict[str, Any]]
    
    # Media
    photos: List[str]
    location_photos: List[str]
    specs_document: Optional[str]
    
    # Status
    is_active: bool
    requires_approval: bool
    content_restrictions: Optional[List[str]]
    blackout_dates: Optional[List[date]]
    
    # Metadata
    created_at: datetime
    updated_at: datetime
    
    # Calculated fields
    average_rating: Optional[float] = None
    total_reviews: int = 0
    availability_percentage: Optional[float] = None

    class Config:
        from_attributes = True

# Booking Schemas
class BillboardBookingCreate(BaseModel):
    billboard_id: str
    start_date: date
    end_date: date
    content_title: str = Field(..., min_length=5, max_length=100)
    content_description: Optional[str] = Field(None, max_length=500)
    creative_urls: List[str] = Field(..., min_items=1, max_items=5)
    special_requests: Optional[str] = Field(None, max_length=500)

    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('End date must be after start date')
        return v

    @validator('start_date')
    def start_date_in_future(cls, v):
        if v <= date.today():
            raise ValueError('Start date must be in the future')
        return v

class BillboardBookingResponse(BaseModel):
    id: str
    user_id: str
    billboard_id: str
    
    # Booking details
    start_date: date
    end_date: date
    total_days: int
    
    # Content
    content_title: str
    content_description: Optional[str]
    creative_urls: List[str]
    content_approved: bool
    content_approved_at: Optional[datetime]
    
    # Pricing
    daily_rate: float
    subtotal: float
    platform_fee: float
    total_amount: float
    
    # Status
    status: BookingStatus
    payment_status: PaymentStatus
    payment_intent_id: Optional[str]
    
    # Approval
    owner_approved: bool
    owner_approved_at: Optional[datetime]
    admin_approved: bool
    admin_approved_at: Optional[datetime]
    
    # Performance
    impressions_delivered: int
    performance_metrics: Optional[Dict[str, Any]]
    
    # Communication
    special_requests: Optional[str]
    owner_notes: Optional[str]
    admin_notes: Optional[str]
    
    # Metadata
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BookingQuote(BaseModel):
    billboard_id: str
    start_date: date
    end_date: date
    total_days: int
    daily_rate: float
    subtotal: float
    platform_fee: float
    total_amount: float
    available: bool
    conflicts: List[str] = []

# Search and Filter Schemas
class BillboardSearchFilters(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    min_daily_rate: Optional[float] = Field(None, ge=0)
    max_daily_rate: Optional[float] = Field(None, ge=0)
    billboard_type: Optional[BillboardType] = None
    min_impressions: Optional[int] = Field(None, ge=0)
    max_distance_miles: Optional[float] = Field(None, ge=0, le=500)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    available_from: Optional[date] = None
    available_to: Optional[date] = None
    min_rating: Optional[float] = Field(None, ge=1, le=5)
    illuminated: Optional[bool] = None
    
class BillboardSearchResponse(BaseModel):
    billboards: List[BillboardResponse]
    total_count: int
    page: int
    per_page: int
    total_pages: int

# Review Schemas
class BillboardReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = Field(None, max_length=1000)
    would_recommend: bool = True
    location_rating: Optional[int] = Field(None, ge=1, le=5)
    visibility_rating: Optional[int] = Field(None, ge=1, le=5)
    traffic_rating: Optional[int] = Field(None, ge=1, le=5)
    owner_communication_rating: Optional[int] = Field(None, ge=1, le=5)

class BillboardReviewResponse(BaseModel):
    id: str
    booking_id: str
    billboard_id: str
    user_id: str
    rating: int
    review_text: Optional[str]
    would_recommend: bool
    location_rating: Optional[int]
    visibility_rating: Optional[int]
    traffic_rating: Optional[int]
    owner_communication_rating: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics Schemas
class BillboardAnalyticsResponse(BaseModel):
    billboard_id: str
    date: date
    impressions: int
    estimated_reach: int
    traffic_count: int
    website_visits: int
    qr_code_scans: int
    phone_calls: int
    social_media_mentions: int
    weather_conditions: Optional[str]

class BillboardPerformanceReport(BaseModel):
    billboard_id: str
    period_start: date
    period_end: date
    total_impressions: int
    average_daily_impressions: int
    total_bookings: int
    occupancy_rate: float
    average_rating: Optional[float]
    revenue_generated: float

# Payment Schemas
class PaymentIntentCreate(BaseModel):
    booking_id: str
    return_url: str

class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: float
    currency: str = "usd"

# Onboarding Progress
class OnboardingProgress(BaseModel):
    profile_completed: bool
    bank_details_added: bool
    first_billboard_created: bool
    stripe_connected: bool
    verification_completed: bool
    overall_progress: float  # 0-100
