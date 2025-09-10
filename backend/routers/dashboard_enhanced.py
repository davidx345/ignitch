"""
Dashboard Router
Provides dashboard statistics and analytics
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

from database import get_db
from models import User, Post, SocialAccount, MediaFile, PerformanceMetric
from auth_enhanced import get_current_active_user
import schemas

router = APIRouter()

class DashboardStats(schemas.BaseModel):
    total_posts: int
    total_reach: int
    avg_engagement: float
    visibility_score: int
    connected_platforms: int
    posts_this_week: int
    scheduled_posts: int

class PlatformPerformance(schemas.BaseModel):
    platform: str
    posts_count: int
    total_reach: int
    avg_engagement: float
    followers_count: int

class QuickAction(schemas.BaseModel):
    title: str
    description: str
    action: str
    icon: str
    priority: str

class DashboardResponse(schemas.BaseModel):
    stats: DashboardStats
    platform_performance: List[PlatformPerformance]
    recent_posts: List[Dict[str, Any]]
    quick_actions: List[QuickAction]
    success: bool
    timestamp: str

@router.get("/overview", response_model=DashboardResponse)
async def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive dashboard overview"""
    
    try:
        # Calculate date ranges
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        
        # Get basic stats
        total_posts = db.query(func.count(Post.id)).filter(
            Post.user_id == current_user.id
        ).scalar() or 0
        
        posts_this_week = db.query(func.count(Post.id)).filter(
            Post.user_id == current_user.id,
            Post.created_at >= week_ago
        ).scalar() or 0
        
        scheduled_posts = db.query(func.count(Post.id)).filter(
            Post.user_id == current_user.id,
            Post.status == "scheduled"
        ).scalar() or 0
        
        # Get connected platforms
        connected_platforms = db.query(func.count(SocialAccount.id)).filter(
            SocialAccount.user_id == current_user.id,
            SocialAccount.is_active == True
        ).scalar() or 0
        
        # Get performance metrics
        total_reach = db.query(func.sum(PerformanceMetric.reach)).filter(
            PerformanceMetric.user_id == current_user.id
        ).scalar() or 0
        
        avg_engagement = db.query(func.avg(PerformanceMetric.engagement_rate)).filter(
            PerformanceMetric.user_id == current_user.id
        ).scalar() or 0.0
        
        # Calculate visibility score
        visibility_score = min(100, max(0, 
            current_user.visibility_score + 
            (connected_platforms * 10) + 
            (total_posts * 2) + 
            int(avg_engagement * 10)
        ))
        
        # Get platform performance
        social_accounts = db.query(SocialAccount).filter(
            SocialAccount.user_id == current_user.id,
            SocialAccount.is_active == True
        ).all()
        
        platform_performance = []
        for account in social_accounts:
            # Get posts count for this platform
            platform_posts = db.query(func.count(Post.id)).filter(
                Post.user_id == current_user.id,
                Post.platforms.contains(f'"{account.platform}"')
            ).scalar() or 0
            
            # Get performance metrics
            platform_reach = db.query(func.sum(PerformanceMetric.reach)).filter(
                PerformanceMetric.user_id == current_user.id,
                PerformanceMetric.platform == account.platform
            ).scalar() or 0
            
            platform_engagement = db.query(func.avg(PerformanceMetric.engagement_rate)).filter(
                PerformanceMetric.user_id == current_user.id,
                PerformanceMetric.platform == account.platform
            ).scalar() or 0.0
            
            platform_performance.append(PlatformPerformance(
                platform=account.platform,
                posts_count=platform_posts,
                total_reach=platform_reach,
                avg_engagement=float(platform_engagement),
                followers_count=account.followers_count or 0
            ))
        
        # Get recent posts
        recent_posts_query = db.query(Post).filter(
            Post.user_id == current_user.id
        ).order_by(desc(Post.created_at)).limit(5).all()
        
        recent_posts = []
        for post in recent_posts_query:
            recent_posts.append({
                "id": post.id,
                "content": post.content[:100] + "..." if len(post.content) > 100 else post.content,
                "platforms": json.loads(post.platforms) if post.platforms else [],
                "status": post.status,
                "created_at": post.created_at.isoformat(),
                "reach": post.reach or 0,
                "engagement": post.engagement or 0.0
            })
        
        # Generate quick actions
        quick_actions = []
        
        if connected_platforms == 0:
            quick_actions.append(QuickAction(
                title="Connect Social Media",
                description="Connect your first social media account",
                action="connect_platform",
                icon="link",
                priority="high"
            ))
        
        if total_posts == 0:
            quick_actions.append(QuickAction(
                title="Create First Post",
                description="Create your first AI-powered content",
                action="create_content",
                icon="edit",
                priority="high"
            ))
        
        if scheduled_posts == 0:
            quick_actions.append(QuickAction(
                title="Schedule Content",
                description="Plan your content calendar",
                action="schedule_post",
                icon="calendar",
                priority="medium"
            ))
        
        # Always show billboard action
        quick_actions.append(QuickAction(
            title="Explore Billboards",
            description="Discover billboard advertising opportunities",
            action="view_billboards",
            icon="billboard",
            priority="medium"
        ))
        
        # Create dashboard stats
        stats = DashboardStats(
            total_posts=total_posts,
            total_reach=total_reach,
            avg_engagement=float(avg_engagement),
            visibility_score=visibility_score,
            connected_platforms=connected_platforms,
            posts_this_week=posts_this_week,
            scheduled_posts=scheduled_posts
        )
        
        return DashboardResponse(
            stats=stats,
            platform_performance=platform_performance,
            recent_posts=recent_posts,
            quick_actions=quick_actions,
            success=True,
            timestamp=now.isoformat()
        )
        
    except Exception as e:
        # Return fallback dashboard if anything fails
        fallback_stats = DashboardStats(
            total_posts=0,
            total_reach=0,
            avg_engagement=0.0,
            visibility_score=current_user.visibility_score or 25,
            connected_platforms=0,
            posts_this_week=0,
            scheduled_posts=0
        )
        
        fallback_actions = [
            QuickAction(
                title="Get Started",
                description="Welcome to AdFlow! Start by connecting your social media accounts",
                action="onboard",
                icon="play",
                priority="high"
            )
        ]
        
        return DashboardResponse(
            stats=fallback_stats,
            platform_performance=[],
            recent_posts=[],
            quick_actions=fallback_actions,
            success=True,
            timestamp=datetime.utcnow().isoformat()
        )

@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get basic dashboard statistics"""
    
    try:
        week_ago = datetime.utcnow() - timedelta(days=7)
        
        stats = {
            "total_posts": db.query(func.count(Post.id)).filter(
                Post.user_id == current_user.id
            ).scalar() or 0,
            
            "scheduled_posts": db.query(func.count(Post.id)).filter(
                Post.user_id == current_user.id,
                Post.status == "scheduled"
            ).scalar() or 0,
            
            "connected_platforms": db.query(func.count(SocialAccount.id)).filter(
                SocialAccount.user_id == current_user.id,
                SocialAccount.is_active == True
            ).scalar() or 0,
            
            "avg_engagement": float(db.query(func.avg(PerformanceMetric.engagement_rate)).filter(
                PerformanceMetric.user_id == current_user.id
            ).scalar() or 0.0)
        }
        
        return {"stats": stats, "success": True}
        
    except Exception as e:
        return {
            "stats": {
                "total_posts": 0,
                "scheduled_posts": 0,
                "connected_platforms": 0,
                "avg_engagement": 0.0
            },
            "success": True,
            "error": f"Using fallback stats: {str(e)}"
        }

@router.get("/analytics")
async def get_analytics(
    period: str = "7d",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed analytics"""
    
    try:
        # Parse period
        if period == "7d":
            days = 7
        elif period == "30d":
            days = 30
        elif period == "90d":
            days = 90
        else:
            days = 7
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get metrics
        metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.user_id == current_user.id,
            PerformanceMetric.data_date >= start_date
        ).all()
        
        # Calculate totals
        total_reach = sum(m.reach for m in metrics)
        total_engagement = sum(m.engagement for m in metrics)
        total_impressions = sum(m.impressions for m in metrics)
        
        # Platform breakdown
        platform_data = {}
        for metric in metrics:
            if metric.platform not in platform_data:
                platform_data[metric.platform] = {
                    "reach": 0,
                    "engagement": 0,
                    "impressions": 0,
                    "posts": 0
                }
            
            platform_data[metric.platform]["reach"] += metric.reach
            platform_data[metric.platform]["engagement"] += metric.engagement
            platform_data[metric.platform]["impressions"] += metric.impressions
            platform_data[metric.platform]["posts"] += 1
        
        return {
            "period": f"{days} days",
            "total_reach": total_reach,
            "total_engagement": total_engagement,
            "total_impressions": total_impressions,
            "platform_breakdown": platform_data,
            "success": True
        }
        
    except Exception as e:
        return {
            "period": f"{period}",
            "total_reach": 0,
            "total_engagement": 0,
            "total_impressions": 0,
            "platform_breakdown": {},
            "success": True,
            "error": f"Using fallback analytics: {str(e)}"
        }

@router.get("/content/recent")
async def get_recent_content(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get recent content"""
    
    try:
        posts = db.query(Post).filter(
            Post.user_id == current_user.id
        ).order_by(desc(Post.created_at)).limit(limit).all()
        
        content = []
        for post in posts:
            content.append({
                "id": post.id,
                "content": post.content,
                "platforms": json.loads(post.platforms) if post.platforms else [],
                "status": post.status,
                "created_at": post.created_at.isoformat(),
                "scheduled_for": post.scheduled_for.isoformat() if post.scheduled_for else None,
                "published_at": post.published_at.isoformat() if post.published_at else None,
                "reach": post.reach or 0,
                "engagement": post.engagement or 0.0
            })
        
        return {
            "content": content,
            "total": len(content),
            "success": True
        }
        
    except Exception as e:
        return {
            "content": [],
            "total": 0,
            "success": True,
            "error": f"Failed to get content: {str(e)}"
        }
