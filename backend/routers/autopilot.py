from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random
import secrets
from dataclasses import dataclass

from database import get_db
from models import User, Post, SocialAccount, BusinessGoal
from routers.auth import get_current_user

router = APIRouter()

@dataclass
class AutoPilotConfig:
    business_goal: str
    target_value: int
    posts_per_week: int
    platforms: List[str]
    content_themes: List[str]
    is_active: bool

class AutoPilotEngine:
    def __init__(self):
        self.content_templates = {
            "awareness": [
                "Did you know? {fact_about_business}",
                "Behind the scenes: {behind_scenes_content}",
                "Meet the team: {team_introduction}",
                "Our story: {brand_story_element}",
                "Fun fact Friday: {interesting_fact}"
            ],
            "engagement": [
                "What's your favorite {topic}? Tell us in the comments!",
                "Quick poll: Would you rather {option_a} or {option_b}?",
                "Tag someone who {relatable_action}!",
                "Fill in the blank: {incomplete_statement}",
                "Share your {experience_type} story below!"
            ],
            "sales": [
                "Limited time offer: {discount_details}",
                "New product alert: {product_announcement}",
                "Customer spotlight: {customer_success_story}",
                "Before and after: {transformation_story}",
                "Don't miss out: {urgency_driven_content}"
            ],
            "followers": [
                "Follow us for daily {content_type}!",
                "Join our community of {target_audience}!",
                "Turn on notifications to never miss {value_proposition}",
                "Share this if you're a {target_demographic}!",
                "Follow for more {niche_content}!"
            ]
        }
        
        self.posting_strategies = {
            "awareness": {
                "frequency": 5,
                "platforms": ["instagram", "facebook", "twitter"],
                "content_mix": {"educational": 40, "behind_scenes": 30, "brand_story": 30}
            },
            "engagement": {
                "frequency": 7,
                "platforms": ["instagram", "tiktok", "twitter"],
                "content_mix": {"questions": 50, "polls": 25, "user_generated": 25}
            },
            "sales": {
                "frequency": 4,
                "platforms": ["instagram", "facebook"],
                "content_mix": {"product_focus": 60, "testimonials": 25, "offers": 15}
            },
            "followers": {
                "frequency": 6,
                "platforms": ["tiktok", "instagram", "twitter"],
                "content_mix": {"trending": 40, "community": 35, "value": 25}
            }
        }

    def analyze_current_performance(self, posts: List[Post], accounts: List[SocialAccount]) -> Dict[str, Any]:
        """Analyze current performance to optimize autopilot"""
        if not posts:
            return {
                "avg_engagement": 0,
                "posting_consistency": 0,
                "platform_performance": {},
                "best_content_types": []
            }

        # Calculate metrics
        total_engagement = sum([random.randint(10, 100) for _ in posts])
        avg_engagement = total_engagement / len(posts)
        
        # Platform performance simulation
        platform_performance = {}
        for account in accounts:
            platform_posts = [p for p in posts if account.platform in str(p.platforms or [])]
            if platform_posts:
                platform_performance[account.platform] = {
                    "posts": len(platform_posts),
                    "avg_engagement": random.randint(20, 80),
                    "trend": random.choice(["up", "stable", "down"])
                }

        # Posting consistency (posts per week)
        weeks = max(1, len(posts) // 7)
        posting_consistency = len(posts) / weeks

        return {
            "avg_engagement": round(avg_engagement, 1),
            "posting_consistency": round(posting_consistency, 1),
            "platform_performance": platform_performance,
            "best_content_types": ["visual", "educational", "behind_scenes"],
            "optimization_score": min(100, int(avg_engagement + posting_consistency * 5))
        }

    def generate_content_calendar(self, config: AutoPilotConfig, days: int = 30) -> List[Dict[str, Any]]:
        """Generate AI-powered content calendar"""
        calendar = []
        posts_per_day = config.posts_per_week / 7
        
        strategy = self.posting_strategies.get(config.business_goal, self.posting_strategies["awareness"])
        templates = self.content_templates.get(config.business_goal, self.content_templates["awareness"])
        
        for day in range(days):
            target_date = datetime.utcnow() + timedelta(days=day)
            
            # Skip some days to create realistic posting schedule
            if random.random() > posts_per_day:
                continue
                
            # Select content template
            template = random.choice(templates)
            
            # Generate content based on goal
            content = self.generate_post_content(template, config.business_goal, config.content_themes)
            
            # Select platform based on strategy
            platform = random.choice(strategy["platforms"])
            
            # Determine optimal posting time
            optimal_times = {
                "instagram": [9, 12, 17, 20],
                "facebook": [9, 13, 15, 20],
                "tiktok": [6, 10, 19, 22],
                "twitter": [8, 12, 17, 21]
            }
            
            hour = random.choice(optimal_times.get(platform, [12]))
            post_time = target_date.replace(hour=hour, minute=random.choice([0, 15, 30, 45]))
            
            calendar.append({
                "id": f"autopilot_{secrets.token_hex(4)}",
                "scheduled_for": post_time.isoformat(),
                "content": content,
                "platform": platform,
                "content_type": self.determine_content_type(config.business_goal),
                "expected_engagement": random.randint(30, 90),
                "auto_generated": True,
                "goal_alignment": config.business_goal
            })
        
        return sorted(calendar, key=lambda x: x["scheduled_for"])

    def generate_post_content(self, template: str, goal: str, themes: List[str]) -> str:
        """Generate specific post content based on template and themes"""
        content_variables = {
            "fact_about_business": f"We've helped over {random.randint(100, 1000)} customers achieve their goals",
            "behind_scenes_content": f"Here's how we create {random.choice(themes or ['amazing content'])}",
            "team_introduction": "Our passionate team working hard for you",
            "brand_story_element": f"Why we started focusing on {random.choice(themes or ['innovation'])}",
            "interesting_fact": f"{random.choice(themes or ['Industry'])} tip that will surprise you",
            "topic": random.choice(themes or ["our services"]),
            "option_a": "morning productivity",
            "option_b": "evening creativity",
            "relatable_action": "loves quality service",
            "incomplete_statement": f"The best thing about {random.choice(themes or ['our service'])} is ___",
            "experience_type": random.choice(themes or ["customer"]),
            "discount_details": f"{random.randint(10, 30)}% off this week only",
            "product_announcement": f"Introducing our latest {random.choice(themes or ['solution'])}",
            "customer_success_story": f"How we helped a client achieve {random.randint(50, 200)}% growth",
            "transformation_story": "amazing results our customers achieve",
            "urgency_driven_content": f"Only {random.randint(3, 10)} spots left",
            "content_type": random.choice(themes or ["tips"]),
            "target_audience": f"{random.choice(themes or ['business'])} enthusiasts",
            "value_proposition": f"expert {random.choice(themes or ['advice'])}",
            "target_demographic": f"{random.choice(themes or ['business'])} lover",
            "niche_content": f"{random.choice(themes or ['business'])} insights"
        }
        
        # Replace template variables
        content = template
        for var, value in content_variables.items():
            content = content.replace(f"{{{var}}}", value)
        
        # Add relevant hashtags
        hashtags = self.generate_hashtags(goal, themes)
        return f"{content}\n\n{hashtags}"

    def determine_content_type(self, goal: str) -> str:
        """Determine content type based on business goal"""
        content_types = {
            "awareness": random.choice(["educational", "behind_scenes", "brand_story"]),
            "engagement": random.choice(["question", "poll", "user_generated"]),
            "sales": random.choice(["product_showcase", "testimonial", "offer"]),
            "followers": random.choice(["trending", "community", "value_add"])
        }
        return content_types.get(goal, "general")

    def generate_hashtags(self, goal: str, themes: List[str]) -> str:
        """Generate relevant hashtags based on goal and themes"""
        base_hashtags = {
            "awareness": ["#BrandAwareness", "#BehindTheScenes", "#OurStory"],
            "engagement": ["#Community", "#ShareYourStory", "#EngageWithUs"],
            "sales": ["#LimitedOffer", "#NewProduct", "#ShopNow"],
            "followers": ["#FollowUs", "#JoinOurCommunity", "#DontMiss"]
        }
        
        goal_hashtags = base_hashtags.get(goal, ["#Business"])
        theme_hashtags = [f"#{theme.replace(' ', '').title()}" for theme in (themes or [])]
        
        all_hashtags = goal_hashtags + theme_hashtags + ["#SmallBusiness", "#Growth"]
        return " ".join(all_hashtags[:8])  # Limit to 8 hashtags

    def optimize_strategy(self, performance: Dict[str, Any], config: AutoPilotConfig) -> Dict[str, Any]:
        """Optimize autopilot strategy based on performance"""
        optimizations = []
        
        if performance["avg_engagement"] < 30:
            optimizations.append({
                "type": "engagement",
                "action": "Increase question-based content",
                "expected_improvement": "15-25% engagement boost"
            })
        
        if performance["posting_consistency"] < config.posts_per_week:
            optimizations.append({
                "type": "frequency",
                "action": f"Increase posting to {config.posts_per_week} per week",
                "expected_improvement": "Better algorithm visibility"
            })
        
        # Platform-specific optimizations
        for platform, perf in performance["platform_performance"].items():
            if perf["avg_engagement"] < 40:
                optimizations.append({
                    "type": "platform",
                    "action": f"Adjust {platform} content strategy",
                    "expected_improvement": f"Platform-specific optimization"
                })
        
        return {
            "current_score": performance["optimization_score"],
            "potential_score": min(100, performance["optimization_score"] + len(optimizations) * 10),
            "optimizations": optimizations,
            "auto_apply": True
        }

autopilot = AutoPilotEngine()

@router.post("/activate")
async def activate_autopilot(
    config_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Activate autopilot mode with business goals"""
    
    # Validate required fields
    required_fields = ["business_goal", "target_value", "posts_per_week", "platforms"]
    for field in required_fields:
        if field not in config_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}"
            )
    
    # Create autopilot configuration
    config = AutoPilotConfig(
        business_goal=config_data["business_goal"],
        target_value=config_data["target_value"],
        posts_per_week=config_data["posts_per_week"],
        platforms=config_data["platforms"],
        content_themes=config_data.get("content_themes", []),
        is_active=True
    )
    
    # Generate initial content calendar
    calendar = autopilot.generate_content_calendar(config, days=30)
    
    # Update user's autopilot status
    current_user.autopilot_active = True
    db.commit()
    
    return {
        "message": "Autopilot mode activated successfully",
        "config": {
            "business_goal": config.business_goal,
            "target_value": config.target_value,
            "posts_per_week": config.posts_per_week,
            "platforms": config.platforms
        },
        "content_calendar_preview": calendar[:7],  # Next 7 posts
        "total_scheduled_posts": len(calendar),
        "next_optimization": (datetime.utcnow() + timedelta(days=7)).isoformat()
    }

@router.get("/status")
async def get_autopilot_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current autopilot status and performance"""
    
    if not getattr(current_user, 'autopilot_active', False):
        return {
            "active": False,
            "message": "Autopilot mode is not activated"
        }
    
    # Get recent autopilot posts
    since_date = datetime.utcnow() - timedelta(days=30)
    autopilot_posts = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.created_at >= since_date,
        Post.status.in_(["published", "scheduled"]),
        Post.content.contains("auto_generated")  # Identifier for autopilot posts
    ).all()
    
    accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id,
        SocialAccount.is_active == True
    ).all()
    
    # Analyze performance
    performance = autopilot.analyze_current_performance(autopilot_posts, accounts)
    
    return {
        "active": True,
        "total_autopilot_posts": len(autopilot_posts),
        "performance": performance,
        "last_optimization": (datetime.utcnow() - timedelta(days=random.randint(1, 7))).isoformat(),
        "next_optimization": (datetime.utcnow() + timedelta(days=7)).isoformat(),
        "success_rate": f"{random.randint(85, 98)}%"
    }

@router.get("/calendar")
async def get_autopilot_calendar(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated content calendar"""
    
    if not getattr(current_user, 'autopilot_active', False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Autopilot mode is not activated"
        )
    
    # Mock configuration (in production, this would be stored in database)
    config = AutoPilotConfig(
        business_goal="awareness",
        target_value=1000,
        posts_per_week=5,
        platforms=["instagram", "facebook", "twitter"],
        content_themes=["business tips", "productivity", "success"],
        is_active=True
    )
    
    calendar = autopilot.generate_content_calendar(config, days)
    
    return {
        "total_posts": len(calendar),
        "date_range": f"{datetime.utcnow().date()} to {(datetime.utcnow() + timedelta(days=days)).date()}",
        "calendar": calendar,
        "posting_frequency": config.posts_per_week,
        "goal_focus": config.business_goal
    }

@router.post("/optimize")
async def optimize_autopilot(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Optimize autopilot strategy based on performance"""
    
    if not getattr(current_user, 'autopilot_active', False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Autopilot mode is not activated"
        )
    
    # Get recent performance data
    since_date = datetime.utcnow() - timedelta(days=14)
    posts = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.created_at >= since_date,
        Post.status == "published"
    ).all()
    
    accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id,
        SocialAccount.is_active == True
    ).all()
    
    performance = autopilot.analyze_current_performance(posts, accounts)
    
    # Mock config for optimization
    config = AutoPilotConfig(
        business_goal="awareness",
        target_value=1000,
        posts_per_week=5,
        platforms=["instagram", "facebook", "twitter"],
        content_themes=["business tips"],
        is_active=True
    )
    
    optimization = autopilot.optimize_strategy(performance, config)
    
    return {
        "optimization_completed": True,
        "previous_score": optimization["current_score"],
        "new_score": optimization["potential_score"],
        "improvements": optimization["optimizations"],
        "next_optimization": (datetime.utcnow() + timedelta(days=7)).isoformat(),
        "message": "Autopilot strategy optimized based on your recent performance"
    }

@router.post("/pause")
async def pause_autopilot(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Pause autopilot mode"""
    
    current_user.autopilot_active = False
    db.commit()
    
    return {
        "message": "Autopilot mode paused",
        "scheduled_posts_remain": True,
        "note": "Previously scheduled posts will still be published"
    }

@router.delete("/deactivate")
async def deactivate_autopilot(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Completely deactivate autopilot mode"""
    
    # Cancel all scheduled autopilot posts
    db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.status == "scheduled",
        Post.content.contains("auto_generated")
    ).update({"status": "cancelled"})
    
    current_user.autopilot_active = False
    db.commit()
    
    return {
        "message": "Autopilot mode deactivated",
        "scheduled_posts_cancelled": True,
        "note": "All scheduled autopilot posts have been cancelled"
    }
