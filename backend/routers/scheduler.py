from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, time
import pytz
from dataclasses import dataclass
import random

from database import get_db
from models import User, Post, SocialAccount, BusinessGoal
from schemas import PostCreate, PostResponse
from routers.auth import get_current_user

router = APIRouter()

@dataclass
class OptimalTime:
    hour: int
    minute: int
    platform: str
    confidence: float
    reason: str

# Platform-specific optimal posting times (based on research)
PLATFORM_OPTIMAL_TIMES = {
    "instagram": [
        {"hour": 6, "minute": 0, "confidence": 0.85, "reason": "Morning commute engagement peak"},
        {"hour": 12, "minute": 0, "confidence": 0.92, "reason": "Lunch break peak activity"},
        {"hour": 19, "minute": 0, "confidence": 0.88, "reason": "Evening leisure time"},
        {"hour": 21, "minute": 0, "confidence": 0.75, "reason": "Before bedtime browsing"}
    ],
    "facebook": [
        {"hour": 9, "minute": 0, "confidence": 0.83, "reason": "Work break browsing"},
        {"hour": 13, "minute": 0, "confidence": 0.90, "reason": "Lunch hour engagement"},
        {"hour": 15, "minute": 0, "confidence": 0.87, "reason": "Afternoon productivity dip"},
        {"hour": 20, "minute": 0, "confidence": 0.85, "reason": "Family time social sharing"}
    ],
    "tiktok": [
        {"hour": 6, "minute": 0, "confidence": 0.88, "reason": "Early risers commute"},
        {"hour": 10, "minute": 0, "confidence": 0.82, "reason": "Mid-morning break"},
        {"hour": 19, "minute": 0, "confidence": 0.94, "reason": "Prime entertainment time"},
        {"hour": 22, "minute": 0, "confidence": 0.89, "reason": "Late night scrolling"}
    ],
    "twitter": [
        {"hour": 8, "minute": 0, "confidence": 0.86, "reason": "Morning news consumption"},
        {"hour": 12, "minute": 0, "confidence": 0.91, "reason": "Lunch break discussion"},
        {"hour": 17, "minute": 0, "confidence": 0.84, "reason": "End of workday sharing"},
        {"hour": 21, "minute": 0, "confidence": 0.78, "reason": "Evening conversation"}
    ]
}

# Business goal to optimal time mapping
GOAL_TIME_PREFERENCES = {
    "sales": {
        "preferred_days": ["tuesday", "wednesday", "thursday"],  # Highest conversion days
        "avoid_hours": [1, 2, 3, 4, 5],  # Late night/early morning
        "peak_hours": [10, 11, 14, 15, 19, 20],  # Business and leisure hours
        "frequency_multiplier": 1.3  # Post more frequently for sales
    },
    "awareness": {
        "preferred_days": ["monday", "wednesday", "friday"],  # Start/mid/end week visibility
        "avoid_hours": [0, 1, 2, 3, 4, 5, 6],  # Very early hours
        "peak_hours": [8, 9, 12, 13, 17, 18, 19],  # High visibility times
        "frequency_multiplier": 1.5  # Higher frequency for awareness
    },
    "engagement": {
        "preferred_days": ["wednesday", "thursday", "friday", "saturday"],  # Social days
        "avoid_hours": [2, 3, 4, 5],  # Deep sleep hours
        "peak_hours": [11, 12, 16, 17, 18, 19, 20, 21],  # Interactive times
        "frequency_multiplier": 1.2  # Moderate increase for engagement
    },
    "followers": {
        "preferred_days": ["monday", "tuesday", "friday"],  # Growth momentum days
        "avoid_hours": [1, 2, 3, 4, 5, 6],  # Low activity hours
        "peak_hours": [7, 8, 12, 13, 18, 19, 20],  # Discovery times
        "frequency_multiplier": 1.4  # Consistent posting for follower growth
    },
    "visits": {
        "preferred_days": ["tuesday", "wednesday", "thursday"],  # Website traffic days
        "avoid_hours": [0, 1, 2, 3, 4, 5],  # Minimal browsing hours
        "peak_hours": [9, 10, 11, 14, 15, 16, 20, 21],  # Active browsing times
        "frequency_multiplier": 1.1  # Quality over quantity for visits
    }
}

def get_user_timezone(user: User) -> str:
    """Get user's timezone, default to UTC if not set"""
    return user.timezone or "UTC"

def calculate_optimal_times(
    platforms: List[str],
    business_goals: List[str],
    user_timezone: str,
    posting_frequency: int = 7  # posts per week
) -> List[Dict[str, Any]]:
    """Calculate optimal posting times based on platform and business goals"""
    
    tz = pytz.timezone(user_timezone)
    now = datetime.now(tz)
    
    optimal_slots = []
    
    # Get base optimal times for each platform
    platform_times = {}
    for platform in platforms:
        if platform in PLATFORM_OPTIMAL_TIMES:
            platform_times[platform] = PLATFORM_OPTIMAL_TIMES[platform]
    
    # Adjust based on business goals
    goal_preferences = {}
    for goal in business_goals:
        if goal in GOAL_TIME_PREFERENCES:
            goal_preferences[goal] = GOAL_TIME_PREFERENCES[goal]
    
    # Generate optimal time slots for the next 7 days
    for day_offset in range(7):
        target_date = now + timedelta(days=day_offset)
        day_name = target_date.strftime("%A").lower()
        
        # Check if this day is preferred for any business goals
        day_preference_score = 0
        for goal_prefs in goal_preferences.values():
            if day_name in goal_prefs["preferred_days"]:
                day_preference_score += 1
        
        # Skip if no goals prefer this day and it's weekend (unless engagement goal)
        if day_preference_score == 0 and day_name in ["saturday", "sunday"]:
            if "engagement" not in business_goals:
                continue
        
        # Calculate how many posts for this day
        base_posts_per_day = posting_frequency / 7
        
        # Adjust based on goal frequency multipliers
        frequency_multiplier = 1.0
        for goal_prefs in goal_preferences.values():
            frequency_multiplier = max(frequency_multiplier, goal_prefs["frequency_multiplier"])
        
        posts_today = int(base_posts_per_day * frequency_multiplier * (1 + day_preference_score * 0.2))
        posts_today = max(1, min(posts_today, 3))  # 1-3 posts per day max
        
        # Get optimal hours for this day
        day_optimal_hours = set()
        
        for platform in platforms:
            if platform in platform_times:
                for time_slot in platform_times[platform]:
                    hour = time_slot["hour"]
                    
                    # Check if this hour is preferred by business goals
                    hour_score = 0
                    hour_allowed = True
                    
                    for goal_prefs in goal_preferences.values():
                        if hour in goal_prefs["avoid_hours"]:
                            hour_allowed = False
                            break
                        if hour in goal_prefs["peak_hours"]:
                            hour_score += time_slot["confidence"]
                    
                    if hour_allowed:
                        day_optimal_hours.add((hour, time_slot["confidence"] + hour_score, platform))
        
        # Select the best hours for this day
        sorted_hours = sorted(day_optimal_hours, key=lambda x: x[1], reverse=True)
        selected_hours = sorted_hours[:posts_today]
        
        for hour, score, platform in selected_hours:
            optimal_time = target_date.replace(
                hour=hour,
                minute=random.choice([0, 15, 30, 45]),  # Vary minutes slightly
                second=0,
                microsecond=0
            )
            
            optimal_slots.append({
                "datetime": optimal_time,
                "platform": platform,
                "confidence": min(score, 1.0),
                "day_preference_score": day_preference_score,
                "business_goal_alignment": len([g for g in business_goals if hour in GOAL_TIME_PREFERENCES.get(g, {}).get("peak_hours", [])])
            })
    
    # Sort by confidence and return
    return sorted(optimal_slots, key=lambda x: x["confidence"], reverse=True)

@router.post("/optimize-schedule")
async def optimize_posting_schedule(
    platforms: List[str],
    business_goals: List[str],
    posts_per_week: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate an optimized posting schedule based on platforms and business goals"""
    
    # Validate platforms
    valid_platforms = ["instagram", "facebook", "tiktok", "twitter"]
    invalid_platforms = [p for p in platforms if p not in valid_platforms]
    if invalid_platforms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid platforms: {invalid_platforms}"
        )
    
    # Validate business goals
    valid_goals = ["sales", "awareness", "engagement", "followers", "visits"]
    invalid_goals = [g for g in business_goals if g not in valid_goals]
    if invalid_goals:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid business goals: {invalid_goals}"
        )
    
    user_timezone = get_user_timezone(current_user)
    
    try:
        optimal_times = calculate_optimal_times(
            platforms=platforms,
            business_goals=business_goals,
            user_timezone=user_timezone,
            posting_frequency=posts_per_week
        )
        
        # Create schedule recommendations
        schedule = {
            "user_timezone": user_timezone,
            "total_recommended_slots": len(optimal_times),
            "posts_per_week": posts_per_week,
            "optimization_factors": {
                "platforms": platforms,
                "business_goals": business_goals,
                "user_timezone": user_timezone
            },
            "recommended_times": [
                {
                    "datetime": slot["datetime"].isoformat(),
                    "day_of_week": slot["datetime"].strftime("%A"),
                    "time": slot["datetime"].strftime("%I:%M %p"),
                    "platform": slot["platform"],
                    "confidence_score": round(slot["confidence"], 2),
                    "goal_alignment": slot["business_goal_alignment"],
                    "reasoning": f"Optimal for {slot['platform']} with {slot['business_goal_alignment']} goal alignments"
                }
                for slot in optimal_times[:posts_per_week * 2]  # Return 2 weeks of recommendations
            ]
        }
        
        return schedule
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to optimize schedule: {str(e)}"
        )

@router.post("/schedule-post")
async def schedule_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedule a post for future publishing"""
    
    if not post_data.scheduled_for:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="scheduled_for is required for scheduling posts"
        )
    
    # Validate scheduled time is in the future
    if post_data.scheduled_for <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scheduled time must be in the future"
        )
    
    # Create scheduled post
    post = Post(
        user_id=current_user.id,
        content=post_data.content,
        media_url=post_data.media_url,
        scheduled_for=post_data.scheduled_for,
        status="scheduled",
        platforms=post_data.platforms
    )
    
    db.add(post)
    db.commit()
    db.refresh(post)
    
    return {
        "post_id": post.id,
        "scheduled_for": post.scheduled_for,
        "platforms": post_data.platforms,
        "status": "scheduled",
        "message": "Post scheduled successfully"
    }

@router.get("/scheduled-posts")
async def get_scheduled_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all scheduled posts for the current user"""
    
    scheduled_posts = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.status == "scheduled",
        Post.scheduled_for > datetime.utcnow()
    ).order_by(Post.scheduled_for.asc()).all()
    
    return [
        {
            "post_id": post.id,
            "content": post.content[:100] + "..." if len(post.content) > 100 else post.content,
            "media_url": post.media_url,
            "scheduled_for": post.scheduled_for,
            "platforms": post.platforms,
            "created_at": post.created_at
        }
        for post in scheduled_posts
    ]

@router.put("/scheduled-posts/{post_id}")
async def update_scheduled_post(
    post_id: str,
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a scheduled post"""
    
    post = db.query(Post).filter(
        Post.id == post_id,
        Post.user_id == current_user.id,
        Post.status == "scheduled"
    ).first()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled post not found"
        )
    
    # Update post fields
    if post_data.content:
        post.content = post_data.content
    if post_data.media_url:
        post.media_url = post_data.media_url
    if post_data.scheduled_for:
        if post_data.scheduled_for <= datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scheduled time must be in the future"
            )
        post.scheduled_for = post_data.scheduled_for
    if post_data.platforms:
        post.platforms = post_data.platforms
    
    db.commit()
    db.refresh(post)
    
    return {
        "post_id": post.id,
        "message": "Scheduled post updated successfully",
        "scheduled_for": post.scheduled_for
    }

@router.delete("/scheduled-posts/{post_id}")
async def cancel_scheduled_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a scheduled post"""
    
    post = db.query(Post).filter(
        Post.id == post_id,
        Post.user_id == current_user.id,
        Post.status == "scheduled"
    ).first()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled post not found"
        )
    
    post.status = "cancelled"
    db.commit()
    
    return {"message": "Scheduled post cancelled successfully"}

@router.get("/analytics/timing")
async def get_timing_analytics(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics about posting times and their performance"""
    
    since_date = datetime.utcnow() - timedelta(days=days)
    
    posts = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.created_at >= since_date,
        Post.status == "published"
    ).all()
    
    # Analyze posting patterns
    hour_performance = {}
    day_performance = {}
    platform_performance = {}
    
    for post in posts:
        hour = post.created_at.hour
        day = post.created_at.strftime("%A")
        
        # Simulate engagement metrics (in real app, get from platform APIs)
        engagement = random.randint(10, 100)
        
        # Hour analysis
        if hour not in hour_performance:
            hour_performance[hour] = {"posts": 0, "total_engagement": 0}
        hour_performance[hour]["posts"] += 1
        hour_performance[hour]["total_engagement"] += engagement
        
        # Day analysis
        if day not in day_performance:
            day_performance[day] = {"posts": 0, "total_engagement": 0}
        day_performance[day]["posts"] += 1
        day_performance[day]["total_engagement"] += engagement
        
        # Platform analysis (if stored)
        if hasattr(post, 'platforms') and post.platforms:
            for platform in post.platforms:
                if platform not in platform_performance:
                    platform_performance[platform] = {"posts": 0, "total_engagement": 0}
                platform_performance[platform]["posts"] += 1
                platform_performance[platform]["total_engagement"] += engagement
    
    # Calculate averages
    best_hours = []
    for hour, data in hour_performance.items():
        avg_engagement = data["total_engagement"] / data["posts"] if data["posts"] > 0 else 0
        best_hours.append({
            "hour": hour,
            "time": f"{hour:02d}:00",
            "posts": data["posts"],
            "avg_engagement": round(avg_engagement, 1)
        })
    
    best_days = []
    for day, data in day_performance.items():
        avg_engagement = data["total_engagement"] / data["posts"] if data["posts"] > 0 else 0
        best_days.append({
            "day": day,
            "posts": data["posts"],
            "avg_engagement": round(avg_engagement, 1)
        })
    
    # Sort by performance
    best_hours.sort(key=lambda x: x["avg_engagement"], reverse=True)
    best_days.sort(key=lambda x: x["avg_engagement"], reverse=True)
    
    return {
        "period_days": days,
        "total_posts": len(posts),
        "best_posting_hours": best_hours[:5],  # Top 5 hours
        "best_posting_days": best_days,
        "platform_performance": [
            {
                "platform": platform,
                "posts": data["posts"],
                "avg_engagement": round(data["total_engagement"] / data["posts"], 1) if data["posts"] > 0 else 0
            }
            for platform, data in platform_performance.items()
        ],
        "recommendations": [
            f"Your best posting hour is {best_hours[0]['time']} with {best_hours[0]['avg_engagement']} avg engagement" if best_hours else "Need more data for recommendations",
            f"Your best posting day is {best_days[0]['day']} with {best_days[0]['avg_engagement']} avg engagement" if best_days else "Post more consistently to get day recommendations"
        ]
    }

@router.post("/bulk-schedule")
async def bulk_schedule_posts(
    posts: List[PostCreate],
    use_optimal_timing: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedule multiple posts with optional optimal timing"""
    
    if not posts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No posts provided"
        )
    
    if len(posts) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 50 posts can be scheduled at once"
        )
    
    scheduled_posts = []
    
    # If using optimal timing, calculate optimal times
    if use_optimal_timing:
        # Extract platforms and goals from posts
        all_platforms = set()
        for post in posts:
            all_platforms.update(post.platforms or [])
        
        # Get user's business goals
        business_goals = db.query(BusinessGoal).filter(
            BusinessGoal.user_id == current_user.id
        ).all()
        goal_types = [goal.goal_type for goal in business_goals]
        
        if not goal_types:
            goal_types = ["engagement"]  # Default goal
        
        # Generate optimal times
        optimal_times = calculate_optimal_times(
            platforms=list(all_platforms),
            business_goals=goal_types,
            user_timezone=get_user_timezone(current_user),
            posting_frequency=len(posts)
        )
        
        # Assign optimal times to posts
        for i, post_data in enumerate(posts):
            if i < len(optimal_times):
                post_data.scheduled_for = optimal_times[i]["datetime"].replace(tzinfo=None)
            else:
                # If we have more posts than optimal times, spread them out
                base_time = datetime.utcnow() + timedelta(hours=i * 4)
                post_data.scheduled_for = base_time
    
    # Create scheduled posts
    for post_data in posts:
        if not post_data.scheduled_for:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="All posts must have scheduled_for when not using optimal timing"
            )
        
        post = Post(
            user_id=current_user.id,
            content=post_data.content,
            media_url=post_data.media_url,
            scheduled_for=post_data.scheduled_for,
            status="scheduled",
            platforms=post_data.platforms
        )
        
        db.add(post)
        scheduled_posts.append(post)
    
    db.commit()
    
    # Refresh all posts to get IDs
    for post in scheduled_posts:
        db.refresh(post)
    
    return {
        "scheduled_count": len(scheduled_posts),
        "posts": [
            {
                "post_id": post.id,
                "scheduled_for": post.scheduled_for,
                "platforms": post.platforms
            }
            for post in scheduled_posts
        ],
        "message": f"Successfully scheduled {len(scheduled_posts)} posts"
    }
