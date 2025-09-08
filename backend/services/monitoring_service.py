"""
Monitoring and Alerting System
Real-time monitoring of platform health, campaigns, and billboards
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from dataclasses import dataclass
from enum import Enum

from database import get_db
from models import Campaign, Booking, Billboard, User, BookingStatus, CampaignStatus
from services.billboard_websocket import billboard_ws_manager

class AlertSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertType(Enum):
    SYSTEM_HEALTH = "system_health"
    BILLBOARD_OFFLINE = "billboard_offline"
    CAMPAIGN_PERFORMANCE = "campaign_performance"
    PAYMENT_FAILURE = "payment_failure"
    CAPACITY_WARNING = "capacity_warning"
    SECURITY_ALERT = "security_alert"

@dataclass
class Alert:
    id: str
    type: AlertType
    severity: AlertSeverity
    title: str
    message: str
    metadata: Dict[str, Any]
    created_at: datetime
    resolved_at: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None

class MonitoringService:
    """Service for monitoring platform health and generating alerts"""
    
    def __init__(self):
        self.is_running = False
        self.alerts: List[Alert] = []
        self.alert_id_counter = 1
        self.monitoring_tasks = []
        
        # Monitoring thresholds
        self.thresholds = {
            "billboard_offline_minutes": 5,
            "low_performance_threshold": 0.7,  # 70% of expected performance
            "high_cpu_threshold": 80,
            "high_memory_threshold": 85,
            "database_query_timeout": 30,
            "websocket_connection_timeout": 60
        }
    
    async def start_monitoring(self):
        """Start all monitoring tasks"""
        if self.is_running:
            return
        
        self.is_running = True
        
        # Start monitoring tasks
        self.monitoring_tasks = [
            asyncio.create_task(self._monitor_billboard_health()),
            asyncio.create_task(self._monitor_campaign_performance()),
            asyncio.create_task(self._monitor_system_health()),
            asyncio.create_task(self._monitor_payment_failures()),
            asyncio.create_task(self._monitor_capacity_warnings()),
            asyncio.create_task(self._cleanup_old_alerts())
        ]
        
        print("🔍 Monitoring system started")
    
    async def stop_monitoring(self):
        """Stop all monitoring tasks"""
        self.is_running = False
        
        # Cancel all tasks
        for task in self.monitoring_tasks:
            task.cancel()
        
        await asyncio.gather(*self.monitoring_tasks, return_exceptions=True)
        
        print("🔍 Monitoring system stopped")
    
    async def _monitor_billboard_health(self):
        """Monitor billboard connection status"""
        while self.is_running:
            try:
                with next(get_db()) as db:
                    # Get all active billboards
                    active_billboards = db.query(Billboard).filter(
                        Billboard.status == "active"
                    ).all()
                    
                    for billboard in active_billboards:
                        try:
                            # Check connection status
                            status = billboard_ws_manager.get_billboard_status(
                                billboard.billboard_id
                            )
                            
                            if not status.get("connected", False):
                                # Check how long it's been offline
                                last_seen = status.get("last_seen")
                                if last_seen:
                                    offline_minutes = (datetime.utcnow() - last_seen).total_seconds() / 60
                                    
                                    if offline_minutes > self.thresholds["billboard_offline_minutes"]:
                                        await self._create_alert(
                                            type=AlertType.BILLBOARD_OFFLINE,
                                            severity=AlertSeverity.HIGH,
                                            title=f"Billboard Offline: {billboard.name}",
                                            message=f"Billboard {billboard.billboard_id} has been offline for {offline_minutes:.1f} minutes",
                                            metadata={
                                                "billboard_id": billboard.billboard_id,
                                                "billboard_name": billboard.name,
                                                "offline_minutes": offline_minutes,
                                                "owner_id": billboard.owner_id
                                            }
                                        )
                            
                            # Check for active campaigns on offline billboards
                            if not status.get("connected", False):
                                active_bookings = db.query(Booking).filter(
                                    Booking.billboard_id == billboard.id,
                                    Booking.status == BookingStatus.ACTIVE
                                ).all()
                                
                                for booking in active_bookings:
                                    await self._create_alert(
                                        type=AlertType.CAMPAIGN_PERFORMANCE,
                                        severity=AlertSeverity.CRITICAL,
                                        title=f"Active Campaign on Offline Billboard",
                                        message=f"Campaign {booking.campaign.campaign_id} is running on offline billboard {billboard.name}",
                                        metadata={
                                            "campaign_id": booking.campaign.campaign_id,
                                            "booking_id": booking.booking_id,
                                            "billboard_id": billboard.billboard_id,
                                            "advertiser_id": booking.advertiser_id
                                        }
                                    )
                            
                        except Exception as e:
                            print(f"❌ Error monitoring billboard {billboard.billboard_id}: {e}")
                
            except Exception as e:
                print(f"❌ Error in billboard health monitor: {e}")
            
            await asyncio.sleep(60)  # Check every minute
    
    async def _monitor_campaign_performance(self):
        """Monitor campaign performance metrics"""
        while self.is_running:
            try:
                with next(get_db()) as db:
                    # Get active campaigns
                    active_bookings = db.query(Booking).filter(
                        Booking.status == BookingStatus.ACTIVE
                    ).all()
                    
                    for booking in active_bookings:
                        try:
                            campaign = booking.campaign
                            
                            # Calculate expected vs actual performance
                            if booking.activated_at and booking.billboard.daily_impressions:
                                running_hours = (datetime.utcnow() - booking.activated_at).total_seconds() / 3600
                                expected_impressions = (booking.billboard.daily_impressions / 24) * running_hours
                                
                                if campaign.total_impressions < expected_impressions * self.thresholds["low_performance_threshold"]:
                                    performance_ratio = campaign.total_impressions / expected_impressions if expected_impressions > 0 else 0
                                    
                                    await self._create_alert(
                                        type=AlertType.CAMPAIGN_PERFORMANCE,
                                        severity=AlertSeverity.MEDIUM,
                                        title=f"Low Campaign Performance",
                                        message=f"Campaign {campaign.campaign_id} is performing at {performance_ratio:.1%} of expected levels",
                                        metadata={
                                            "campaign_id": campaign.campaign_id,
                                            "booking_id": booking.booking_id,
                                            "expected_impressions": expected_impressions,
                                            "actual_impressions": campaign.total_impressions,
                                            "performance_ratio": performance_ratio,
                                            "advertiser_id": booking.advertiser_id
                                        }
                                    )
                            
                        except Exception as e:
                            print(f"❌ Error monitoring campaign {booking.booking_id}: {e}")
                
            except Exception as e:
                print(f"❌ Error in campaign performance monitor: {e}")
            
            await asyncio.sleep(300)  # Check every 5 minutes
    
    async def _monitor_system_health(self):
        """Monitor overall system health"""
        while self.is_running:
            try:
                with next(get_db()) as db:
                    # Check database health
                    start_time = datetime.utcnow()
                    
                    # Simple database query to check responsiveness
                    user_count = db.query(func.count(User.id)).scalar()
                    
                    query_time = (datetime.utcnow() - start_time).total_seconds()
                    
                    if query_time > self.thresholds["database_query_timeout"]:
                        await self._create_alert(
                            type=AlertType.SYSTEM_HEALTH,
                            severity=AlertSeverity.HIGH,
                            title="Database Performance Issue",
                            message=f"Database query took {query_time:.1f} seconds (threshold: {self.thresholds['database_query_timeout']}s)",
                            metadata={
                                "query_time": query_time,
                                "threshold": self.thresholds["database_query_timeout"]
                            }
                        )
                    
                    # Check WebSocket connection health
                    connected_billboards = len(billboard_ws_manager.get_connected_billboards())
                    total_billboards = db.query(func.count(Billboard.id)).filter(
                        Billboard.status == "active"
                    ).scalar()
                    
                    if total_billboards > 0:
                        connection_ratio = connected_billboards / total_billboards
                        
                        if connection_ratio < 0.8:  # Less than 80% connected
                            await self._create_alert(
                                type=AlertType.SYSTEM_HEALTH,
                                severity=AlertSeverity.MEDIUM,
                                title="Low Billboard Connectivity",
                                message=f"Only {connected_billboards}/{total_billboards} billboards are connected ({connection_ratio:.1%})",
                                metadata={
                                    "connected_billboards": connected_billboards,
                                    "total_billboards": total_billboards,
                                    "connection_ratio": connection_ratio
                                }
                            )
                
            except Exception as e:
                await self._create_alert(
                    type=AlertType.SYSTEM_HEALTH,
                    severity=AlertSeverity.CRITICAL,
                    title="System Health Check Failed",
                    message=f"Unable to perform system health check: {str(e)}",
                    metadata={"error": str(e)}
                )
                print(f"❌ Error in system health monitor: {e}")
            
            await asyncio.sleep(120)  # Check every 2 minutes
    
    async def _monitor_payment_failures(self):
        """Monitor payment failures and issues"""
        while self.is_running:
            try:
                with next(get_db()) as db:
                    # Check for bookings stuck in pending payment
                    cutoff_time = datetime.utcnow() - timedelta(hours=2)
                    
                    stuck_payments = db.query(Booking).filter(
                        Booking.status == BookingStatus.PENDING_PAYMENT,
                        Booking.created_at < cutoff_time
                    ).all()
                    
                    for booking in stuck_payments:
                        await self._create_alert(
                            type=AlertType.PAYMENT_FAILURE,
                            severity=AlertSeverity.HIGH,
                            title="Payment Timeout",
                            message=f"Booking {booking.booking_id} has been pending payment for over 2 hours",
                            metadata={
                                "booking_id": booking.booking_id,
                                "campaign_id": booking.campaign.campaign_id,
                                "advertiser_id": booking.advertiser_id,
                                "amount": booking.total_amount,
                                "hours_pending": (datetime.utcnow() - booking.created_at).total_seconds() / 3600
                            }
                        )
                
            except Exception as e:
                print(f"❌ Error in payment failure monitor: {e}")
            
            await asyncio.sleep(600)  # Check every 10 minutes
    
    async def _monitor_capacity_warnings(self):
        """Monitor system capacity and resource usage"""
        while self.is_running:
            try:
                with next(get_db()) as db:
                    # Check billboard booking capacity
                    now = datetime.utcnow()
                    next_week = now + timedelta(days=7)
                    
                    # Count available vs booked time slots
                    total_billboards = db.query(func.count(Billboard.id)).filter(
                        Billboard.status == "active"
                    ).scalar()
                    
                    booked_slots = db.query(func.count(Booking.id)).filter(
                        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.ACTIVE]),
                        Booking.start_date <= next_week,
                        Booking.end_date >= now
                    ).scalar()
                    
                    # Simplified capacity calculation
                    capacity_ratio = booked_slots / (total_billboards * 7) if total_billboards > 0 else 0
                    
                    if capacity_ratio > 0.8:  # Over 80% capacity
                        await self._create_alert(
                            type=AlertType.CAPACITY_WARNING,
                            severity=AlertSeverity.MEDIUM,
                            title="High Booking Capacity",
                            message=f"Billboard booking capacity at {capacity_ratio:.1%} for next 7 days",
                            metadata={
                                "capacity_ratio": capacity_ratio,
                                "total_billboards": total_billboards,
                                "booked_slots": booked_slots
                            }
                        )
                
            except Exception as e:
                print(f"❌ Error in capacity monitor: {e}")
            
            await asyncio.sleep(3600)  # Check every hour
    
    async def _cleanup_old_alerts(self):
        """Clean up old resolved alerts"""
        while self.is_running:
            try:
                cutoff_time = datetime.utcnow() - timedelta(days=7)
                
                # Remove resolved alerts older than 7 days
                self.alerts = [
                    alert for alert in self.alerts
                    if not (alert.resolved_at and alert.resolved_at < cutoff_time)
                ]
                
            except Exception as e:
                print(f"❌ Error in alert cleanup: {e}")
            
            await asyncio.sleep(3600)  # Clean up every hour
    
    async def _create_alert(
        self,
        type: AlertType,
        severity: AlertSeverity,
        title: str,
        message: str,
        metadata: Dict[str, Any]
    ):
        """Create a new alert"""
        
        # Check if similar alert already exists and is unresolved
        similar_alerts = [
            alert for alert in self.alerts
            if (alert.type == type and 
                alert.severity == severity and
                not alert.resolved_at and
                alert.metadata.get("billboard_id") == metadata.get("billboard_id") and
                alert.metadata.get("campaign_id") == metadata.get("campaign_id"))
        ]
        
        if similar_alerts:
            # Update existing alert instead of creating duplicate
            existing_alert = similar_alerts[0]
            existing_alert.message = message
            existing_alert.metadata.update(metadata)
            return existing_alert
        
        # Create new alert
        alert = Alert(
            id=f"ALERT_{self.alert_id_counter:06d}",
            type=type,
            severity=severity,
            title=title,
            message=message,
            metadata=metadata,
            created_at=datetime.utcnow()
        )
        
        self.alerts.append(alert)
        self.alert_id_counter += 1
        
        print(f"🚨 Alert created: [{severity.value.upper()}] {title}")
        
        # In production, send notifications based on severity
        await self._send_alert_notification(alert)
        
        return alert
    
    async def _send_alert_notification(self, alert: Alert):
        """Send alert notification to relevant parties"""
        try:
            # Determine recipients based on alert type and metadata
            recipients = []
            
            if alert.type == AlertType.BILLBOARD_OFFLINE:
                # Notify billboard owner and affected advertisers
                recipients.append(f"billboard_owner_{alert.metadata.get('owner_id')}")
                if alert.metadata.get('advertiser_id'):
                    recipients.append(f"advertiser_{alert.metadata.get('advertiser_id')}")
            
            elif alert.type == AlertType.CAMPAIGN_PERFORMANCE:
                # Notify advertiser
                recipients.append(f"advertiser_{alert.metadata.get('advertiser_id')}")
            
            elif alert.type in [AlertType.SYSTEM_HEALTH, AlertType.CAPACITY_WARNING]:
                # Notify system administrators
                recipients.append("system_admin")
            
            elif alert.type == AlertType.PAYMENT_FAILURE:
                # Notify advertiser and billing team
                recipients.append(f"advertiser_{alert.metadata.get('advertiser_id')}")
                recipients.append("billing_team")
            
            notification_data = {
                "alert_id": alert.id,
                "type": alert.type.value,
                "severity": alert.severity.value,
                "title": alert.title,
                "message": alert.message,
                "recipients": recipients,
                "created_at": alert.created_at.isoformat()
            }
            
            print(f"📧 Alert notification sent: {notification_data}")
            
        except Exception as e:
            print(f"❌ Failed to send alert notification: {e}")
    
    def get_alerts(
        self,
        severity: Optional[AlertSeverity] = None,
        type: Optional[AlertType] = None,
        resolved: Optional[bool] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get alerts with optional filtering"""
        
        filtered_alerts = self.alerts
        
        # Apply filters
        if severity:
            filtered_alerts = [a for a in filtered_alerts if a.severity == severity]
        
        if type:
            filtered_alerts = [a for a in filtered_alerts if a.type == type]
        
        if resolved is not None:
            if resolved:
                filtered_alerts = [a for a in filtered_alerts if a.resolved_at is not None]
            else:
                filtered_alerts = [a for a in filtered_alerts if a.resolved_at is None]
        
        # Sort by creation time (newest first) and limit
        filtered_alerts = sorted(filtered_alerts, key=lambda x: x.created_at, reverse=True)[:limit]
        
        # Convert to dict format
        return [
            {
                "id": alert.id,
                "type": alert.type.value,
                "severity": alert.severity.value,
                "title": alert.title,
                "message": alert.message,
                "metadata": alert.metadata,
                "created_at": alert.created_at.isoformat(),
                "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
                "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
                "acknowledged_by": alert.acknowledged_by
            }
            for alert in filtered_alerts
        ]
    
    def acknowledge_alert(self, alert_id: str, acknowledged_by: str) -> Dict[str, Any]:
        """Acknowledge an alert"""
        
        alert = next((a for a in self.alerts if a.id == alert_id), None)
        
        if not alert:
            return {"success": False, "message": "Alert not found"}
        
        if alert.acknowledged_at:
            return {"success": False, "message": "Alert already acknowledged"}
        
        alert.acknowledged_at = datetime.utcnow()
        alert.acknowledged_by = acknowledged_by
        
        return {
            "success": True,
            "message": "Alert acknowledged",
            "acknowledged_at": alert.acknowledged_at.isoformat()
        }
    
    def resolve_alert(self, alert_id: str, resolved_by: str) -> Dict[str, Any]:
        """Resolve an alert"""
        
        alert = next((a for a in self.alerts if a.id == alert_id), None)
        
        if not alert:
            return {"success": False, "message": "Alert not found"}
        
        if alert.resolved_at:
            return {"success": False, "message": "Alert already resolved"}
        
        alert.resolved_at = datetime.utcnow()
        
        return {
            "success": True,
            "message": "Alert resolved",
            "resolved_at": alert.resolved_at.isoformat()
        }
    
    def get_monitoring_stats(self) -> Dict[str, Any]:
        """Get monitoring system statistics"""
        
        now = datetime.utcnow()
        last_24h = now - timedelta(days=1)
        
        recent_alerts = [a for a in self.alerts if a.created_at >= last_24h]
        
        stats = {
            "monitoring_status": "running" if self.is_running else "stopped",
            "total_alerts": len(self.alerts),
            "alerts_last_24h": len(recent_alerts),
            "unresolved_alerts": len([a for a in self.alerts if not a.resolved_at]),
            "critical_alerts": len([a for a in self.alerts if a.severity == AlertSeverity.CRITICAL and not a.resolved_at]),
            "alert_breakdown": {
                severity.value: len([a for a in self.alerts if a.severity == severity and not a.resolved_at])
                for severity in AlertSeverity
            },
            "active_monitoring_tasks": len([task for task in self.monitoring_tasks if not task.done()]),
            "thresholds": self.thresholds
        }
        
        return stats

# Create monitoring service instance
monitoring_service = MonitoringService()
