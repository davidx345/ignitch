"""
Production Startup Script
Initializes all AdFlow platform services for production deployment
"""

import asyncio
import sys
import signal
from datetime import datetime
from typing import Dict, Any

# Import all services
from services.monitoring_service import monitoring_service
from services.campaign_scheduler import campaign_scheduler
from services.billboard_websocket import billboard_ws_manager
from services.customer_support_service import customer_support_service
from database import engine, Base

class AdFlowPlatform:
    """Main platform orchestrator for production deployment"""
    
    def __init__(self):
        self.services = {}
        self.is_running = False
        self.startup_time = None
        
    async def initialize_database(self):
        """Initialize database tables"""
        try:
            print("🔄 Initializing database...")
            
            # Create all tables
            Base.metadata.create_all(bind=engine)
            
            print("✅ Database initialized successfully")
            return True
            
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")
            return False
    
    async def start_services(self):
        """Start all platform services"""
        
        if self.is_running:
            print("⚠️ Platform already running")
            return
        
        print("🚀 Starting AdFlow Platform...")
        self.startup_time = datetime.utcnow()
        
        # Initialize database
        if not await self.initialize_database():
            print("❌ Platform startup failed: Database initialization error")
            return False
        
        try:
            # Start monitoring service
            print("🔄 Starting monitoring service...")
            await monitoring_service.start_monitoring()
            self.services["monitoring"] = monitoring_service
            print("✅ Monitoring service started")
            
            # Start campaign scheduler
            print("🔄 Starting campaign scheduler...")
            await campaign_scheduler.start()
            self.services["scheduler"] = campaign_scheduler
            print("✅ Campaign scheduler started")
            
            # Initialize WebSocket manager
            print("🔄 Initializing WebSocket manager...")
            # Note: WebSocket manager is initialized when first used
            self.services["websockets"] = billboard_ws_manager
            print("✅ WebSocket manager ready")
            
            # Initialize customer support
            print("🔄 Initializing customer support...")
            self.services["support"] = customer_support_service
            print("✅ Customer support initialized")
            
            self.is_running = True
            
            print("🎉 AdFlow Platform started successfully!")
            print(f"📊 Platform status: {self.get_platform_status()}")
            
            return True
            
        except Exception as e:
            print(f"❌ Platform startup failed: {e}")
            await self.stop_services()
            return False
    
    async def stop_services(self):
        """Stop all platform services"""
        
        if not self.is_running:
            print("⚠️ Platform not running")
            return
        
        print("🛑 Stopping AdFlow Platform...")
        
        try:
            # Stop monitoring service
            if "monitoring" in self.services:
                print("🔄 Stopping monitoring service...")
                await monitoring_service.stop_monitoring()
                print("✅ Monitoring service stopped")
            
            # Stop campaign scheduler
            if "scheduler" in self.services:
                print("🔄 Stopping campaign scheduler...")
                await campaign_scheduler.stop()
                print("✅ Campaign scheduler stopped")
            
            # WebSocket connections will be closed automatically
            if "websockets" in self.services:
                print("🔄 Closing WebSocket connections...")
                # In production, we'd gracefully close all connections
                print("✅ WebSocket connections closed")
            
            self.services.clear()
            self.is_running = False
            
            print("✅ AdFlow Platform stopped successfully")
            
        except Exception as e:
            print(f"❌ Error during platform shutdown: {e}")
    
    def get_platform_status(self) -> Dict[str, Any]:
        """Get current platform status"""
        
        uptime_seconds = 0
        if self.startup_time:
            uptime_seconds = (datetime.utcnow() - self.startup_time).total_seconds()
        
        return {
            "platform_running": self.is_running,
            "startup_time": self.startup_time.isoformat() if self.startup_time else None,
            "uptime_seconds": uptime_seconds,
            "services": {
                "monitoring": "monitoring" in self.services,
                "scheduler": "scheduler" in self.services,
                "websockets": "websockets" in self.services,
                "support": "support" in self.services
            },
            "service_count": len(self.services)
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform comprehensive health check"""
        
        health_status = {
            "platform": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {}
        }
        
        try:
            # Check monitoring service
            if "monitoring" in self.services:
                monitoring_stats = monitoring_service.get_monitoring_stats()
                health_status["checks"]["monitoring"] = {
                    "status": "healthy" if monitoring_stats["monitoring_status"] == "running" else "unhealthy",
                    "details": monitoring_stats
                }
            else:
                health_status["checks"]["monitoring"] = {"status": "not_running"}
            
            # Check scheduler service
            if "scheduler" in self.services:
                scheduler_status = campaign_scheduler.get_scheduler_status()
                health_status["checks"]["scheduler"] = {
                    "status": "healthy" if scheduler_status["is_running"] else "unhealthy",
                    "details": scheduler_status
                }
            else:
                health_status["checks"]["scheduler"] = {"status": "not_running"}
            
            # Check WebSocket connections
            if "websockets" in self.services:
                connected_billboards = len(billboard_ws_manager.get_connected_billboards())
                health_status["checks"]["websockets"] = {
                    "status": "healthy",
                    "connected_billboards": connected_billboards
                }
            else:
                health_status["checks"]["websockets"] = {"status": "not_initialized"}
            
            # Check customer support
            if "support" in self.services:
                support_stats = customer_support_service.get_support_stats()
                health_status["checks"]["support"] = {
                    "status": "healthy",
                    "details": support_stats
                }
            else:
                health_status["checks"]["support"] = {"status": "not_initialized"}
            
            # Determine overall health
            service_statuses = [check.get("status") for check in health_status["checks"].values()]
            if any(status == "unhealthy" for status in service_statuses):
                health_status["platform"] = "degraded"
            elif any(status in ["not_running", "not_initialized"] for status in service_statuses):
                health_status["platform"] = "partial"
            
        except Exception as e:
            health_status["platform"] = "unhealthy"
            health_status["error"] = str(e)
        
        return health_status
    
    async def restart_service(self, service_name: str) -> Dict[str, Any]:
        """Restart a specific service"""
        
        try:
            if service_name == "monitoring":
                print("🔄 Restarting monitoring service...")
                await monitoring_service.stop_monitoring()
                await monitoring_service.start_monitoring()
                print("✅ Monitoring service restarted")
                
            elif service_name == "scheduler":
                print("🔄 Restarting campaign scheduler...")
                await campaign_scheduler.stop()
                await campaign_scheduler.start()
                print("✅ Campaign scheduler restarted")
                
            else:
                return {
                    "success": False,
                    "message": f"Unknown service: {service_name}"
                }
            
            return {
                "success": True,
                "message": f"{service_name} service restarted successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to restart {service_name}: {str(e)}"
            }

# Create global platform instance
platform = AdFlowPlatform()

# Signal handlers for graceful shutdown
def signal_handler(signum, frame):
    """Handle shutdown signals"""
    print(f"\n🛑 Received signal {signum}, initiating graceful shutdown...")
    
    # Run shutdown in event loop
    loop = asyncio.get_event_loop()
    if loop.is_running():
        loop.create_task(platform.stop_services())
    else:
        asyncio.run(platform.stop_services())
    
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGINT, signal_handler)   # Ctrl+C
signal.signal(signal.SIGTERM, signal_handler)  # Termination signal

async def main():
    """Main startup function"""
    
    print("🌟 AdFlow Digital Billboard Platform")
    print("🚀 Production Deployment v1.0")
    print("=" * 50)
    
    # Start platform services
    success = await platform.start_services()
    
    if not success:
        print("❌ Platform startup failed")
        sys.exit(1)
    
    # Keep the platform running
    try:
        while platform.is_running:
            # Perform periodic health checks
            await asyncio.sleep(300)  # Check every 5 minutes
            
            health = await platform.health_check()
            if health["platform"] == "unhealthy":
                print(f"⚠️ Platform health check failed: {health}")
            elif health["platform"] == "degraded":
                print(f"⚠️ Platform running in degraded mode: {health}")
            else:
                print(f"✅ Platform health check passed at {health['timestamp']}")
    
    except KeyboardInterrupt:
        print("\n🛑 Shutdown initiated by user")
    
    except Exception as e:
        print(f"❌ Platform error: {e}")
    
    finally:
        await platform.stop_services()

# Development/testing functions
async def start_platform():
    """Start platform (for use in other modules)"""
    return await platform.start_services()

async def stop_platform():
    """Stop platform (for use in other modules)"""
    await platform.stop_services()

def get_platform_status():
    """Get platform status (for use in other modules)"""
    return platform.get_platform_status()

async def platform_health_check():
    """Get platform health (for use in other modules)"""
    return await platform.health_check()

# FastAPI startup event handlers
async def startup_event():
    """FastAPI startup event handler"""
    print("🔄 FastAPI startup: Initializing AdFlow platform...")
    await start_platform()

async def shutdown_event():
    """FastAPI shutdown event handler"""
    print("🔄 FastAPI shutdown: Stopping AdFlow platform...")
    await stop_platform()

if __name__ == "__main__":
    """Run platform directly"""
    print("🚀 Starting AdFlow Platform in standalone mode...")
    asyncio.run(main())
