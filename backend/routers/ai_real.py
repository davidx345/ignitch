"""
Real AI Content Generation Router
Uses OpenAI API for actual content generation and optimization
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import logging

from database import get_db
from models import User, MediaFile, Post
from schemas import AIPromptRequest, AIContentResponse, GeneratedContent
from routers.auth import get_current_user
from services.openai_service import openai_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate-content", response_model=AIContentResponse)
async def generate_content(
    request: AIPromptRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI-powered content for social media platforms"""
    try:
        # Prepare context for AI generation
        user_context = {
            "business_name": current_user.business_name,
            "business_location": current_user.business_location,
            "user_preferences": {
                "tone": request.tone if hasattr(request, 'tone') else 'professional',
                "target_audience": request.target_audience if hasattr(request, 'target_audience') else 'general'
            }
        }
        
        # Generate content using OpenAI
        result = await openai_service.generate_content(
            prompt=request.prompt,
            business_goal=request.business_goal,
            context=user_context
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Content generation failed: {result.get('error')}"
            )
        
        generated_content = result["content"]
        
        # Structure response according to schema
        content_response = AIContentResponse(
            generated_content=[
                GeneratedContent(
                    platform="instagram",
                    content=generated_content.get("instagram", ""),
                    hashtags=_extract_hashtags(generated_content.get("instagram", "")),
                    estimated_engagement=_estimate_engagement("instagram", request.business_goal)
                ),
                GeneratedContent(
                    platform="facebook",
                    content=generated_content.get("facebook", ""),
                    hashtags=_extract_hashtags(generated_content.get("facebook", "")),
                    estimated_engagement=_estimate_engagement("facebook", request.business_goal)
                ),
                GeneratedContent(
                    platform="twitter",
                    content=generated_content.get("twitter", ""),
                    hashtags=_extract_hashtags(generated_content.get("twitter", "")),
                    estimated_engagement=_estimate_engagement("twitter", request.business_goal)
                ),
                GeneratedContent(
                    platform="tiktok",
                    content=generated_content.get("tiktok", ""),
                    hashtags=_extract_hashtags(generated_content.get("tiktok", "")),
                    estimated_engagement=_estimate_engagement("tiktok", request.business_goal)
                )
            ],
            business_goal=request.business_goal,
            strategy_notes=generated_content.get("strategy_notes", "AI-optimized content for maximum engagement"),
            tokens_used=result.get("tokens_used", 0)
        )
        
        return content_response
        
    except Exception as e:
        logger.error(f"Content generation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate content: {str(e)}"
        )

@router.post("/optimize-content")
async def optimize_content(
    content: str,
    platform: str,
    goal: str,
    current_user: User = Depends(get_current_user)
):
    """Optimize existing content for specific platform and goal"""
    try:
        result = await openai_service.optimize_content(
            content=content,
            platform=platform,
            goal=goal
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Content optimization failed: {result.get('error')}"
            )
        
        return {
            "optimized_content": result["optimization"],
            "original_content": content,
            "platform": platform,
            "goal": goal,
            "tokens_used": result.get("tokens_used", 0)
        }
        
    except Exception as e:
        logger.error(f"Content optimization error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to optimize content: {str(e)}"
        )

@router.post("/analyze-performance")
async def analyze_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze user's social media performance using AI"""
    try:
        # Get user's recent posts
        recent_posts = db.query(Post).filter(
            Post.user_id == current_user.id,
            Post.status == "published"
        ).order_by(Post.published_at.desc()).limit(20).all()
        
        if not recent_posts:
            return {
                "analysis": {
                    "summary": "No published posts found for analysis",
                    "recommendations": ["Start by publishing some content to get AI analysis"]
                },
                "posts_analyzed": 0
            }
        
        # Prepare posts data for analysis
        posts_data = []
        for post in recent_posts:
            posts_data.append({
                "id": post.id,
                "content": post.content[:200],  # Truncate for API efficiency
                "platforms": post.platforms,
                "business_goal": post.business_goal,
                "reach": post.reach,
                "engagement": post.engagement,
                "clicks": post.clicks,
                "published_at": post.published_at.isoformat() if post.published_at else None
            })
        
        # Get AI analysis
        result = await openai_service.analyze_performance(
            posts_data=posts_data,
            business_goal=recent_posts[0].business_goal
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Performance analysis failed: {result.get('error')}"
            )
        
        return {
            "analysis": result["analysis"],
            "posts_analyzed": len(posts_data),
            "tokens_used": result.get("tokens_used", 0)
        }
        
    except Exception as e:
        logger.error(f"Performance analysis error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze performance: {str(e)}"
        )

@router.post("/generate-calendar")
async def generate_content_calendar(
    days: int = 7,
    business_goal: str = "engagement",
    content_style: str = "balanced",
    current_user: User = Depends(get_current_user)
):
    """Generate AI-powered content calendar"""
    try:
        # Prepare user preferences
        preferences = {
            "business_name": current_user.business_name,
            "business_location": current_user.business_location,
            "content_style": content_style,
            "posting_frequency": "optimal"
        }
        
        result = await openai_service.generate_content_calendar(
            business_goal=business_goal,
            preferences=preferences,
            days=days
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Calendar generation failed: {result.get('error')}"
            )
        
        return {
            "calendar": result["calendar"],
            "days": days,
            "business_goal": business_goal,
            "tokens_used": result.get("tokens_used", 0)
        }
        
    except Exception as e:
        logger.error(f"Calendar generation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate calendar: {str(e)}"
        )

@router.get("/business-insights")
async def get_business_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered business insights and recommendations"""
    try:
        # Gather user data
        user_data = {
            "business_name": current_user.business_name,
            "business_location": current_user.business_location,
            "account_age_days": (datetime.now() - current_user.created_at).days if current_user.created_at else 0,
            "total_posts": db.query(Post).filter(Post.user_id == current_user.id).count()
        }
        
        # Get performance data
        recent_posts = db.query(Post).filter(
            Post.user_id == current_user.id,
            Post.status == "published"
        ).order_by(Post.published_at.desc()).limit(10).all()
        
        performance_data = {
            "total_reach": sum([post.reach for post in recent_posts]),
            "total_engagement": sum([post.engagement for post in recent_posts]),
            "avg_engagement_rate": sum([post.engagement for post in recent_posts]) / len(recent_posts) if recent_posts else 0,
            "platforms_used": list(set([platform for post in recent_posts for platform in post.platforms])),
            "most_common_goal": current_user.business_goals[0].goal_type if current_user.business_goals else "engagement"
        }
        
        # Generate AI insights
        result = await openai_service.generate_business_insights(
            user_data=user_data,
            performance_data=performance_data
        )
        
        if not result.get("success"):
            # Fallback to basic insights if AI fails
            return {
                "insights": [
                    {
                        "title": "Keep posting consistently",
                        "description": "Regular posting helps maintain audience engagement",
                        "priority": "medium",
                        "expected_impact": "medium",
                        "action_required": True
                    }
                ],
                "ai_generated": False
            }
        
        return {
            "insights": result["insights"],
            "tokens_used": result.get("tokens_used", 0),
            "ai_generated": True
        }
        
    except Exception as e:
        logger.error(f"Business insights error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate insights: {str(e)}"
        )

@router.get("/cost-estimate")
async def get_cost_estimate(
    current_user: User = Depends(get_current_user)
):
    """Get estimated costs for AI usage"""
    try:
        # Estimate based on typical usage
        estimates = {
            "content_generation": {
                "tokens_per_request": 800,
                "cost_per_request": openai_service.estimate_cost(800),
                "monthly_estimate_10_posts": openai_service.estimate_cost(800 * 10 * 4)  # 10 posts/week * 4 weeks
            },
            "performance_analysis": {
                "tokens_per_analysis": 1200,
                "cost_per_analysis": openai_service.estimate_cost(1200),
                "monthly_estimate": openai_service.estimate_cost(1200 * 4)  # Weekly analysis
            },
            "business_insights": {
                "tokens_per_insight": 1000,
                "cost_per_insight": openai_service.estimate_cost(1000),
                "monthly_estimate": openai_service.estimate_cost(1000 * 8)  # Bi-weekly insights
            }
        }
        
        total_monthly_estimate = (
            estimates["content_generation"]["monthly_estimate_10_posts"] +
            estimates["performance_analysis"]["monthly_estimate"] +
            estimates["business_insights"]["monthly_estimate"]
        )
        
        return {
            "estimates": estimates,
            "total_monthly_estimate": round(total_monthly_estimate, 2),
            "currency": "USD",
            "note": "Estimates based on GPT-3.5-turbo pricing"
        }
        
    except Exception as e:
        logger.error(f"Cost estimation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to estimate costs: {str(e)}"
        )

# Helper functions
def _extract_hashtags(content: str) -> List[str]:
    """Extract hashtags from content"""
    words = content.split()
    hashtags = [word for word in words if word.startswith('#')]
    return hashtags[:10]  # Limit to 10 hashtags

def _estimate_engagement(platform: str, goal: str) -> float:
    """Estimate engagement based on platform and goal"""
    base_rates = {
        "instagram": 0.034,
        "facebook": 0.018,
        "twitter": 0.045,
        "tiktok": 0.18
    }
    
    goal_multipliers = {
        "engagement": 1.2,
        "followers": 1.1,
        "sales": 0.9,
        "visits": 1.0,
        "awareness": 1.05
    }
    
    base_rate = base_rates.get(platform, 0.03)
    multiplier = goal_multipliers.get(goal, 1.0)
    
    return round(base_rate * multiplier, 3)
