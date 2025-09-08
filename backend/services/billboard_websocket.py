"""
Billboard WebSocket Manager
Handles real-time communication with connected billboards
"""

from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
import json
import asyncio
import logging
from datetime import datetime
import uuid

from database import get_db
from models import Billboard, Campaign, BillboardStatus
from auth_enhanced import get_current_user

logger = logging.getLogger(__name__)

class BillboardConnection:
    def __init__(self, websocket: WebSocket, billboard_id: str, billboard: Billboard):
        self.websocket = websocket
        self.billboard_id = billboard_id
        self.billboard = billboard
        self.connected_at = datetime.utcnow()
        self.last_heartbeat = datetime.utcnow()
        
    async def send_message(self, message: Dict[str, Any]):
        """Send message to billboard"""
        try:
            await self.websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send message to {self.billboard_id}: {e}")
            raise

class BillboardWebSocketManager:
    def __init__(self):
        # Store active connections: billboard_id -> BillboardConnection
        self.active_connections: Dict[str, BillboardConnection] = {}
        # Store pending campaigns: billboard_id -> [campaigns]
        self.pending_campaigns: Dict[str, List[Dict]] = {}
        
    async def connect_billboard(
        self, 
        websocket: WebSocket, 
        billboard_id: str, 
        api_key: str,
        db: Session
    ):
        """Connect a billboard to the WebSocket system"""
        
        # Authenticate billboard
        billboard = db.query(Billboard).filter(
            Billboard.billboard_id == billboard_id,
            Billboard.api_key == api_key
        ).first()
        
        if not billboard:
            await websocket.close(code=4001, reason="Invalid credentials")
            return None
        
        # Accept WebSocket connection
        await websocket.accept()
        
        # Create connection object
        connection = BillboardConnection(websocket, billboard_id, billboard)
        self.active_connections[billboard_id] = connection
        
        # Update billboard status
        billboard.is_online = True
        billboard.last_heartbeat = datetime.utcnow()
        db.commit()
        
        logger.info(f"Billboard {billboard_id} connected via WebSocket")
        
        # Send pending campaigns if any
        await self.send_pending_campaigns(billboard_id)
        
        return connection
    
    async def disconnect_billboard(self, billboard_id: str, db: Session):
        """Disconnect a billboard"""
        
        if billboard_id in self.active_connections:
            del self.active_connections[billboard_id]
            
            # Update billboard status
            billboard = db.query(Billboard).filter(
                Billboard.billboard_id == billboard_id
            ).first()
            
            if billboard:
                billboard.is_online = False
                db.commit()
            
            logger.info(f"Billboard {billboard_id} disconnected")
    
    async def handle_message(
        self, 
        billboard_id: str, 
        message: str, 
        db: Session
    ):
        """Handle incoming message from billboard"""
        
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            if message_type == "heartbeat":
                await self.handle_heartbeat(billboard_id, data, db)
            elif message_type == "campaign_deployed":
                await self.handle_campaign_deployed(billboard_id, data, db)
            elif message_type == "campaign_deployment_failed":
                await self.handle_campaign_failed(billboard_id, data, db)
            elif message_type == "status_update":
                await self.handle_status_update(billboard_id, data, db)
            else:
                logger.warning(f"Unknown message type from {billboard_id}: {message_type}")
                
        except Exception as e:
            logger.error(f"Error handling message from {billboard_id}: {e}")
    
    async def handle_heartbeat(self, billboard_id: str, data: Dict, db: Session):
        """Handle billboard heartbeat"""
        
        connection = self.active_connections.get(billboard_id)
        if connection:
            connection.last_heartbeat = datetime.utcnow()
            
            # Update billboard in database
            billboard = db.query(Billboard).filter(
                Billboard.billboard_id == billboard_id
            ).first()
            
            if billboard:
                billboard.last_heartbeat = datetime.utcnow()
                billboard.is_online = True
                
                # Update system status if provided
                system_status = data.get("system_status", {})
                if system_status:
                    # Store system metrics (you might want to create a separate table)
                    logger.debug(f"System status for {billboard_id}: {system_status}")
                
                db.commit()
    
    async def handle_campaign_deployed(self, billboard_id: str, data: Dict, db: Session):
        """Handle successful campaign deployment"""
        
        campaign_id = data.get("campaign_id")
        logger.info(f"Campaign {campaign_id} successfully deployed to {billboard_id}")
        
        # Update campaign status
        campaign = db.query(Campaign).filter(
            Campaign.campaign_id == campaign_id
        ).first()
        
        if campaign:
            campaign.status = "active"
            campaign.deployed_at = datetime.utcnow()
            db.commit()
            
            # Notify relevant parties (advertisers, admins)
            await self.notify_campaign_status(campaign_id, "deployed", db)
    
    async def handle_campaign_failed(self, billboard_id: str, data: Dict, db: Session):
        """Handle failed campaign deployment"""
        
        campaign_id = data.get("campaign_id")
        error_message = data.get("message", "Unknown error")
        
        logger.error(f"Campaign {campaign_id} deployment failed on {billboard_id}: {error_message}")
        
        # Update campaign status
        campaign = db.query(Campaign).filter(
            Campaign.campaign_id == campaign_id
        ).first()
        
        if campaign:
            campaign.status = "failed"
            campaign.approval_notes = f"Deployment failed: {error_message}"
            db.commit()
            
            # Notify relevant parties
            await self.notify_campaign_status(campaign_id, "failed", db)
    
    async def deploy_campaign_to_billboard(
        self, 
        billboard_id: str, 
        campaign_data: Dict[str, Any]
    ) -> bool:
        """Deploy campaign to specific billboard"""
        
        connection = self.active_connections.get(billboard_id)
        
        if connection:
            try:
                message = {
                    "type": "new_campaign",
                    "timestamp": datetime.utcnow().isoformat(),
                    **campaign_data
                }
                
                await connection.send_message(message)
                logger.info(f"Campaign {campaign_data.get('campaign_id')} sent to {billboard_id}")
                return True
                
            except Exception as e:
                logger.error(f"Failed to deploy campaign to {billboard_id}: {e}")
                return False
        else:
            # Billboard not connected, store for later
            if billboard_id not in self.pending_campaigns:
                self.pending_campaigns[billboard_id] = []
            
            self.pending_campaigns[billboard_id].append(campaign_data)
            logger.info(f"Campaign queued for offline billboard {billboard_id}")
            return True
    
    async def send_pending_campaigns(self, billboard_id: str):
        """Send pending campaigns to newly connected billboard"""
        
        pending = self.pending_campaigns.get(billboard_id, [])
        
        for campaign_data in pending:
            await self.deploy_campaign_to_billboard(billboard_id, campaign_data)
        
        # Clear pending campaigns
        if billboard_id in self.pending_campaigns:
            del self.pending_campaigns[billboard_id]
    
    async def stop_campaign_on_billboard(
        self, 
        billboard_id: str, 
        campaign_id: str
    ) -> bool:
        """Stop campaign on specific billboard"""
        
        connection = self.active_connections.get(billboard_id)
        
        if connection:
            try:
                message = {
                    "type": "stop_campaign",
                    "campaign_id": campaign_id,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                await connection.send_message(message)
                return True
                
            except Exception as e:
                logger.error(f"Failed to stop campaign on {billboard_id}: {e}")
                return False
        
        return False
    
    async def broadcast_to_billboards(
        self, 
        billboard_ids: List[str], 
        message: Dict[str, Any]
    ):
        """Broadcast message to multiple billboards"""
        
        tasks = []
        for billboard_id in billboard_ids:
            connection = self.active_connections.get(billboard_id)
            if connection:
                tasks.append(connection.send_message(message))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def get_connected_billboards(self) -> List[str]:
        """Get list of currently connected billboard IDs"""
        return list(self.active_connections.keys())
    
    async def get_billboard_status(self, billboard_id: str) -> Optional[Dict[str, Any]]:
        """Get status of specific billboard"""
        
        connection = self.active_connections.get(billboard_id)
        
        if connection:
            return {
                "billboard_id": billboard_id,
                "status": "online",
                "connected_at": connection.connected_at.isoformat(),
                "last_heartbeat": connection.last_heartbeat.isoformat(),
                "connection_duration": (datetime.utcnow() - connection.connected_at).total_seconds()
            }
        
        return {
            "billboard_id": billboard_id,
            "status": "offline"
        }
    
    async def notify_campaign_status(self, campaign_id: str, status: str, db: Session):
        """Notify relevant parties about campaign status changes"""
        
        # This would typically send notifications to:
        # - Campaign advertiser
        # - Admin dashboard
        # - Webhook endpoints
        
        logger.info(f"Campaign {campaign_id} status changed to: {status}")
        
        # TODO: Implement actual notifications
        # - Email notifications
        # - Push notifications
        # - Webhook calls
        # - Admin dashboard updates

# Global WebSocket manager instance
billboard_ws_manager = BillboardWebSocketManager()

# Heartbeat monitor task
async def heartbeat_monitor():
    """Monitor billboard heartbeats and mark offline ones"""
    
    while True:
        try:
            current_time = datetime.utcnow()
            offline_billboards = []
            
            for billboard_id, connection in billboard_ws_manager.active_connections.items():
                # If no heartbeat for 2 minutes, consider offline
                if (current_time - connection.last_heartbeat).total_seconds() > 120:
                    offline_billboards.append(billboard_id)
            
            # Mark offline billboards
            for billboard_id in offline_billboards:
                logger.warning(f"Billboard {billboard_id} heartbeat timeout - marking offline")
                # Note: We'd need database session here to update status
                
        except Exception as e:
            logger.error(f"Heartbeat monitor error: {e}")
        
        await asyncio.sleep(60)  # Check every minute

# Start heartbeat monitor when module loads
# asyncio.create_task(heartbeat_monitor())
