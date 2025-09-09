"""
Social Media Management Router - Phase 1 Foundation
Enhanced social media functionality for AdFlow platform
"""

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from typing import List, Optional, Dict, Any, Generic, TypeVar
from datetime import datetime, timedelta
import json
import uuid

# Avoid SQLAlchemy import for now due to version conflict
# from sqlalchemy.orm import Session
# from database import get_db
# from models import User

from middleware.rate_limiting import rate_limit

# Initialize router
router = APIRouter(prefix="/api/social", tags=["social_media"])

# Pydantic models for requests/responses
from pydantic import BaseModel, Field
from enum import Enum

# Generic types for responses
T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    message: Optional[str] = None
    error: Optional[str] = None

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    skip: int
    limit: int
    has_more: bool

# Mock User class for now
class User(BaseModel):
    id: str = "user-123"
    email: str = "user@example.com"
    name: str = "Test User"

class SocialPlatform(str, Enum):
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    TIKTOK = "tiktok"
    LINKEDIN = "linkedin"
    YOUTUBE = "youtube"

class ContentStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"

class BusinessGoal(str, Enum):
    SALES = "sales"
    ENGAGEMENT = "engagement"
    AWARENESS = "awareness"
    FOLLOWERS = "followers"
    WEBSITE_VISITS = "website_visits"
    BRAND_BUILDING = "brand_building"

class ContentType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    CAROUSEL = "carousel"
    STORY = "story"
    REEL = "reel"

# Request/Response Models
class CreateContentRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2200)
    platforms: List[SocialPlatform]
    content_type: ContentType = ContentType.TEXT
    business_goal: BusinessGoal
    hashtags: Optional[List[str]] = []
    mentions: Optional[List[str]] = []
    scheduled_for: Optional[datetime] = None
    ai_prompt: Optional[str] = None

class GenerateContentRequest(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=500)
    business_goal: BusinessGoal
    platforms: List[SocialPlatform]
    content_type: Optional[ContentType] = ContentType.TEXT
    style_preferences: Optional[Dict[str, Any]] = {}

class SocialContentResponse(BaseModel):
    id: str
    user_id: str
    title: Optional[str]
    content: str
    platforms: List[SocialPlatform]
    content_type: ContentType
    status: ContentStatus
    scheduled_for: Optional[datetime]
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    media_urls: List[str]
    thumbnail_url: Optional[str]
    hashtags: List[str]
    mentions: List[str]
    business_goal: BusinessGoal
    ai_generated: bool
    ai_prompt: Optional[str]
    engagement_score: Optional[float]
    predicted_reach: Optional[int]

class ContentAnalyticsResponse(BaseModel):
    content_id: str
    platform: SocialPlatform
    likes: int = 0
    comments: int = 0
    shares: int = 0
    views: int = 0
    clicks: int = 0
    reach: int = 0
    impressions: int = 0
    engagement_rate: float = 0.0
    measured_at: datetime

# Temporary in-memory storage (Phase 1 - will move to database later)
social_content_store: Dict[str, Dict] = {}
content_analytics_store: Dict[str, Dict] = {}

# Mock dependency functions (replace with actual implementations)
def get_db():
    """Mock database session"""
    return None

def get_current_user() -> User:
    """Temporary user getter - integrate with existing auth"""
    # TODO: Integrate with existing authentication system
    return User(
        id="user_123",
        email="user@example.com", 
        name="Test User"
    )

# Mock service classes
class OpenAIService:
    def __init__(self):
        pass
    
    async def generate_social_content(self, prompt: str, platform: str, business_goal: str, tone: str = "professional") -> Dict[str, Any]:
        """Mock AI content generation"""
        return {
            "content": f"AI-generated content for {platform}: {prompt}",
            "hashtags": ["ai", "generated", "content"],
            "engagement_prediction": 85
        }

# API Endpoints

@router.post("/content", response_model=APIResponse[SocialContentResponse])
@rate_limit(category="posting")  # 20 posts per hour
async def create_content(
    request: CreateContentRequest,
    # db: Session = Depends(get_db),  # Skip DB for Phase 1
    current_user: User = Depends(get_current_user)
):
    """Create new social media content"""
    try:
        content_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        # Create content object
        content_data = {
            "id": content_id,
            "user_id": current_user.id,
            "title": None,
            "content": request.content,
            "platforms": [platform.value for platform in request.platforms],
            "content_type": request.content_type.value,
            "status": ContentStatus.DRAFT.value,
            "scheduled_for": request.scheduled_for,
            "published_at": None,
            "created_at": now,
            "updated_at": now,
            "media_urls": [],
            "thumbnail_url": None,
            "hashtags": request.hashtags or [],
            "mentions": request.mentions or [],
            "business_goal": request.business_goal.value,
            "ai_generated": bool(request.ai_prompt),
            "ai_prompt": request.ai_prompt,
            "engagement_score": None,
            "predicted_reach": None
        }
        
        # Store content (temporary storage)
        social_content_store[content_id] = content_data
        
        return APIResponse(
            success=True,
            data=SocialContentResponse(**content_data),
            message="Content created successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create content: {str(e)}"
        )

@router.get("/content", response_model=PaginatedResponse[SocialContentResponse])
async def get_content(
    page: int = 1,
    per_page: int = 20,
    status: Optional[ContentStatus] = None,
    platform: Optional[SocialPlatform] = None,
    business_goal: Optional[BusinessGoal] = None,
    current_user: User = Depends(get_current_user)
):
    """Get user's social media content with filtering"""
    try:
        # Filter content for current user
        user_content = [
            content for content in social_content_store.values()
            if content["user_id"] == current_user.id
        ]
        
        # Apply filters
        if status:
            user_content = [c for c in user_content if c["status"] == status.value]
        
        if platform:
            user_content = [c for c in user_content if platform.value in c["platforms"]]
        
        if business_goal:
            user_content = [c for c in user_content if c["business_goal"] == business_goal.value]
        
        # Sort by created_at descending
        user_content.sort(key=lambda x: x["created_at"], reverse=True)
        
        # Pagination
        total = len(user_content)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_content = user_content[start:end]
        
        return PaginatedResponse(
            success=True,
            data=[SocialContentResponse(**content) for content in paginated_content],
            pagination={
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": (total + per_page - 1) // per_page,
                "has_next": end < total,
                "has_prev": page > 1
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve content: {str(e)}"
        )

@router.post("/content/generate", response_model=APIResponse[List[SocialContentResponse]])
@rate_limit(category="ai")  # 30 AI generations per hour
async def generate_content(
    request: GenerateContentRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate content using AI"""
    try:
        # Initialize OpenAI service
        ai_service = OpenAIService()
        
        # Build AI prompt based on request
        ai_prompt = f"""
        Create social media content for {', '.join([p.value for p in request.platforms])}.
        
        User Request: {request.prompt}
        Business Goal: {request.business_goal.value}
        Content Type: {request.content_type.value if request.content_type else 'text'}
        
        Style Preferences:
        {json.dumps(request.style_preferences, indent=2) if request.style_preferences else 'Default style'}
        
        Generate engaging, platform-optimized content that aligns with the business goal.
        Include relevant hashtags and maintain brand consistency.
        """
        
        # Generate content variations (1-3 variations for Phase 1)
        generated_variations = []
        for i in range(min(3, len(request.platforms))):
            try:
                ai_response = await ai_service.generate_content(
                    prompt=ai_prompt,
                    business_goal=request.business_goal.value,
                    platform=request.platforms[i].value if i < len(request.platforms) else request.platforms[0].value
                )
                
                content_id = str(uuid.uuid4())
                now = datetime.utcnow()
                
                # Extract hashtags from generated content
                hashtags = []
                if ai_response.get("hashtags"):
                    hashtags = ai_response["hashtags"]
                
                content_data = {
                    "id": content_id,
                    "user_id": current_user.id,
                    "title": f"AI Generated Content {i+1}",
                    "content": ai_response.get("content", ""),
                    "platforms": [request.platforms[i].value] if i < len(request.platforms) else [request.platforms[0].value],
                    "content_type": request.content_type.value if request.content_type else ContentType.TEXT.value,
                    "status": ContentStatus.DRAFT.value,
                    "scheduled_for": None,
                    "published_at": None,
                    "created_at": now,
                    "updated_at": now,
                    "media_urls": [],
                    "thumbnail_url": None,
                    "hashtags": hashtags,
                    "mentions": [],
                    "business_goal": request.business_goal.value,
                    "ai_generated": True,
                    "ai_prompt": request.prompt,
                    "engagement_score": ai_response.get("predicted_engagement", 75.0),
                    "predicted_reach": ai_response.get("predicted_reach", 1000)
                }
                
                # Store generated content
                social_content_store[content_id] = content_data
                generated_variations.append(SocialContentResponse(**content_data))
                
            except Exception as gen_error:
                print(f"Failed to generate variation {i+1}: {gen_error}")
                continue
        
        if not generated_variations:
            raise Exception("Failed to generate any content variations")
        
        return APIResponse(
            success=True,
            data=generated_variations,
            message=f"Generated {len(generated_variations)} content variations"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content generation failed: {str(e)}"
        )

@router.get("/content/{content_id}", response_model=APIResponse[SocialContentResponse])
async def get_content_by_id(
    content_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get specific content by ID"""
    try:
        if content_id not in social_content_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found"
            )
        
        content = social_content_store[content_id]
        
        # Check ownership
        if content["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return APIResponse(
            success=True,
            data=SocialContentResponse(**content)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve content: {str(e)}"
        )

@router.put("/content/{content_id}", response_model=APIResponse[SocialContentResponse])
async def update_content(
    content_id: str,
    request: CreateContentRequest,
    current_user: User = Depends(get_current_user)
):
    """Update existing content"""
    try:
        if content_id not in social_content_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found"
            )
        
        content = social_content_store[content_id]
        
        # Check ownership
        if content["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Update content
        content.update({
            "content": request.content,
            "platforms": [platform.value for platform in request.platforms],
            "content_type": request.content_type.value,
            "business_goal": request.business_goal.value,
            "hashtags": request.hashtags or [],
            "mentions": request.mentions or [],
            "scheduled_for": request.scheduled_for,
            "updated_at": datetime.utcnow()
        })
        
        return APIResponse(
            success=True,
            data=SocialContentResponse(**content),
            message="Content updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update content: {str(e)}"
        )

@router.delete("/content/{content_id}", response_model=APIResponse[bool])
async def delete_content(
    content_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete content"""
    try:
        if content_id not in social_content_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found"
            )
        
        content = social_content_store[content_id]
        
        # Check ownership
        if content["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Delete content
        del social_content_store[content_id]
        
        return APIResponse(
            success=True,
            data=True,
            message="Content deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete content: {str(e)}"
        )

@router.get("/analytics/overview", response_model=APIResponse[Dict[str, Any]])
async def get_analytics_overview(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """Get social media analytics overview"""
    try:
        # Get user's content from last N days
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        user_content = [
            content for content in social_content_store.values()
            if (content["user_id"] == current_user.id and 
                content["created_at"] >= cutoff_date)
        ]
        
        # Calculate basic metrics
        total_posts = len(user_content)
        scheduled_posts = len([c for c in user_content if c["status"] == ContentStatus.SCHEDULED.value])
        published_posts = len([c for c in user_content if c["status"] == ContentStatus.PUBLISHED.value])
        ai_generated_posts = len([c for c in user_content if c["ai_generated"]])
        
        # Platform breakdown
        platform_metrics = {}
        for content in user_content:
            for platform in content["platforms"]:
                if platform not in platform_metrics:
                    platform_metrics[platform] = {"posts": 0, "avg_engagement": 0}
                platform_metrics[platform]["posts"] += 1
                if content.get("engagement_score"):
                    platform_metrics[platform]["avg_engagement"] += content["engagement_score"]
        
        # Calculate averages
        for platform in platform_metrics:
            if platform_metrics[platform]["posts"] > 0:
                platform_metrics[platform]["avg_engagement"] /= platform_metrics[platform]["posts"]
        
        analytics_data = {
            "overview": {
                "total_posts": total_posts,
                "scheduled_posts": scheduled_posts,
                "published_posts": published_posts,
                "ai_generated_posts": ai_generated_posts,
                "ai_usage_percentage": (ai_generated_posts / total_posts * 100) if total_posts > 0 else 0
            },
            "platform_metrics": platform_metrics,
            "date_range": {
                "start_date": cutoff_date.isoformat(),
                "end_date": datetime.utcnow().isoformat(),
                "days": days
            }
        }
        
        return APIResponse(
            success=True,
            data=analytics_data
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve analytics: {str(e)}"
        )

# Health check endpoint
@router.get("/health")
async def social_media_health_check():
    """Health check for social media service"""
    return {
        "service": "social_media",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "features": [
            "content_creation",
            "ai_generation", 
            "basic_analytics",
            "multi_platform_support"
        ]
    }
