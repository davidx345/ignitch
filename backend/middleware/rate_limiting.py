"""
Rate Limiting Middleware
Implements rate limiting for API endpoints with Redis/memory backend
"""
import time
import asyncio
from typing import Dict, Any, Optional, Callable
from datetime import datetime, timedelta
import logging
from collections import defaultdict, deque
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
import redis.asyncio as redis

logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_client = None
        self.memory_store = defaultdict(deque)
        self.cleanup_interval = 300  # 5 minutes
        self.last_cleanup = time.time()
        
        # Try to connect to Redis if URL provided
        if redis_url:
            try:
                self.redis_client = redis.from_url(redis_url)
                logger.info("Rate limiter using Redis backend")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis, using memory backend: {str(e)}")
        else:
            logger.info("Rate limiter using memory backend")
    
    async def is_allowed(
        self, 
        key: str, 
        limit: int, 
        window_seconds: int,
        burst_limit: Optional[int] = None
    ) -> Dict[str, Any]:
        """Check if request is allowed under rate limit"""
        try:
            current_time = time.time()
            window_start = current_time - window_seconds
            
            if self.redis_client:
                return await self._check_redis_limit(key, limit, window_seconds, current_time, burst_limit)
            else:
                return await self._check_memory_limit(key, limit, window_seconds, current_time, burst_limit)
                
        except Exception as e:
            logger.error(f"Rate limit check error: {str(e)}")
            # Allow request on error to avoid blocking legitimate traffic
            return {
                "allowed": True,
                "limit": limit,
                "remaining": limit,
                "reset_time": current_time + window_seconds,
                "retry_after": None
            }
    
    async def _check_redis_limit(
        self, 
        key: str, 
        limit: int, 
        window_seconds: int, 
        current_time: float,
        burst_limit: Optional[int] = None
    ) -> Dict[str, Any]:
        """Check rate limit using Redis backend"""
        try:
            pipe = self.redis_client.pipeline()
            
            # Use sliding window log approach
            window_start = current_time - window_seconds
            
            # Remove old entries
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Count current requests
            pipe.zcard(key)
            
            # Add current request
            pipe.zadd(key, {str(current_time): current_time})
            
            # Set expiry
            pipe.expire(key, window_seconds + 10)
            
            results = await pipe.execute()
            request_count = results[1]
            
            # Check burst limit if specified
            if burst_limit and request_count > burst_limit:
                return {
                    "allowed": False,
                    "limit": limit,
                    "remaining": 0,
                    "reset_time": current_time + window_seconds,
                    "retry_after": window_seconds,
                    "reason": "burst_limit_exceeded"
                }
            
            # Check regular limit
            if request_count >= limit:
                # Get oldest request time to calculate reset
                oldest_requests = await self.redis_client.zrange(key, 0, 0, withscores=True)
                if oldest_requests:
                    oldest_time = oldest_requests[0][1]
                    reset_time = oldest_time + window_seconds
                    retry_after = max(1, int(reset_time - current_time))
                else:
                    reset_time = current_time + window_seconds
                    retry_after = window_seconds
                
                return {
                    "allowed": False,
                    "limit": limit,
                    "remaining": 0,
                    "reset_time": reset_time,
                    "retry_after": retry_after
                }
            
            return {
                "allowed": True,
                "limit": limit,
                "remaining": limit - request_count,
                "reset_time": current_time + window_seconds,
                "retry_after": None
            }
            
        except Exception as e:
            logger.error(f"Redis rate limit error: {str(e)}")
            # Fallback to memory
            return await self._check_memory_limit(key, limit, window_seconds, current_time, burst_limit)
    
    async def _check_memory_limit(
        self, 
        key: str, 
        limit: int, 
        window_seconds: int, 
        current_time: float,
        burst_limit: Optional[int] = None
    ) -> Dict[str, Any]:
        """Check rate limit using memory backend"""
        try:
            # Cleanup old entries periodically
            if current_time - self.last_cleanup > self.cleanup_interval:
                await self._cleanup_memory_store()
                self.last_cleanup = current_time
            
            requests = self.memory_store[key]
            window_start = current_time - window_seconds
            
            # Remove old requests
            while requests and requests[0] < window_start:
                requests.popleft()
            
            # Check burst limit
            if burst_limit and len(requests) >= burst_limit:
                return {
                    "allowed": False,
                    "limit": limit,
                    "remaining": 0,
                    "reset_time": current_time + window_seconds,
                    "retry_after": window_seconds,
                    "reason": "burst_limit_exceeded"
                }
            
            # Check regular limit
            if len(requests) >= limit:
                # Calculate reset time based on oldest request
                reset_time = requests[0] + window_seconds
                retry_after = max(1, int(reset_time - current_time))
                
                return {
                    "allowed": False,
                    "limit": limit,
                    "remaining": 0,
                    "reset_time": reset_time,
                    "retry_after": retry_after
                }
            
            # Add current request
            requests.append(current_time)
            
            return {
                "allowed": True,
                "limit": limit,
                "remaining": limit - len(requests),
                "reset_time": current_time + window_seconds,
                "retry_after": None
            }
            
        except Exception as e:
            logger.error(f"Memory rate limit error: {str(e)}")
            return {
                "allowed": True,
                "limit": limit,
                "remaining": limit,
                "reset_time": current_time + window_seconds,
                "retry_after": None
            }
    
    async def _cleanup_memory_store(self):
        """Clean up old entries from memory store"""
        try:
            current_time = time.time()
            max_age = 3600  # 1 hour
            
            keys_to_remove = []
            for key, requests in self.memory_store.items():
                # Remove requests older than max_age
                while requests and requests[0] < current_time - max_age:
                    requests.popleft()
                
                # Remove empty queues
                if not requests:
                    keys_to_remove.append(key)
            
            for key in keys_to_remove:
                del self.memory_store[key]
                
            logger.debug(f"Cleaned up {len(keys_to_remove)} empty rate limit entries")
            
        except Exception as e:
            logger.error(f"Memory cleanup error: {str(e)}")

# Global rate limiter instance
rate_limiter = RateLimiter()

# Rate limit configurations
RATE_LIMITS = {
    "default": {"limit": 100, "window": 3600},  # 100 requests per hour
    "auth": {"limit": 10, "window": 300},       # 10 requests per 5 minutes
    "upload": {"limit": 50, "window": 3600, "burst": 10},    # 50 uploads per hour, 10 burst
    "ai": {"limit": 30, "window": 3600},        # 30 AI requests per hour
    "posting": {"limit": 20, "window": 3600},   # 20 posts per hour
    "analytics": {"limit": 200, "window": 3600} # 200 analytics requests per hour
}

def get_client_ip(request: Request) -> str:
    """Get client IP address"""
    # Check for forwarded IP first (proxy/load balancer)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    # Check for real IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fall back to client host
    return request.client.host if request.client else "unknown"

def create_rate_limit_key(request: Request, user_id: Optional[str] = None) -> str:
    """Create rate limit key based on user or IP"""
    if user_id:
        return f"user:{user_id}"
    else:
        client_ip = get_client_ip(request)
        return f"ip:{client_ip}"

async def apply_rate_limit(
    request: Request,
    category: str = "default",
    user_id: Optional[str] = None
) -> Optional[Response]:
    """Apply rate limiting to request"""
    try:
        # Get rate limit configuration
        config = RATE_LIMITS.get(category, RATE_LIMITS["default"])
        
        # Create rate limit key
        key = f"{category}:{create_rate_limit_key(request, user_id)}"
        
        # Check rate limit
        result = await rate_limiter.is_allowed(
            key=key,
            limit=config["limit"],
            window_seconds=config["window"],
            burst_limit=config.get("burst")
        )
        
        # Add rate limit headers to response (will be added by middleware)
        request.state.rate_limit_info = {
            "limit": result["limit"],
            "remaining": result["remaining"],
            "reset_time": result["reset_time"]
        }
        
        # Return error response if not allowed
        if not result["allowed"]:
            headers = {
                "X-RateLimit-Limit": str(result["limit"]),
                "X-RateLimit-Remaining": str(result["remaining"]),
                "X-RateLimit-Reset": str(int(result["reset_time"])),
                "Retry-After": str(result["retry_after"])
            }
            
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "detail": f"Too many requests. Limit: {result['limit']} per {config['window']} seconds",
                    "retry_after": result["retry_after"],
                    "reset_time": result["reset_time"]
                },
                headers=headers
            )
        
        return None  # Request allowed
        
    except Exception as e:
        logger.error(f"Rate limit application error: {str(e)}")
        return None  # Allow request on error

class RateLimitMiddleware:
    """FastAPI middleware for rate limiting"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive)
        
        # Skip rate limiting for health checks and static files
        if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
            await self.app(scope, receive, send)
            return
        
        # Determine rate limit category based on path
        category = "default"
        if request.url.path.startswith("/auth"):
            category = "auth"
        elif request.url.path.startswith("/media"):
            category = "upload"
        elif request.url.path.startswith("/ai"):
            category = "ai"
        elif request.url.path.startswith("/social") or request.url.path.startswith("/post"):
            category = "posting"
        elif request.url.path.startswith("/analytics") or request.url.path.startswith("/dashboard"):
            category = "analytics"
        
        # Apply rate limiting
        rate_limit_response = await apply_rate_limit(request, category)
        
        if rate_limit_response:
            # Rate limit exceeded, return error response
            await rate_limit_response(scope, receive, send)
            return
        
        # Create response wrapper to add headers
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                # Add rate limit headers if available
                if hasattr(request.state, "rate_limit_info"):
                    headers = message.get("headers", [])
                    rate_info = request.state.rate_limit_info
                    
                    headers.extend([
                        (b"x-ratelimit-limit", str(rate_info["limit"]).encode()),
                        (b"x-ratelimit-remaining", str(rate_info["remaining"]).encode()),
                        (b"x-ratelimit-reset", str(int(rate_info["reset_time"])).encode()),
                    ])
                    
                    message["headers"] = headers
            
            await send(message)
        
        await self.app(scope, receive, send_wrapper)

# Decorator for applying rate limits to specific routes
def rate_limit(category: str = "default"):
    """Decorator to apply rate limiting to specific routes"""
    def decorator(func: Callable) -> Callable:
        async def wrapper(*args, **kwargs):
            # Extract request and user from function parameters
            request = None
            user_id = None
            
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            # Check if user is in kwargs
            if "current_user" in kwargs and kwargs["current_user"]:
                user_id = kwargs["current_user"].id
            
            if request:
                rate_limit_response = await apply_rate_limit(request, category, user_id)
                if rate_limit_response:
                    return rate_limit_response
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator
