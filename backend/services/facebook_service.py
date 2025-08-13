"""
Real Facebook API Integration
Handles OAuth, posting, and analytics for Facebook Pages
"""
import httpx
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class FacebookService:
    def __init__(self):
        self.client_id = os.getenv("FACEBOOK_CLIENT_ID")
        self.client_secret = os.getenv("FACEBOOK_CLIENT_SECRET")
        self.redirect_uri = os.getenv("FACEBOOK_REDIRECT_URI", "http://localhost:3000/auth/facebook/callback")
        self.base_url = "https://graph.facebook.com/v18.0"
        self.auth_url = "https://www.facebook.com/v18.0/dialog/oauth"
        
    def get_auth_url(self, state: str) -> str:
        """Generate Facebook OAuth authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "pages_manage_posts,pages_read_engagement,pages_show_list,business_management",
            "response_type": "code",
            "state": state
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{self.auth_url}?{query_string}"
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uri": self.redirect_uri,
                    "code": code
                }
                
                response = await client.get(f"{self.base_url}/oauth/access_token", params=params)
                
                if response.status_code == 200:
                    token_data = response.json()
                    
                    # Get long-lived token
                    long_lived_token = await self._get_long_lived_token(token_data["access_token"])
                    
                    return {
                        "success": True,
                        "access_token": long_lived_token.get("access_token", token_data["access_token"]),
                        "expires_in": long_lived_token.get("expires_in", token_data.get("expires_in", 3600))
                    }
                else:
                    logger.error(f"Token exchange failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Token exchange error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _get_long_lived_token(self, short_token: str) -> Dict[str, Any]:
        """Convert short-lived token to long-lived token"""
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "grant_type": "fb_exchange_token",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "fb_exchange_token": short_token
                }
                
                response = await client.get(f"{self.base_url}/oauth/access_token", params=params)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.warning(f"Long-lived token failed: {response.text}")
                    return {}
                    
        except Exception as e:
            logger.warning(f"Long-lived token error: {str(e)}")
            return {}
    
    async def get_user_pages(self, access_token: str) -> Dict[str, Any]:
        """Get user's Facebook pages"""
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "fields": "id,name,access_token,category,fan_count",
                    "access_token": access_token
                }
                
                response = await client.get(f"{self.base_url}/me/accounts", params=params)
                
                if response.status_code == 200:
                    pages_data = response.json()
                    return {
                        "success": True,
                        "pages": pages_data.get("data", [])
                    }
                else:
                    logger.error(f"Get pages failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Get pages error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def post_content(self, page_access_token: str, page_id: str, message: str, image_url: str = None) -> Dict[str, Any]:
        """Post content to Facebook page"""
        try:
            async with httpx.AsyncClient() as client:
                data = {
                    "message": message,
                    "access_token": page_access_token
                }
                
                # Add image if provided
                if image_url:
                    data["link"] = image_url
                
                response = await client.post(f"{self.base_url}/{page_id}/feed", data=data)
                
                if response.status_code == 200:
                    post_data = response.json()
                    return {
                        "success": True,
                        "platform": "facebook",
                        "post_id": post_data.get("id"),
                        "message": "Posted successfully to Facebook"
                    }
                else:
                    logger.error(f"Facebook post failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Facebook post error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def post_photo(self, page_access_token: str, page_id: str, message: str, photo_url: str) -> Dict[str, Any]:
        """Post photo to Facebook page"""
        try:
            async with httpx.AsyncClient() as client:
                data = {
                    "message": message,
                    "url": photo_url,
                    "access_token": page_access_token
                }
                
                response = await client.post(f"{self.base_url}/{page_id}/photos", data=data)
                
                if response.status_code == 200:
                    post_data = response.json()
                    return {
                        "success": True,
                        "platform": "facebook",
                        "post_id": post_data.get("id"),
                        "message": "Photo posted successfully to Facebook"
                    }
                else:
                    logger.error(f"Facebook photo post failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Facebook photo post error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_post_insights(self, access_token: str, post_id: str) -> Dict[str, Any]:
        """Get Facebook post insights"""
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "metric": "post_impressions,post_reach,post_reactions_like_total,post_reactions_love_total,post_clicks",
                    "access_token": access_token
                }
                
                response = await client.get(f"{self.base_url}/{post_id}/insights", params=params)
                
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
                    logger.error(f"Post insights failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Post insights error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_page_insights(self, page_access_token: str, page_id: str, days: int = 7) -> Dict[str, Any]:
        """Get Facebook page insights"""
        try:
            async with httpx.AsyncClient() as client:
                since = datetime.now().timestamp() - (days * 24 * 60 * 60)
                until = datetime.now().timestamp()
                
                params = {
                    "metric": "page_impressions,page_reach,page_fans,page_engaged_users",
                    "period": "day",
                    "since": int(since),
                    "until": int(until),
                    "access_token": page_access_token
                }
                
                response = await client.get(f"{self.base_url}/{page_id}/insights", params=params)
                
                if response.status_code == 200:
                    insights_data = response.json()
                    metrics = {}
                    
                    for metric in insights_data.get("data", []):
                        values = metric.get("values", [])
                        if values:
                            # Sum up values for the period
                            total = sum([v.get("value", 0) for v in values])
                            metrics[metric["name"]] = total
                    
                    return {
                        "success": True,
                        "insights": metrics,
                        "period_days": days
                    }
                else:
                    logger.error(f"Page insights failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Page insights error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_page_info(self, page_access_token: str, page_id: str) -> Dict[str, Any]:
        """Get Facebook page information"""
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "fields": "id,name,category,fan_count,engagement,new_like_count",
                    "access_token": page_access_token
                }
                
                response = await client.get(f"{self.base_url}/{page_id}", params=params)
                
                if response.status_code == 200:
                    page_data = response.json()
                    return {
                        "success": True,
                        "page_info": page_data
                    }
                else:
                    logger.error(f"Get page info failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Get page info error: {str(e)}")
            return {"success": False, "error": str(e)}

# Singleton instance
facebook_service = FacebookService()
