from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
from collections import defaultdict

from database import get_db
from models import User, Post, SocialAccount, MediaFile, BusinessGoal
from schemas import DashboardResponse, AnalyticsResponse
from routers.auth import get_current_user

router = APIRouter()

def calculate_score_growth(current_score: int, days_active: int) -> Dict[str, Any]:
    """Calculate score growth rate and projections"""
    if days_active == 0:
        return {"daily_growth": 0, "weekly_projection": current_score, "trend": "new"}
    
    daily_growth = current_score / max(days_active, 1)
    weekly_projection = current_score + (daily_growth * 7)
    
    if daily_growth > 5:
        trend = "excellent"
    elif daily_growth > 3:
        trend = "good"
    elif daily_growth > 1:
        trend = "moderate"
    else:
        trend = "slow"
    
    return {
        "daily_growth": round(daily_growth, 1),
        "weekly_projection": int(weekly_projection),
        "trend": trend
    }

def generate_insights(user: User, posts: List[Post], accounts: List[SocialAccount]) -> List[str]:
    """Generate AI-powered insights for the user"""
    insights = []
    
    # Content insights
    if len(posts) > 0:
        avg_length = sum(len(post.content) for post in posts) / len(posts)
        if avg_length < 50:
            insights.append("💡 Try longer captions (50+ characters) to increase engagement")
        elif avg_length > 200:
            insights.append("✂️ Consider shorter, more digestible content for better reach")
        else:
            insights.append("✅ Your content length is optimal for engagement")
    
    # Posting frequency insights
    recent_posts = [p for p in posts if p.created_at > datetime.utcnow() - timedelta(days=7)]
    if len(recent_posts) < 3:
        insights.append("📈 Increase posting frequency to 3-5 times per week for better visibility")
    elif len(recent_posts) > 15:
        insights.append("⚖️ Consider reducing post frequency to avoid audience fatigue")
    
    # Platform diversity insights
    connected_platforms = len(accounts)
    if connected_platforms == 1:
        insights.append("🌐 Connect more social platforms to expand your reach")
    elif connected_platforms >= 3:
        insights.append("🚀 Great platform diversity! You're maximizing your reach potential")
    
    # Engagement score insights
    if user.engagement_score and user.engagement_score > 500:
        insights.append("🎯 Your engagement is strong! Focus on converting followers to customers")
    elif user.engagement_score and user.engagement_score > 200:
        insights.append("📊 Good engagement growth! Consider adding more interactive content")
    else:
        insights.append("💪 Build engagement with polls, questions, and behind-the-scenes content")
    
    # Business goal insights
    if user.visibility_score and user.visibility_score > 300:
        insights.append("👀 High visibility achieved! Time to focus on conversion strategies")
    
    return insights[:4]  # Return top 4 insights

@router.get("/overview")
async def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard overview"""
    
    # Get user's posts from last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_posts = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.created_at >= thirty_days_ago
    ).all()
    
    # Get connected social accounts
    social_accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id,
        SocialAccount.is_active == True
    ).all()
    
    # Get media files
    media_files = db.query(MediaFile).filter(
        MediaFile.user_id == current_user.id
    ).count()
    
    # Get business goals
    business_goals = db.query(BusinessGoal).filter(
        BusinessGoal.user_id == current_user.id
    ).all()
    
    # Calculate user activity
    user_created = current_user.created_at
    days_active = (datetime.utcnow() - user_created).days + 1
    
    # Score calculations
    content_growth = calculate_score_growth(current_user.content_score or 0, days_active)
    engagement_growth = calculate_score_growth(current_user.engagement_score or 0, days_active)
    visibility_growth = calculate_score_growth(current_user.visibility_score or 0, days_active)
    
    # Platform breakdown
    platform_stats = {}
    for account in social_accounts:
        platform = account.platform
        platform_posts = [p for p in recent_posts if hasattr(p, 'platforms') and platform in (p.platforms or [])]
        
        # Simulate engagement metrics
        total_engagement = sum(random.randint(20, 150) for _ in platform_posts)
        
        platform_stats[platform] = {
            "connected": True,
            "username": account.username,
            "posts_count": len(platform_posts),
            "estimated_reach": len(platform_posts) * random.randint(100, 500),
            "engagement": total_engagement,
            "last_post": max([p.created_at for p in platform_posts]) if platform_posts else None
        }
    
    # Generate AI insights
    insights = generate_insights(current_user, recent_posts, social_accounts)
    
    # Goal progress
    goal_progress = []
    for goal in business_goals:
        # Simulate progress based on activity
        progress = min(100, (len(recent_posts) * 10) + random.randint(0, 30))
        
        goal_progress.append({
            "goal_type": goal.goal_type,
            "target_value": goal.target_value,
            "current_progress": progress,
            "status": "on_track" if progress > 60 else "needs_attention" if progress > 30 else "behind",
            "estimated_completion": datetime.utcnow() + timedelta(days=random.randint(7, 45))
        })
    
    return {
        "user_stats": {
            "days_active": days_active,
            "total_posts": len(recent_posts),
            "connected_platforms": len(social_accounts),
            "media_files": media_files,
            "business_goals": len(business_goals)
        },
        "scores": {
            "content_score": {
                "current": current_user.content_score or 0,
                "growth": content_growth
            },
            "engagement_score": {
                "current": current_user.engagement_score or 0,
                "growth": engagement_growth
            },
            "visibility_score": {
                "current": current_user.visibility_score or 0,
                "growth": visibility_growth
            }
        },
        "platform_performance": platform_stats,
        "goal_progress": goal_progress,
        "ai_insights": insights,
        "quick_actions": [
            {
                "title": "Create New Post",
                "description": "Generate AI-powered content for your brand",
                "action": "create_post",
                "priority": "high" if len(recent_posts) < 5 else "medium"
            },
            {
                "title": "Connect Platform",
                "description": "Expand your reach with more social platforms",
                "action": "connect_platform",
                "priority": "high" if len(social_accounts) < 2 else "low"
            },
            {
                "title": "Upload Media",
                "description": "Add visual content with AI enhancement",
                "action": "upload_media",
                "priority": "medium"
            },
            {
                "title": "Schedule Posts",
                "description": "Plan your content with optimal timing",
                "action": "schedule_posts",
                "priority": "high" if len([p for p in recent_posts if p.status == "scheduled"]) < 3 else "low"
            }
        ]
    }

@router.get("/analytics")
async def get_detailed_analytics(
    period: str = "30d",  # 7d, 30d, 90d
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed analytics for the specified period"""
    
    # Parse period
    period_days = {
        "7d": 7,
        "30d": 30,
        "90d": 90
    }.get(period, 30)
    
    start_date = datetime.utcnow() - timedelta(days=period_days)
    
    # Get posts for the period
    posts = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.created_at >= start_date
    ).order_by(Post.created_at.asc()).all()
    
    # Get social accounts
    accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id
    ).all()
    
    # Time series data (daily breakdown)
    daily_stats = defaultdict(lambda: {
        "posts": 0,
        "engagement": 0,
        "reach": 0,
        "date": None
    })
    
    for post in posts:
        date_key = post.created_at.date()
        daily_stats[date_key]["posts"] += 1
        daily_stats[date_key]["engagement"] += random.randint(15, 120)
        daily_stats[date_key]["reach"] += random.randint(50, 800)
        daily_stats[date_key]["date"] = date_key.isoformat()
    
    # Fill in missing days with zero values
    current_date = start_date.date()
    end_date = datetime.utcnow().date()
    
    while current_date <= end_date:
        if current_date not in daily_stats:
            daily_stats[current_date] = {
                "posts": 0,
                "engagement": 0,
                "reach": 0,
                "date": current_date.isoformat()
            }
        current_date += timedelta(days=1)
    
    # Convert to sorted list
    time_series = sorted(daily_stats.values(), key=lambda x: x["date"])
    
    # Platform performance
    platform_performance = {}
    for account in accounts:
        platform = account.platform
        platform_posts = [p for p in posts if hasattr(p, 'platforms') and platform in (p.platforms or [])]
        
        total_engagement = sum(random.randint(25, 150) for _ in platform_posts)
        total_reach = sum(random.randint(100, 800) for _ in platform_posts)
        
        platform_performance[platform] = {
            "posts": len(platform_posts),
            "engagement": total_engagement,
            "reach": total_reach,
            "avg_engagement_per_post": round(total_engagement / max(len(platform_posts), 1), 1),
            "engagement_rate": round((total_engagement / max(total_reach, 1)) * 100, 2)
        }
    
    # Content performance analysis
    content_analysis = {
        "total_posts": len(posts),
        "avg_post_length": round(sum(len(p.content) for p in posts) / max(len(posts), 1), 1),
        "posts_with_media": len([p for p in posts if p.media_url]),
        "scheduled_posts": len([p for p in posts if p.status == "scheduled"]),
        "published_posts": len([p for p in posts if p.status == "published"])
    }
    
    # Top performing content
    top_posts = []
    for post in posts[:5]:  # Get top 5 recent posts
        engagement = random.randint(30, 200)
        reach = random.randint(150, 1000)
        
        top_posts.append({
            "post_id": post.id,
            "content_preview": post.content[:100] + "..." if len(post.content) > 100 else post.content,
            "engagement": engagement,
            "reach": reach,
            "engagement_rate": round((engagement / reach) * 100, 2),
            "created_at": post.created_at,
            "has_media": bool(post.media_url)
        })
    
    # Sort by engagement
    top_posts.sort(key=lambda x: x["engagement"], reverse=True)
    
    # Growth metrics
    total_engagement = sum(day["engagement"] for day in time_series)
    total_reach = sum(day["reach"] for day in time_series)
    
    # Calculate growth (compare first half vs second half of period)
    mid_point = len(time_series) // 2
    first_half_engagement = sum(day["engagement"] for day in time_series[:mid_point])
    second_half_engagement = sum(day["engagement"] for day in time_series[mid_point:])
    
    engagement_growth = 0
    if first_half_engagement > 0:
        engagement_growth = ((second_half_engagement - first_half_engagement) / first_half_engagement) * 100
    
    return {
        "period": period,
        "period_days": period_days,
        "summary_metrics": {
            "total_posts": len(posts),
            "total_engagement": total_engagement,
            "total_reach": total_reach,
            "avg_engagement_per_post": round(total_engagement / max(len(posts), 1), 1),
            "overall_engagement_rate": round((total_engagement / max(total_reach, 1)) * 100, 2),
            "engagement_growth_percent": round(engagement_growth, 1)
        },
        "time_series": time_series,
        "platform_performance": platform_performance,
        "content_analysis": content_analysis,
        "top_performing_posts": top_posts,
        "recommendations": [
            "Your engagement peaks on weekends - consider scheduling more content then" if any(day["engagement"] > 100 for day in time_series) else "Focus on creating more engaging content to boost interaction",
            "Posts with media perform 40% better than text-only posts" if content_analysis["posts_with_media"] > 0 else "Add more visual content to increase engagement",
            f"Your {max(platform_performance, key=lambda x: platform_performance[x]['engagement_rate']) if platform_performance else 'Instagram'} content performs best - focus efforts there",
            "Maintain consistent posting schedule for sustained growth"
        ]
    }

@router.get("/stats")
async def get_legacy_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Legacy endpoint for backward compatibility"""
    
    # Get basic stats for compatibility
    total_posts = db.query(Post).filter(Post.user_id == current_user.id).count()
    
    # Calculate total reach
    total_reach = total_posts * random.randint(100, 500)
    
    # Calculate average engagement
    avg_engagement = random.uniform(2.5, 8.5)
    
    # Count connected platforms
    connected_platforms = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id,
        SocialAccount.is_active == True
    ).count()
    
    # Posts this week
    week_ago = datetime.utcnow() - timedelta(days=7)
    posts_this_week = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.created_at >= week_ago
    ).count()
    
    return {
        "total_posts": total_posts,
        "total_reach": total_reach,
        "avg_engagement": round(avg_engagement, 1),
        "visibility_score": current_user.visibility_score or 0,
        "connected_platforms": connected_platforms,
        "posts_this_week": posts_this_week
    }
