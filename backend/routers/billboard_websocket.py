"""
Billboard WebSocket Router
WebSocket endpoints for billboard real-time communication
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import logging

from database import get_db
from services.billboard_websocket import billboard_ws_manager

router = APIRouter(prefix="/billboard", tags=["Billboard WebSocket"])
logger = logging.getLogger(__name__)

@router.websocket("/{billboard_id}/connect")
async def billboard_websocket_endpoint(
    websocket: WebSocket,
    billboard_id: str,
    api_key: str = Query(..., description="Billboard API key for authentication"),
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for billboard real-time communication"""
    
    connection = None
    
    try:
        # Connect billboard
        connection = await billboard_ws_manager.connect_billboard(
            websocket, billboard_id, api_key, db
        )
        
        if not connection:
            return  # Connection was rejected
        
        # Listen for messages
        while True:
            try:
                message = await websocket.receive_text()
                await billboard_ws_manager.handle_message(billboard_id, message, db)
                
            except WebSocketDisconnect:
                logger.info(f"Billboard {billboard_id} disconnected normally")
                break
                
    except Exception as e:
        logger.error(f"WebSocket error for billboard {billboard_id}: {e}")
        
    finally:
        # Clean up connection
        if connection:
            await billboard_ws_manager.disconnect_billboard(billboard_id, db)

@router.get("/{billboard_id}/status")
async def get_billboard_connection_status(
    billboard_id: str,
    db: Session = Depends(get_db)
):
    """Get real-time connection status of a billboard"""
    
    status = await billboard_ws_manager.get_billboard_status(billboard_id)
    return status

@router.get("/connected")
async def get_connected_billboards():
    """Get list of currently connected billboards"""
    
    connected = await billboard_ws_manager.get_connected_billboards()
    return {
        "connected_billboards": connected,
        "total_connected": len(connected)
    }

@router.post("/{billboard_id}/deploy-campaign")
async def deploy_campaign_to_billboard(
    billboard_id: str,
    campaign_data: dict,
    db: Session = Depends(get_db)
):
    """Deploy campaign to specific billboard"""
    
    success = await billboard_ws_manager.deploy_campaign_to_billboard(
        billboard_id, campaign_data
    )
    
    return {
        "success": success,
        "message": "Campaign deployed" if success else "Failed to deploy campaign"
    }

@router.post("/{billboard_id}/stop-campaign")
async def stop_campaign_on_billboard(
    billboard_id: str,
    campaign_id: str,
    db: Session = Depends(get_db)
):
    """Stop campaign on specific billboard"""
    
    success = await billboard_ws_manager.stop_campaign_on_billboard(
        billboard_id, campaign_id
    )
    
    return {
        "success": success,
        "message": "Campaign stopped" if success else "Failed to stop campaign"
    }
