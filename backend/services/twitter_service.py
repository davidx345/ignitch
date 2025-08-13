"""
Real Twitter/X API Integration
Handles OAuth, posting, and analytics for Twitter
"""
import httpx
import os
from typing import Dict, Any, Optional
from datetime import datetime
import base64
import logging
import json

logger = logging.getLogger(__name__)

class TwitterService:
    def __init__(self):
        self.client_id = os.getenv("TWITTER_CLIENT_ID")
        self.client_secret = os.getenv("TWITTER_CLIENT_SECRET")
        self.bearer_token = os.getenv("TWITTER_BEARER_TOKEN")
        self.redirect_uri = os.getenv("TWITTER_REDIRECT_URI", "http://localhost:3000/auth/twitter/callback")
        self.base_url = "https://api.twitter.com/2"
        self.auth_url = "https://twitter.com/i/oauth2/authorize"
        self.token_url = "https://api.twitter.com/2/oauth2/token"
        self.upload_url = "https://upload.twitter.com/1.1/media/upload.json"
        
    def get_auth_url(self, state: str) -> str:
        """Generate Twitter OAuth 2.0 authorization URL"""
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "tweet.read tweet.write users.read offline.access",
            "state": state,
            "code_challenge": "challenge",  # In production, use PKCE
            "code_challenge_method": "plain"
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{self.auth_url}?{query_string}"
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        try:
            # Create basic auth header
            credentials = f"{self.client_id}:{self.client_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Basic {encoded_credentials}",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
                
                data = {
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": self.redirect_uri,
                    "code_verifier": "challenge"  # In production, use proper PKCE
                }
                
                response = await client.post(self.token_url, headers=headers, data=data)
                
                if response.status_code == 200:
                    token_data = response.json()
                    return {
                        "success": True,
                        "access_token": token_data.get("access_token"),
                        "refresh_token": token_data.get("refresh_token"),
                        "expires_in": token_data.get("expires_in", 7200)
                    }
                else:
                    logger.error(f"Token exchange failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Token exchange error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh Twitter access token"""
        try:
            credentials = f"{self.client_id}:{self.client_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Basic {encoded_credentials}",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
                
                data = {
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token"
                }
                
                response = await client.post(self.token_url, headers=headers, data=data)
                
                if response.status_code == 200:
                    token_data = response.json()
                    return {
                        "success": True,
                        "access_token": token_data.get("access_token"),
                        "refresh_token": token_data.get("refresh_token"),
                        "expires_in": token_data.get("expires_in", 7200)
                    }
                else:
                    logger.error(f"Token refresh failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get Twitter user information"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
                
                params = {
                    "user.fields": "id,name,username,public_metrics,verified"
                }
                
                response = await client.get(f"{self.base_url}/users/me", headers=headers, params=params)
                
                if response.status_code == 200:
                    user_data = response.json()
                    user_info = user_data.get("data", {})
                    metrics = user_info.get("public_metrics", {})
                    
                    return {
                        "success": True,
                        "user_id": user_info.get("id"),
                        "username": user_info.get("username"),
                        "name": user_info.get("name"),
                        "followers_count": metrics.get("followers_count", 0),
                        "following_count": metrics.get("following_count", 0),
                        "tweet_count": metrics.get("tweet_count", 0),
                        "verified": user_info.get("verified", False)
                    }
                else:
                    logger.error(f"Get user info failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Get user info error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def upload_media(self, access_token: str, media_content: bytes, media_type: str) -> Dict[str, Any]:
        """Upload media to Twitter"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {access_token}"
                }
                
                files = {
                    "media": (f"media.{media_type}", media_content, f"image/{media_type}")
                }
                
                response = await client.post(self.upload_url, headers=headers, files=files)
                
                if response.status_code == 200:
                    media_data = response.json()
                    return {
                        "success": True,
                        "media_id": media_data.get("media_id_string")
                    }
                else:
                    logger.error(f"Media upload failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Media upload error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def post_tweet(self, access_token: str, text: str, media_ids: Optional[list] = None) -> Dict[str, Any]:
        """Post a tweet"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
                
                tweet_data = {
                    "text": text[:280]  # Twitter character limit
                }
                
                if media_ids:
                    tweet_data["media"] = {"media_ids": media_ids}
                
                response = await client.post(f"{self.base_url}/tweets", headers=headers, json=tweet_data)
                
                if response.status_code == 201:
                    tweet_response = response.json()
                    return {
                        "success": True,
                        "platform": "twitter",
                        "post_id": tweet_response.get("data", {}).get("id"),
                        "message": "Tweet posted successfully"
                    }
                else:
                    logger.error(f"Tweet post failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Tweet post error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def post_content(self, access_token: str, text: str, media_url: str = None) -> Dict[str, Any]:
        """Complete Twitter posting workflow"""
        try:
            media_ids = []
            
            # Upload media if provided
            if media_url:
                async with httpx.AsyncClient() as client:
                    media_response = await client.get(media_url)
                    if media_response.status_code == 200:
                        media_content = media_response.content
                        
                        # Determine media type from URL
                        media_type = "jpg"
                        if ".png" in media_url.lower():
                            media_type = "png"
                        elif ".gif" in media_url.lower():
                            media_type = "gif"
                        
                        upload_result = await self.upload_media(access_token, media_content, media_type)
                        
                        if upload_result.get("success"):
                            media_ids.append(upload_result["media_id"])
                        else:
                            logger.warning(f"Media upload failed: {upload_result.get('error')}")
            
            # Post tweet
            return await self.post_tweet(access_token, text, media_ids if media_ids else None)
            
        except Exception as e:
            logger.error(f"Twitter post workflow error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_tweet_metrics(self, tweet_id: str) -> Dict[str, Any]:
        """Get tweet metrics using bearer token (public metrics only)"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {self.bearer_token}"
                }
                
                params = {
                    "tweet.fields": "public_metrics,created_at"
                }
                
                response = await client.get(f"{self.base_url}/tweets/{tweet_id}", headers=headers, params=params)
                
                if response.status_code == 200:
                    tweet_data = response.json()
                    tweet_info = tweet_data.get("data", {})
                    metrics = tweet_info.get("public_metrics", {})
                    
                    return {
                        "success": True,
                        "insights": {
                            "retweet_count": metrics.get("retweet_count", 0),
                            "like_count": metrics.get("like_count", 0),
                            "reply_count": metrics.get("reply_count", 0),
                            "quote_count": metrics.get("quote_count", 0),
                            "bookmark_count": metrics.get("bookmark_count", 0),
                            "impression_count": metrics.get("impression_count", 0)
                        },
                        "created_at": tweet_info.get("created_at")
                    }
                else:
                    logger.error(f"Tweet metrics failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Tweet metrics error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_user_tweets(self, access_token: str, max_results: int = 10) -> Dict[str, Any]:
        """Get user's recent tweets"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {access_token}"
                }
                
                params = {
                    "max_results": max_results,
                    "tweet.fields": "created_at,public_metrics",
                    "exclude": "retweets,replies"
                }
                
                response = await client.get(f"{self.base_url}/users/me/tweets", headers=headers, params=params)
                
                if response.status_code == 200:
                    tweets_data = response.json()
                    return {
                        "success": True,
                        "tweets": tweets_data.get("data", []),
                        "meta": tweets_data.get("meta", {})
                    }
                else:
                    logger.error(f"Get user tweets failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Get user tweets error: {str(e)}")
            return {"success": False, "error": str(e)}

# Singleton instance
twitter_service = TwitterService()
