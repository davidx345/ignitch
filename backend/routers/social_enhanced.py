"""
Social Media Management Router
Handles social media accounts, posting, and platform integrations
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import uuid

from database import get_db
from models import User, SocialAccount, Post
from auth_enhanced import get_current_active_user
from services.facebook_service import FacebookService
from services.instagram_service import InstagramService
from services.twitter_service import TwitterService
from services.tiktok_service import TikTokService
import schemas

router = APIRouter()

class SocialAccountResponse(schemas.BaseModel):
    id: str
    platform: str
    username: Optional[str]
    is_active: bool
    followers_count: int
    connected_at: datetime
    last_used: Optional[datetime]

class ConnectPlatformRequest(schemas.BaseModel):
    platform: str
    auth_code: Optional[str] = None
    access_token: Optional[str] = None

class CreatePostRequest(schemas.BaseModel):
    content: str
    platforms: List[str]
    media_url: Optional[str] = None
    scheduled_for: Optional[datetime] = None

@router.get("/accounts", response_model=List[SocialAccountResponse])
async def get_social_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's connected social media accounts"""
    
    accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id
    ).all()
    
    account_responses = []
    for account in accounts:
        account_responses.append(SocialAccountResponse(
            id=account.id,
            platform=account.platform,
            username=account.username,
            is_active=account.is_active,
            followers_count=account.followers_count or 0,
            connected_at=account.connected_at,
            last_used=account.last_used
        ))
    
    return account_responses

@router.post("/auth/{platform}")
async def get_auth_url(
    platform: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get authentication URL for social media platform"""
    
    redirect_uri = "https://ignitch.vercel.app/auth/callback"
    
    if platform == "instagram":
        service = InstagramService()
        auth_url = service.get_auth_url(redirect_uri)
    elif platform == "facebook":
        service = FacebookService()
        auth_url = service.get_auth_url(redirect_uri)
    elif platform == "twitter":
        service = TwitterService()
        auth_url = service.get_auth_url(redirect_uri)
    elif platform == "tiktok":
        service = TikTokService()
        auth_url = service.get_auth_url(redirect_uri)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Platform {platform} not supported"
        )
    
    return {
        "auth_url": auth_url,
        "platform": platform,
        "state": f"user_{current_user.id}_{platform}",
        "redirect_uri": redirect_uri
    }

@router.post("/connect/{platform}")
async def connect_platform(
    platform: str,
    request: ConnectPlatformRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Connect a social media platform"""
    
    try:
        # Get platform service
        if platform == "instagram":
            service = InstagramService()
        elif platform == "facebook":
            service = FacebookService()
        elif platform == "twitter":
            service = TwitterService()
        elif platform == "tiktok":
            service = TikTokService()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Platform {platform} not supported"
            )
        
        # Exchange auth code for access token if needed
        if request.auth_code:
            token_data = await service.exchange_code_for_token(request.auth_code)
            access_token = token_data.get("access_token")
        else:
            access_token = request.access_token
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Access token is required"
            )
        
        # Get user info from platform
        user_info = await service.get_user_info(access_token)
        
        # Check if account already exists
        existing_account = db.query(SocialAccount).filter(
            SocialAccount.user_id == current_user.id,
            SocialAccount.platform == platform,
            SocialAccount.account_id == user_info.get("id")
        ).first()
        
        if existing_account:
            # Update existing account
            existing_account.access_token = access_token
            existing_account.username = user_info.get("username")
            existing_account.followers_count = user_info.get("followers_count", 0)
            existing_account.is_active = True
            existing_account.last_used = datetime.utcnow()
            db.commit()
            account = existing_account
        else:
            # Create new account
            account = SocialAccount(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                platform=platform,
                account_id=user_info.get("id"),
                username=user_info.get("username"),
                access_token=access_token,
                followers_count=user_info.get("followers_count", 0),
                is_active=True
            )
            db.add(account)
            db.commit()
        
        return {
            "success": True,
            "message": f"{platform.capitalize()} account connected successfully",
            "account": {
                "id": account.id,
                "platform": account.platform,
                "username": account.username,
                "followers_count": account.followers_count
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to connect {platform}: {str(e)}"
        )

@router.delete("/accounts/{account_id}")
async def disconnect_account(
    account_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Disconnect a social media account"""
    
    account = db.query(SocialAccount).filter(
        SocialAccount.id == account_id,
        SocialAccount.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Soft delete by setting inactive
    account.is_active = False
    db.commit()
    
    return {
        "success": True,
        "message": f"{account.platform.capitalize()} account disconnected"
    }

@router.post("/post")
async def create_post(
    request: CreatePostRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create and publish a social media post"""
    
    try:
        # Create post record
        post = Post(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            content=request.content,
            platforms=json.dumps(request.platforms),
            media_urls=json.dumps([request.media_url] if request.media_url else []),
            scheduled_for=request.scheduled_for,
            status="scheduled" if request.scheduled_for else "publishing"
        )
        
        db.add(post)
        db.commit()
        db.refresh(post)
        
        if request.scheduled_for:
            # Schedule for later
            return {
                "success": True,
                "message": "Post scheduled successfully",
                "post_id": post.id,
                "scheduled_for": request.scheduled_for
            }
        else:
            # Publish immediately in background
            background_tasks.add_task(
                publish_post_to_platforms,
                post.id,
                request.platforms,
                request.content,
                request.media_url,
                current_user.id,
                db
            )
            
            return {
                "success": True,
                "message": "Post is being published",
                "post_id": post.id
            }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create post: {str(e)}"
        )

async def publish_post_to_platforms(
    post_id: str,
    platforms: List[str],
    content: str,
    media_url: Optional[str],
    user_id: str,
    db: Session
):
    """Background task to publish post to platforms"""
    
    # Get user's accounts
    accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id == user_id,
        SocialAccount.platform.in_(platforms),
        SocialAccount.is_active == True
    ).all()
    
    success_count = 0
    errors = []
    
    for account in accounts:
        try:
            if account.platform == "instagram":
                service = InstagramService()
                result = await service.create_post(
                    access_token=account.access_token,
                    content=content,
                    media_url=media_url
                )
            elif account.platform == "facebook":
                service = FacebookService()
                result = await service.create_post(
                    access_token=account.access_token,
                    content=content,
                    media_url=media_url
                )
            elif account.platform == "twitter":
                service = TwitterService()
                result = await service.create_post(
                    access_token=account.access_token,
                    content=content,
                    media_url=media_url
                )
            elif account.platform == "tiktok":
                service = TikTokService()
                result = await service.create_post(
                    access_token=account.access_token,
                    content=content,
                    media_url=media_url
                )
            
            if result.get("success"):
                success_count += 1
                account.last_used = datetime.utcnow()
            else:
                errors.append(f"{account.platform}: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            errors.append(f"{account.platform}: {str(e)}")
    
    # Update post status
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        if success_count > 0:
            post.status = "published"
            post.published_at = datetime.utcnow()
        else:
            post.status = "failed"
        
        db.commit()

@router.get("/analytics/{platform}")
async def get_platform_analytics(
    platform: str,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get analytics for a specific platform"""
    
    account = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id,
        SocialAccount.platform == platform,
        SocialAccount.is_active == True
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active {platform} account found"
        )
    
    try:
        # Get analytics from platform service
        if platform == "instagram":
            service = InstagramService()
            analytics = await service.get_analytics(account.access_token, days)
        elif platform == "facebook":
            service = FacebookService()
            analytics = await service.get_analytics(account.access_token, days)
        elif platform == "twitter":
            service = TwitterService()
            analytics = await service.get_analytics(account.access_token, days)
        elif platform == "tiktok":
            service = TikTokService()
            analytics = await service.get_analytics(account.access_token, days)
        else:
            # Fallback analytics
            analytics = {
                "followers": account.followers_count or 0,
                "total_posts": 0,
                "total_reach": 0,
                "total_engagement": 0,
                "engagement_rate": 0.0,
                "period": f"Last {days} days"
            }
        
        return {
            "platform": platform,
            "account_username": account.username,
            "analytics": analytics,
            "success": True
        }
        
    except Exception as e:
        # Return fallback analytics if service fails
        return {
            "platform": platform,
            "account_username": account.username,
            "analytics": {
                "followers": account.followers_count or 0,
                "total_posts": 0,
                "total_reach": 0,
                "total_engagement": 0,
                "engagement_rate": 0.0,
                "period": f"Last {days} days",
                "error": "Analytics temporarily unavailable"
            },
            "success": True
        }

@router.post("/accounts/test-connection/{account_id}")
async def test_account_connection(
    account_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Test connection to a social media account"""
    
    account = db.query(SocialAccount).filter(
        SocialAccount.id == account_id,
        SocialAccount.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    try:
        # Test connection based on platform
        if account.platform == "instagram":
            service = InstagramService()
            result = await service.test_connection(account.access_token)
        elif account.platform == "facebook":
            service = FacebookService()
            result = await service.test_connection(account.access_token)
        elif account.platform == "twitter":
            service = TwitterService()
            result = await service.test_connection(account.access_token)
        elif account.platform == "tiktok":
            service = TikTokService()
            result = await service.test_connection(account.access_token)
        else:
            result = {"status": "unknown", "message": "Platform not supported"}
        
        # Update account status based on test
        if result.get("status") == "connected":
            account.is_active = True
            account.last_used = datetime.utcnow()
        else:
            account.is_active = False
        
        db.commit()
        
        return {
            "account_id": account_id,
            "platform": account.platform,
            "status": result.get("status", "error"),
            "message": result.get("message", "Connection test completed")
        }
        
    except Exception as e:
        account.is_active = False
        db.commit()
        
        return {
            "account_id": account_id,
            "platform": account.platform,
            "status": "error",
            "message": f"Connection test failed: {str(e)}"
        }
