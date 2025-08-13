from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    business_name: Optional[str] = None
    business_location: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    is_pro: bool
    visibility_score: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Media schemas
class MediaFileUpload(BaseModel):
    filename: str
    file_type: str
    content_type: str
    alt_text: Optional[str] = None
    tags: Optional[List[str]] = []

class BulkMediaUpload(BaseModel):
    files: List[MediaFileUpload]
    organize_by_date: bool = True
    auto_detect_brand_colors: bool = True
    generate_alt_text: bool = True

class MediaFileResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    brand_colors: Optional[List[str]] = None
    alt_text: Optional[str] = None
    tags: Optional[List[str]] = []
    upload_status: str
    processing_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class BulkUploadResponse(BaseModel):
    upload_id: str
    total_files: int
    successful_uploads: int
    failed_uploads: int
    processing_status: str
    files: List[MediaFileResponse]
    estimated_completion_time: Optional[datetime] = None

# Enhanced AI Content schemas with bulk support
class AIPromptRequest(BaseModel):
    prompt: str
    business_goal: str
    business_location: Optional[str] = None
    media_file_ids: List[str] = []  # Support multiple media files
    content_type: Optional[str] = "mixed"  # single, carousel, story, reel
    target_audience: Optional[str] = None
    brand_voice: Optional[str] = None

class BulkContentGeneration(BaseModel):
    media_file_ids: List[str]
    business_goal: str
    platforms: List[str]
    content_themes: List[str]
    posts_per_media: int = 3  # Generate multiple variations per image
    schedule_automatically: bool = False

class GeneratedContent(BaseModel):
    platform: str
    caption: str
    hashtags: List[str]
    estimated_engagement: float
    estimated_reach: str
    goal_alignment_score: int
    media_file_id: Optional[str] = None
    content_variation: int = 1

class AIContentResponse(BaseModel):
    content: List[GeneratedContent]
    business_impact: Dict[str, Any]
    total_variations: int
    processing_time: float

# Social Media schemas
class SocialAccountConnect(BaseModel):
    platform: str
    access_token: str
    platform_user_id: str

class SocialAccountResponse(BaseModel):
    id: str
    platform: str
    is_active: bool
    followers_count: int
    avg_engagement: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Post schemas
class PostCreate(BaseModel):
    content: str
    media_url: Optional[str] = None
    platforms: Optional[List[str]] = None
    scheduled_for: Optional[datetime] = None
    business_goal: Optional[str] = None

class PostResponse(BaseModel):
    id: str
    content: str
    media_url: Optional[str] = None
    platforms: Optional[List[str]] = None
    status: str
    scheduled_for: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Social Media schemas
class SocialAccountCreate(BaseModel):
    platform: str
    account_id: str
    username: str
    access_token: str

class SocialAccountResponse(BaseModel):
    id: str
    platform: str
    username: Optional[str] = None
    is_active: bool
    connected_at: datetime
    
    class Config:
        from_attributes = True

# Scheduler schemas
class ScheduleOptimization(BaseModel):
    platforms: List[str]
    business_goals: List[str]
    posts_per_week: int = 7
    user_timezone: str = "UTC"

# Dashboard schemas
class DashboardStats(BaseModel):
    total_posts: int
    total_reach: int
    avg_engagement: float
    visibility_score: int
    connected_platforms: int
    posts_this_week: int

class PerformanceMetrics(BaseModel):
    platform: str
    posts_count: int
    total_reach: int
    avg_engagement: float
    top_performing_post: Optional[PostResponse] = None

class DashboardResponse(BaseModel):
    stats: DashboardStats
    platform_performance: List[PerformanceMetrics]
    recent_posts: List[PostResponse]
    visibility_tips: List[str]

class AnalyticsResponse(BaseModel):
    period: str
    total_posts: int
    total_engagement: int
    total_reach: int
    platform_breakdown: Dict[str, Any]
    growth_metrics: Dict[str, Any]

# AI Coach schemas
class CoachingInsightCreate(BaseModel):
    insight_type: str
    title: str
    content: str
    priority: str = "medium"
    action_required: bool = False
    metrics_analyzed: Dict[str, Any] = {}
    confidence_score: float = 0.0
    predicted_impact: str = "medium"

class CoachingInsightResponse(BaseModel):
    id: str
    user_id: str
    insight_type: str
    title: str
    content: str
    priority: str
    action_required: bool
    is_read: bool
    metrics_analyzed: Dict[str, Any]
    confidence_score: float
    predicted_impact: str
    created_at: datetime
    expires_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PerformanceAnalysis(BaseModel):
    overall_score: int
    visibility_score: int
    content_score: int
    engagement_score: int
    growth_rate: float
    goal_progress: Optional[Dict[str, Any]] = None

class WeeklyReport(BaseModel):
    week_start: str
    week_end: str
    posts_published: int
    total_reach: int
    total_engagement: int
    avg_engagement_rate: float
    best_performing_post: Optional[Dict[str, Any]] = None
    improvement_areas: List[str] = []
    next_week_recommendations: List[str] = []

# Enhanced Error Handling schemas
class ErrorResponse(BaseModel):
    error: str
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime
    request_id: Optional[str] = None
    retry_after: Optional[int] = None  # seconds

class ValidationError(BaseModel):
    field: str
    message: str
    value: Any

class ValidationErrorResponse(BaseModel):
    errors: List[ValidationError]
    detail: str = "Validation failed"

# Rate Limiting schemas
class RateLimitInfo(BaseModel):
    limit: int
    remaining: int
    reset_time: datetime
    retry_after: Optional[int] = None

class RateLimitResponse(BaseModel):
    message: str
    rate_limit: RateLimitInfo

# Health Check schemas
class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str
    database: bool
    services: Dict[str, bool]
    uptime: int

# Auto-Pilot schemas with enhanced bulk support
class AutoPilotConfigCreate(BaseModel):
    primary_goal: str
    target_value: int
    deadline: datetime
    content_style: str = "balanced"
    posting_frequency: str = "optimal"
    platforms: List[str] = []
    ai_creativity_level: float = 0.7
    brand_voice: Optional[str] = None
    content_themes: List[str] = []
    exclude_topics: List[str] = []
    min_engagement_rate: float = 0.02
    content_rotation_days: int = 7

class AutoPilotConfigUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    primary_goal: Optional[str] = None
    target_value: Optional[int] = None
    deadline: Optional[datetime] = None
    content_style: Optional[str] = None
    posting_frequency: Optional[str] = None
    platforms: Optional[List[str]] = None
    ai_creativity_level: Optional[float] = None
    brand_voice: Optional[str] = None
    content_themes: Optional[List[str]] = None
    exclude_topics: Optional[List[str]] = None
    min_engagement_rate: Optional[float] = None
    content_rotation_days: Optional[int] = None

class AutoPilotConfigResponse(BaseModel):
    id: str
    user_id: str
    is_enabled: bool
    primary_goal: str
    target_value: int
    deadline: datetime
    content_style: str
    posting_frequency: str
    platforms: List[str]
    ai_creativity_level: float
    brand_voice: Optional[str]
    content_themes: List[str]
    exclude_topics: List[str]
    min_engagement_rate: float
    content_rotation_days: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AutoPilotCalendarEntry(BaseModel):
    id: str
    content: str
    media_suggestions: List[str]
    platforms: List[str]
    content_type: str
    scheduled_for: datetime
    is_published: bool
    predicted_performance: Dict[str, float]
    content_score: float
    optimization_notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AutoPilotStats(BaseModel):
    posts_generated: int
    posts_published: int
    avg_performance_score: float
    goal_progress: float
    time_saved_hours: int
    next_post_time: Optional[datetime]

class GenerateCalendarRequest(BaseModel):
    days_ahead: int = 30
    override_existing: bool = False

class OptimizeStrategyRequest(BaseModel):
    focus_areas: List[str] = []
    performance_threshold: float = 0.5
