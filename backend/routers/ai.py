from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import random
import asyncio
from typing import List, Dict, Any

from database import get_db
from models import User, MediaFile
from schemas import AIPromptRequest, AIContentResponse, GeneratedContent
from routers.auth import get_current_user

router = APIRouter()

# Business goal strategies
GOAL_STRATEGIES = {
    "sales": {
        "tone": "Create urgency and highlight value",
        "ctas": ["Shop now", "Order today", "Get yours", "Buy now", "Limited time"],
        "hashtags": ["#Sale", "#BuyNow", "#LimitedTime", "#Deal", "#Offer", "#ShopLocal"],
        "focus": "conversion",
        "emoji_style": "💰🛍️✨🔥",
        "platforms": ["instagram", "facebook"]
    },
    "visits": {
        "tone": "Emphasize location and experience",
        "ctas": ["Visit us", "Come by", "Stop in", "See you soon", "Experience it"],
        "hashtags": ["#VisitUs", "#LocalBusiness", "#InStore", "#Experience", "#Community"],
        "focus": "location",
        "emoji_style": "🏪📍✨🎯",
        "platforms": ["instagram", "facebook", "google"]
    },
    "followers": {
        "tone": "Engaging and shareable content",
        "ctas": ["Follow for more", "Tag a friend", "Share this", "Join us"],
        "hashtags": ["#Follow", "#Community", "#JoinUs", "#ShareThis", "#NewFollowers"],
        "focus": "engagement",
        "emoji_style": "🚀❤️👥✨",
        "platforms": ["instagram", "tiktok"]
    },
    "awareness": {
        "tone": "Educational and brand-focused",
        "ctas": ["Learn more", "Discover", "Explore", "Find out", "See why"],
        "hashtags": ["#Brand", "#Quality", "#Discover", "#Learn", "#NewBrand"],
        "focus": "reach",
        "emoji_style": "🌟💫⭐🎯",
        "platforms": ["instagram", "tiktok", "facebook"]
    },
    "messages": {
        "tone": "Personal and direct",
        "ctas": ["DM us", "WhatsApp us", "Message for details", "Contact us"],
        "hashtags": ["#DMUs", "#WhatsApp", "#Contact", "#GetInTouch", "#MessageUs"],
        "focus": "direct_contact",
        "emoji_style": "💬📲✨🤝",
        "platforms": ["instagram", "tiktok"]
    }
}

async def generate_ai_content_advanced(prompt: str, goal: str, location: str = None) -> List[GeneratedContent]:
    """Advanced AI content generation with business focus"""
    strategy = GOAL_STRATEGIES.get(goal, GOAL_STRATEGIES["sales"])
    
    # Simulate AI processing delay
    await asyncio.sleep(2)
    
    # Content templates based on goal and platform
    content_templates = {
        "instagram": {
            "sales": [
                f"✨ {prompt} ✨\n\nDon't miss out on this incredible opportunity! {random.choice(strategy['ctas'])} and experience the difference. Limited time offer! 💫\n\n{f'Available in {location}! 📍' if location else ''}",
                f"🔥 JUST DROPPED! 🔥\n\n{prompt}\n\nSeriously, this is everything you've been looking for. {random.choice(strategy['ctas'])} before it's gone! ⚡\n\n{f'Visit us in {location} 🏪' if location else ''}",
                f"This is your sign to treat yourself! ✨\n\n{prompt}\n\n{random.choice(strategy['ctas'])} and thank us later! Your future self will love you for this decision 💖\n\n{f'#{location.replace(' ', '')}' if location else ''}"
            ],
            "visits": [
                f"Come see the magic in person! ✨\n\n{prompt}\n\n{random.choice(strategy['ctas'])} {f'at {location}' if location else ''} and experience what everyone's talking about! 🏪\n\nWe can't wait to welcome you! 🤗",
                f"Your next favorite spot awaits! 📍\n\n{prompt}\n\n{random.choice(strategy['ctas'])} {f'in {location}' if location else ''} for an experience you won't forget. Open today! ✨",
                f"Local gem alert! 💎\n\n{prompt}\n\n{random.choice(strategy['ctas'])} {f'and find us in {location}' if location else ''}. Supporting local has never felt this good! 🏪❤️"
            ],
            "followers": [
                f"This content hits different! 🔥\n\n{prompt}\n\n{random.choice(strategy['ctas'])} for daily inspiration like this! Your feed will thank you ✨",
                f"POV: You just found your new obsession 😍\n\n{prompt}\n\n{random.choice(strategy['ctas'])} if you want more content that speaks to your soul! 💫"
            ],
            "awareness": [
                f"Let's talk about quality! ✨\n\n{prompt}\n\n{random.choice(strategy['ctas'])} what makes us different. Education over everything! 🎯",
                f"Behind the scenes magic! 🌟\n\n{prompt}\n\n{random.choice(strategy['ctas'])} the story behind the brand. Transparency matters! 💎"
            ],
            "messages": [
                f"Slide into our DMs! 💬\n\n{prompt}\n\n{random.choice(strategy['ctas'])} and let's chat about what you need! We're here for you 🤝",
                f"Questions? We have answers! ✨\n\n{prompt}\n\n{random.choice(strategy['ctas'])} for personalized recommendations! 📲"
            ]
        },
        "facebook": {
            "sales": [
                f"Exciting news from our team! 🎉\n\n{prompt}\n\nWe're thrilled to offer this to our wonderful community. {random.choice(strategy['ctas'])} and see why customers keep coming back! {f'Available in {location}.' if location else ''}",
                f"Quality meets affordability! ✨\n\n{prompt}\n\nAfter months of development, we're proud to present this to you. {random.choice(strategy['ctas'])} and experience the difference quality makes. {f'Serving {location} with pride!' if location else ''}"
            ],
            "visits": [
                f"We'd love to see you! 🤗\n\n{prompt}\n\n{random.choice(strategy['ctas'])} {f'at our {location} location' if location else ''} and meet our friendly team. We're open and ready to serve you with a smile! 😊",
                f"Your local business needs your support! ❤️\n\n{prompt}\n\n{random.choice(strategy['ctas'])} {f'in {location}' if location else ''} and experience what makes us special. Supporting local businesses makes a difference! 🏪"
            ],
            "followers": [
                f"Building community, one post at a time! 👥\n\n{prompt}\n\n{random.choice(strategy['ctas'])} and be part of our growing family! Together we're stronger 💪",
                f"Your support means everything! ❤️\n\n{prompt}\n\n{random.choice(strategy['ctas'])} and let's grow together! Community over competition 🤝"
            ],
            "awareness": [
                f"Education is empowerment! 📚\n\n{prompt}\n\n{random.choice(strategy['ctas'])} what sets us apart. Knowledge is power! 💡",
                f"Let's change the conversation! 🌟\n\n{prompt}\n\n{random.choice(strategy['ctas'])} why this matters. Be part of the change! ✊"
            ],
            "messages": [
                f"Let's chat! 💬\n\n{prompt}\n\n{random.choice(strategy['ctas'])} and let's discuss your needs personally. We're here to help! 🤝",
                f"Personal service matters! ✨\n\n{prompt}\n\n{random.choice(strategy['ctas'])} for a conversation that matters. Real people, real solutions! 📞"
            ]
        },
        "tiktok": {
            "sales": [
                f"This is actually everything! 😍\n\n{prompt}\n\n{random.choice(strategy['ctas'])} bestie, you won't regret it! ✨",
                f"No cap, this hits different! 🔥\n\n{prompt}\n\n{random.choice(strategy['ctas'])} fr fr, your wallet will thank you! 💸"
            ],
            "visits": [
                f"IRL > URL vibes! 📍\n\n{prompt}\n\n{random.choice(strategy['ctas'])} {f'in {location}' if location else ''} for the full experience! Touch grass bestie! 🌱",
                f"Local business appreciation post! 🏪\n\n{prompt}\n\n{random.choice(strategy['ctas'])} and support small business! Community vibes only! ❤️"
            ],
            "followers": [
                f"POV: You just found your new obsession 😍\n\n{prompt}\n\n{random.choice(strategy['ctas'])} for more content like this! 🚀",
                f"This is actually life-changing??? 🤯\n\n{prompt}\n\n{random.choice(strategy['ctas'])} if you want your mind blown daily! ✨"
            ],
            "awareness": [
                f"Educating the people! 📚\n\n{prompt}\n\n{random.choice(strategy['ctas'])} why this matters! Knowledge is power! 💪",
                f"Spilling the tea on quality! ☕\n\n{prompt}\n\n{random.choice(strategy['ctas'])} the real facts! No cap! 🎯"
            ],
            "messages": [
                f"Slide into my DMs! 📲\n\n{prompt}\n\n{random.choice(strategy['ctas'])} and let's chat! I reply to everyone! 💬",
                f"Your questions deserve answers! ✨\n\n{prompt}\n\n{random.choice(strategy['ctas'])} for personalized help! Real talk! 🤝"
            ]
        }
    }
    
    # Generate content for each platform
    generated_content = []
    platforms = strategy.get("platforms", ["instagram", "facebook", "tiktok"])
    
    for platform in platforms:
        # Select appropriate template
        goal_templates = content_templates.get(platform, {}).get(goal)
        if not goal_templates:
            goal_templates = [f"{prompt} {random.choice(strategy['ctas'])}! ✨"]
        
        caption = random.choice(goal_templates)
        
        # Generate hashtags
        base_hashtags = strategy["hashtags"].copy()
        
        # Add location hashtags
        if location:
            location_clean = location.replace(' ', '').replace(',', '')
            location_hashtags = [f"#{location_clean}", f"#{location_clean}Business"]
            base_hashtags.extend(location_hashtags)
        
        # Add platform-specific hashtags
        platform_hashtags = {
            "instagram": ["#Instagood", "#PhotoOfTheDay", "#InstaDaily", "#Love"],
            "facebook": ["#SmallBusiness", "#Local", "#Community", "#Quality"],
            "tiktok": ["#FYP", "#Viral", "#Trending", "#ForYou"]
        }
        
        base_hashtags.extend(random.sample(platform_hashtags[platform], 2))
        hashtags = base_hashtags[:10]  # Limit total hashtags
        
        # Calculate estimated metrics
        engagement_rates = {
            "instagram": {"sales": 6.2, "visits": 5.8, "followers": 7.1, "awareness": 5.5, "messages": 6.8},
            "facebook": {"sales": 4.1, "visits": 4.8, "followers": 3.9, "awareness": 4.2, "messages": 5.1},
            "tiktok": {"sales": 8.9, "visits": 7.2, "followers": 12.1, "awareness": 9.4, "messages": 10.2}
        }
        
        reach_estimates = {
            "instagram": {"sales": "15-25K", "visits": "8-15K", "followers": "20-35K", "awareness": "25-40K", "messages": "12-20K"},
            "facebook": {"sales": "5-12K", "visits": "3-8K", "followers": "8-15K", "awareness": "12-20K", "messages": "6-10K"},
            "tiktok": {"sales": "50-100K", "visits": "30-60K", "followers": "100-250K", "awareness": "75-150K", "messages": "40-80K"}
        }
        
        estimated_engagement = engagement_rates.get(platform, {}).get(goal, 5.0) + random.uniform(-1.0, 2.0)
        estimated_reach = reach_estimates.get(platform, {}).get(goal, "10-20K")
        
        # Goal alignment score
        alignment_scores = {"sales": 95, "visits": 92, "followers": 88, "awareness": 90, "messages": 87}
        goal_alignment_score = alignment_scores.get(goal, 85) + random.randint(-5, 10)
        
        content = GeneratedContent(
            platform=platform,
            caption=caption,
            hashtags=hashtags,
            estimated_engagement=round(estimated_engagement, 1),
            estimated_reach=estimated_reach,
            goal_alignment_score=min(100, goal_alignment_score)
        )
        
        generated_content.append(content)
    
    return generated_content

@router.post("/generate-content", response_model=AIContentResponse)
async def generate_content(
    request: AIPromptRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI-powered content for social media platforms"""
    
    # Verify media file belongs to user
    media_file = db.query(MediaFile).filter(
        MediaFile.id == request.media_file_id,
        MediaFile.user_id == current_user.id
    ).first()
    
    if not media_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file not found"
        )
    
    # Generate content
    generated_content = await generate_ai_content_advanced(
        request.prompt,
        request.business_goal,
        request.business_location
    )
    
    # Calculate business impact predictions
    strategy = GOAL_STRATEGIES.get(request.business_goal, GOAL_STRATEGIES["sales"])
    
    business_impact = {
        "goal_type": request.business_goal,
        "expected_reach_boost": "+28%",
        "expected_engagement_boost": "+15%",
        "conversion_probability": "High" if strategy["focus"] == "conversion" else "Medium",
        "optimal_posting_times": ["7-9 AM", "12-2 PM", "5-7 PM"],
        "audience_fit": 92,
        "viral_potential": random.randint(75, 95),
        "business_alignment": 95
    }
    
    return AIContentResponse(
        content=generated_content,
        business_impact=business_impact
    )

@router.post("/rewrite-prompt")
async def rewrite_prompt(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """Rewrite user prompt with AI enhancement"""
    
    user_prompt = request.get("prompt", "")
    goal = request.get("goal", "sales")
    location = request.get("location", "")
    
    if not user_prompt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt is required"
        )
    
    # Simulate AI processing
    await asyncio.sleep(2)
    
    strategy = GOAL_STRATEGIES.get(goal, GOAL_STRATEGIES["sales"])
    
    # Enhanced prompt templates based on goal
    rewrite_templates = {
        "sales": f"✨ {user_prompt} {random.choice(strategy['ctas'])} and experience the difference! 💫",
        "visits": f"🏪 {user_prompt} Visit us {f'in {location}' if location else 'today'} and see for yourself! 🎯",
        "messages": f"💬 {user_prompt} DM us for details and let's make it happen! 📲",
        "awareness": f"🌟 {user_prompt} Discover what makes us special! ✨",
        "followers": f"🔥 {user_prompt} Follow us for more amazing content! 🚀"
    }
    
    enhanced_prompt = rewrite_templates.get(goal, rewrite_templates["sales"])
    
    return {
        "original_prompt": user_prompt,
        "enhanced_prompt": enhanced_prompt,
        "improvement_score": random.randint(85, 98),
        "goal_alignment": random.randint(90, 100),
        "engagement_boost": "+15%"
    }

@router.get("/content-suggestions")
async def get_content_suggestions(
    goal: str = "sales",
    current_user: User = Depends(get_current_user)
):
    """Get AI-powered content suggestions based on business goal"""
    
    strategy = GOAL_STRATEGIES.get(goal, GOAL_STRATEGIES["sales"])
    
    suggestions = {
        "sales": [
            "Flash sale alert! 50% off everything this weekend only",
            "Limited stock remaining - get yours before they're gone",
            "Customer favorite is back in stock - order now",
            "End of season clearance - incredible deals inside",
            "Buy 2 get 1 free - limited time offer"
        ],
        "visits": [
            "Come experience our showroom in person today",
            "Free consultation available - book your appointment",
            "Grand opening celebration this weekend",
            "Meet the team behind the magic - visit us today",
            "See our latest collection in store first"
        ],
        "followers": [
            "Behind the scenes: How we make our products",
            "Tag 3 friends who need to see this",
            "Follow for daily inspiration and tips",
            "What's your favorite style? Comment below",
            "Double tap if you love this as much as we do"
        ],
        "awareness": [
            "The story behind our brand and mission",
            "Why quality matters more than quantity",
            "Meet the artisans who craft our products",
            "Our commitment to sustainable practices",
            "What makes us different from the rest"
        ],
        "messages": [
            "Have questions? DM us for personalized help",
            "WhatsApp us for instant customer support",
            "Need styling advice? Our experts are here to help",
            "Custom orders available - message us for details",
            "Get exclusive offers by messaging us directly"
        ]
    }
    
    return {
        "goal": goal,
        "suggestions": suggestions.get(goal, suggestions["sales"]),
        "strategy": strategy,
        "recommended_hashtags": strategy["hashtags"][:5],
        "best_platforms": strategy["platforms"]
    }
