"""
Production-Grade Error Handling Middleware
Comprehensive error handling, logging, and monitoring
"""
import traceback
import uuid
from typing import Dict, Any, Optional
from datetime import datetime
import logging
import json
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException
import asyncio

# Set up structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ErrorHandler:
    """Centralized error handling with logging and monitoring"""
    
    def __init__(self):
        self.error_categories = {
            "auth": ["authentication", "authorization", "token"],
            "validation": ["validation", "input", "parameter"],
            "database": ["database", "sql", "connection"],
            "external": ["api", "service", "timeout", "network"],
            "system": ["memory", "disk", "cpu", "internal"],
            "business": ["business_logic", "workflow", "rule"]
        }
    
    def categorize_error(self, error: Exception, context: Dict[str, Any]) -> str:
        """Categorize error for better monitoring"""
        error_type = type(error).__name__.lower()
        error_message = str(error).lower()
        
        for category, keywords in self.error_categories.items():
            if any(keyword in error_type or keyword in error_message for keyword in keywords):
                return category
        
        return "unknown"
    
    async def log_error(
        self, 
        error: Exception, 
        request: Request, 
        request_id: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Log error with comprehensive context"""
        try:
            error_context = {
                "request_id": request_id,
                "timestamp": datetime.now().isoformat(),
                "error_type": type(error).__name__,
                "error_message": str(error),
                "error_category": self.categorize_error(error, {}),
                "request": {
                    "method": request.method,
                    "url": str(request.url),
                    "path": request.url.path,
                    "query_params": dict(request.query_params),
                    "headers": dict(request.headers),
                    "user_agent": request.headers.get("user-agent"),
                    "client_ip": self._get_client_ip(request)
                },
                "user_id": user_id,
                "stack_trace": traceback.format_exc()
            }
            
            # Sanitize sensitive data
            error_context = self._sanitize_context(error_context)
            
            # Log based on severity
            if isinstance(error, (HTTPException, RequestValidationError)):
                logger.warning(f"Client error: {json.dumps(error_context, default=str)}")
            else:
                logger.error(f"Server error: {json.dumps(error_context, default=str)}")
            
            # TODO: Send to monitoring service (e.g., Sentry, DataDog)
            # await self._send_to_monitoring(error_context)
            
            return error_context
            
        except Exception as logging_error:
            # Don't let logging errors break the application
            logger.critical(f"Error logging failed: {str(logging_error)}")
            return {}
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def _sanitize_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Remove sensitive information from error context"""
        sensitive_headers = {
            "authorization", "cookie", "x-api-key", "x-auth-token"
        }
        
        if "request" in context and "headers" in context["request"]:
            headers = context["request"]["headers"]
            for header in list(headers.keys()):
                if header.lower() in sensitive_headers:
                    headers[header] = "[REDACTED]"
        
        return context
    
    async def _send_to_monitoring(self, error_context: Dict[str, Any]):
        """Send error to external monitoring service"""
        try:
            # Placeholder for external monitoring integration
            # Example: Sentry, DataDog, New Relic, etc.
            pass
        except Exception as e:
            logger.error(f"Failed to send error to monitoring: {str(e)}")

# Global error handler instance
error_handler = ErrorHandler()

class ErrorHandlingMiddleware:
    """FastAPI middleware for comprehensive error handling"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive)
        request_id = str(uuid.uuid4())
        
        # Add request ID to request state for use in handlers
        request.state.request_id = request_id
        
        try:
            # Add request ID header to response
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    headers = message.get("headers", [])
                    headers.append((b"x-request-id", request_id.encode()))
                    message["headers"] = headers
                await send(message)
            
            await self.app(scope, receive, send_wrapper)
            
        except Exception as e:
            # Handle unhandled exceptions
            response = await self._handle_exception(e, request, request_id)
            await response(scope, receive, send)
    
    async def _handle_exception(
        self, 
        error: Exception, 
        request: Request, 
        request_id: str
    ) -> Response:
        """Handle various types of exceptions"""
        try:
            # Extract user ID if available
            user_id = getattr(request.state, "user_id", None)
            
            # Log the error
            await error_handler.log_error(error, request, request_id, user_id)
            
            # Handle specific exception types
            if isinstance(error, RequestValidationError):
                return await self._handle_validation_error(error, request_id)
            
            elif isinstance(error, HTTPException):
                return await self._handle_http_exception(error, request_id)
            
            elif isinstance(error, SQLAlchemyError):
                return await self._handle_database_error(error, request_id)
            
            elif isinstance(error, asyncio.TimeoutError):
                return await self._handle_timeout_error(error, request_id)
            
            else:
                return await self._handle_internal_error(error, request_id)
                
        except Exception as handler_error:
            # Last resort error handling
            logger.critical(f"Error handler failed: {str(handler_error)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "Critical system error",
                    "detail": "An unexpected error occurred",
                    "request_id": request_id,
                    "timestamp": datetime.now().isoformat()
                }
            )
    
    async def _handle_validation_error(
        self, 
        error: RequestValidationError, 
        request_id: str
    ) -> JSONResponse:
        """Handle validation errors"""
        validation_errors = []
        
        for error_detail in error.errors():
            validation_errors.append({
                "field": " -> ".join(str(loc) for loc in error_detail["loc"]),
                "message": error_detail["msg"],
                "type": error_detail["type"],
                "value": error_detail.get("input")
            })
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "Validation failed",
                "detail": "The request contains invalid data",
                "validation_errors": validation_errors,
                "request_id": request_id,
                "timestamp": datetime.now().isoformat()
            }
        )
    
    async def _handle_http_exception(
        self, 
        error: HTTPException, 
        request_id: str
    ) -> JSONResponse:
        """Handle HTTP exceptions"""
        return JSONResponse(
            status_code=error.status_code,
            content={
                "error": "HTTP error",
                "detail": error.detail,
                "status_code": error.status_code,
                "request_id": request_id,
                "timestamp": datetime.now().isoformat()
            }
        )
    
    async def _handle_database_error(
        self, 
        error: SQLAlchemyError, 
        request_id: str
    ) -> JSONResponse:
        """Handle database errors"""
        # Don't expose database details in production
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Database error",
                "detail": "A database operation failed. Please try again later.",
                "error_code": "DB_ERROR",
                "request_id": request_id,
                "timestamp": datetime.now().isoformat(),
                "retry_after": 60  # Suggest retry after 60 seconds
            }
        )
    
    async def _handle_timeout_error(
        self, 
        error: asyncio.TimeoutError, 
        request_id: str
    ) -> JSONResponse:
        """Handle timeout errors"""
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content={
                "error": "Request timeout",
                "detail": "The request took too long to process. Please try again.",
                "error_code": "TIMEOUT_ERROR",
                "request_id": request_id,
                "timestamp": datetime.now().isoformat(),
                "retry_after": 30
            }
        )
    
    async def _handle_internal_error(
        self, 
        error: Exception, 
        request_id: str
    ) -> JSONResponse:
        """Handle internal server errors"""
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal server error",
                "detail": "An unexpected error occurred. Please contact support if the problem persists.",
                "error_code": "INTERNAL_ERROR",
                "request_id": request_id,
                "timestamp": datetime.now().isoformat()
            }
        )

# Exception handlers for FastAPI
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle FastAPI validation errors"""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    
    validation_errors = []
    for error in exc.errors():
        validation_errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    await error_handler.log_error(exc, request, request_id)
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation failed",
            "detail": "Request validation failed",
            "validation_errors": validation_errors,
            "request_id": request_id,
            "timestamp": datetime.now().isoformat()
        }
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    
    # Log client errors (4xx) as warnings, server errors (5xx) as errors
    if exc.status_code >= 500:
        await error_handler.log_error(exc, request, request_id)
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP error",
            "detail": exc.detail,
            "status_code": exc.status_code,
            "request_id": request_id,
            "timestamp": datetime.now().isoformat()
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    
    await error_handler.log_error(exc, request, request_id)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": "An unexpected error occurred",
            "request_id": request_id,
            "timestamp": datetime.now().isoformat()
        }
    )

# Health check endpoint with error monitoring
async def health_check() -> Dict[str, Any]:
    """Comprehensive health check endpoint"""
    try:
        health_status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "services": {},
            "uptime": 0  # TODO: Implement uptime tracking
        }
        
        # Check database connectivity
        try:
            # TODO: Add actual database health check
            health_status["services"]["database"] = True
        except Exception:
            health_status["services"]["database"] = False
            health_status["status"] = "degraded"
        
        # Check external services
        try:
            # TODO: Add health checks for external APIs
            health_status["services"]["openai"] = True
            health_status["services"]["social_apis"] = True
        except Exception:
            health_status["services"]["openai"] = False
            health_status["services"]["social_apis"] = False
            health_status["status"] = "degraded"
        
        # Overall status
        if all(health_status["services"].values()):
            health_status["status"] = "healthy"
        elif any(health_status["services"].values()):
            health_status["status"] = "degraded"
        else:
            health_status["status"] = "unhealthy"
        
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": "Health check failed"
        }
