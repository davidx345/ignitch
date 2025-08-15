from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    business_name = Column(String)
    business_location = Column(String)
    timezone = Column(String, default="UTC")
    is_active = Column(Boolean, default=True)
    is_pro = Column(Boolean, default=False)
    
    # Scoring system
    visibility_score = Column(Integer, default=0)
    content_score = Column(Integer, default=0)
    engagement_score = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    posts = relationship("Post", back_populates="user")
    social_accounts = relationship("SocialAccount", back_populates="user")
    media_files = relationship("MediaFile", back_populates="user")
    business_goals = relationship("BusinessGoal", back_populates="user")

class SocialAccount(Base):
    __tablename__ = "social_accounts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    platform = Column(String, nullable=False)  # instagram, facebook, tiktok
    account_id = Column(String, nullable=False)  # Platform-specific user ID
    username = Column(String)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    followers_count = Column(Integer, default=0)
    avg_engagement = Column(Float, default=0.0)
    
    # Connection tracking
    connected_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="social_accounts")

class MediaFile(Base):
    __tablename__ = "media_files"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # image, video
    file_size = Column(Integer)
    content_type = Column(String)  # MIME type
    
    # Enhanced metadata
    brand_colors = Column(JSON)  # Detected brand colors
    alt_text = Column(Text)  # AI-generated or user-provided alt text
    tags = Column(JSON)  # Array of tags
    
    # Processing status
    upload_status = Column(String, default="uploading")  # uploading, completed, failed
    processing_status = Column(String, default="pending")  # pending, processing, completed, failed
    
    # Bulk upload tracking
    upload_batch_id = Column(String)  # Groups files uploaded together
    
        # Dimensions and metadata
    width = Column(Integer)
    height = Column(Integer)
    duration = Column(Float)  # For videos
    file_metadata = Column(JSON)  # EXIF data, etc. (renamed from metadata)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="media_files")

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    media_urls = Column(JSON)  # Array of media URLs (supports multiple)
    platforms = Column(JSON)  # Array of target platforms
    business_goal = Column(String)  # sales, visits, followers, awareness, engagement
    
    # Content metadata
    content_type = Column(String, default="single")  # single, carousel, story, reel
    hashtags = Column(JSON)  # Array of hashtags
    mentions = Column(JSON)  # Array of mentions
    
    # Scheduling
    scheduled_for = Column(DateTime)
    published_at = Column(DateTime)
    status = Column(String, default="draft")  # draft, scheduled, publishing, published, failed, cancelled
    
    # Performance metrics (populated after publishing)
    reach = Column(Integer, default=0)
    engagement = Column(Float, default=0.0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    
    # AI and automation tracking
    created_by_autopilot = Column(Boolean, default=False)
    ai_generated = Column(Boolean, default=False)
    content_theme = Column(String)  # For autopilot categorization
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="posts")

class BusinessGoal(Base):
    __tablename__ = "business_goals"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    goal_type = Column(String, nullable=False)  # sales, visits, followers, awareness, engagement
    target_value = Column(Integer, nullable=False)
    current_value = Column(Integer, default=0)
    deadline = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="business_goals")

class CoachingInsight(Base):
    __tablename__ = "coaching_insights"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    insight_type = Column(String, nullable=False)  # performance, optimization, strategy
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String, default="medium")  # low, medium, high, critical
    action_required = Column(Boolean, default=False)
    is_read = Column(Boolean, default=False)
    
    # Metadata
    metrics_analyzed = Column(JSON)  # Which metrics triggered this insight
    confidence_score = Column(Float, default=0.0)
    predicted_impact = Column(String)  # low, medium, high
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime)
    
    # Relationships
    user = relationship("User")

class AutoPilotConfig(Base):
    __tablename__ = "autopilot_configs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    is_enabled = Column(Boolean, default=False)
    
    # Goal settings
    primary_goal = Column(String, nullable=False)  # sales, visits, followers, awareness, engagement
    target_value = Column(Integer, nullable=False)
    deadline = Column(DateTime)
    
    # Content preferences
    content_style = Column(String, default="balanced")  # casual, professional, creative, balanced
    posting_frequency = Column(String, default="optimal")  # low, medium, high, optimal
    platforms = Column(JSON)  # Array of enabled platforms
    
    # Advanced settings
    ai_creativity_level = Column(Float, default=0.7)  # 0-1 scale
    brand_voice = Column(Text)
    content_themes = Column(JSON)  # Array of themes/topics
    exclude_topics = Column(JSON)  # Array of topics to avoid
    
    # Performance thresholds
    min_engagement_rate = Column(Float, default=0.02)
    content_rotation_days = Column(Integer, default=7)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    calendar_entries = relationship("AutoPilotCalendar", back_populates="config")

class AutoPilotCalendar(Base):
    __tablename__ = "autopilot_calendar"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    config_id = Column(String, ForeignKey("autopilot_configs.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Content details
    content = Column(Text, nullable=False)
    media_suggestions = Column(JSON)  # Suggested media types/styles
    platforms = Column(JSON)  # Target platforms for this post
    content_type = Column(String)  # educational, promotional, engagement, trending
    
    # Scheduling
    scheduled_for = Column(DateTime, nullable=False)
    is_published = Column(Boolean, default=False)
    post_id = Column(String, ForeignKey("posts.id"))  # Link to actual post when published
    
    # AI analysis
    predicted_performance = Column(JSON)  # Performance predictions per platform
    content_score = Column(Float, default=0.0)
    optimization_notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    published_at = Column(DateTime)
    
    # Relationships
    config = relationship("AutoPilotConfig", back_populates="calendar_entries")
    user = relationship("User")
    post = relationship("Post")

class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    post_id = Column(String, ForeignKey("posts.id"))
    platform = Column(String, nullable=False)
    
    # Core metrics
    impressions = Column(Integer, default=0)
    reach = Column(Integer, default=0)
    engagement = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    
    # Calculated metrics
    engagement_rate = Column(Float, default=0.0)
    click_through_rate = Column(Float, default=0.0)
    save_rate = Column(Float, default=0.0)
    
    # Time tracking
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    data_date = Column(DateTime, nullable=False)  # The date this data represents
    
    # Relationships
    user = relationship("User")
    post = relationship("Post")

class BulkUploadBatch(Base):
    __tablename__ = "bulk_upload_batches"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    batch_name = Column(String)
    total_files = Column(Integer, default=0)
    successful_uploads = Column(Integer, default=0)
    failed_uploads = Column(Integer, default=0)
    processing_status = Column(String, default="pending")  # pending, processing, completed, failed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User")

class AutopilotRule(Base):
    __tablename__ = "autopilot_rules"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    rule_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Posting configuration
    posting_frequency = Column(Integer, default=1)  # posts per day
    content_themes = Column(JSON)  # Array of content themes
    target_platforms = Column(JSON)  # Array of platforms
    
    # Timing configuration
    business_hours_only = Column(Boolean, default=True)
    start_time = Column(String, default="09:00")
    end_time = Column(String, default="17:00")
    exclude_weekends = Column(Boolean, default=False)
    
    # Content configuration
    content_style = Column(String, default="professional")
    hashtag_strategy = Column(String, default="trending")
    approval_required = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")

class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    platforms = Column(JSON)  # Array of target platforms
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String, default="pending")  # pending, approved, cancelled, published, failed
    
    # Content details
    media_urls = Column(JSON)  # Array of media URLs
    hashtags = Column(JSON)  # Array of hashtags
    content_theme = Column(String)
    
    # Approval workflow
    approval_required = Column(Boolean, default=False)
    approved_by = Column(String)
    approved_at = Column(DateTime)
    
    # Automation tracking
    created_by_autopilot = Column(Boolean, default=False)
    autopilot_rule_id = Column(String, ForeignKey("autopilot_rules.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    published_at = Column(DateTime)
    
    # Relationships
    user = relationship("User")
    autopilot_rule = relationship("AutopilotRule")

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    level = Column(String, nullable=False)  # INFO, WARNING, ERROR, CRITICAL
    category = Column(String, nullable=False)  # auth, upload, posting, ai, analytics
    message = Column(Text, nullable=False)
    details = Column(JSON)  # Additional context
    
    # Error tracking
    error_code = Column(String)
    stack_trace = Column(Text)
    request_id = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")

class RateLimit(Base):
    __tablename__ = "rate_limits"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    endpoint = Column(String, nullable=False)
    requests_count = Column(Integer, default=0)
    window_start = Column(DateTime, nullable=False)
    window_end = Column(DateTime, nullable=False)
    limit_exceeded = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")


# Billboard Models
class BillboardOwner(Base):
    __tablename__ = "billboard_owners"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    company_name = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    address = Column(String, nullable=False)
    business_license = Column(String)  # Document URL
    tax_id = Column(String)
    bank_account_details = Column(JSON)  # Encrypted bank details for payments
    commission_rate = Column(Float, default=0.12)  # 12% commission
    status = Column(String, default="pending")  # pending, approved, suspended
    onboarding_completed = Column(Boolean, default=False)
    stripe_account_id = Column(String)  # Stripe Connect account
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="billboard_owner")
    billboards = relationship("Billboard", back_populates="owner")


class Billboard(Base):
    __tablename__ = "billboards"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("billboard_owners.id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    country = Column(String, default="US")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Billboard specifications
    width_feet = Column(Float, nullable=False)
    height_feet = Column(Float, nullable=False)
    billboard_type = Column(String, nullable=False)  # digital, static, led, vinyl
    orientation = Column(String, nullable=False)  # landscape, portrait, square
    illuminated = Column(Boolean, default=False)
    double_sided = Column(Boolean, default=False)
    
    # Pricing
    daily_rate = Column(Float, nullable=False)
    weekly_rate = Column(Float, nullable=False)
    monthly_rate = Column(Float, nullable=False)
    minimum_booking_days = Column(Integer, default=7)
    
    # Performance metrics
    daily_impressions = Column(Integer, nullable=False)
    traffic_count = Column(Integer)  # Daily vehicle count
    demographics = Column(JSON)  # Age, income, etc.
    
    # Media and documentation
    photos = Column(JSON)  # Array of photo URLs
    location_photos = Column(JSON)  # Photos showing billboard location
    specs_document = Column(String)  # Technical specifications PDF
    
    # Availability and status
    is_active = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=True)
    content_restrictions = Column(JSON)  # Restricted content types
    
    # Booking calendar
    availability_calendar = Column(JSON)  # Available dates
    blackout_dates = Column(JSON)  # Unavailable dates
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("BillboardOwner", back_populates="billboards")
    bookings = relationship("BillboardBooking", back_populates="billboard")
    reviews = relationship("BillboardReview", back_populates="billboard")


class BillboardBooking(Base):
    __tablename__ = "billboard_bookings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    billboard_id = Column(String, ForeignKey("billboards.id"))
    
    # Booking details
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_days = Column(Integer, nullable=False)
    
    # Creative content
    content_title = Column(String, nullable=False)
    content_description = Column(Text)
    creative_urls = Column(JSON)  # Array of creative file URLs
    content_approved = Column(Boolean, default=False)
    content_approved_at = Column(DateTime)
    
    # Pricing and payment
    daily_rate = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    # Status tracking
    status = Column(String, default="pending")  # pending, approved, rejected, active, completed, cancelled
    payment_status = Column(String, default="pending")  # pending, paid, refunded, failed
    payment_intent_id = Column(String)  # Stripe payment intent ID
    
    # Approval workflow
    owner_approved = Column(Boolean, default=False)
    owner_approved_at = Column(DateTime)
    admin_approved = Column(Boolean, default=False)
    admin_approved_at = Column(DateTime)
    
    # Performance tracking
    impressions_delivered = Column(Integer, default=0)
    performance_metrics = Column(JSON)
    
    # Communication
    special_requests = Column(Text)
    owner_notes = Column(Text)
    admin_notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    billboard = relationship("Billboard", back_populates="bookings")
    reviews = relationship("BillboardReview", back_populates="booking")


class BillboardReview(Base):
    __tablename__ = "billboard_reviews"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("billboard_bookings.id"))
    billboard_id = Column(String, ForeignKey("billboards.id"))
    user_id = Column(String, ForeignKey("users.id"))
    
    rating = Column(Integer, nullable=False)  # 1-5 stars
    review_text = Column(Text)
    would_recommend = Column(Boolean, default=True)
    
    # Review categories
    location_rating = Column(Integer)  # 1-5
    visibility_rating = Column(Integer)  # 1-5
    traffic_rating = Column(Integer)  # 1-5
    owner_communication_rating = Column(Integer)  # 1-5
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    booking = relationship("BillboardBooking", back_populates="reviews")
    billboard = relationship("Billboard", back_populates="reviews")
    user = relationship("User")


class BillboardAnalytics(Base):
    __tablename__ = "billboard_analytics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    billboard_id = Column(String, ForeignKey("billboards.id"))
    booking_id = Column(String, ForeignKey("billboard_bookings.id"), nullable=True)
    
    date = Column(DateTime, nullable=False)
    impressions = Column(Integer, default=0)
    estimated_reach = Column(Integer, default=0)
    traffic_count = Column(Integer, default=0)
    weather_conditions = Column(String)
    
    # Attribution tracking
    website_visits = Column(Integer, default=0)
    qr_code_scans = Column(Integer, default=0)
    phone_calls = Column(Integer, default=0)
    social_media_mentions = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# Update User model to include billboard owner relationship
User.billboard_owner = relationship("BillboardOwner", back_populates="user", uselist=False)
