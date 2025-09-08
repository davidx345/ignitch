"""
Admin Dashboard Router
Production monitoring and management for AdFlow platform
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_

from database import get_db
from auth_enhanced import get_current_admin_user
from services.monitoring_service import monitoring_service, AlertSeverity, AlertType
from services.customer_support_service import customer_support_service, TicketStatus, TicketPriority
from services.campaign_scheduler import campaign_scheduler
from services.billboard_websocket import billboard_ws_manager
from models import User, Billboard, Campaign, Booking, BillboardRegistration

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

# Request/Response Models
class AlertResponse(BaseModel):
    id: str
    type: str
    severity: str
    title: str
    message: str
    created_at: str
    resolved_at: Optional[str]
    acknowledged_at: Optional[str]

class SystemStatsResponse(BaseModel):
    users: Dict[str, int]
    billboards: Dict[str, int]
    campaigns: Dict[str, int]
    bookings: Dict[str, int]
    revenue: Dict[str, float]
    performance: Dict[str, Any]

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_admin_dashboard(
    current_admin = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive admin dashboard overview"""
    
    try:
        now = datetime.utcnow()
        last_24h = now - timedelta(days=1)
        last_7d = now - timedelta(days=7)
        last_30d = now - timedelta(days=30)
        
        # User statistics
        total_users = db.query(func.count(User.id)).scalar()
        users_24h = db.query(func.count(User.id)).filter(User.created_at >= last_24h).scalar()
        users_7d = db.query(func.count(User.id)).filter(User.created_at >= last_7d).scalar()
        
        active_advertisers = db.query(func.count(User.id.distinct())).join(
            Campaign, User.id == Campaign.advertiser_id
        ).filter(Campaign.created_at >= last_30d).scalar()
        
        active_owners = db.query(func.count(User.id.distinct())).join(
            Billboard, User.id == Billboard.owner_id
        ).filter(Billboard.created_at >= last_30d).scalar()
        
        # Billboard statistics
        total_billboards = db.query(func.count(Billboard.id)).scalar()
        active_billboards = db.query(func.count(Billboard.id)).filter(
            Billboard.status == "active"
        ).scalar()
        
        pending_registrations = db.query(func.count(BillboardRegistration.id)).filter(
            BillboardRegistration.status == "pending"
        ).scalar()
        
        # Campaign statistics
        total_campaigns = db.query(func.count(Campaign.id)).scalar()
        campaigns_24h = db.query(func.count(Campaign.id)).filter(
            Campaign.created_at >= last_24h
        ).scalar()
        
        active_campaigns = db.query(func.count(Campaign.id)).filter(
            Campaign.status == "live"
        ).scalar()
        
        # Booking statistics
        total_bookings = db.query(func.count(Booking.id)).scalar()
        bookings_24h = db.query(func.count(Booking.id)).filter(
            Booking.created_at >= last_24h
        ).scalar()
        
        confirmed_bookings = db.query(func.count(Booking.id)).filter(
            Booking.status == "confirmed"
        ).scalar()
        
        # Revenue statistics
        total_revenue = db.query(func.sum(Booking.total_amount)).filter(
            Booking.status.in_(["confirmed", "active", "completed"])
        ).scalar() or 0
        
        revenue_24h = db.query(func.sum(Booking.total_amount)).filter(
            and_(
                Booking.payment_confirmed_at >= last_24h,
                Booking.status.in_(["confirmed", "active", "completed"])
            )
        ).scalar() or 0
        
        revenue_7d = db.query(func.sum(Booking.total_amount)).filter(
            and_(
                Booking.payment_confirmed_at >= last_7d,
                Booking.status.in_(["confirmed", "active", "completed"])
            )
        ).scalar() or 0
        
        # Platform fee revenue (20% of bookings)
        platform_revenue = total_revenue * 0.2
        
        # Get monitoring stats
        monitoring_stats = monitoring_service.get_monitoring_stats()
        
        # Get support stats
        support_stats = customer_support_service.get_support_stats()
        
        # Get scheduler status
        scheduler_status = campaign_scheduler.get_scheduler_status()
        
        # Get connected billboards
        connected_billboards = len(billboard_ws_manager.get_connected_billboards())
        connection_rate = (connected_billboards / max(active_billboards, 1)) * 100
        
        dashboard_data = {
            "overview": {
                "total_users": total_users,
                "total_billboards": total_billboards,
                "total_campaigns": total_campaigns,
                "total_revenue": total_revenue,
                "platform_revenue": platform_revenue
            },
            "recent_activity": {
                "users_24h": users_24h,
                "campaigns_24h": campaigns_24h,
                "bookings_24h": bookings_24h,
                "revenue_24h": revenue_24h,
                "revenue_7d": revenue_7d
            },
            "user_metrics": {
                "total_users": total_users,
                "active_advertisers": active_advertisers,
                "active_owners": active_owners,
                "user_growth_rate": (users_7d / max(total_users - users_7d, 1)) * 100
            },
            "billboard_metrics": {
                "total_billboards": total_billboards,
                "active_billboards": active_billboards,
                "pending_registrations": pending_registrations,
                "connected_billboards": connected_billboards,
                "connection_rate": round(connection_rate, 2)
            },
            "campaign_metrics": {
                "total_campaigns": total_campaigns,
                "active_campaigns": active_campaigns,
                "campaign_growth": campaigns_24h,
                "average_campaign_value": (total_revenue / max(total_campaigns, 1))
            },
            "booking_metrics": {
                "total_bookings": total_bookings,
                "confirmed_bookings": confirmed_bookings,
                "booking_conversion_rate": (confirmed_bookings / max(total_bookings, 1)) * 100
            },
            "system_health": {
                "monitoring_status": monitoring_stats["monitoring_status"],
                "total_alerts": monitoring_stats["total_alerts"],
                "critical_alerts": monitoring_stats["critical_alerts"],
                "scheduler_running": scheduler_status["is_running"],
                "websocket_connections": connected_billboards
            },
            "support_metrics": {
                "open_tickets": support_stats["open_tickets"],
                "sla_compliance": support_stats["sla_compliance_rate"],
                "avg_resolution_time": support_stats["average_resolution_time_hours"]
            }
        }
        
        return dashboard_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dashboard: {str(e)}"
        )

@router.get("/alerts", response_model=List[AlertResponse])
async def get_system_alerts(
    severity: Optional[str] = None,
    type: Optional[str] = None,
    resolved: Optional[bool] = None,
    limit: int = 100,
    current_admin = Depends(get_current_admin_user)
):
    """Get system alerts with filtering"""
    
    try:
        # Convert string parameters to enums
        severity_enum = None
        if severity:
            try:
                severity_enum = AlertSeverity(severity)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid severity: {severity}"
                )
        
        type_enum = None
        if type:
            try:
                type_enum = AlertType(type)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid type: {type}"
                )
        
        alerts = monitoring_service.get_alerts(
            severity=severity_enum,
            type=type_enum,
            resolved=resolved,
            limit=limit
        )
        
        return [
            AlertResponse(
                id=alert["id"],
                type=alert["type"],
                severity=alert["severity"],
                title=alert["title"],
                message=alert["message"],
                created_at=alert["created_at"],
                resolved_at=alert["resolved_at"],
                acknowledged_at=alert["acknowledged_at"]
            )
            for alert in alerts
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get alerts: {str(e)}"
        )

@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    current_admin = Depends(get_current_admin_user)
):
    """Acknowledge an alert"""
    
    result = monitoring_service.acknowledge_alert(
        alert_id=alert_id,
        acknowledged_by=current_admin.email
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )
    
    return result

@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    current_admin = Depends(get_current_admin_user)
):
    """Resolve an alert"""
    
    result = monitoring_service.resolve_alert(
        alert_id=alert_id,
        resolved_by=current_admin.email
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )
    
    return result

@router.get("/support/tickets")
async def get_support_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 100,
    current_admin = Depends(get_current_admin_user)
):
    """Get support tickets (admin view)"""
    
    try:
        # In a real implementation, this would query the database
        # For now, we'll return the in-memory tickets
        
        # Convert string parameters to enums
        status_enum = None
        if status:
            try:
                status_enum = TicketStatus(status)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {status}"
                )
        
        priority_enum = None
        if priority:
            try:
                priority_enum = TicketPriority(priority)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid priority: {priority}"
                )
        
        # Get all tickets (admin can see all)
        all_tickets = customer_support_service.tickets
        
        # Apply filters
        filtered_tickets = all_tickets
        if status_enum:
            filtered_tickets = [t for t in filtered_tickets if t.status == status_enum]
        if priority_enum:
            filtered_tickets = [t for t in filtered_tickets if t.priority == priority_enum]
        
        # Sort and limit
        filtered_tickets = sorted(filtered_tickets, key=lambda x: x.created_at, reverse=True)[:limit]
        
        return [
            customer_support_service._ticket_to_dict(ticket)
            for ticket in filtered_tickets
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tickets: {str(e)}"
        )

@router.get("/support/stats")
async def get_support_statistics(
    current_admin = Depends(get_current_admin_user)
):
    """Get detailed support statistics"""
    
    return customer_support_service.get_support_stats()

@router.get("/system/health")
async def get_system_health(
    current_admin = Depends(get_current_admin_user)
):
    """Get detailed system health information"""
    
    try:
        # Get monitoring stats
        monitoring_stats = monitoring_service.get_monitoring_stats()
        
        # Get scheduler status
        scheduler_status = campaign_scheduler.get_scheduler_status()
        
        # Get WebSocket connection info
        connected_billboards = billboard_ws_manager.get_connected_billboards()
        
        # Check database connectivity
        with next(get_db()) as db:
            start_time = datetime.utcnow()
            db.execute("SELECT 1")
            db_response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        health_data = {
            "database": {
                "status": "healthy" if db_response_time < 1000 else "slow",
                "response_time_ms": round(db_response_time, 2)
            },
            "monitoring": {
                "status": monitoring_stats["monitoring_status"],
                "active_tasks": monitoring_stats.get("active_monitoring_tasks", 0),
                "total_alerts": monitoring_stats["total_alerts"],
                "critical_alerts": monitoring_stats["critical_alerts"]
            },
            "scheduler": {
                "status": "running" if scheduler_status["is_running"] else "stopped",
                "active_tasks": scheduler_status["active_tasks"],
                "check_interval": scheduler_status["check_interval"]
            },
            "websockets": {
                "connected_billboards": len(connected_billboards),
                "connection_list": list(connected_billboards)
            },
            "overall_status": "healthy"  # Would be calculated based on all components
        }
        
        return health_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system health: {str(e)}"
        )

@router.post("/system/restart-monitoring")
async def restart_monitoring(
    background_tasks: BackgroundTasks,
    current_admin = Depends(get_current_admin_user)
):
    """Restart monitoring system"""
    
    try:
        # Stop monitoring
        await monitoring_service.stop_monitoring()
        
        # Start monitoring in background
        background_tasks.add_task(monitoring_service.start_monitoring)
        
        return {
            "success": True,
            "message": "Monitoring system restart initiated"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to restart monitoring: {str(e)}"
        )

@router.post("/system/restart-scheduler")
async def restart_scheduler(
    background_tasks: BackgroundTasks,
    current_admin = Depends(get_current_admin_user)
):
    """Restart campaign scheduler"""
    
    try:
        # Stop scheduler
        await campaign_scheduler.stop()
        
        # Start scheduler in background
        background_tasks.add_task(campaign_scheduler.start)
        
        return {
            "success": True,
            "message": "Campaign scheduler restart initiated"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to restart scheduler: {str(e)}"
        )

@router.get("/billboards/status")
async def get_billboards_status(
    current_admin = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get detailed billboard connection status"""
    
    try:
        # Get all billboards
        billboards = db.query(Billboard).filter(
            Billboard.status == "active"
        ).all()
        
        billboard_status = []
        for billboard in billboards:
            status = billboard_ws_manager.get_billboard_status(billboard.billboard_id)
            
            billboard_status.append({
                "billboard_id": billboard.billboard_id,
                "name": billboard.name,
                "location": f"{billboard.city}, {billboard.state}",
                "owner": billboard.owner.full_name if billboard.owner else "Unknown",
                "connected": status.get("connected", False),
                "last_seen": status.get("last_seen"),
                "last_heartbeat": status.get("last_heartbeat"),
                "current_campaign": status.get("current_campaign"),
                "uptime_hours": status.get("uptime_hours", 0)
            })
        
        # Summary stats
        total_billboards = len(billboard_status)
        connected_count = sum(1 for b in billboard_status if b["connected"])
        
        return {
            "summary": {
                "total_billboards": total_billboards,
                "connected": connected_count,
                "disconnected": total_billboards - connected_count,
                "connection_rate": round((connected_count / max(total_billboards, 1)) * 100, 2)
            },
            "billboards": billboard_status
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get billboard status: {str(e)}"
        )

@router.post("/force-checks")
async def force_system_checks(
    current_admin = Depends(get_current_admin_user)
):
    """Force immediate system health checks"""
    
    try:
        # Force activation check
        activation_result = await campaign_scheduler.force_check_activations()
        
        # Force completion check
        completion_result = await campaign_scheduler.force_check_completions()
        
        return {
            "success": True,
            "message": "System checks completed",
            "results": {
                "activation_check": activation_result,
                "completion_check": completion_result
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run system checks: {str(e)}"
        )

@router.get("/analytics/revenue")
async def get_revenue_analytics(
    days: int = 30,
    current_admin = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get revenue analytics"""
    
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Daily revenue breakdown
        daily_revenue = db.query(
            func.date(Booking.payment_confirmed_at).label("date"),
            func.sum(Booking.total_amount).label("revenue"),
            func.count(Booking.id).label("bookings")
        ).filter(
            and_(
                Booking.payment_confirmed_at >= start_date,
                Booking.payment_confirmed_at <= end_date,
                Booking.status.in_(["confirmed", "active", "completed"])
            )
        ).group_by(func.date(Booking.payment_confirmed_at)).all()
        
        # Platform fee calculation
        total_revenue = sum(day.revenue for day in daily_revenue)
        platform_revenue = total_revenue * 0.2
        owner_payouts = total_revenue * 0.8
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "summary": {
                "total_revenue": total_revenue,
                "platform_revenue": platform_revenue,
                "owner_payouts": owner_payouts,
                "total_bookings": sum(day.bookings for day in daily_revenue),
                "average_booking_value": total_revenue / max(sum(day.bookings for day in daily_revenue), 1)
            },
            "daily_breakdown": [
                {
                    "date": day.date.isoformat(),
                    "revenue": float(day.revenue),
                    "bookings": day.bookings
                }
                for day in daily_revenue
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get revenue analytics: {str(e)}"
        )
