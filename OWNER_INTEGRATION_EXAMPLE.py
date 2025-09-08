"""
AdFlow Billboard Agent - Installation Package
This is what billboard owners receive to connect their billboard to AdFlow platform
"""

import asyncio
import websockets
import requests
import json
import os
from datetime import datetime
import hashlib

class AdFlowBillboardAgent:
    def __init__(self, billboard_id, api_key):
        self.billboard_id = billboard_id
        self.api_key = api_key
        self.api_base = "https://api.adflow.app"
        self.websocket_url = f"wss://api.adflow.app/billboard/{billboard_id}/connect"
        self.websocket = None
        self.current_campaign = None
        self.local_content_path = "/var/adflow/content/"
        
    async def connect_to_adflow(self):
        """Connect billboard to AdFlow platform"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Billboard-ID": self.billboard_id
            }
            
            # Establish WebSocket connection
            self.websocket = await websockets.connect(
                self.websocket_url,
                extra_headers=headers
            )
            
            print(f"✅ Billboard {self.billboard_id} connected to AdFlow")
            
            # Send initial status
            await self.send_heartbeat()
            
            # Listen for commands
            await self.listen_for_campaigns()
            
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            await asyncio.sleep(30)  # Retry in 30 seconds
            await self.connect_to_adflow()
    
    async def send_heartbeat(self):
        """Send billboard status to AdFlow every 30 seconds"""
        while True:
            try:
                status = {
                    "type": "heartbeat",
                    "billboard_id": self.billboard_id,
                    "timestamp": datetime.utcnow().isoformat(),
                    "status": "online",
                    "current_campaign": self.current_campaign,
                    "system_info": {
                        "cpu_usage": self.get_cpu_usage(),
                        "memory_usage": self.get_memory_usage(),
                        "storage_free": self.get_storage_free(),
                        "temperature": self.get_temperature(),
                        "network_quality": self.test_network_speed()
                    }
                }
                
                if self.websocket:
                    await self.websocket.send(json.dumps(status))
                    
            except Exception as e:
                print(f"Heartbeat error: {e}")
                
            await asyncio.sleep(30)  # Send every 30 seconds
    
    async def listen_for_campaigns(self):
        """Listen for new campaigns from AdFlow"""
        async for message in self.websocket:
            try:
                data = json.loads(message)
                
                if data["type"] == "new_campaign":
                    await self.handle_new_campaign(data)
                elif data["type"] == "stop_campaign":
                    await self.handle_stop_campaign(data)
                elif data["type"] == "update_schedule":
                    await self.handle_schedule_update(data)
                    
            except Exception as e:
                print(f"Message handling error: {e}")
    
    async def handle_new_campaign(self, campaign_data):
        """Download and display new campaign"""
        try:
            campaign_id = campaign_data["campaign_id"]
            print(f"📥 Receiving new campaign: {campaign_id}")
            
            # Download campaign assets
            for asset in campaign_data["assets"]:
                await self.download_asset(asset)
            
            # Update display schedule
            self.current_campaign = campaign_id
            self.schedule_campaign_display(campaign_data)
            
            # Confirm receipt to AdFlow
            await self.confirm_campaign_received(campaign_id)
            
            print(f"✅ Campaign {campaign_id} is now live!")
            
        except Exception as e:
            print(f"Campaign handling error: {e}")
            await self.report_error(campaign_data.get("campaign_id"), str(e))
    
    async def download_asset(self, asset):
        """Download campaign media files"""
        try:
            url = asset["url"]
            filename = asset["filename"]
            expected_hash = asset["checksum"]
            
            # Download file
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            file_path = os.path.join(self.local_content_path, filename)
            
            # Save and verify
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Verify checksum
            if self.verify_file_hash(file_path, expected_hash):
                print(f"✅ Downloaded: {filename}")
            else:
                raise Exception(f"Checksum mismatch for {filename}")
                
        except Exception as e:
            print(f"Download error: {e}")
            raise
    
    def schedule_campaign_display(self, campaign_data):
        """Schedule campaign to display on billboard"""
        # This would integrate with the billboard's existing display system
        # Examples of what this might do:
        
        # For LED billboards with playlist systems:
        self.update_playlist(campaign_data)
        
        # For digital signage systems:
        self.update_signage_schedule(campaign_data)
        
        # For custom display controllers:
        self.send_display_command(campaign_data)
    
    def update_playlist(self, campaign_data):
        """Update billboard playlist with new campaign"""
        # Example for common billboard software
        playlist = {
            "campaign_id": campaign_data["campaign_id"],
            "start_time": campaign_data["start_time"],
            "end_time": campaign_data["end_time"],
            "media_files": [
                {
                    "file": os.path.join(self.local_content_path, asset["filename"]),
                    "duration": asset["duration"],
                    "transition": asset.get("transition", "fade")
                }
                for asset in campaign_data["assets"]
            ]
        }
        
        # Write to billboard system (this varies by manufacturer)
        # Common formats: JSON, XML, CSV
        with open("/var/billboard/current_playlist.json", "w") as f:
            json.dump(playlist, f)
        
        # Signal billboard system to reload
        os.system("killall -USR1 billboard_player")  # Example signal
    
    # Helper methods
    def get_cpu_usage(self):
        return "45%"  # Would use psutil or similar
    
    def get_memory_usage(self):
        return "2.1GB / 8GB"
    
    def get_storage_free(self):
        return "450GB"
    
    def get_temperature(self):
        return "42°C"
    
    def test_network_speed(self):
        return "85 Mbps"
    
    def verify_file_hash(self, file_path, expected_hash):
        """Verify downloaded file integrity"""
        with open(file_path, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
        return file_hash == expected_hash

# Main execution
if __name__ == "__main__":
    # These would be provided by AdFlow during setup
    BILLBOARD_ID = "BILLBOARD_12345"
    API_KEY = "sk_live_abc123xyz789..."
    
    agent = AdFlowBillboardAgent(BILLBOARD_ID, API_KEY)
    
    print("🚀 Starting AdFlow Billboard Agent...")
    print(f"Billboard ID: {BILLBOARD_ID}")
    print("Connecting to AdFlow platform...")
    
    # Run the agent
    asyncio.run(agent.connect_to_adflow())
