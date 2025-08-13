"""
Real Instagram API Integration
Handles OAuth, posting, and analytics for Instagram
"""
import httpx
import os
from typing import Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class InstagramService:
    def __init__(self):
        self.client_id = os.getenv("INSTAGRAM_CLIENT_ID")
        self.client_secret = os.getenv("INSTAGRAM_CLIENT_SECRET")
        self.redirect_uri = os.getenv("INSTAGRAM_REDIRECT_URI", "http://localhost:3000/auth/instagram/callback")
        self.base_url = "https://graph.instagram.com"
        self.auth_url = "https://api.instagram.com/oauth/authorize"
        self.token_url = "https://api.instagram.com/oauth/access_token"
        
    def get_auth_url(self, state: str) -> str:
        """Generate Instagram OAuth authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "user_profile,user_media",
            "response_type": "code",
            "state": state
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{self.auth_url}?{query_string}"
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        try:
            async with httpx.AsyncClient() as client:
                data = {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "grant_type": "authorization_code",
                    "redirect_uri": self.redirect_uri,
                    "code": code
                }
                
                response = await client.post(self.token_url, data=data)
                
                if response.status_code == 200:
                    token_data = response.json()
                    
                    # Get long-lived token
                    long_lived_token = await self._get_long_lived_token(token_data["access_token"])
                    
                    return {
                        "success": True,
                        "access_token": long_lived_token.get("access_token", token_data["access_token"]),
                        "user_id": token_data.get("user_id"),
                        "expires_in": long_lived_token.get("expires_in", 3600)
                    }
                else:
                    logger.error(f"Token exchange failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Token exchange error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _get_long_lived_token(self, short_token: str) -> Dict[str, Any]:
        """Convert short-lived token to long-lived token (60 days)"""
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "grant_type": "ig_exchange_token",
                    "client_secret": self.client_secret,
                    "access_token": short_token
                }
                
                response = await client.get(f"{self.base_url}/access_token", params=params)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.warning(f"Long-lived token failed: {response.text}")
                    return {}
                    
        except Exception as e:
            logger.warning(f"Long-lived token error: {str(e)}")
            return {}
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get Instagram user profile information"""
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "fields": "id,username,account_type,media_count",
                    "access_token": access_token
                }
                
                response = await client.get(f"{self.base_url}/me", params=params)
                
                if response.status_code == 200:
                    user_data = response.json()
                    return {
                        "success": True,
                        "user_id": user_data.get("id"),
                        "username": user_data.get("username"),
                        "account_type": user_data.get("account_type"),
                        "media_count": user_data.get("media_count", 0)
                    }
                else:
                    logger.error(f"Get user info failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Get user info error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def create_media_container(self, access_token: str, image_url: str, caption: str) -> Dict[str, Any]:
        """Create Instagram media container for posting"""
        try:
            async with httpx.AsyncClient() as client:
                data = {
                    "image_url": image_url,
                    "caption": caption,
                    "access_token": access_token
                }
                
                response = await client.post(f"{self.base_url}/me/media", data=data)
                
                if response.status_code == 200:
                    container_data = response.json()
                    return {
                        "success": True,
                        "container_id": container_data.get("id")
                    }
                else:
                    logger.error(f"Media container creation failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Media container error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def publish_media(self, access_token: str, container_id: str) -> Dict[str, Any]:
        """Publish Instagram media container"""
        try:
            async with httpx.AsyncClient() as client:
                data = {
                    "creation_id": container_id,
                    "access_token": access_token
                }
                
                response = await client.post(f"{self.base_url}/me/media_publish", data=data)
                
                if response.status_code == 200:
                    publish_data = response.json()
                    return {
                        "success": True,
                        "media_id": publish_data.get("id")
                    }
                else:
                    logger.error(f"Media publish failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Media publish error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def post_content(self, access_token: str, image_url: str, caption: str) -> Dict[str, Any]:
        """Complete Instagram posting workflow"""
        try:
            # Step 1: Create media container
            container_result = await self.create_media_container(access_token, image_url, caption)
            
            if not container_result.get("success"):
                return container_result
            
            # Step 2: Publish media
            publish_result = await self.publish_media(access_token, container_result["container_id"])
            
            if publish_result.get("success"):
                return {
                    "success": True,
                    "platform": "instagram",
                    "post_id": publish_result["media_id"],
                    "message": "Posted successfully to Instagram"
                }
            else:
                return publish_result
                
        except Exception as e:
            logger.error(f"Instagram post error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_media_insights(self, access_token: str, media_id: str) -> Dict[str, Any]:
        """Get Instagram media insights/analytics"""
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "metric": "impressions,reach,likes,comments,shares,saved",
                    "access_token": access_token
                }
                
                response = await client.get(f"{self.base_url}/{media_id}/insights", params=params)
                
                if response.status_code == 200:
                    insights_data = response.json()
                    metrics = {}
                    
                    for metric in insights_data.get("data", []):
                        metrics[metric["name"]] = metric.get("values", [{}])[0].get("value", 0)
                    
                    return {
                        "success": True,
                        "insights": metrics
                    }
                else:
                    logger.error(f"Media insights failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Media insights error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_account_insights(self, access_token: str, days: int = 7) -> Dict[str, Any]:
        """Get Instagram account insights"""
        try:
            async with httpx.AsyncClient() as client:
                since = datetime.now().timestamp() - (days * 24 * 60 * 60)
                until = datetime.now().timestamp()
                
                params = {
                    "metric": "impressions,reach,profile_views,website_clicks",
                    "period": "days_28",
                    "since": int(since),
                    "until": int(until),
                    "access_token": access_token
                }
                
                response = await client.get(f"{self.base_url}/me/insights", params=params)
                
                if response.status_code == 200:
                    insights_data = response.json()
                    metrics = {}
                    
                    for metric in insights_data.get("data", []):
                        values = metric.get("values", [])
                        if values:
                            metrics[metric["name"]] = sum([v.get("value", 0) for v in values])
                    
                    return {
                        "success": True,
                        "insights": metrics,
                        "period_days": days
                    }
                else:
                    logger.error(f"Account insights failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Account insights error: {str(e)}")
            return {"success": False, "error": str(e)}

# Singleton instance
instagram_service = InstagramService()
