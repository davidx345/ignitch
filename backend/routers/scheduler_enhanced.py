"""
Enhanced Scheduler API - Phase 3
Full calendar scheduling with automation rules
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import uuid
from enum import Enum

# Mock user dependency (replace with actual implementation)
class User:
    def __init__(self, id: str = "user123"):
        self.id = id

def get_current_user() -> User:
    return User()

# Enhanced Enums and Models
class ScheduleStatus(str, Enum):
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"
    DRAFT = "draft"
    CANCELLED = "cancelled"

class ContentType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    CAROUSEL = "carousel"
    STORY = "story"

class AutomationTrigger(str, Enum):
    SCHEDULE = "schedule"
    PERFORMANCE = "performance"
    CONTENT_AGE = "content_age"
    ENGAGEMENT_THRESHOLD = "engagement_threshold"

class AutomationAction(str, Enum):
    REPOST = "repost"
    BOOST = "boost"
    ARCHIVE = "archive"
    CROSS_POST = "cross_post"

# Enhanced Request/Response Models
class SchedulePostRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    platforms: List[str] = Field(..., min_items=1)
    scheduled_for: datetime
    content_type: ContentType = ContentType.TEXT
    media_urls: Optional[List[str]] = None
    hashtags: Optional[List[str]] = None
    force_schedule: bool = False  # Override optimal time warnings

class OptimalTimeSlot(BaseModel):
    platform: str
    day_of_week: int  # 0=Sunday, 6=Saturday
    hour: int
    minute: int
    engagement_rate: float
    confidence_score: float
    audience_size: int

class AutomationRuleCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    trigger: AutomationTrigger
    action: AutomationAction
    platforms: List[str] = Field(..., min_items=1)
    enabled: bool = True
    conditions: Dict[str, Any] = Field(default_factory=dict)
    schedule_config: Optional[Dict[str, Any]] = None

class BulkScheduleRequest(BaseModel):
    posts: List[SchedulePostRequest]
    use_optimal_times: bool = True
    spread_interval_hours: int = Field(default=2, ge=1, le=24)
    start_date: Optional[datetime] = None

class ScheduledPostResponse(BaseModel):
    id: str
    content: str
    platforms: List[str]
    scheduled_for: datetime
    status: ScheduleStatus
    content_type: ContentType
    optimal_time: bool
    engagement_prediction: Optional[float]
    media_urls: List[str]
    hashtags: List[str]
    created_at: datetime
    updated_at: datetime

class CalendarResponse(BaseModel):
    month: int
    year: int
    posts: List[ScheduledPostResponse]
    optimal_slots: List[OptimalTimeSlot]
    automation_summary: Dict[str, int]

# Router setup
router = APIRouter(prefix="/api/scheduler", tags=["Enhanced Scheduler"])

# In-memory storage (replace with database)
scheduled_posts_store: Dict[str, Dict] = {}
automation_rules_store: Dict[str, Dict] = {}
optimal_times_cache: List[OptimalTimeSlot] = []

# API Endpoints

@router.post("/schedule", response_model=ScheduledPostResponse)
async def schedule_post(
    request: SchedulePostRequest,
    current_user: User = Depends(get_current_user)
):
    """Schedule a single post with optimal time validation"""
    
    # Validate scheduled time
    if request.scheduled_for <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scheduled time must be in the future"
        )
    
    # Check if it's an optimal time
    optimal_time = is_optimal_time(request.platforms[0], request.scheduled_for)
    
    # Warn if not optimal time and not forced
    if not optimal_time and not request.force_schedule:
        suggested_times = get_next_optimal_times(request.platforms[0], request.scheduled_for)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "This is not an optimal posting time",
                "suggested_times": suggested_times,
                "use_force_schedule": True
            }
        )
    
    # Create scheduled post
    post_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    post_data = {
        "id": post_id,
        "user_id": current_user.id,
        "content": request.content,
        "platforms": request.platforms,
        "scheduled_for": request.scheduled_for,
        "status": ScheduleStatus.SCHEDULED.value,
        "content_type": request.content_type.value,
        "optimal_time": optimal_time,
        "engagement_prediction": predict_engagement(request.content, request.platforms),
        "media_urls": request.media_urls or [],
        "hashtags": request.hashtags or [],
        "created_at": now,
        "updated_at": now
    }
    
    scheduled_posts_store[post_id] = post_data
    
    return ScheduledPostResponse(**post_data)

@router.post("/bulk-schedule", response_model=List[ScheduledPostResponse])
async def bulk_schedule_posts(
    request: BulkScheduleRequest,
    current_user: User = Depends(get_current_user)
):
    """Schedule multiple posts with intelligent timing distribution"""
    
    if len(request.posts) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 50 posts can be scheduled at once"
        )
    
    scheduled_posts = []
    start_time = request.start_date or datetime.utcnow() + timedelta(hours=1)
    
    for i, post_request in enumerate(request.posts):
        # Calculate optimal scheduling time
        if request.use_optimal_times:
            optimal_time = find_next_optimal_time(
                post_request.platforms[0], 
                start_time + timedelta(hours=i * request.spread_interval_hours)
            )
            post_request.scheduled_for = optimal_time
        else:
            post_request.scheduled_for = start_time + timedelta(hours=i * request.spread_interval_hours)
        
        # Force schedule for bulk operations
        post_request.force_schedule = True
        
        # Schedule the post
        try:
            scheduled_post = await schedule_post(post_request, current_user)
            scheduled_posts.append(scheduled_post)
        except HTTPException as e:
            # Log error but continue with other posts
            continue
    
    return scheduled_posts

@router.get("/calendar/{year}/{month}", response_model=CalendarResponse)
async def get_calendar_data(
    year: int,
    month: int,
    current_user: User = Depends(get_current_user)
):
    """Get calendar view data for a specific month"""
    
    # Validate month/year
    if month < 1 or month > 12 or year < 2020 or year > 2030:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid month or year"
        )
    
    # Get posts for the month
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    
    month_posts = []
    for post_data in scheduled_posts_store.values():
        if (post_data["user_id"] == current_user.id and 
            start_date <= post_data["scheduled_for"] < end_date):
            month_posts.append(ScheduledPostResponse(**post_data))
    
    # Get optimal time slots for the month
    optimal_slots = get_optimal_times_for_month(year, month)
    
    # Get automation summary
    automation_summary = get_automation_summary(current_user.id)
    
    return CalendarResponse(
        month=month,
        year=year,
        posts=month_posts,
        optimal_slots=optimal_slots,
        automation_summary=automation_summary
    )

@router.get("/optimal-times", response_model=List[OptimalTimeSlot])
async def get_optimal_times(
    platform: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get optimal posting times for platforms"""
    
    # Mock optimal times data - replace with ML/analytics
    optimal_times = [
        OptimalTimeSlot(
            platform="instagram",
            day_of_week=2,  # Tuesday
            hour=11,
            minute=0,
            engagement_rate=92.5,
            confidence_score=95.0,
            audience_size=12500
        ),
        OptimalTimeSlot(
            platform="instagram",
            day_of_week=3,  # Wednesday
            hour=14,
            minute=30,
            engagement_rate=89.2,
            confidence_score=88.0,
            audience_size=11800
        ),
        OptimalTimeSlot(
            platform="facebook",
            day_of_week=3,  # Wednesday
            hour=13,
            minute=0,
            engagement_rate=86.1,
            confidence_score=91.0,
            audience_size=8200
        ),
        OptimalTimeSlot(
            platform="twitter",
            day_of_week=2,  # Tuesday
            hour=9,
            minute=0,
            engagement_rate=94.3,
            confidence_score=97.0,
            audience_size=5400
        ),
        OptimalTimeSlot(
            platform="youtube",
            day_of_week=6,  # Saturday
            hour=14,
            minute=0,
            engagement_rate=85.7,
            confidence_score=83.0,
            audience_size=3200
        )
    ]
    
    if platform:
        optimal_times = [ot for ot in optimal_times if ot.platform == platform]
    
    return optimal_times

@router.post("/automation-rules", response_model=Dict[str, str])
async def create_automation_rule(
    request: AutomationRuleCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new automation rule"""
    
    rule_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    rule_data = {
        "id": rule_id,
        "user_id": current_user.id,
        "name": request.name,
        "trigger": request.trigger.value,
        "action": request.action.value,
        "platforms": request.platforms,
        "enabled": request.enabled,
        "conditions": request.conditions,
        "schedule_config": request.schedule_config,
        "created_at": now,
        "updated_at": now,
        "execution_count": 0
    }
    
    automation_rules_store[rule_id] = rule_data
    
    return {"rule_id": rule_id, "message": "Automation rule created successfully"}

@router.get("/automation-rules")
async def get_automation_rules(
    current_user: User = Depends(get_current_user)
):
    """Get user's automation rules"""
    
    user_rules = []
    for rule_data in automation_rules_store.values():
        if rule_data["user_id"] == current_user.id:
            user_rules.append(rule_data)
    
    return {"rules": user_rules}

@router.put("/posts/{post_id}/reschedule")
async def reschedule_post(
    post_id: str,
    new_time: datetime,
    current_user: User = Depends(get_current_user)
):
    """Reschedule an existing post"""
    
    if post_id not in scheduled_posts_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled post not found"
        )
    
    post_data = scheduled_posts_store[post_id]
    
    if post_data["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this post"
        )
    
    if new_time <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New scheduled time must be in the future"
        )
    
    # Update the post
    post_data["scheduled_for"] = new_time
    post_data["updated_at"] = datetime.utcnow()
    post_data["optimal_time"] = is_optimal_time(post_data["platforms"][0], new_time)
    
    return {"message": "Post rescheduled successfully", "new_time": new_time}

@router.delete("/posts/{post_id}")
async def cancel_scheduled_post(
    post_id: str,
    current_user: User = Depends(get_current_user)
):
    """Cancel a scheduled post"""
    
    if post_id not in scheduled_posts_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled post not found"
        )
    
    post_data = scheduled_posts_store[post_id]
    
    if post_data["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this post"
        )
    
    if post_data["status"] == ScheduleStatus.PUBLISHED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel already published post"
        )
    
    # Update status instead of deleting
    post_data["status"] = ScheduleStatus.CANCELLED.value
    post_data["updated_at"] = datetime.utcnow()
    
    return {"message": "Scheduled post cancelled successfully"}

# Helper Functions

def is_optimal_time(platform: str, scheduled_time: datetime) -> bool:
    """Check if the scheduled time is optimal for the platform"""
    # Mock implementation - replace with actual analytics
    optimal_hours = {
        "instagram": [11, 14, 17],
        "facebook": [13, 15, 19],
        "twitter": [9, 12, 15],
        "youtube": [14, 16, 20]
    }
    
    hour = scheduled_time.hour
    return hour in optimal_hours.get(platform, [])

def get_next_optimal_times(platform: str, after_time: datetime) -> List[Dict]:
    """Get next 3 optimal times for a platform"""
    # Mock implementation
    return [
        {
            "time": (after_time + timedelta(hours=2)).isoformat(),
            "engagement_rate": 92.5,
            "confidence": 95
        },
        {
            "time": (after_time + timedelta(hours=6)).isoformat(),
            "engagement_rate": 89.2,
            "confidence": 88
        },
        {
            "time": (after_time + timedelta(days=1, hours=2)).isoformat(),
            "engagement_rate": 94.1,
            "confidence": 96
        }
    ]

def find_next_optimal_time(platform: str, after_time: datetime) -> datetime:
    """Find the next optimal posting time for a platform"""
    # Mock implementation - replace with ML model
    optimal_hours = {
        "instagram": [11, 14, 17],
        "facebook": [13, 15, 19],
        "twitter": [9, 12, 15],
        "youtube": [14, 16, 20]
    }
    
    hours = optimal_hours.get(platform, [14])  # Default to 2 PM
    
    # Find next optimal hour
    current_hour = after_time.hour
    next_hour = None
    
    for hour in hours:
        if hour > current_hour:
            next_hour = hour
            break
    
    if next_hour is None:
        # Next day, first optimal hour
        next_hour = hours[0]
        after_time = after_time + timedelta(days=1)
    
    return after_time.replace(hour=next_hour, minute=0, second=0, microsecond=0)

def predict_engagement(content: str, platforms: List[str]) -> float:
    """Predict engagement rate for content"""
    # Mock prediction - replace with ML model
    base_rate = 75.0
    
    # Simple heuristics
    if len(content) > 100:
        base_rate += 5.0
    if any(emoji in content for emoji in ["🚀", "✨", "💡", "🔥"]):
        base_rate += 8.0
    if len(platforms) > 1:
        base_rate += 3.0
    
    return min(95.0, base_rate)

def get_optimal_times_for_month(year: int, month: int) -> List[OptimalTimeSlot]:
    """Get optimal time slots for a specific month"""
    # Mock implementation - would query analytics data
    return optimal_times_cache

def get_automation_summary(user_id: str) -> Dict[str, int]:
    """Get summary of automation rule executions"""
    user_rules = [r for r in automation_rules_store.values() if r["user_id"] == user_id]
    
    return {
        "total_rules": len(user_rules),
        "active_rules": len([r for r in user_rules if r["enabled"]]),
        "executions_today": sum(r.get("execution_count", 0) for r in user_rules),
        "posts_automated": 15  # Mock data
    }
