"""
Billboard Agent - Core Client Software
This runs on billboard computers to connect them to AdFlow platform
"""

import asyncio
import websockets
import aiohttp
import json
import os
import hashlib
import platform
import psutil
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/adflow/agent.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AdFlowAgent:
    def __init__(self, billboard_id: str, api_key: str, config: Dict[str, Any] = None):
        self.billboard_id = billboard_id
        self.api_key = api_key
        self.config = config or {}
        
        # Connection settings
        self.api_base_url = self.config.get("api_url", "https://api.adflow.app")
        self.websocket_url = f"wss://api.adflow.app/billboard/{billboard_id}/connect"
        
        # State
        self.websocket = None
        self.is_connected = False
        self.current_campaign = None
        self.agent_version = "1.0.0"
        
        # Paths
        self.content_dir = Path(self.config.get("content_dir", "/var/adflow/content"))
        self.config_dir = Path(self.config.get("config_dir", "/var/adflow/config"))
        
        # Create directories
        self.content_dir.mkdir(parents=True, exist_ok=True)
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"AdFlow Agent initialized for billboard {billboard_id}")
    
    async def start(self):
        """Start the billboard agent"""
        logger.info("Starting AdFlow Billboard Agent...")
        
        try:
            # Initial registration
            await self.register_billboard()
            
            # Start WebSocket connection
            await self.connect_websocket()
            
        except Exception as e:
            logger.error(f"Failed to start agent: {e}")
            await asyncio.sleep(30)  # Wait before retry
            await self.start()  # Retry
    
    async def register_billboard(self):
        """Register billboard with AdFlow platform"""
        logger.info("Registering with AdFlow platform...")
        
        registration_data = {
            "billboard_id": self.billboard_id,
            "agent_version": self.agent_version,
            "system_info": await self.get_system_info(),
            "capabilities": self.get_capabilities(),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/billboard/register",
                    json=registration_data,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        logger.info("✅ Successfully registered with AdFlow")
                        return result
                    else:
                        error_text = await response.text()
                        raise Exception(f"Registration failed: {response.status} - {error_text}")
                        
        except Exception as e:
            logger.error(f"Registration error: {e}")
            raise
    
    async def connect_websocket(self):
        """Establish WebSocket connection for real-time communication"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Billboard-ID": self.billboard_id
        }
        
        while True:
            try:
                logger.info("Connecting to AdFlow WebSocket...")
                
                async with websockets.connect(
                    self.websocket_url,
                    extra_headers=headers,
                    ping_interval=30,
                    ping_timeout=10
                ) as websocket:
                    
                    self.websocket = websocket
                    self.is_connected = True
                    logger.info("✅ WebSocket connected")
                    
                    # Start heartbeat task
                    heartbeat_task = asyncio.create_task(self.send_heartbeat())
                    
                    # Listen for messages
                    try:
                        async for message in websocket:
                            await self.handle_message(message)
                    except websockets.exceptions.ConnectionClosed:
                        logger.warning("WebSocket connection closed")
                    finally:
                        heartbeat_task.cancel()
                        self.is_connected = False
                        
            except Exception as e:
                logger.error(f"WebSocket connection error: {e}")
                self.is_connected = False
                await asyncio.sleep(30)  # Wait before reconnecting
    
    async def send_heartbeat(self):
        """Send regular heartbeat to AdFlow platform"""
        
        while self.is_connected:
            try:
                heartbeat_data = {
                    "type": "heartbeat",
                    "billboard_id": self.billboard_id,
                    "timestamp": datetime.utcnow().isoformat(),
                    "status": "online",
                    "current_campaign": self.current_campaign,
                    "system_status": await self.get_system_status()
                }
                
                if self.websocket:
                    await self.websocket.send(json.dumps(heartbeat_data))
                    logger.debug("Heartbeat sent")
                    
            except Exception as e:
                logger.error(f"Heartbeat error: {e}")
                break
            
            await asyncio.sleep(30)  # Send every 30 seconds
    
    async def handle_message(self, message: str):
        """Handle incoming WebSocket messages"""
        
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            logger.info(f"Received message: {message_type}")
            
            if message_type == "new_campaign":
                await self.handle_new_campaign(data)
            elif message_type == "stop_campaign":
                await self.handle_stop_campaign(data)
            elif message_type == "update_schedule":
                await self.handle_schedule_update(data)
            elif message_type == "system_command":
                await self.handle_system_command(data)
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except Exception as e:
            logger.error(f"Error handling message: {e}")
    
    async def handle_new_campaign(self, data: Dict[str, Any]):
        """Handle new campaign deployment"""
        
        campaign_id = data.get("campaign_id")
        logger.info(f"📥 Deploying new campaign: {campaign_id}")
        
        try:
            # Download campaign assets
            assets = data.get("assets", [])
            for asset in assets:
                await self.download_asset(asset)
            
            # Update display schedule
            await self.update_display_schedule(data)
            
            # Update current campaign
            self.current_campaign = campaign_id
            
            # Confirm deployment
            await self.send_confirmation("campaign_deployed", {
                "campaign_id": campaign_id,
                "status": "success",
                "message": "Campaign deployed successfully"
            })
            
            logger.info(f"✅ Campaign {campaign_id} deployed successfully")
            
        except Exception as e:
            logger.error(f"Campaign deployment failed: {e}")
            
            await self.send_confirmation("campaign_deployment_failed", {
                "campaign_id": campaign_id,
                "status": "error",
                "message": str(e)
            })
    
    async def download_asset(self, asset: Dict[str, Any]):
        """Download campaign media asset"""
        
        url = asset.get("url")
        filename = asset.get("filename")
        expected_hash = asset.get("checksum")
        
        if not all([url, filename, expected_hash]):
            raise ValueError("Invalid asset data")
        
        file_path = self.content_dir / filename
        
        logger.info(f"Downloading asset: {filename}")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=300)) as response:
                    response.raise_for_status()
                    
                    with open(file_path, 'wb') as f:
                        async for chunk in response.content.iter_chunked(8192):
                            f.write(chunk)
            
            # Verify checksum
            if await self.verify_file_checksum(file_path, expected_hash):
                logger.info(f"✅ Asset downloaded and verified: {filename}")
            else:
                raise ValueError(f"Checksum verification failed for {filename}")
                
        except Exception as e:
            logger.error(f"Asset download failed: {e}")
            if file_path.exists():
                file_path.unlink()  # Remove corrupted file
            raise
    
    async def verify_file_checksum(self, file_path: Path, expected_hash: str) -> bool:
        """Verify downloaded file checksum"""
        
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256_hash.update(chunk)
        
        return sha256_hash.hexdigest() == expected_hash
    
    async def update_display_schedule(self, campaign_data: Dict[str, Any]):
        """Update billboard display schedule"""
        
        # This is where we integrate with the billboard's display system
        # Implementation depends on billboard hardware/software
        
        schedule = {
            "campaign_id": campaign_data["campaign_id"],
            "start_time": campaign_data["start_time"],
            "end_time": campaign_data["end_time"],
            "assets": []
        }
        
        for asset in campaign_data.get("assets", []):
            schedule["assets"].append({
                "file_path": str(self.content_dir / asset["filename"]),
                "duration": asset.get("duration", 10),
                "transition": asset.get("transition", "fade")
            })
        
        # Save schedule configuration
        schedule_file = self.config_dir / "current_schedule.json"
        with open(schedule_file, 'w') as f:
            json.dump(schedule, f, indent=2)
        
        # Signal display system to reload (this varies by billboard type)
        await self.reload_display_system()
        
        logger.info("Display schedule updated")
    
    async def reload_display_system(self):
        """Reload billboard display system with new content"""
        
        # This method should be customized for each billboard type
        # Examples:
        
        # For LED display controllers:
        # os.system("systemctl reload led-controller")
        
        # For digital signage software:
        # os.system("killall -USR1 digital-signage")
        
        # For custom players:
        # await self.send_display_command("reload")
        
        logger.info("Display system reload triggered")
    
    async def send_confirmation(self, event_type: str, data: Dict[str, Any]):
        """Send confirmation message to AdFlow platform"""
        
        confirmation = {
            "type": event_type,
            "billboard_id": self.billboard_id,
            "timestamp": datetime.utcnow().isoformat(),
            **data
        }
        
        if self.websocket:
            try:
                await self.websocket.send(json.dumps(confirmation))
            except Exception as e:
                logger.error(f"Failed to send confirmation: {e}")
    
    async def get_system_info(self) -> Dict[str, Any]:
        """Get system information"""
        
        return {
            "platform": platform.platform(),
            "architecture": platform.architecture()[0],
            "hostname": platform.node(),
            "cpu_count": psutil.cpu_count(),
            "memory_total": psutil.virtual_memory().total,
            "disk_total": psutil.disk_usage('/').total,
            "agent_version": self.agent_version
        }
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get current system status"""
        
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "cpu_usage": psutil.cpu_percent(interval=1),
            "memory_usage": memory.percent,
            "memory_available": memory.available,
            "disk_usage": disk.percent,
            "disk_free": disk.free,
            "uptime": datetime.now().timestamp() - psutil.boot_time(),
            "load_average": os.getloadavg() if hasattr(os, 'getloadavg') else [0, 0, 0]
        }
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Get billboard capabilities"""
        
        return {
            "supported_formats": ["jpg", "png", "mp4", "gif"],
            "max_file_size": "100MB",
            "display_resolution": self.config.get("resolution", "1920x1080"),
            "audio_support": self.config.get("audio", False),
            "interactive_support": self.config.get("interactive", False),
            "scheduling_support": True,
            "remote_control": True
        }

# Configuration loader
def load_config(config_path: str = "/etc/adflow/agent.conf") -> Dict[str, Any]:
    """Load agent configuration"""
    
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning(f"Config file not found: {config_path}")
        return {}
    except Exception as e:
        logger.error(f"Failed to load config: {e}")
        return {}

# Main execution
async def main():
    """Main agent execution"""
    
    # Load configuration
    config = load_config()
    
    # Get credentials from environment or config
    billboard_id = os.getenv("BILLBOARD_ID") or config.get("billboard_id")
    api_key = os.getenv("BILLBOARD_API_KEY") or config.get("api_key")
    
    if not billboard_id or not api_key:
        logger.error("Missing BILLBOARD_ID or BILLBOARD_API_KEY")
        return
    
    # Create and start agent
    agent = AdFlowAgent(billboard_id, api_key, config)
    await agent.start()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Agent stopped by user")
    except Exception as e:
        logger.error(f"Agent crashed: {e}")
        raise
