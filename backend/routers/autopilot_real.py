"""
Autopilot Router - Real Implementation
Autonomous content creation and posting automation
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import asyncio

from database import get_db
from models import User, Post, SocialAccount, AutopilotRule, ContentTemplate, ScheduledPost
from schemas import AutopilotRuleRequest, ScheduledPostResponse, AutopilotStatusResponse
from routers.auth import get_current_user
from services.openai_service import openai_service
from services.instagram_service import instagram_service
from services.facebook_service import facebook_service
from services.twitter_service import twitter_service
from services.tiktok_service import tiktok_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/enable")
async def enable_autopilot(
    autopilot_config: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enable autopilot mode with configuration"""
    try:
        # Validate required fields
        required_fields = ["posting_frequency", "content_themes", "target_platforms"]
        for field in required_fields:
            if field not in autopilot_config:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        # Create autopilot rule
        rule = AutopilotRule(
            user_id=current_user.id,
            rule_name="Main Autopilot Rule",
            is_active=True,
            posting_frequency=autopilot_config["posting_frequency"],  # posts per day
            content_themes=autopilot_config["content_themes"],  # list of themes
            target_platforms=autopilot_config["target_platforms"],  # list of platforms
            business_hours_only=autopilot_config.get("business_hours_only", True),
            start_time=autopilot_config.get("start_time", "09:00"),
            end_time=autopilot_config.get("end_time", "17:00"),
            exclude_weekends=autopilot_config.get("exclude_weekends", False),
            content_style=autopilot_config.get("content_style", "professional"),
            hashtag_strategy=autopilot_config.get("hashtag_strategy", "trending"),
            approval_required=autopilot_config.get("approval_required", False)
        )
        
        # Deactivate existing rules
        db.query(AutopilotRule).filter(
            AutopilotRule.user_id == current_user.id,
            AutopilotRule.is_active == True
        ).update({"is_active": False})
        
        db.add(rule)
        db.commit()
        db.refresh(rule)
        
        # Schedule initial content generation
        background_tasks.add_task(generate_autopilot_content, current_user.id, rule.id, db)
        
        return {
            "message": "Autopilot enabled successfully",
            "rule_id": rule.id,
            "posting_frequency": rule.posting_frequency,
            "target_platforms": rule.target_platforms,
            "next_generation_time": datetime.now() + timedelta(hours=1)
        }
        
    except Exception as e:
        logger.error(f"Enable autopilot error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enable autopilot: {str(e)}"
        )

@router.post("/disable")
async def disable_autopilot(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disable autopilot mode"""
    try:
        # Deactivate all autopilot rules
        updated_rules = db.query(AutopilotRule).filter(
            AutopilotRule.user_id == current_user.id,
            AutopilotRule.is_active == True
        ).update({"is_active": False})
        
        # Cancel pending scheduled posts
        pending_posts = db.query(ScheduledPost).filter(
            ScheduledPost.user_id == current_user.id,
            ScheduledPost.status == "pending",
            ScheduledPost.scheduled_time > datetime.now()
        ).update({"status": "cancelled"})
        
        db.commit()
        
        return {
            "message": "Autopilot disabled successfully",
            "rules_deactivated": updated_rules,
            "posts_cancelled": pending_posts
        }
        
    except Exception as e:
        logger.error(f"Disable autopilot error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disable autopilot: {str(e)}"
        )

@router.get("/status")
async def get_autopilot_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current autopilot status"""
    try:
        # Get active autopilot rule
        active_rule = db.query(AutopilotRule).filter(
            AutopilotRule.user_id == current_user.id,
            AutopilotRule.is_active == True
        ).first()
        
        if not active_rule:
            return {
                "is_active": False,
                "message": "Autopilot is currently disabled"
            }
        
        # Get scheduled posts count
        pending_posts = db.query(ScheduledPost).filter(
            ScheduledPost.user_id == current_user.id,
            ScheduledPost.status == "pending",
            ScheduledPost.scheduled_time > datetime.now()
        ).count()
        
        # Get recent autopilot posts
        recent_posts = db.query(Post).filter(
            Post.user_id == current_user.id,
            Post.created_by_autopilot == True,
            Post.created_at >= datetime.now() - timedelta(days=7)
        ).count()
        
        # Calculate next posting time
        next_post_time = _calculate_next_posting_time(active_rule)
        
        return {
            "is_active": True,
            "rule_id": active_rule.id,
            "posting_frequency": active_rule.posting_frequency,
            "content_themes": active_rule.content_themes,
            "target_platforms": active_rule.target_platforms,
            "pending_posts": pending_posts,
            "posts_this_week": recent_posts,
            "next_post_time": next_post_time.isoformat() if next_post_time else None,
            "approval_required": active_rule.approval_required
        }
        
    except Exception as e:
        logger.error(f"Get autopilot status error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get autopilot status: {str(e)}"
        )

@router.get("/scheduled-posts")
async def get_scheduled_posts(
    days_ahead: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get upcoming scheduled posts"""
    try:
        end_date = datetime.now() + timedelta(days=days_ahead)
        
        scheduled_posts = db.query(ScheduledPost).filter(
            ScheduledPost.user_id == current_user.id,
            ScheduledPost.scheduled_time >= datetime.now(),
            ScheduledPost.scheduled_time <= end_date,
            ScheduledPost.status.in_(["pending", "approved"])
        ).order_by(ScheduledPost.scheduled_time).all()
        
        posts_data = []
        for post in scheduled_posts:
            posts_data.append({
                "id": post.id,
                "content": post.content[:150] + "..." if len(post.content) > 150 else post.content,
                "platforms": post.platforms,
                "scheduled_time": post.scheduled_time.isoformat(),
                "status": post.status,
                "approval_required": post.approval_required,
                "media_urls": post.media_urls,
                "hashtags": post.hashtags,
                "created_at": post.created_at.isoformat()
            })
        
        return {
            "scheduled_posts": posts_data,
            "total_count": len(posts_data),
            "period_days": days_ahead
        }
        
    except Exception as e:
        logger.error(f"Get scheduled posts error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get scheduled posts: {str(e)}"
        )

@router.post("/approve-post/{post_id}")
async def approve_scheduled_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve a scheduled post for publishing"""
    try:
        scheduled_post = db.query(ScheduledPost).filter(
            ScheduledPost.id == post_id,
            ScheduledPost.user_id == current_user.id,
            ScheduledPost.status == "pending"
        ).first()
        
        if not scheduled_post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scheduled post not found or already processed"
            )
        
        scheduled_post.status = "approved"
        db.commit()
        
        return {
            "message": "Post approved successfully",
            "post_id": post_id,
            "scheduled_time": scheduled_post.scheduled_time.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Approve post error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve post: {str(e)}"
        )

@router.delete("/scheduled-post/{post_id}")
async def cancel_scheduled_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a scheduled post"""
    try:
        scheduled_post = db.query(ScheduledPost).filter(
            ScheduledPost.id == post_id,
            ScheduledPost.user_id == current_user.id,
            ScheduledPost.status.in_(["pending", "approved"])
        ).first()
        
        if not scheduled_post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scheduled post not found"
            )
        
        scheduled_post.status = "cancelled"
        db.commit()
        
        return {
            "message": "Scheduled post cancelled successfully",
            "post_id": post_id
        }
        
    except Exception as e:
        logger.error(f"Cancel post error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel post: {str(e)}"
        )

@router.post("/generate-content")
async def generate_content_now(
    theme: Optional[str] = None,
    platform: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually generate content using autopilot AI"""
    try:
        # Get active autopilot rule for context
        active_rule = db.query(AutopilotRule).filter(
            AutopilotRule.user_id == current_user.id,
            AutopilotRule.is_active == True
        ).first()
        
        if not active_rule:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Autopilot is not enabled. Please enable it first."
            )
        
        # Use provided theme or pick from rule themes
        content_theme = theme or (active_rule.content_themes[0] if active_rule.content_themes else "general business")
        target_platform = platform or active_rule.target_platforms[0]
        
        # Generate content with AI
        ai_result = await openai_service.generate_social_content({
            "business_name": current_user.business_name,
            "business_location": current_user.business_location,
            "content_theme": content_theme,
            "platform": target_platform,
            "style": active_rule.content_style,
            "hashtag_strategy": active_rule.hashtag_strategy
        })
        
        if not ai_result.get("success"):
            return {
                "success": False,
                "message": "AI content generation failed",
                "error": ai_result.get("error", "Unknown error")
            }
        
        generated_content = ai_result["content"]
        
        return {
            "success": True,
            "content": generated_content["text"],
            "hashtags": generated_content.get("hashtags", []),
            "platform": target_platform,
            "theme": content_theme,
            "style": active_rule.content_style,
            "estimated_engagement": ai_result.get("estimated_engagement", "medium")
        }
        
    except Exception as e:
        logger.error(f"Generate content error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate content: {str(e)}"
        )

@router.get("/performance")
async def get_autopilot_performance(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get autopilot performance metrics"""
    try:
        since_date = datetime.now() - timedelta(days=days)
        
        # Get autopilot posts
        autopilot_posts = db.query(Post).filter(
            Post.user_id == current_user.id,
            Post.created_by_autopilot == True,
            Post.published_at >= since_date,
            Post.status == "published"
        ).all()
        
        # Get manual posts for comparison
        manual_posts = db.query(Post).filter(
            Post.user_id == current_user.id,
            Post.created_by_autopilot == False,
            Post.published_at >= since_date,
            Post.status == "published"
        ).all()
        
        # Calculate metrics
        autopilot_metrics = _calculate_post_metrics(autopilot_posts)
        manual_metrics = _calculate_post_metrics(manual_posts)
        
        # Calculate improvement percentages
        engagement_improvement = 0
        reach_improvement = 0
        
        if manual_metrics["avg_engagement"] > 0:
            engagement_improvement = ((autopilot_metrics["avg_engagement"] - manual_metrics["avg_engagement"]) / manual_metrics["avg_engagement"]) * 100
        
        if manual_metrics["avg_reach"] > 0:
            reach_improvement = ((autopilot_metrics["avg_reach"] - manual_metrics["avg_reach"]) / manual_metrics["avg_reach"]) * 100
        
        return {
            "period_days": days,
            "autopilot_posts": len(autopilot_posts),
            "manual_posts": len(manual_posts),
            "autopilot_metrics": autopilot_metrics,
            "manual_metrics": manual_metrics,
            "performance_comparison": {
                "engagement_improvement": round(engagement_improvement, 1),
                "reach_improvement": round(reach_improvement, 1),
                "consistency_score": min(100, len(autopilot_posts) / days * 100) if days > 0 else 0
            },
            "most_successful_theme": _find_best_performing_theme(autopilot_posts),
            "optimal_posting_times": _analyze_posting_times(autopilot_posts)
        }
        
    except Exception as e:
        logger.error(f"Get autopilot performance error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance metrics: {str(e)}"
        )

# Background tasks and helper functions
async def generate_autopilot_content(user_id: str, rule_id: str, db: Session):
    """Background task to generate and schedule content"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        rule = db.query(AutopilotRule).filter(AutopilotRule.id == rule_id).first()
        
        if not user or not rule or not rule.is_active:
            return
        
        # Generate content for next few days
        posting_schedule = _generate_posting_schedule(rule, days_ahead=3)
        
        for schedule_item in posting_schedule:
            # Generate content with AI
            for theme in rule.content_themes:
                for platform in rule.target_platforms:
                    ai_result = await openai_service.generate_social_content({
                        "business_name": user.business_name,
                        "business_location": user.business_location,
                        "content_theme": theme,
                        "platform": platform,
                        "style": rule.content_style,
                        "hashtag_strategy": rule.hashtag_strategy
                    })
                    
                    if ai_result.get("success"):
                        content_data = ai_result["content"]
                        
                        # Create scheduled post
                        scheduled_post = ScheduledPost(
                            user_id=user.id,
                            content=content_data["text"],
                            platforms=[platform],
                            scheduled_time=schedule_item["time"],
                            status="pending" if rule.approval_required else "approved",
                            approval_required=rule.approval_required,
                            hashtags=content_data.get("hashtags", []),
                            created_by_autopilot=True,
                            content_theme=theme
                        )
                        
                        db.add(scheduled_post)
        
        db.commit()
        logger.info(f"Generated autopilot content for user {user_id}")
        
    except Exception as e:
        logger.error(f"Generate autopilot content error: {str(e)}")
        db.rollback()

def _calculate_next_posting_time(rule: AutopilotRule) -> Optional[datetime]:
    """Calculate next posting time based on rule"""
    now = datetime.now()
    
    # Simple calculation - next business hour
    if rule.business_hours_only:
        start_hour = int(rule.start_time.split(":")[0])
        end_hour = int(rule.end_time.split(":")[0])
        
        current_hour = now.hour
        if current_hour < start_hour:
            next_time = now.replace(hour=start_hour, minute=0, second=0, microsecond=0)
        elif current_hour >= end_hour:
            # Next business day
            next_day = now + timedelta(days=1)
            next_time = next_day.replace(hour=start_hour, minute=0, second=0, microsecond=0)
        else:
            # Next hour within business hours
            next_time = now + timedelta(hours=24 // rule.posting_frequency)
    else:
        next_time = now + timedelta(hours=24 // rule.posting_frequency)
    
    return next_time

def _generate_posting_schedule(rule: AutopilotRule, days_ahead: int = 3) -> List[Dict[str, Any]]:
    """Generate posting schedule based on rule"""
    schedule = []
    start_time = datetime.now()
    
    for day in range(days_ahead):
        day_start = start_time + timedelta(days=day)
        
        # Skip weekends if configured
        if rule.exclude_weekends and day_start.weekday() >= 5:
            continue
        
        # Generate posts for this day
        posts_per_day = rule.posting_frequency
        hour_interval = 24 / posts_per_day if posts_per_day > 0 else 24
        
        for post_num in range(posts_per_day):
            post_hour = int(post_num * hour_interval)
            
            # Respect business hours
            if rule.business_hours_only:
                start_hour = int(rule.start_time.split(":")[0])
                end_hour = int(rule.end_time.split(":")[0])
                
                business_hours = end_hour - start_hour
                if business_hours > 0:
                    post_hour = start_hour + (post_num * (business_hours / posts_per_day))
            
            post_time = day_start.replace(hour=int(post_hour), minute=0, second=0, microsecond=0)
            
            schedule.append({
                "time": post_time,
                "day": day,
                "post_num": post_num
            })
    
    return schedule

def _calculate_post_metrics(posts: List[Post]) -> Dict[str, float]:
    """Calculate metrics for a list of posts"""
    if not posts:
        return {
            "avg_engagement": 0,
            "avg_reach": 0,
            "total_likes": 0,
            "total_comments": 0,
            "total_shares": 0
        }
    
    total_engagement = sum([post.engagement for post in posts])
    total_reach = sum([post.reach for post in posts])
    total_likes = sum([post.likes for post in posts])
    total_comments = sum([post.comments for post in posts])
    total_shares = sum([post.shares for post in posts])
    
    return {
        "avg_engagement": total_engagement / len(posts),
        "avg_reach": total_reach / len(posts),
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares
    }

def _find_best_performing_theme(posts: List[Post]) -> Optional[str]:
    """Find the best performing content theme"""
    theme_performance = {}
    
    for post in posts:
        theme = getattr(post, 'content_theme', 'general')
        if theme not in theme_performance:
            theme_performance[theme] = []
        theme_performance[theme].append(post.engagement)
    
    if not theme_performance:
        return None
    
    # Calculate average engagement per theme
    best_theme = max(theme_performance.keys(), 
                    key=lambda t: sum(theme_performance[t]) / len(theme_performance[t]))
    
    return best_theme

def _analyze_posting_times(posts: List[Post]) -> List[str]:
    """Analyze optimal posting times from historical data"""
    hour_performance = {}
    
    for post in posts:
        hour = post.published_at.hour if post.published_at else 12
        if hour not in hour_performance:
            hour_performance[hour] = []
        hour_performance[hour].append(post.engagement)
    
    # Find top 3 performing hours
    sorted_hours = sorted(hour_performance.keys(), 
                         key=lambda h: sum(hour_performance[h]) / len(hour_performance[h]), 
                         reverse=True)
    
    top_hours = sorted_hours[:3]
    return [f"{hour:02d}:00" for hour in top_hours]
