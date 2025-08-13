"""
Real Dashboard Router with Analytics Integration
Provides comprehensive dashboard data with real platform analytics
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from database import get_db
from models import User, Post, SocialAccount, BusinessGoal, PerformanceMetric
from schemas import DashboardResponse, AnalyticsResponse
from routers.auth import get_current_user
from services.analytics_service import analytics_service
from services.openai_service import openai_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/overview", response_model=DashboardResponse)
async def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard overview with real analytics"""
    try:
        # Get basic user stats
        total_posts = db.query(Post).filter(Post.user_id == current_user.id).count()
        published_posts = db.query(Post).filter(
            Post.user_id == current_user.id,
            Post.status == "published"
        ).count()
        
        scheduled_posts = db.query(Post).filter(
            Post.user_id == current_user.id,
            Post.status == "scheduled"
        ).count()
        
        # Get connected platforms
        connected_accounts = db.query(SocialAccount).filter(
            SocialAccount.user_id == current_user.id,
            SocialAccount.is_active == True
        ).all()
        
        platforms = [account.platform for account in connected_accounts]
        
        # Get real analytics for the last 30 days
        analytics_data = await analytics_service.aggregate_performance_metrics(
            current_user, db, days=30
        )
        
        # Calculate scores based on real data
        if analytics_data.get("success"):
            total_metrics = analytics_data.get("total_metrics", {})
            
            # Real scores based on actual performance
            visibility_score = min(100, max(0, int(total_metrics.get("total_reach", 0) / 100)))
            engagement_score = min(100, int(total_metrics.get("avg_engagement_rate", 0) * 1000))
            content_score = min(100, max(0, published_posts * 5))  # 5 points per published post
        else:
            # Fallback scores
            visibility_score = current_user.visibility_score or 0
            engagement_score = current_user.engagement_score or 0
            content_score = current_user.content_score or 0
        
        # Update user scores
        current_user.visibility_score = visibility_score
        current_user.engagement_score = engagement_score
        current_user.content_score = content_score
        db.commit()
        
        # Get business goals progress
        active_goals = db.query(BusinessGoal).filter(
            BusinessGoal.user_id == current_user.id,
            BusinessGoal.is_active == True
        ).all()
        
        goals_progress = []
        for goal in active_goals:
            progress_percentage = min(100, (goal.current_value / goal.target_value) * 100) if goal.target_value > 0 else 0
            goals_progress.append({
                "goal_type": goal.goal_type,
                "target_value": goal.target_value,
                "current_value": goal.current_value,
                "progress_percentage": round(progress_percentage, 1),
                "deadline": goal.deadline.isoformat() if goal.deadline else None
            })
        
        # Recent activity
        recent_posts = db.query(Post).filter(
            Post.user_id == current_user.id
        ).order_by(Post.created_at.desc()).limit(5).all()
        
        recent_activity = []
        for post in recent_posts:
            recent_activity.append({
                "id": post.id,
                "content": post.content[:100] + "..." if len(post.content) > 100 else post.content,
                "platforms": post.platforms,
                "status": post.status,
                "created_at": post.created_at.isoformat(),
                "reach": post.reach,
                "engagement": post.engagement
            })
        
        # Performance insights
        insights = []
        if analytics_data.get("success"):
            summary = analytics_service.generate_performance_summary(analytics_data)
            insights = summary.get("highlights", []) + summary.get("recommendations", [])
        
        return DashboardResponse(
            user_id=current_user.id,
            business_name=current_user.business_name,
            total_posts=total_posts,
            published_posts=published_posts,
            scheduled_posts=scheduled_posts,
            connected_platforms=platforms,
            visibility_score=visibility_score,
            engagement_score=engagement_score,
            content_score=content_score,
            goals_progress=goals_progress,
            recent_activity=recent_activity,
            insights=insights[:3],  # Top 3 insights
            analytics_data=analytics_data if analytics_data.get("success") else None
        )
        
    except Exception as e:
        logger.error(f"Dashboard overview error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dashboard: {str(e)}"
        )

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    days: int = 30,
    platform: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed analytics data"""
    try:
        # Get real analytics data
        analytics_data = await analytics_service.aggregate_performance_metrics(
            current_user, db, days=days
        )
        
        if not analytics_data.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Analytics collection failed: {analytics_data.get('error')}"
            )
        
        # Get previous period for comparison
        previous_analytics = await analytics_service.aggregate_performance_metrics(
            current_user, db, days=days
        )  # In real implementation, this would be offset by 'days'
        
        # Calculate growth metrics
        growth_metrics = {}
        if previous_analytics.get("success"):
            growth_metrics = analytics_service.calculate_growth_metrics(
                analytics_data.get("total_metrics", {}),
                previous_analytics.get("total_metrics", {})
            )
        
        # Filter by platform if specified
        platform_data = analytics_data
        if platform and platform in analytics_data.get("platform_breakdown", {}):
            platform_data = {
                "platform_specific": analytics_data["platform_breakdown"][platform],
                "total_metrics": analytics_data["total_metrics"]
            }
        
        # Generate performance summary
        summary = analytics_service.generate_performance_summary(analytics_data, growth_metrics)
        
        return AnalyticsResponse(
            period_days=days,
            platform_filter=platform,
            analytics_data=platform_data,
            growth_metrics=growth_metrics,
            performance_summary=summary,
            last_updated=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load analytics: {str(e)}"
        )

@router.post("/sync-analytics")
async def sync_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually sync analytics from all platforms"""
    try:
        sync_result = await analytics_service.sync_platform_metrics(current_user, db)
        
        if not sync_result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Analytics sync failed: {sync_result.get('error')}"
            )
        
        return {
            "message": "Analytics synced successfully",
            "synced_platforms": sync_result.get("synced_platforms", []),
            "sync_details": sync_result.get("sync_results", {}),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Analytics sync error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync analytics: {str(e)}"
        )

@router.get("/performance-insights")
async def get_performance_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered performance insights"""
    try:
        # Get recent posts for analysis
        recent_posts = db.query(Post).filter(
            Post.user_id == current_user.id,
            Post.status == "published"
        ).order_by(Post.published_at.desc()).limit(20).all()
        
        if not recent_posts:
            return {
                "insights": [],
                "message": "No published posts found for analysis"
            }
        
        # Prepare data for AI analysis
        posts_data = []
        for post in recent_posts:
            posts_data.append({
                "content": post.content[:200],
                "platforms": post.platforms,
                "business_goal": post.business_goal,
                "reach": post.reach,
                "engagement": post.engagement,
                "published_at": post.published_at.isoformat() if post.published_at else None
            })
        
        # Get AI insights
        ai_result = await openai_service.analyze_performance(
            posts_data=posts_data,
            business_goal=recent_posts[0].business_goal
        )
        
        if ai_result.get("success"):
            return {
                "insights": ai_result["analysis"],
                "posts_analyzed": len(posts_data),
                "ai_generated": True,
                "tokens_used": ai_result.get("tokens_used", 0)
            }
        else:
            # Fallback insights
            return {
                "insights": {
                    "summary": "Keep posting consistently to build audience engagement",
                    "recommendations": ["Post during peak hours", "Use engaging visuals", "Include clear calls-to-action"]
                },
                "posts_analyzed": len(posts_data),
                "ai_generated": False
            }
        
    except Exception as e:
        logger.error(f"Performance insights error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate insights: {str(e)}"
        )

@router.get("/top-performing-content")
async def get_top_performing_content(
    limit: int = 10,
    platform: Optional[str] = None,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get top performing content based on real metrics"""
    try:
        # Get posts from the specified period
        since_date = datetime.now() - timedelta(days=days)
        
        query = db.query(Post).filter(
            Post.user_id == current_user.id,
            Post.status == "published",
            Post.published_at >= since_date
        )
        
        if platform:
            query = query.filter(Post.platforms.contains([platform]))
        
        posts = query.order_by(Post.engagement.desc()).limit(limit).all()
        
        # Get detailed metrics for each post
        top_content = []
        for post in posts:
            # Get platform-specific metrics
            metrics = db.query(PerformanceMetric).filter(
                PerformanceMetric.post_id == post.id
            ).all()
            
            total_engagement = sum([m.engagement for m in metrics])
            total_reach = sum([m.reach for m in metrics])
            engagement_rate = (total_engagement / total_reach) if total_reach > 0 else 0
            
            top_content.append({
                "post_id": post.id,
                "content": post.content[:150] + "..." if len(post.content) > 150 else post.content,
                "platforms": post.platforms,
                "business_goal": post.business_goal,
                "published_at": post.published_at.isoformat() if post.published_at else None,
                "total_reach": total_reach,
                "total_engagement": total_engagement,
                "engagement_rate": round(engagement_rate, 3),
                "platform_metrics": {
                    metric.platform: {
                        "reach": metric.reach,
                        "engagement": metric.engagement,
                        "likes": metric.likes,
                        "comments": metric.comments,
                        "shares": metric.shares
                    } for metric in metrics
                }
            })
        
        return {
            "top_content": top_content,
            "period_days": days,
            "platform_filter": platform,
            "total_found": len(top_content)
        }
        
    except Exception as e:
        logger.error(f"Top content error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get top content: {str(e)}"
        )

@router.get("/engagement-trends")
async def get_engagement_trends(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get engagement trends over time"""
    try:
        since_date = datetime.now() - timedelta(days=days)
        
        # Get metrics grouped by date
        metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.user_id == current_user.id,
            PerformanceMetric.recorded_at >= since_date
        ).order_by(PerformanceMetric.data_date).all()
        
        # Group by date
        daily_trends = {}
        for metric in metrics:
            date_key = metric.data_date.isoformat()
            
            if date_key not in daily_trends:
                daily_trends[date_key] = {
                    "date": date_key,
                    "total_reach": 0,
                    "total_engagement": 0,
                    "total_posts": 0,
                    "platforms": set()
                }
            
            daily_trends[date_key]["total_reach"] += metric.reach
            daily_trends[date_key]["total_engagement"] += metric.engagement
            daily_trends[date_key]["total_posts"] += 1
            daily_trends[date_key]["platforms"].add(metric.platform)
        
        # Convert to list and calculate rates
        trends_list = []
        for date_data in daily_trends.values():
            engagement_rate = (
                date_data["total_engagement"] / date_data["total_reach"]
                if date_data["total_reach"] > 0 else 0
            )
            
            trends_list.append({
                "date": date_data["date"],
                "total_reach": date_data["total_reach"],
                "total_engagement": date_data["total_engagement"],
                "engagement_rate": round(engagement_rate, 3),
                "posts_count": date_data["total_posts"],
                "platforms_active": len(date_data["platforms"])
            })
        
        # Sort by date
        trends_list.sort(key=lambda x: x["date"])
        
        return {
            "trends": trends_list,
            "period_days": days,
            "total_data_points": len(trends_list)
        }
        
    except Exception as e:
        logger.error(f"Engagement trends error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get trends: {str(e)}"
        )
