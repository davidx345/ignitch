"""
AI Business Coach Router - Real Implementation
Provides personalized business insights and coaching recommendations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

from database import get_db
from models import User, Post, SocialAccount, CoachingInsight, PerformanceMetric, BusinessGoal
from schemas import CoachingInsightResponse, WeeklyReportResponse, PerformanceAnalysisResponse
from routers.auth import get_current_user
from services.analytics_service import analytics_service
from services.openai_service import openai_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/insights")
async def get_coaching_insights(
    limit: int = 10,
    priority: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized coaching insights"""
    try:
        # Get existing insights from database
        query = db.query(CoachingInsight).filter(
            CoachingInsight.user_id == current_user.id
        ).order_by(CoachingInsight.created_at.desc())
        
        if priority:
            query = query.filter(CoachingInsight.priority == priority)
        
        existing_insights = query.limit(limit).all()
        
        # If no recent insights (< 24 hours), generate new ones
        if not existing_insights or (
            existing_insights[0].created_at < datetime.now() - timedelta(hours=24)
        ):
            await generate_new_insights(current_user, db)
            # Refresh query
            existing_insights = query.limit(limit).all()
        
        # Format response
        insights_data = []
        for insight in existing_insights:
            insights_data.append({
                "id": insight.id,
                "type": insight.insight_type,
                "title": insight.title,
                "content": insight.content,
                "priority": insight.priority,
                "action_required": insight.action_required,
                "is_read": insight.is_read,
                "confidence_score": insight.confidence_score,
                "predicted_impact": insight.predicted_impact,
                "created_at": insight.created_at.isoformat(),
                "expires_at": insight.expires_at.isoformat() if insight.expires_at else None
            })
        
        return {
            "insights": insights_data,
            "total_count": len(insights_data),
            "unread_count": sum(1 for insight in existing_insights if not insight.is_read)
        }
        
    except Exception as e:
        logger.error(f"Coaching insights error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get insights: {str(e)}"
        )

@router.post("/generate-insights")
async def generate_insights_manually(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually generate new coaching insights"""
    try:
        result = await generate_new_insights(current_user, db)
        return {
            "message": "New insights generated successfully",
            "insights_created": result.get("insights_created", 0),
            "ai_generated": result.get("ai_generated", False)
        }
        
    except Exception as e:
        logger.error(f"Manual insight generation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate insights: {str(e)}"
        )

@router.post("/insights/{insight_id}/read")
async def mark_insight_as_read(
    insight_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark coaching insight as read"""
    try:
        insight = db.query(CoachingInsight).filter(
            CoachingInsight.id == insight_id,
            CoachingInsight.user_id == current_user.id
        ).first()
        
        if not insight:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Insight not found"
            )
        
        insight.is_read = True
        db.commit()
        
        return {"message": "Insight marked as read"}
        
    except Exception as e:
        logger.error(f"Mark insight read error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark insight as read: {str(e)}"
        )

@router.get("/performance-analysis")
async def get_performance_analysis(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive performance analysis"""
    try:
        # Get real analytics data
        analytics_data = await analytics_service.aggregate_performance_metrics(
            current_user, db, days=days
        )
        
        if not analytics_data.get("success"):
            return {
                "overall_score": 0,
                "visibility_score": 0,
                "content_score": 0,
                "engagement_score": 0,
                "growth_rate": 0,
                "message": "Insufficient data for analysis"
            }
        
        total_metrics = analytics_data.get("total_metrics", {})
        
        # Calculate performance scores (0-100)
        overall_score = _calculate_overall_score(total_metrics, current_user, db)
        visibility_score = min(100, max(0, total_metrics.get("total_reach", 0) // 50))
        content_score = min(100, max(0, total_metrics.get("total_likes", 0) // 10))
        engagement_score = min(100, int(total_metrics.get("avg_engagement_rate", 0) * 1000))
        
        # Calculate growth rate
        growth_rate = await _calculate_growth_rate(current_user, db, days)
        
        # Get goal progress
        goal_progress = None
        active_goal = db.query(BusinessGoal).filter(
            BusinessGoal.user_id == current_user.id,
            BusinessGoal.is_active == True
        ).first()
        
        if active_goal:
            progress_percentage = min(100, (active_goal.current_value / active_goal.target_value) * 100) if active_goal.target_value > 0 else 0
            days_remaining = (active_goal.deadline - datetime.now()).days if active_goal.deadline else None
            
            goal_progress = {
                "goal_type": active_goal.goal_type,
                "current": active_goal.current_value,
                "target": active_goal.target_value,
                "progress_percentage": round(progress_percentage, 1),
                "days_remaining": days_remaining
            }
        
        return {
            "overall_score": overall_score,
            "visibility_score": visibility_score,
            "content_score": content_score,
            "engagement_score": engagement_score,
            "growth_rate": growth_rate,
            "goal_progress": goal_progress,
            "period_days": days,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Performance analysis error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze performance: {str(e)}"
        )

@router.get("/weekly-report")
async def get_weekly_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly performance report"""
    try:
        # Calculate week boundaries
        today = datetime.now()
        week_start = today - timedelta(days=7)
        week_end = today
        
        # Get posts from this week
        weekly_posts = db.query(Post).filter(
            Post.user_id == current_user.id,
            Post.published_at >= week_start,
            Post.published_at <= week_end,
            Post.status == "published"
        ).all()
        
        # Get metrics for this week
        weekly_metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.user_id == current_user.id,
            PerformanceMetric.recorded_at >= week_start,
            PerformanceMetric.recorded_at <= week_end
        ).all()
        
        # Calculate totals
        total_reach = sum([m.reach for m in weekly_metrics])
        total_engagement = sum([m.engagement for m in weekly_metrics])
        avg_engagement_rate = (total_engagement / total_reach) if total_reach > 0 else 0
        
        # Find best performing post
        best_post = None
        if weekly_posts:
            best_post = max(weekly_posts, key=lambda p: p.engagement)
            best_post_data = {
                "content": best_post.content[:100] + "..." if len(best_post.content) > 100 else best_post.content,
                "platform": weekly_posts[0].platforms[0] if best_post.platforms else "unknown",
                "engagement_rate": (best_post.engagement / best_post.reach) if best_post.reach > 0 else 0
            }
        else:
            best_post_data = None
        
        # Generate AI recommendations
        improvement_areas = []
        recommendations = []
        
        if avg_engagement_rate < 0.02:
            improvement_areas.append("Engagement rate below industry average")
            recommendations.append("Try more interactive content with questions and polls")
        
        if len(weekly_posts) < 3:
            improvement_areas.append("Low posting frequency")
            recommendations.append("Aim for 3-5 posts per week for better reach")
        
        if total_reach < 500:
            improvement_areas.append("Limited reach")
            recommendations.append("Use trending hashtags and post during peak hours")
        
        return {
            "week_start": week_start.isoformat(),
            "week_end": week_end.isoformat(),
            "posts_published": len(weekly_posts),
            "total_reach": total_reach,
            "total_engagement": total_engagement,
            "avg_engagement_rate": round(avg_engagement_rate, 3),
            "best_performing_post": best_post_data,
            "improvement_areas": improvement_areas,
            "next_week_recommendations": recommendations
        }
        
    except Exception as e:
        logger.error(f"Weekly report error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate weekly report: {str(e)}"
        )

@router.get("/growth-predictions")
async def get_growth_predictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered growth predictions"""
    try:
        # Get historical data for predictions
        historical_metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.user_id == current_user.id,
            PerformanceMetric.recorded_at >= datetime.now() - timedelta(days=90)
        ).order_by(PerformanceMetric.recorded_at).all()
        
        if len(historical_metrics) < 10:
            return {
                "message": "Insufficient data for predictions",
                "min_data_points_needed": 10,
                "current_data_points": len(historical_metrics)
            }
        
        # Calculate trends
        weekly_reaches = []
        weekly_engagements = []
        
        # Group by week
        for i in range(0, len(historical_metrics), 7):
            week_data = historical_metrics[i:i+7]
            week_reach = sum([m.reach for m in week_data])
            week_engagement = sum([m.engagement for m in week_data])
            
            weekly_reaches.append(week_reach)
            weekly_engagements.append(week_engagement)
        
        # Simple linear trend calculation
        reach_growth_rate = _calculate_trend(weekly_reaches) if len(weekly_reaches) > 1 else 0
        engagement_growth_rate = _calculate_trend(weekly_engagements) if len(weekly_engagements) > 1 else 0
        
        # Predict next 4 weeks
        current_reach = weekly_reaches[-1] if weekly_reaches else 0
        current_engagement = weekly_engagements[-1] if weekly_engagements else 0
        
        predictions = []
        for week in range(1, 5):
            predicted_reach = current_reach + (reach_growth_rate * week)
            predicted_engagement = current_engagement + (engagement_growth_rate * week)
            
            predictions.append({
                "week": week,
                "predicted_reach": max(0, int(predicted_reach)),
                "predicted_engagement": max(0, int(predicted_engagement)),
                "confidence": max(0.5, 1 - (week * 0.1))  # Decreasing confidence over time
            })
        
        return {
            "predictions": predictions,
            "current_reach_trend": "increasing" if reach_growth_rate > 0 else "decreasing",
            "current_engagement_trend": "increasing" if engagement_growth_rate > 0 else "decreasing",
            "reach_growth_rate": round(reach_growth_rate, 2),
            "engagement_growth_rate": round(engagement_growth_rate, 2),
            "data_points_used": len(historical_metrics)
        }
        
    except Exception as e:
        logger.error(f"Growth predictions error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate predictions: {str(e)}"
        )

@router.post("/set-goals")
async def set_business_goals(
    goals_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set business goals for AI coaching"""
    try:
        # Deactivate existing goals
        db.query(BusinessGoal).filter(
            BusinessGoal.user_id == current_user.id,
            BusinessGoal.is_active == True
        ).update({"is_active": False})
        
        # Create new goals
        goals_created = 0
        for goal_type, target_value in goals_data.items():
            if goal_type in ["followers", "engagement", "posts_per_week", "revenue", "reach", "likes"]:
                goal = BusinessGoal(
                    user_id=current_user.id,
                    goal_type=goal_type,
                    target_value=int(target_value),
                    current_value=0,
                    deadline=datetime.now() + timedelta(days=30),
                    is_active=True
                )
                db.add(goal)
                goals_created += 1
        
        db.commit()
        
        return {
            "message": "Business goals set successfully",
            "goals_created": goals_created,
            "goals": goals_data,
            "ai_coaching": "Your AI coach will now provide personalized insights based on these goals"
        }
        
    except Exception as e:
        logger.error(f"Set goals error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to set goals: {str(e)}"
        )

# Helper functions
async def generate_new_insights(user: User, db: Session) -> Dict[str, Any]:
    """Generate new coaching insights using AI"""
    try:
        # Gather user data for insights
        user_data = {
            "business_name": user.business_name,
            "business_location": user.business_location,
            "account_age": (datetime.now() - user.created_at).days if user.created_at else 0
        }
        
        # Get performance data
        recent_metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.user_id == user.id,
            PerformanceMetric.recorded_at >= datetime.now() - timedelta(days=30)
        ).all()
        
        performance_data = {
            "total_reach": sum([m.reach for m in recent_metrics]),
            "total_engagement": sum([m.engagement for m in recent_metrics]),
            "platforms_active": len(set([m.platform for m in recent_metrics])),
            "posts_analyzed": len(recent_metrics)
        }
        
        # Generate AI insights
        ai_result = await openai_service.generate_business_insights(user_data, performance_data)
        
        insights_created = 0
        
        if ai_result.get("success"):
            # Save AI insights to database
            for insight_data in ai_result["insights"]:
                insight = CoachingInsight(
                    user_id=user.id,
                    insight_type="strategy",
                    title=insight_data.get("title", "AI Recommendation"),
                    content=insight_data.get("description", ""),
                    priority=insight_data.get("priority", "medium"),
                    action_required=insight_data.get("action_required", False),
                    confidence_score=0.8,
                    predicted_impact=insight_data.get("expected_impact", "medium"),
                    expires_at=datetime.now() + timedelta(days=14)
                )
                db.add(insight)
                insights_created += 1
        else:
            # Create fallback insights
            fallback_insights = [
                {
                    "title": "Optimize Your Posting Schedule",
                    "content": "Based on industry trends, consider posting during peak hours (9 AM, 1 PM, 7 PM) for better engagement.",
                    "priority": "medium",
                    "action_required": True
                },
                {
                    "title": "Expand Your Platform Presence", 
                    "content": "Consider adding more social media platforms to increase your reach and diversify your audience.",
                    "priority": "low",
                    "action_required": False
                }
            ]
            
            for insight_data in fallback_insights:
                insight = CoachingInsight(
                    user_id=user.id,
                    insight_type="optimization",
                    title=insight_data["title"],
                    content=insight_data["content"],
                    priority=insight_data["priority"],
                    action_required=insight_data["action_required"],
                    confidence_score=0.7,
                    predicted_impact="medium",
                    expires_at=datetime.now() + timedelta(days=14)
                )
                db.add(insight)
                insights_created += 1
        
        db.commit()
        
        return {
            "insights_created": insights_created,
            "ai_generated": ai_result.get("success", False)
        }
        
    except Exception as e:
        logger.error(f"Generate insights error: {str(e)}")
        db.rollback()
        return {"insights_created": 0, "ai_generated": False, "error": str(e)}

def _calculate_overall_score(metrics: Dict[str, Any], user: User, db: Session) -> int:
    """Calculate overall performance score"""
    try:
        # Base score components
        reach_score = min(50, metrics.get("total_reach", 0) // 100)
        engagement_score = min(30, int(metrics.get("avg_engagement_rate", 0) * 1000))
        consistency_score = min(20, db.query(Post).filter(
            Post.user_id == user.id,
            Post.status == "published"
        ).count())
        
        return reach_score + engagement_score + consistency_score
        
    except Exception:
        return 0

async def _calculate_growth_rate(user: User, db: Session, days: int) -> float:
    """Calculate growth rate over specified period"""
    try:
        # Get metrics from two periods for comparison
        current_period = datetime.now() - timedelta(days=days//2)
        previous_period = datetime.now() - timedelta(days=days)
        
        current_metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.user_id == user.id,
            PerformanceMetric.recorded_at >= current_period
        ).all()
        
        previous_metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.user_id == user.id,
            PerformanceMetric.recorded_at >= previous_period,
            PerformanceMetric.recorded_at < current_period
        ).all()
        
        current_total = sum([m.reach for m in current_metrics])
        previous_total = sum([m.reach for m in previous_metrics])
        
        if previous_total > 0:
            growth_rate = ((current_total - previous_total) / previous_total) * 100
            return round(growth_rate, 2)
        
        return 0.0
        
    except Exception:
        return 0.0

def _calculate_trend(values: List[float]) -> float:
    """Calculate simple linear trend"""
    if len(values) < 2:
        return 0
    
    # Simple linear regression slope
    n = len(values)
    x_sum = sum(range(n))
    y_sum = sum(values)
    xy_sum = sum(i * values[i] for i in range(n))
    x_squared_sum = sum(i * i for i in range(n))
    
    denominator = n * x_squared_sum - x_sum * x_sum
    if denominator == 0:
        return 0
    
    slope = (n * xy_sum - x_sum * y_sum) / denominator
    return slope
