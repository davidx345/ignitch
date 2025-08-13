"""
Real Analytics Service
Aggregates and analyzes data from all social media platforms
"""
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging

from models import User, Post, SocialAccount, PerformanceMetric
from services.instagram_service import instagram_service
from services.facebook_service import facebook_service
from services.twitter_service import twitter_service
from services.tiktok_service import tiktok_service

logger = logging.getLogger(__name__)

class AnalyticsService:
    def __init__(self):
        self.platform_services = {
            "instagram": instagram_service,
            "facebook": facebook_service,
            "twitter": twitter_service,
            "tiktok": tiktok_service
        }
    
    async def collect_platform_analytics(self, user: User, db: Session, days: int = 7) -> Dict[str, Any]:
        """Collect analytics from all connected platforms"""
        try:
            analytics_data = {}
            
            # Get user's social accounts
            social_accounts = db.query(SocialAccount).filter(
                SocialAccount.user_id == user.id,
                SocialAccount.is_active == True
            ).all()
            
            if not social_accounts:
                return {"error": "No connected social accounts found"}
            
            # Collect data from each platform
            for account in social_accounts:
                platform_data = await self._get_platform_analytics(account, days)
                analytics_data[account.platform] = platform_data
            
            return analytics_data
            
        except Exception as e:
            logger.error(f"Analytics collection error: {str(e)}")
            return {"error": str(e)}
    
    async def _get_platform_analytics(self, account: SocialAccount, days: int) -> Dict[str, Any]:
        """Get analytics for a specific platform"""
        try:
            service = self.platform_services.get(account.platform)
            if not service:
                return {"error": f"Service not available for {account.platform}"}
            
            if account.platform == "instagram":
                insights = await service.get_account_insights(account.access_token, days)
                return insights
                
            elif account.platform == "facebook":
                # Assuming we have page info stored
                page_insights = await service.get_page_insights(
                    account.access_token, 
                    account.account_id, 
                    days
                )
                return page_insights
                
            elif account.platform == "twitter":
                # Get recent tweets and their metrics
                tweets = await service.get_user_tweets(account.access_token, 10)
                if tweets.get("success"):
                    return {"success": True, "insights": tweets}
                return tweets
                
            elif account.platform == "tiktok":
                # Get recent videos and insights
                videos = await service.get_user_videos(
                    account.access_token, 
                    account.account_id, 
                    max_count=10
                )
                return videos
                
            return {"error": f"Analytics not implemented for {account.platform}"}
            
        except Exception as e:
            logger.error(f"Platform analytics error for {account.platform}: {str(e)}")
            return {"error": str(e)}
    
    async def aggregate_performance_metrics(self, user: User, db: Session, days: int = 30) -> Dict[str, Any]:
        """Aggregate performance metrics across all platforms"""
        try:
            # Get performance data from database
            since_date = datetime.now() - timedelta(days=days)
            
            metrics = db.query(PerformanceMetric).filter(
                PerformanceMetric.user_id == user.id,
                PerformanceMetric.recorded_at >= since_date
            ).all()
            
            if not metrics:
                # Try to collect fresh data
                await self.sync_platform_metrics(user, db)
                metrics = db.query(PerformanceMetric).filter(
                    PerformanceMetric.user_id == user.id,
                    PerformanceMetric.recorded_at >= since_date
                ).all()
            
            # Aggregate by platform
            platform_aggregates = {}
            total_aggregates = {
                "total_impressions": 0,
                "total_reach": 0,
                "total_engagement": 0,
                "total_clicks": 0,
                "total_shares": 0,
                "total_saves": 0,
                "total_comments": 0,
                "total_likes": 0,
                "avg_engagement_rate": 0,
                "platforms_count": 0
            }
            
            platforms = set()
            
            for metric in metrics:
                platform = metric.platform
                platforms.add(platform)
                
                if platform not in platform_aggregates:
                    platform_aggregates[platform] = {
                        "impressions": 0,
                        "reach": 0,
                        "engagement": 0,
                        "clicks": 0,
                        "shares": 0,
                        "saves": 0,
                        "comments": 0,
                        "likes": 0,
                        "posts_count": 0,
                        "avg_engagement_rate": 0
                    }
                
                # Add to platform totals
                platform_aggregates[platform]["impressions"] += metric.impressions
                platform_aggregates[platform]["reach"] += metric.reach
                platform_aggregates[platform]["engagement"] += metric.engagement
                platform_aggregates[platform]["clicks"] += metric.clicks
                platform_aggregates[platform]["shares"] += metric.shares
                platform_aggregates[platform]["saves"] += metric.saves
                platform_aggregates[platform]["comments"] += metric.comments
                platform_aggregates[platform]["likes"] += metric.likes
                platform_aggregates[platform]["posts_count"] += 1
                
                # Add to totals
                total_aggregates["total_impressions"] += metric.impressions
                total_aggregates["total_reach"] += metric.reach
                total_aggregates["total_engagement"] += metric.engagement
                total_aggregates["total_clicks"] += metric.clicks
                total_aggregates["total_shares"] += metric.shares
                total_aggregates["total_saves"] += metric.saves
                total_aggregates["total_comments"] += metric.comments
                total_aggregates["total_likes"] += metric.likes
            
            # Calculate averages
            total_aggregates["platforms_count"] = len(platforms)
            
            if total_aggregates["total_reach"] > 0:
                total_aggregates["avg_engagement_rate"] = (
                    total_aggregates["total_engagement"] / total_aggregates["total_reach"]
                )
            
            for platform_data in platform_aggregates.values():
                if platform_data["reach"] > 0:
                    platform_data["avg_engagement_rate"] = (
                        platform_data["engagement"] / platform_data["reach"]
                    )
            
            return {
                "success": True,
                "period_days": days,
                "total_metrics": total_aggregates,
                "platform_breakdown": platform_aggregates,
                "metrics_count": len(metrics)
            }
            
        except Exception as e:
            logger.error(f"Performance aggregation error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def sync_platform_metrics(self, user: User, db: Session) -> Dict[str, Any]:
        """Sync latest metrics from all platforms"""
        try:
            sync_results = {}
            
            # Get user's social accounts
            social_accounts = db.query(SocialAccount).filter(
                SocialAccount.user_id == user.id,
                SocialAccount.is_active == True
            ).all()
            
            # Get recent posts to sync metrics for
            recent_posts = db.query(Post).filter(
                Post.user_id == user.id,
                Post.status == "published",
                Post.published_at >= datetime.now() - timedelta(days=7)
            ).all()
            
            for account in social_accounts:
                platform_posts = [
                    post for post in recent_posts 
                    if account.platform in post.platforms
                ]
                
                if not platform_posts:
                    continue
                
                sync_results[account.platform] = await self._sync_platform_posts(
                    account, platform_posts, db
                )
            
            db.commit()
            
            return {
                "success": True,
                "synced_platforms": list(sync_results.keys()),
                "sync_results": sync_results
            }
            
        except Exception as e:
            logger.error(f"Metrics sync error: {str(e)}")
            db.rollback()
            return {"success": False, "error": str(e)}
    
    async def _sync_platform_posts(self, account: SocialAccount, posts: List[Post], db: Session) -> Dict[str, Any]:
        """Sync metrics for posts on a specific platform"""
        try:
            service = self.platform_services.get(account.platform)
            if not service:
                return {"error": f"Service not available for {account.platform}"}
            
            synced_count = 0
            
            for post in posts:
                # Skip if we don't have platform-specific post ID
                if not hasattr(post, 'platform_post_ids') or account.platform not in post.platform_post_ids:
                    continue
                
                platform_post_id = post.platform_post_ids[account.platform]
                
                # Get insights based on platform
                insights = None
                
                if account.platform == "instagram":
                    insights = await service.get_media_insights(account.access_token, platform_post_id)
                elif account.platform == "facebook":
                    insights = await service.get_post_insights(account.access_token, platform_post_id)
                elif account.platform == "twitter":
                    insights = await service.get_tweet_metrics(platform_post_id)
                elif account.platform == "tiktok":
                    insights = await service.get_video_insights(
                        account.access_token, account.account_id, [platform_post_id]
                    )
                
                if insights and insights.get("success"):
                    # Create or update performance metric
                    metric = PerformanceMetric(
                        user_id=account.user_id,
                        post_id=post.id,
                        platform=account.platform,
                        impressions=insights.get("insights", {}).get("impressions", 0),
                        reach=insights.get("insights", {}).get("reach", 0),
                        engagement=insights.get("insights", {}).get("likes", 0) + insights.get("insights", {}).get("comments", 0),
                        clicks=insights.get("insights", {}).get("clicks", 0),
                        shares=insights.get("insights", {}).get("shares", 0),
                        saves=insights.get("insights", {}).get("saves", 0),
                        comments=insights.get("insights", {}).get("comments", 0),
                        likes=insights.get("insights", {}).get("likes", 0),
                        data_date=datetime.now().date(),
                        recorded_at=datetime.now()
                    )
                    
                    # Calculate rates
                    if metric.reach > 0:
                        metric.engagement_rate = metric.engagement / metric.reach
                    if metric.impressions > 0:
                        metric.click_through_rate = metric.clicks / metric.impressions
                        metric.save_rate = metric.saves / metric.impressions
                    
                    db.add(metric)
                    synced_count += 1
            
            return {
                "success": True,
                "synced_posts": synced_count,
                "total_posts": len(posts)
            }
            
        except Exception as e:
            logger.error(f"Platform sync error for {account.platform}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def calculate_growth_metrics(self, current_metrics: Dict, previous_metrics: Dict) -> Dict[str, Any]:
        """Calculate growth metrics compared to previous period"""
        try:
            growth_metrics = {}
            
            metrics_to_compare = [
                "total_reach", "total_engagement", "total_impressions", 
                "total_clicks", "avg_engagement_rate"
            ]
            
            for metric in metrics_to_compare:
                current_value = current_metrics.get(metric, 0)
                previous_value = previous_metrics.get(metric, 0)
                
                if previous_value > 0:
                    growth_percentage = ((current_value - previous_value) / previous_value) * 100
                    growth_metrics[f"{metric}_growth"] = round(growth_percentage, 2)
                else:
                    growth_metrics[f"{metric}_growth"] = 0 if current_value == 0 else 100
            
            # Overall growth score
            growth_values = [v for v in growth_metrics.values() if v != 0]
            if growth_values:
                growth_metrics["overall_growth_score"] = round(sum(growth_values) / len(growth_values), 2)
            else:
                growth_metrics["overall_growth_score"] = 0
            
            return growth_metrics
            
        except Exception as e:
            logger.error(f"Growth calculation error: {str(e)}")
            return {}
    
    def generate_performance_summary(self, metrics: Dict[str, Any], growth: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate human-readable performance summary"""
        try:
            summary = {
                "overview": "",
                "highlights": [],
                "areas_for_improvement": [],
                "recommendations": []
            }
            
            total_metrics = metrics.get("total_metrics", {})
            
            # Generate overview
            reach = total_metrics.get("total_reach", 0)
            engagement_rate = total_metrics.get("avg_engagement_rate", 0)
            platforms_count = total_metrics.get("platforms_count", 0)
            
            summary["overview"] = f"Your content reached {reach:,} people across {platforms_count} platforms with an average engagement rate of {engagement_rate:.1%}."
            
            # Highlights
            if engagement_rate > 0.03:  # Above average engagement
                summary["highlights"].append(f"Excellent engagement rate of {engagement_rate:.1%}")
            
            if reach > 1000:
                summary["highlights"].append(f"Strong reach of {reach:,} people")
            
            if growth:
                for metric, value in growth.items():
                    if value > 10:  # 10% growth or more
                        metric_name = metric.replace("_growth", "").replace("_", " ").title()
                        summary["highlights"].append(f"{metric_name} increased by {value}%")
            
            # Areas for improvement
            if engagement_rate < 0.02:
                summary["areas_for_improvement"].append("Engagement rate below industry average")
            
            if platforms_count < 3:
                summary["areas_for_improvement"].append("Consider expanding to more platforms")
            
            # Recommendations
            if engagement_rate < 0.02:
                summary["recommendations"].append("Focus on creating more engaging content with strong calls-to-action")
            
            if reach < 500:
                summary["recommendations"].append("Increase posting frequency and use relevant hashtags")
            
            return summary
            
        except Exception as e:
            logger.error(f"Summary generation error: {str(e)}")
            return {"error": str(e)}

# Singleton instance
analytics_service = AnalyticsService()
