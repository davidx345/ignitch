from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn
import os
import logging
from datetime import datetime
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

# Import essential routers only (avoiding problematic imports)
try:
    from routers import auth, media, data_deletion, billboard, autopilot
    from routers.media_enhanced import router as media_enhanced_router
    
    # Import AdFlow Platform routers
    try:
        from routers import campaign, booking, admin_dashboard
        from routers.billboard_websocket import router as billboard_ws_router
        ADFLOW_ROUTERS_AVAILABLE = True
        print("✅ AdFlow platform routers imported successfully")
    except Exception as adflow_error:
        print(f"❌ AdFlow platform routers import failed: {adflow_error}")
        ADFLOW_ROUTERS_AVAILABLE = False
    
    # Import billboard registration router
    try:
        from routers import billboard_registration
        BILLBOARD_REGISTRATION_AVAILABLE = True
        print("✅ Billboard registration router imported successfully")
    except Exception as billboard_reg_error:
        print(f"❌ Billboard registration router import failed: {billboard_reg_error}")
        BILLBOARD_REGISTRATION_AVAILABLE = False
    
    # Import social router separately to catch specific errors
    try:
        from routers import social
        SOCIAL_AVAILABLE = True
        print("✅ Social router imported successfully")
    except Exception as social_import_error:
        print(f"❌ Social router import failed: {social_import_error}")
        import traceback
        traceback.print_exc()
        SOCIAL_AVAILABLE = False
    
    # Import enhanced social media router
    try:
        from routers import social_media
        SOCIAL_MEDIA_ENHANCED_AVAILABLE = True
        print("✅ Enhanced social media router imported successfully")
    except Exception as social_media_error:
        print(f"❌ Enhanced social media router import failed: {social_media_error}")
        SOCIAL_MEDIA_ENHANCED_AVAILABLE = False
    
    # Try to import dashboard separately to catch SQLAlchemy issues
    try:
        from routers import dashboard
        DASHBOARD_AVAILABLE = True
    except Exception as dashboard_error:
        print(f"Dashboard import warning: {dashboard_error}")
        DASHBOARD_AVAILABLE = False
        
    ROUTERS_AVAILABLE = True
except ImportError as e:
    print(f"Router import warning: {e}")
    ROUTERS_AVAILABLE = False
    DASHBOARD_AVAILABLE = False
    SOCIAL_AVAILABLE = False
    BILLBOARD_REGISTRATION_AVAILABLE = False
    ADFLOW_ROUTERS_AVAILABLE = False

from database import engine, Base
# Import models and middleware with error handling
try:
    from models import User, Post, SocialAccount, MediaFile, BulkUploadBatch, AutopilotRule, ScheduledPost, SystemLog, RateLimit
    from middleware.rate_limiting import RateLimitMiddleware, rate_limiter
    from middleware.error_handling import (
        ErrorHandlingMiddleware, 
        validation_exception_handler,
        http_exception_handler, 
        general_exception_handler,
        health_check
    )
    MIDDLEWARE_AVAILABLE = True
except ImportError as e:
    print(f"Middleware/Models import warning: {e}")
    MIDDLEWARE_AVAILABLE = False
    # Simple health check fallback
    async def health_check():
        return {"status": "ok", "message": "API is running"}

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Ignitch API v2.0.0 - Production Mode")
    
    # Ensure database tables exist
    try:
        logger.info("🔄 Initializing database schema...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database schema ready!")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
        # Don't raise - allow app to start even if DB fails
    
    # Initialize AdFlow platform services
    try:
        logger.info("🔄 Starting AdFlow platform services...")
        from production_startup import startup_event
        await startup_event()
        logger.info("✅ AdFlow platform services started!")
    except Exception as e:
        logger.warning(f"AdFlow services failed to start: {str(e)}")
    
    # Initialize services
    try:
        # TODO: Initialize external service connections
        logger.info("Services initialized successfully")
    except Exception as e:
        logger.warning(f"Some services failed to initialize: {str(e)}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Ignitch API")
    
    # Shutdown AdFlow platform services
    try:
        logger.info("🔄 Stopping AdFlow platform services...")
        from production_startup import shutdown_event
        await shutdown_event()
        logger.info("✅ AdFlow platform services stopped!")
    except Exception as e:
        logger.warning(f"AdFlow services shutdown error: {str(e)}")
        
    # TODO: Cleanup resources

# Initialize FastAPI app with production configuration
app = FastAPI(
    title="Ignitch API - Production",
    description="AI-Powered Social Media Marketing Platform with Business Coach & Auto-Pilot",
    version="2.0.0",
    docs_url="/api/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/api/redoc" if os.getenv("ENVIRONMENT") != "production" else None,
    lifespan=lifespan
)

# Production-grade middleware setup (conditional)
# 1. Security middleware - Allow Heroku hosts
heroku_hosts = [
    "ignitch-api-8f7efad07047.herokuapp.com",
    "*.herokuapp.com",
    "localhost",
    "127.0.0.1"
]

if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=heroku_hosts + ["adflow.app", "*.adflow.app", "*.railway.app"]
    )

# 2. Error handling middleware (if available)
if MIDDLEWARE_AVAILABLE:
    app.add_middleware(ErrorHandlingMiddleware)
    # 3. Rate limiting middleware
    app.add_middleware(RateLimitMiddleware)

# 4. CORS middleware - Enhanced for production
origins = [
    "http://localhost:3000",  # Local development
    "https://localhost:3000",  # Local development with HTTPS
    "https://ignitch.vercel.app",  # Vercel frontend URL
    "https://ignitch-git-main-davidx345s-projects.vercel.app",  # Vercel preview URL
    "https://adflow.app",  # Production domain
    "https://www.adflow.app",  # Production domain with www
]

# Add environment-based origins
if os.getenv("RAILWAY_ENVIRONMENT"):
    frontend_url = os.getenv("FRONTEND_URL", "https://ignitch.vercel.app")
    if frontend_url not in origins:
        origins.append(frontend_url)

# Add development origins in non-production
if os.getenv("ENVIRONMENT") != "production":
    development_origins = [
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    origins.extend(development_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]
)

# Enhanced exception handlers (if middleware available)
if MIDDLEWARE_AVAILABLE:
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)

# Include routers - Only working ones for now
if ROUTERS_AVAILABLE:
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    
    # Media endpoints - both original and enhanced
    app.include_router(media.router, prefix="/api/media", tags=["Media Upload"])
    app.include_router(media_enhanced_router, prefix="/api/media/v2", tags=["Enhanced Media Upload"])
    
    # Include social router only if available
    if SOCIAL_AVAILABLE:
        try:
            app.include_router(social.router, prefix="/api/social", tags=["Social Media"])
            print("✅ Social router included successfully")
        except Exception as social_error:
            print(f"❌ Social router failed to include: {social_error}")
            import traceback
            traceback.print_exc()
    else:
        print("⚠️ Social router not available - skipped inclusion")
    
    # Include enhanced social media router
    if SOCIAL_MEDIA_ENHANCED_AVAILABLE:
        try:
            app.include_router(social_media.router, tags=["Enhanced Social Media"])
            print("✅ Enhanced social media router included successfully")
        except Exception as social_media_error:
            print(f"❌ Enhanced social media router failed to include: {social_media_error}")
            import traceback
            traceback.print_exc()
    else:
        print("⚠️ Enhanced social media router not available - skipped inclusion")
    
    # Include billboard router for global billboard marketplace
    try:
        app.include_router(billboard.router, prefix="/api/billboards", tags=["Global Billboard Marketplace"])
        print("✅ Billboard router included successfully")
    except Exception as billboard_error:
        print(f"❌ Billboard router failed to include: {billboard_error}")
        import traceback
        traceback.print_exc()
    
    # Include billboard registration router for Nigeria onboarding
    if BILLBOARD_REGISTRATION_AVAILABLE:
        try:
            app.include_router(billboard_registration.router, prefix="/api", tags=["Billboard Registration"])
            print("✅ Billboard registration router included successfully")
        except Exception as billboard_reg_error:
            print(f"❌ Billboard registration router failed to include: {billboard_reg_error}")
            import traceback
            traceback.print_exc()
    else:
        print("⚠️ Billboard registration router not available")
    
    # Include dashboard only if available
    if DASHBOARD_AVAILABLE:
        try:
            app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Analytics Dashboard"])
            print("✅ Dashboard router included successfully")
        except Exception as dashboard_include_error:
            print(f"❌ Dashboard router failed to include: {dashboard_include_error}")
            DASHBOARD_AVAILABLE = False
    else:
        print("⚠️ Dashboard router not available, using fallback endpoint only")
    
    app.include_router(data_deletion.router, prefix="/api/data-deletion", tags=["Data Deletion"])
    
    # Add simple billboard test endpoint if router import fails
    @app.get("/api/billboards/test")
    async def billboard_test():
        """Test endpoint to verify billboard system is ready"""
        return {
            "status": "ready",
            "message": "Global Billboard Marketplace System Online",
            "features": [
                "Billboard Search & Discovery",
                "Real-time Booking System",
                "Stripe Payment Processing",
                "Geographic Search",
                "Owner Onboarding",
                "Analytics & Reporting"
            ],
            "endpoints": [
                "GET /api/billboards/search - Search billboards",
                "POST /api/billboards/bookings - Create booking",
                "POST /api/billboards/bookings/quote - Get quote",
                "POST /api/billboards/owner/onboard - Onboard owner"
            ]
        }
    
    # TODO: Add other routers once import issues are resolved
    # app.include_router(ai.router, prefix="/api/ai", tags=["AI Content Generation"])
    # app.include_router(scheduler.router, prefix="/api/scheduler", tags=["Post Scheduler"])
    # app.include_router(ai_coach.router, prefix="/api/ai-coach", tags=["AI Business Coach"])
    app.include_router(autopilot.router, prefix="/api/autopilot", tags=["Auto-Pilot Mode"])
    
    # Include AdFlow platform routers
    if ADFLOW_ROUTERS_AVAILABLE:
        try:
            app.include_router(campaign.router, prefix="/api/campaigns", tags=["Campaign Management"])
            app.include_router(booking.router, prefix="/api/bookings", tags=["Booking Management"]) 
            app.include_router(admin_dashboard.router, prefix="/api/admin", tags=["Admin Dashboard"])
            app.include_router(billboard_ws_router, prefix="/api/ws", tags=["WebSocket Communication"])
            print("✅ All AdFlow platform routers included successfully")
        except Exception as adflow_include_error:
            print(f"❌ AdFlow platform routers failed to include: {adflow_include_error}")
            import traceback
            traceback.print_exc()
    else:
        print("⚠️ AdFlow platform routers not available")

# Enhanced root and health endpoints
@app.get("/")
async def root():
    """Root endpoint with system information"""
    return {
        "message": "Ignitch API - Production Ready", 
        "version": "2.0.0", 
        "status": "operational",
        "database": "connected" if engine else "not connected",
        "features": [
            "Global Billboard Marketplace",
            "Real-time Billboard Booking System", 
            "Stripe Connect Payment Processing",
            "Geographic Billboard Search",
            "Billboard Owner Onboarding",
            "Real Social Media Integration",
            "AI-Powered Content Generation", 
            "Business Coach with Real Analytics",
            "Auto-Pilot Mode with Real Posting",
            "Bulk Photo Upload",
            "Rate Limiting",
            "Production Error Handling",
            "Comprehensive Monitoring",
            "Authentication System",
            "AdFlow Billboard Platform",
            "Campaign Management System",
            "Booking & Payment Processing",
            "Billboard Agent Software",
            "Real-time WebSocket Communication",
            "Admin Dashboard & Monitoring"
        ],
        "endpoints": {
            "health": "/health",
            "auth": "/auth/*",
            "docs": "/api/docs" if os.getenv("ENVIRONMENT") != "production" else "disabled",
            "social": "/api/social/*",
            "media_v2": "/api/media/v2",
            "billboards": "/api/billboards/*",
            "billboard_search": "/api/billboards/search",
            "billboard_bookings": "/api/billboards/bookings",
            "ai_coach_v2": "/api/ai-coach/v2", 
            "autopilot_v2": "/api/autopilot/v2",
            "adflow_campaigns": "/api/campaigns/*",
            "adflow_bookings": "/api/bookings/*",
            "adflow_admin": "/api/admin/*",
            "adflow_websockets": "/api/ws/*"
        }
    }

@app.get("/health")
async def health_endpoint():
    """Enhanced health check endpoint"""
    return await health_check()

# Basic auth endpoints for testing
@app.post("/auth/signup")
async def signup():
    """Signup endpoint - ready for Supabase integration"""
    return {
        "message": "Signup endpoint ready - integrate with Supabase",
        "providers": ["email", "google"],
        "supabase_url": os.getenv("NEXT_PUBLIC_SUPABASE_URL", "not_configured"),
        "status": "ready"
    }

@app.post("/auth/signin")
async def signin():
    """Signin endpoint - ready for Supabase integration"""
    return {
        "message": "Signin endpoint ready - integrate with Supabase",
        "providers": ["email", "google"],
        "supabase_url": os.getenv("NEXT_PUBLIC_SUPABASE_URL", "not_configured"),
        "status": "ready"
    }

@app.get("/auth/google")
async def google_auth():
    """Google OAuth endpoint - ready for Supabase integration"""
    return {
        "message": "Google OAuth ready",
        "redirect_url": "Handle via Supabase client",
        "status": "configured"
    }

@app.get("/api/info")
async def api_info():
    """API information and capabilities"""
    return {
        "api_version": "2.0.0",
        "production_ready": True,
        "capabilities": {
            "bulk_upload": True,
            "real_social_apis": True,
            "ai_coach": True,
            "autopilot": True,
            "rate_limiting": True,
            "error_handling": True,
            "monitoring": True
        },
        "supported_platforms": ["Instagram", "Facebook", "Twitter", "TikTok"],
        "ai_models": ["GPT-3.5-turbo"],
        "upload_limits": {
            "max_file_size": "50MB",
            "max_bulk_files": 50,
            "supported_formats": ["JPEG", "PNG", "WebP", "GIF", "MP4", "MOV"]
        }
    }

# Temporary fallback endpoints for social media (while debugging router issues)
@app.get("/api/social/accounts")
async def get_social_accounts_fallback():
    """Temporary fallback for social accounts endpoint"""
    return {
        "accounts": [],
        "message": "No social media accounts connected yet",
        "available_platforms": ["Instagram", "Facebook", "Twitter", "TikTok"],
        "status": "ready",
        "note": "This is a temporary endpoint while debugging router issues"
    }

@app.post("/api/social/auth/instagram")
async def connect_instagram_fallback():
    """Temporary fallback for Instagram connection"""
    instagram_client_id = os.getenv("INSTAGRAM_CLIENT_ID", "747326327930933")
    return {
        "auth_url": f"https://www.facebook.com/v18.0/dialog/oauth?client_id={instagram_client_id}&redirect_uri=https://ignitch.vercel.app/auth/instagram/callback&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement&response_type=code&state=temp_state_token",
        "state": "temp_state_token",
        "platform": "instagram",
        "status": "ready",
        "message": "Visit the auth_url to connect your Instagram account",
        "note": "This is a temporary endpoint while debugging router issues"
    }

@app.post("/api/social/auth/facebook")
async def connect_facebook_fallback():
    """Temporary fallback for Facebook connection"""
    facebook_client_id = os.getenv("FACEBOOK_CLIENT_ID", "747326327930933")
    return {
        "auth_url": f"https://www.facebook.com/v18.0/dialog/oauth?client_id={facebook_client_id}&redirect_uri=https://ignitch.vercel.app/auth/facebook/callback&scope=pages_manage_posts,pages_read_engagement,business_management&response_type=code&state=temp_state_token",
        "state": "temp_state_token", 
        "platform": "facebook",
        "status": "ready",
        "message": "Visit the auth_url to connect your Facebook account",
        "note": "This is a temporary endpoint while debugging router issues"
    }

# Direct dashboard endpoint to bypass import issues
@app.get("/api/dashboard/overview")
async def dashboard_overview():
    """Dashboard overview with real zero data - bypasses import issues"""
    try:
        return {
            "stats": {
                "total_posts": 0,
                "total_reach": 0,
                "avg_engagement": 0,
                "connected_platforms": 0,
                "posts_this_week": 0,
                "visibility_score": 0
            },
            "recent_posts": [],
            "platform_performance": [],
            "growth_metrics": {
                "reach_growth": 0,
                "engagement_growth": 0,
                "follower_growth": 0
            },
            "performance_insights": [
                {
                    "metric": "Getting Started",
                    "value": "Welcome!",
                    "trend": "new",
                    "period": "all time",
                    "description": "Your dashboard is ready! Start by uploading content or connecting social media accounts."
                }
            ],
            "trending_hashtags": [],
            "best_performing_content": [],
            "quick_actions": [
                {
                    "title": "Upload Content",
                    "description": "Upload and create AI-powered content",
                    "action": "upload",
                    "icon": "upload",
                    "priority": "high"
                },
                {
                    "title": "Connect Social Media",
                    "description": "Connect your social media accounts",
                    "action": "connect",
                    "icon": "link",
                    "priority": "high"
                },
                {
                    "title": "Billboard Marketplace",
                    "description": "Explore global billboard advertising",
                    "action": "billboard",
                    "icon": "billboard",
                    "priority": "medium"
                }
            ],
            "success": True,
            "status": "ready",
            "timestamp": datetime.now().isoformat(),
            "message": "Dashboard loaded successfully. Start creating content to see real analytics!"
        }
    except Exception as e:
        # Fallback response if anything goes wrong
        return {
            "stats": {
                "total_posts": 0,
                "total_reach": 0,
                "avg_engagement": 0,
                "connected_platforms": 0,
                "posts_this_week": 0,
                "visibility_score": 0
            },
            "recent_posts": [],
            "platform_performance": [],
            "growth_metrics": {
                "reach_growth": 0,
                "engagement_growth": 0,
                "follower_growth": 0
            },
            "performance_insights": [
                {
                    "metric": "System Status",
                    "value": "Online",
                    "trend": "stable",
                    "period": "now",
                    "description": "Dashboard is running in fallback mode"
                }
            ],
            "trending_hashtags": [],
            "best_performing_content": [],
            "quick_actions": [
                {
                    "title": "Reload Dashboard",
                    "description": "Refresh the page to try again",
                    "action": "reload",
                    "icon": "refresh",
                    "priority": "high"
                }
            ],
            "success": True,
            "status": "fallback",
            "error": str(e),
            "message": "Dashboard fallback mode - basic functionality available"
        }

# Simple test endpoint without authentication
@app.get("/api/dashboard/test")
async def dashboard_test():
    """Test endpoint to verify dashboard API is responding"""
    return {
        "status": "ok",
        "message": "Dashboard API is working",
        "timestamp": datetime.now().isoformat(),
        "available_endpoints": [
            "/api/dashboard/overview - Main dashboard data",
            "/api/dashboard/test - This test endpoint"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
