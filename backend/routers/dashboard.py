from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import asyncio
from collections import defaultdict

from database import get_db
from models import User, Post, SocialAccount, MediaFile, BusinessGoal
from schemas import UserResponse, PostCreate, PostResponse
from routers.auth import get_current_user

router = APIRouter()

# WebSocket connection manager for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        self.active_connections.remove(websocket)
        if user_id in self.user_connections:
            self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def send_user_update(self, message: dict, user_id: str):
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    # Remove dead connections
                    self.user_connections[user_id].remove(connection)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove dead connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time dashboard updates"""
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            # Echo back for testing
            await manager.send_personal_message(f"Echo: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

async def broadcast_stats_update(user_id: str, db: Session):
    """Broadcast updated stats to user's connected clients"""
    stats = await get_real_time_stats(user_id, db)
    await manager.send_user_update({
        "type": "stats_update",
        "data": stats
    }, user_id)

async def get_real_time_stats(user_id: str, db: Session) -> Dict[str, Any]:
    """Get real-time stats from database"""
    
    # Get actual counts from database
    total_posts = db.query(Post).filter(
        Post.user_id == user_id,
        Post.status == "published"
    ).count()
    
    # Get actual reach sum
    reach_result = db.query(func.sum(Post.actual_reach)).filter(
        Post.user_id == user_id,
        Post.status == "published",
        Post.actual_reach.isnot(None)
    ).scalar()
    total_reach = reach_result or 0
    
    # Get actual engagement sum
    engagement_result = db.query(func.sum(Post.actual_engagement)).filter(
        Post.user_id == user_id,
        Post.status == "published",
        Post.actual_engagement.isnot(None)
    ).scalar()
    total_engagement = engagement_result or 0
    
    # Calculate real average engagement rate
    avg_engagement = 0
    if total_reach > 0:
        avg_engagement = round((total_engagement / total_reach) * 100, 1)
    
    # Get connected platforms count
    connected_platforms = db.query(SocialAccount).filter(
        SocialAccount.user_id == user_id,
        SocialAccount.is_active == True
    ).count()
    
    # Posts this week
    week_ago = datetime.utcnow() - timedelta(days=7)
    posts_this_week = db.query(Post).filter(
        Post.user_id == user_id,
        Post.created_at >= week_ago,
        Post.status == "published"
    ).count()
    
    return {
        "total_posts": total_posts,
        "total_reach": total_reach,
        "avg_engagement": avg_engagement,
        "connected_platforms": connected_platforms,
        "posts_this_week": posts_this_week
    }

@router.get("/overview")
async def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard overview with REAL DATA"""
    
    # Get REAL posts from database - only published ones
    recent_posts = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.status == "published"
    ).order_by(Post.created_at.desc()).limit(10).all()
    
    # Get REAL connected social accounts
    social_accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id,
        SocialAccount.is_active == True
    ).all()
    
    # Get REAL media files count
    media_files = db.query(MediaFile).filter(
        MediaFile.user_id == current_user.id
    ).count()
    
    # Calculate REAL stats from database
    stats = await get_real_time_stats(current_user.id, db)
    
    # Get REAL recent posts for display (not mock data)
    formatted_recent_posts = []
    for post in recent_posts[:5]:  # Show last 5 posts
        formatted_recent_posts.append({
            "id": post.id,
            "title": f"Post from {post.created_at.strftime('%b %d')}",
            "platform": post.platforms[0] if post.platforms else "Multiple",
            "content_preview": post.content[:50] + "..." if len(post.content) > 50 else post.content,
            "status": post.status,
            "reach": post.actual_reach or 0,
            "engagement": post.actual_engagement or 0,
            "created_at": post.created_at,
            "has_media": bool(post.media_url)
        })
    
    # REAL performance insights - no fake data
    performance_insights = []
    
    if stats["total_posts"] > 0:
        if stats["avg_engagement"] > 5.0:
            performance_insights.append({
                "metric": "Engagement Rate",
                "value": f"{stats['avg_engagement']}%",
                "trend": "up",
                "period": "this month",
                "description": "Strong engagement performance"
            })
        elif stats["avg_engagement"] > 0:
            performance_insights.append({
                "metric": "Engagement Rate", 
                "value": f"{stats['avg_engagement']}%",
                "trend": "stable",
                "period": "this month",
                "description": "Building engagement steadily"
            })
    
    if stats["posts_this_week"] > 0:
        performance_insights.append({
            "metric": "Posts This Week",
            "value": str(stats["posts_this_week"]),
            "trend": "up" if stats["posts_this_week"] >= 3 else "down",
            "period": "this week",
            "description": "Consistent posting schedule" if stats["posts_this_week"] >= 3 else "Increase posting frequency"
        })
    
    if stats["connected_platforms"] > 1:
        performance_insights.append({
            "metric": "Platform Reach",
            "value": f"{stats['connected_platforms']} platforms",
            "trend": "up",
            "period": "connected",
            "description": "Multi-platform presence active"
        })
    
    # If no real insights, show empty state
    if not performance_insights:
        performance_insights.append({
            "metric": "Getting Started",
            "value": "0 posts",
            "trend": "new",
            "period": "all time",
            "description": "Create your first post to see insights"
        })
    
    return {
        "stats": {
            "total_posts": stats["total_posts"],
            "total_reach": stats["total_reach"], 
            "avg_engagement": stats["avg_engagement"],
            "connected_platforms": stats["connected_platforms"],
            "posts_this_week": stats["posts_this_week"],
            "visibility_score": current_user.visibility_score or 0,
            "media_files": media_files
        },
        "recent_posts": formatted_recent_posts,
        "performance_insights": performance_insights,
        "platform_performance": [],  # Add empty array for compatibility
        "visibility_tips": [insight["description"] for insight in performance_insights],
        "quick_actions": [
            {
                "title": "Upload & Create",
                "description": "Upload media and generate AI content",
                "action": "upload_create",
                "icon": "upload",
                "priority": "high" if stats["total_posts"] == 0 else "medium"
            },
            {
                "title": "Schedule Posts", 
                "description": "Plan your content calendar",
                "action": "schedule",
                "icon": "calendar",
                "priority": "medium"
            },
            {
                "title": "Billboard Ads",
                "description": "Create advertising campaigns", 
                "action": "billboard",
                "icon": "ads",
                "priority": "low"
            }
        ],
        "websocket_url": f"/api/dashboard/ws/{current_user.id}"
    }

@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get real-time dashboard stats - REAL DATA ONLY"""
    
    stats = await get_real_time_stats(current_user.id, db)
    
    # Add visibility score from user profile
    stats["visibility_score"] = current_user.visibility_score or 0
    
    return stats

@router.get("/analytics")
async def get_detailed_analytics(
    period: str = "30d",  # 7d, 30d, 90d
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed analytics with REAL DATA"""
    
    # Parse period
    period_days = {
        "7d": 7,
        "30d": 30,
        "90d": 90
    }.get(period, 30)
    
    start_date = datetime.utcnow() - timedelta(days=period_days)
    
    # Get REAL posts for the period
    posts = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.created_at >= start_date,
        Post.status == "published"
    ).order_by(Post.created_at.asc()).all()
    
    # Get REAL social accounts
    accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id == current_user.id
    ).all()
    
    # REAL time series data (daily breakdown)
    daily_stats = defaultdict(lambda: {
        "posts": 0,
        "engagement": 0,
        "reach": 0,
        "date": None
    })
    
    for post in posts:
        date_key = post.created_at.date()
        daily_stats[date_key]["posts"] += 1
        daily_stats[date_key]["engagement"] += post.actual_engagement or 0
        daily_stats[date_key]["reach"] += post.actual_reach or 0
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
    
    # REAL platform performance
    platform_performance = {}
    for account in accounts:
        platform = account.platform
        platform_posts = [p for p in posts if hasattr(p, 'platforms') and platform in (p.platforms or [])]
        
        total_engagement = sum(p.actual_engagement or 0 for p in platform_posts)
        total_reach = sum(p.actual_reach or 0 for p in platform_posts)
        
        platform_performance[platform] = {
            "posts": len(platform_posts),
            "engagement": total_engagement,
            "reach": total_reach,
            "avg_engagement_per_post": round(total_engagement / max(len(platform_posts), 1), 1),
            "engagement_rate": round((total_engagement / max(total_reach, 1)) * 100, 2) if total_reach > 0 else 0
        }
    
    # REAL totals
    total_engagement = sum(day["engagement"] for day in time_series)
    total_reach = sum(day["reach"] for day in time_series)
    
    return {
        "period": period,
        "period_days": period_days,
        "summary_metrics": {
            "total_posts": len(posts),
            "total_engagement": total_engagement,
            "total_reach": total_reach,
            "avg_engagement_per_post": round(total_engagement / max(len(posts), 1), 1),
            "overall_engagement_rate": round((total_engagement / max(total_reach, 1)) * 100, 2) if total_reach > 0 else 0
        },
        "time_series": time_series,
        "platform_performance": platform_performance,
        "empty_state_message": "No data available for this period. Start posting to see analytics!" if len(posts) == 0 else None
    }

# Trigger functions for real-time updates
async def trigger_dashboard_update(user_id: str, db: Session):
    """Call this when posts/data changes to push real-time updates"""
    await broadcast_stats_update(user_id, db)
