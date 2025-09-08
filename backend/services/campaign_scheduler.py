"""
Campaign Scheduler Service
Automated scheduling and lifecycle management for campaigns
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from database import get_db
from models import Campaign, Booking, BookingStatus, CampaignStatus
from services.booking_service import booking_service
from services.billboard_websocket import billboard_ws_manager
from services.analytics_service import analytics_service

class CampaignScheduler:
    """Service for automated campaign scheduling and management"""
    
    def __init__(self):
        self.is_running = False
        self.check_interval = 60  # Check every minute
        self.tasks = []
        
    async def start(self):
        """Start the scheduler"""
        if self.is_running:
            return
        
        self.is_running = True
        
        # Start background tasks
        self.tasks = [
            asyncio.create_task(self._activation_monitor()),
            asyncio.create_task(self._completion_monitor()),
            asyncio.create_task(self._health_monitor()),
            asyncio.create_task(self._analytics_collector())
        ]
        
        print("Campaign Scheduler started")
    
    async def stop(self):
        """Stop the scheduler"""
        self.is_running = False
        
        # Cancel all tasks
        for task in self.tasks:
            task.cancel()
        
        # Wait for tasks to complete
        await asyncio.gather(*self.tasks, return_exceptions=True)
        
        print("Campaign Scheduler stopped")
    
    async def _activation_monitor(self):
        """Monitor and activate campaigns at their start time"""
        while self.is_running:
            try:
                with next(get_db()) as db:
                    # Find bookings that should be activated
                    now = datetime.utcnow()
                    
                    bookings_to_activate = db.query(Booking).filter(
                        Booking.status == BookingStatus.CONFIRMED,
                        Booking.start_date <= now + timedelta(minutes=1),  # Activate within 1 minute
                        Booking.start_date > now - timedelta(minutes=5)    # Don't activate if more than 5 minutes late
                    ).all()
                    
                    for booking in bookings_to_activate:
                        try:
                            result = booking_service.activate_booking(
                                booking.booking_id, db
                            )
                            
                            if result["success"]:
                                print(f"✅ Activated booking: {booking.booking_id}")
                                
                                # Send notification to advertiser
                                await self._send_activation_notification(booking)
                            else:
                                print(f"❌ Failed to activate booking: {booking.booking_id}")
                                
                        except Exception as e:
                            print(f"❌ Error activating booking {booking.booking_id}: {e}")
                
            except Exception as e:
                print(f"❌ Error in activation monitor: {e}")
            
            await asyncio.sleep(self.check_interval)
    
    async def _completion_monitor(self):
        """Monitor and complete campaigns at their end time"""
        while self.is_running:
            try:
                with next(get_db()) as db:
                    # Find bookings that should be completed
                    now = datetime.utcnow()
                    
                    bookings_to_complete = db.query(Booking).filter(
                        Booking.status == BookingStatus.ACTIVE,
                        Booking.end_date <= now
                    ).all()
                    
                    for booking in bookings_to_complete:
                        try:
                            result = booking_service.complete_booking(
                                booking.booking_id, db
                            )
                            
                            if result["success"]:
                                print(f"✅ Completed booking: {booking.booking_id}")
                                
                                # Send completion notification
                                await self._send_completion_notification(booking)
                                
                                # Generate final analytics report
                                await self._generate_campaign_report(booking)
                            else:
                                print(f"❌ Failed to complete booking: {booking.booking_id}")
                                
                        except Exception as e:
                            print(f"❌ Error completing booking {booking.booking_id}: {e}")
                
            except Exception as e:
                print(f"❌ Error in completion monitor: {e}")
            
            await asyncio.sleep(self.check_interval)
    
    async def _health_monitor(self):
        """Monitor campaign and billboard health"""
        while self.is_running:
            try:
                with next(get_db()) as db:
                    # Find active campaigns
                    active_bookings = db.query(Booking).filter(
                        Booking.status == BookingStatus.ACTIVE
                    ).all()
                    
                    for booking in active_bookings:
                        try:
                            # Check billboard connection status
                            billboard_status = billboard_ws_manager.get_billboard_status(
                                booking.billboard.billboard_id
                            )
                            
                            if not billboard_status.get("connected", False):
                                print(f"⚠️ Billboard offline: {booking.billboard.billboard_id} for campaign {booking.campaign.campaign_id}")
                                
                                # Send alert to billboard owner and advertiser
                                await self._send_offline_alert(booking)
                            
                            # Check campaign performance
                            await self._check_campaign_performance(booking)
                            
                        except Exception as e:
                            print(f"❌ Error checking health for booking {booking.booking_id}: {e}")
                
            except Exception as e:
                print(f"❌ Error in health monitor: {e}")
            
            await asyncio.sleep(self.check_interval * 5)  # Check every 5 minutes
    
    async def _analytics_collector(self):
        """Collect analytics data for active campaigns"""
        while self.is_running:
            try:
                with next(get_db()) as db:
                    # Find active campaigns
                    active_bookings = db.query(Booking).filter(
                        Booking.status == BookingStatus.ACTIVE
                    ).all()
                    
                    for booking in active_bookings:
                        try:
                            # Collect impressions data
                            billboard_id = booking.billboard.billboard_id
                            campaign_id = booking.campaign.campaign_id
                            
                            # Get current impressions from billboard
                            billboard_data = billboard_ws_manager.get_billboard_analytics(
                                billboard_id
                            )
                            
                            if billboard_data.get("success"):
                                # Record impressions
                                analytics_service.record_impression(
                                    campaign_id=campaign_id,
                                    billboard_id=billboard_id,
                                    impressions=billboard_data.get("current_impressions", 0),
                                    timestamp=datetime.utcnow()
                                )
                                
                                # Update campaign total
                                campaign = booking.campaign
                                campaign.total_impressions += billboard_data.get("hourly_impressions", 0)
                                db.commit()
                            
                        except Exception as e:
                            print(f"❌ Error collecting analytics for booking {booking.booking_id}: {e}")
                
            except Exception as e:
                print(f"❌ Error in analytics collector: {e}")
            
            await asyncio.sleep(self.check_interval * 10)  # Collect every 10 minutes
    
    async def _send_activation_notification(self, booking: Booking):
        """Send campaign activation notification"""
        try:
            # In production, this would send email/SMS/push notifications
            notification_data = {
                "type": "campaign_activated",
                "booking_id": booking.booking_id,
                "campaign_id": booking.campaign.campaign_id,
                "billboard_name": booking.billboard.name,
                "message": f"Your campaign '{booking.campaign.title}' is now live on {booking.billboard.name}"
            }
            
            print(f"📧 Notification sent: {notification_data}")
            
        except Exception as e:
            print(f"❌ Failed to send activation notification: {e}")
    
    async def _send_completion_notification(self, booking: Booking):
        """Send campaign completion notification"""
        try:
            notification_data = {
                "type": "campaign_completed",
                "booking_id": booking.booking_id,
                "campaign_id": booking.campaign.campaign_id,
                "total_impressions": booking.campaign.total_impressions,
                "message": f"Your campaign '{booking.campaign.title}' has completed successfully"
            }
            
            print(f"📧 Completion notification sent: {notification_data}")
            
        except Exception as e:
            print(f"❌ Failed to send completion notification: {e}")
    
    async def _send_offline_alert(self, booking: Booking):
        """Send billboard offline alert"""
        try:
            alert_data = {
                "type": "billboard_offline",
                "booking_id": booking.booking_id,
                "billboard_id": booking.billboard.billboard_id,
                "billboard_name": booking.billboard.name,
                "message": f"Billboard '{booking.billboard.name}' is currently offline during your active campaign"
            }
            
            print(f"🚨 Offline alert sent: {alert_data}")
            
        except Exception as e:
            print(f"❌ Failed to send offline alert: {e}")
    
    async def _check_campaign_performance(self, booking: Booking):
        """Check campaign performance metrics"""
        try:
            # Calculate expected vs actual impressions
            campaign = booking.campaign
            now = datetime.utcnow()
            
            # Calculate how long campaign has been running
            running_hours = (now - booking.activated_at).total_seconds() / 3600 if booking.activated_at else 0
            
            # Calculate expected impressions
            if booking.billboard.daily_impressions:
                expected_impressions = (booking.billboard.daily_impressions / 24) * running_hours
                
                # Check if performance is significantly below expected
                if campaign.total_impressions < expected_impressions * 0.7:  # 30% below expected
                    print(f"⚠️ Low performance detected for campaign {campaign.campaign_id}")
                    print(f"Expected: {expected_impressions:.0f}, Actual: {campaign.total_impressions}")
                    
                    # Send performance alert
                    await self._send_performance_alert(booking, expected_impressions)
            
        except Exception as e:
            print(f"❌ Error checking campaign performance: {e}")
    
    async def _send_performance_alert(self, booking: Booking, expected_impressions: float):
        """Send campaign performance alert"""
        try:
            alert_data = {
                "type": "low_performance",
                "booking_id": booking.booking_id,
                "campaign_id": booking.campaign.campaign_id,
                "expected_impressions": expected_impressions,
                "actual_impressions": booking.campaign.total_impressions,
                "message": f"Campaign performance is below expected levels"
            }
            
            print(f"📊 Performance alert sent: {alert_data}")
            
        except Exception as e:
            print(f"❌ Failed to send performance alert: {e}")
    
    async def _generate_campaign_report(self, booking: Booking):
        """Generate final campaign performance report"""
        try:
            campaign = booking.campaign
            
            # Calculate final metrics
            total_duration = (booking.end_date - booking.start_date).total_seconds() / 3600  # hours
            average_hourly_impressions = campaign.total_impressions / total_duration if total_duration > 0 else 0
            
            # Calculate ROI metrics
            cost_per_impression = campaign.total_amount / campaign.total_impressions if campaign.total_impressions > 0 else 0
            
            report = {
                "campaign_id": campaign.campaign_id,
                "campaign_title": campaign.title,
                "billboard_name": booking.billboard.name,
                "duration_hours": total_duration,
                "total_impressions": campaign.total_impressions,
                "average_hourly_impressions": average_hourly_impressions,
                "total_cost": campaign.total_amount,
                "cost_per_impression": cost_per_impression,
                "estimated_reach": campaign.total_impressions * 0.8,  # Assuming 80% unique views
                "performance_score": min(100, (campaign.total_impressions / campaign.estimated_impressions * 100)) if campaign.estimated_impressions else 0
            }
            
            print(f"📊 Campaign report generated: {report}")
            
            # In production, save report to database and send to advertiser
            
        except Exception as e:
            print(f"❌ Error generating campaign report: {e}")

    def get_scheduler_status(self) -> Dict[str, Any]:
        """Get current scheduler status"""
        return {
            "is_running": self.is_running,
            "check_interval": self.check_interval,
            "active_tasks": len([task for task in self.tasks if not task.done()]),
            "uptime": "Not implemented",  # Would track actual uptime in production
            "last_check": datetime.utcnow().isoformat()
        }
    
    async def force_check_activations(self) -> Dict[str, Any]:
        """Manually trigger activation check"""
        try:
            with next(get_db()) as db:
                now = datetime.utcnow()
                
                bookings_ready = db.query(Booking).filter(
                    Booking.status == BookingStatus.CONFIRMED,
                    Booking.start_date <= now
                ).count()
                
                return {
                    "success": True,
                    "bookings_ready_for_activation": bookings_ready,
                    "check_time": now.isoformat()
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def force_check_completions(self) -> Dict[str, Any]:
        """Manually trigger completion check"""
        try:
            with next(get_db()) as db:
                now = datetime.utcnow()
                
                bookings_ready = db.query(Booking).filter(
                    Booking.status == BookingStatus.ACTIVE,
                    Booking.end_date <= now
                ).count()
                
                return {
                    "success": True,
                    "bookings_ready_for_completion": bookings_ready,
                    "check_time": now.isoformat()
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

# Create scheduler instance
campaign_scheduler = CampaignScheduler()
