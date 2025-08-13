"""
Real TikTok API Integration
Handles OAuth, posting, and analytics for TikTok
"""
import httpx
import os
from typing import Dict, Any, Optional
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)

class TikTokService:
    def __init__(self):
        self.client_id = os.getenv("TIKTOK_CLIENT_ID")
        self.client_secret = os.getenv("TIKTOK_CLIENT_SECRET")
        self.redirect_uri = os.getenv("TIKTOK_REDIRECT_URI", "http://localhost:3000/auth/tiktok/callback")
        self.base_url = "https://open-api.tiktok.com"
        self.auth_url = "https://www.tiktok.com/auth/authorize/"
        
    def get_auth_url(self, state: str) -> str:
        """Generate TikTok OAuth authorization URL"""
        params = {
            "client_key": self.client_id,
            "response_type": "code",
            "scope": "user.info.basic,video.list,video.upload",
            "redirect_uri": self.redirect_uri,
            "state": state
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{self.auth_url}?{query_string}"
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Cache-Control": "no-cache"
                }
                
                data = {
                    "client_key": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": self.redirect_uri
                }
                
                response = await client.post(f"{self.base_url}/oauth/access_token/", headers=headers, data=data)
                
                if response.status_code == 200:
                    token_data = response.json()
                    
                    if token_data.get("data"):
                        return {
                            "success": True,
                            "access_token": token_data["data"].get("access_token"),
                            "refresh_token": token_data["data"].get("refresh_token"),
                            "expires_in": token_data["data"].get("expires_in", 86400),
                            "open_id": token_data["data"].get("open_id")
                        }
                    else:
                        return {"success": False, "error": token_data.get("message", "Token exchange failed")}
                else:
                    logger.error(f"Token exchange failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Token exchange error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh TikTok access token"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
                
                data = {
                    "client_key": self.client_id,
                    "client_secret": self.client_secret,
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token
                }
                
                response = await client.post(f"{self.base_url}/oauth/refresh_token/", headers=headers, data=data)
                
                if response.status_code == 200:
                    token_data = response.json()
                    
                    if token_data.get("data"):
                        return {
                            "success": True,
                            "access_token": token_data["data"].get("access_token"),
                            "refresh_token": token_data["data"].get("refresh_token"),
                            "expires_in": token_data["data"].get("expires_in", 86400)
                        }
                    else:
                        return {"success": False, "error": token_data.get("message", "Token refresh failed")}
                else:
                    logger.error(f"Token refresh failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_user_info(self, access_token: str, open_id: str) -> Dict[str, Any]:
        """Get TikTok user information"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
                
                data = {
                    "access_token": access_token,
                    "open_id": open_id,
                    "fields": ["open_id", "union_id", "avatar_url", "display_name", "bio_description", "profile_deep_link", "is_verified", "follower_count", "following_count", "likes_count", "video_count"]
                }
                
                response = await client.post(f"{self.base_url}/user/info/", headers=headers, json=data)
                
                if response.status_code == 200:
                    user_data = response.json()
                    
                    if user_data.get("data") and user_data["data"].get("user"):
                        user_info = user_data["data"]["user"]
                        return {
                            "success": True,
                            "user_id": user_info.get("open_id"),
                            "username": user_info.get("display_name"),
                            "avatar_url": user_info.get("avatar_url"),
                            "bio": user_info.get("bio_description"),
                            "follower_count": user_info.get("follower_count", 0),
                            "following_count": user_info.get("following_count", 0),
                            "likes_count": user_info.get("likes_count", 0),
                            "video_count": user_info.get("video_count", 0),
                            "is_verified": user_info.get("is_verified", False)
                        }
                    else:
                        return {"success": False, "error": user_data.get("message", "Failed to get user info")}
                else:
                    logger.error(f"Get user info failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Get user info error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def upload_video(self, access_token: str, open_id: str, video_url: str, title: str, privacy_level: str = "SELF_ONLY") -> Dict[str, Any]:
        """Upload video to TikTok"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
                
                data = {
                    "access_token": access_token,
                    "open_id": open_id,
                    "video_url": video_url,
                    "title": title[:150],  # TikTok title limit
                    "privacy_level": privacy_level,
                    "disable_duet": False,
                    "disable_comment": False,
                    "disable_stitch": False,
                    "video_cover_timestamp_ms": 1000
                }
                
                response = await client.post(f"{self.base_url}/share/video/upload/", headers=headers, json=data)
                
                if response.status_code == 200:
                    upload_data = response.json()
                    
                    if upload_data.get("data"):
                        return {
                            "success": True,
                            "platform": "tiktok",
                            "post_id": upload_data["data"].get("share_id"),
                            "message": "Video uploaded successfully to TikTok"
                        }
                    else:
                        return {"success": False, "error": upload_data.get("message", "Video upload failed")}
                else:
                    logger.error(f"TikTok video upload failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"TikTok video upload error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def post_content(self, access_token: str, open_id: str, video_url: str, title: str) -> Dict[str, Any]:
        """Complete TikTok posting workflow"""
        try:
            # TikTok requires video content, so we'll upload the video
            return await self.upload_video(access_token, open_id, video_url, title, "PUBLIC_TO_EVERYONE")
            
        except Exception as e:
            logger.error(f"TikTok post workflow error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_user_videos(self, access_token: str, open_id: str, cursor: int = 0, max_count: int = 20) -> Dict[str, Any]:
        """Get user's TikTok videos"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
                
                data = {
                    "access_token": access_token,
                    "open_id": open_id,
                    "cursor": cursor,
                    "max_count": max_count,
                    "fields": ["id", "title", "video_description", "duration", "cover_image_url", "share_url", "view_count", "like_count", "comment_count", "share_count", "download_count"]
                }
                
                response = await client.post(f"{self.base_url}/video/list/", headers=headers, json=data)
                
                if response.status_code == 200:
                    videos_data = response.json()
                    
                    if videos_data.get("data"):
                        return {
                            "success": True,
                            "videos": videos_data["data"].get("videos", []),
                            "cursor": videos_data["data"].get("cursor", 0),
                            "has_more": videos_data["data"].get("has_more", False)
                        }
                    else:
                        return {"success": False, "error": videos_data.get("message", "Failed to get videos")}
                else:
                    logger.error(f"Get user videos failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Get user videos error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_video_insights(self, access_token: str, open_id: str, video_ids: list) -> Dict[str, Any]:
        """Get TikTok video insights/analytics"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
                
                data = {
                    "access_token": access_token,
                    "open_id": open_id,
                    "video_ids": video_ids,
                    "fields": ["video_id", "like_count", "comment_count", "share_count", "view_count", "profile_view_count", "play_count"]
                }
                
                response = await client.post(f"{self.base_url}/video/data/", headers=headers, json=data)
                
                if response.status_code == 200:
                    insights_data = response.json()
                    
                    if insights_data.get("data"):
                        return {
                            "success": True,
                            "insights": insights_data["data"].get("video_stats", [])
                        }
                    else:
                        return {"success": False, "error": insights_data.get("message", "Failed to get insights")}
                else:
                    logger.error(f"Get video insights failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Get video insights error: {str(e)}")
            return {"success": False, "error": str(e)}

# Singleton instance
tiktok_service = TikTokService()
