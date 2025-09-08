"""
Billboard Agent Installer
Easy installation script for billboard owners
"""

import os
import sys
import subprocess
import json
import platform
from pathlib import Path
import urllib.request
import shutil

class AgentInstaller:
    def __init__(self):
        self.platform = platform.system().lower()
        self.architecture = platform.machine().lower()
        self.install_dir = self.get_install_directory()
        self.service_name = "adflow-agent"
        
    def get_install_directory(self):
        """Get appropriate installation directory"""
        if self.platform == "windows":
            return Path("C:/Program Files/AdFlow/Agent")
        else:
            return Path("/opt/adflow/agent")
    
    def check_requirements(self):
        """Check system requirements"""
        print("🔍 Checking system requirements...")
        
        # Check Python version
        python_version = sys.version_info
        if python_version < (3, 7):
            print("❌ Python 3.7 or higher required")
            return False
        
        print(f"✅ Python {python_version.major}.{python_version.minor}")
        
        # Check internet connectivity
        try:
            urllib.request.urlopen("https://api.adflow.app/health", timeout=10)
            print("✅ Internet connectivity")
        except Exception:
            print("❌ No internet connection to AdFlow API")
            return False
        
        # Check disk space (minimum 1GB)
        disk_usage = shutil.disk_usage(str(Path.home()))
        free_gb = disk_usage.free / (1024**3)
        if free_gb < 1:
            print(f"❌ Insufficient disk space: {free_gb:.1f}GB free, 1GB required")
            return False
        
        print(f"✅ Disk space: {free_gb:.1f}GB free")
        
        return True
    
    def install_dependencies(self):
        """Install required Python packages"""
        print("📦 Installing dependencies...")
        
        requirements = [
            "asyncio",
            "websockets>=10.0",
            "aiohttp>=3.8.0",
            "psutil>=5.8.0",
            "pathlib"
        ]
        
        for package in requirements:
            try:
                subprocess.check_call([
                    sys.executable, "-m", "pip", "install", package
                ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                print(f"✅ {package}")
            except subprocess.CalledProcessError:
                print(f"❌ Failed to install {package}")
                return False
        
        return True
    
    def create_directories(self):
        """Create necessary directories"""
        print("📁 Creating directories...")
        
        directories = [
            self.install_dir,
            self.install_dir / "content",
            self.install_dir / "config",
            self.install_dir / "logs"
        ]
        
        if self.platform != "windows":
            directories.extend([
                Path("/var/adflow"),
                Path("/var/adflow/content"), 
                Path("/var/adflow/config"),
                Path("/var/log/adflow")
            ])
        
        for directory in directories:
            try:
                directory.mkdir(parents=True, exist_ok=True)
                print(f"✅ {directory}")
            except PermissionError:
                print(f"❌ Permission denied: {directory}")
                return False
        
        return True
    
    def download_agent(self):
        """Download agent files"""
        print("⬇️  Downloading agent...")
        
        # In production, this would download from a release URL
        # For now, we'll copy the local agent file
        
        agent_source = Path(__file__).parent / "agent.py"
        agent_dest = self.install_dir / "agent.py"
        
        try:
            shutil.copy2(agent_source, agent_dest)
            print(f"✅ Agent copied to {agent_dest}")
            return True
        except Exception as e:
            print(f"❌ Failed to copy agent: {e}")
            return False
    
    def configure_agent(self, billboard_id: str, api_key: str):
        """Configure agent with credentials"""
        print("⚙️  Configuring agent...")
        
        config = {
            "billboard_id": billboard_id,
            "api_key": api_key,
            "api_url": "https://api.adflow.app",
            "content_dir": str(self.install_dir / "content"),
            "config_dir": str(self.install_dir / "config"),
            "log_level": "INFO"
        }
        
        config_file = self.install_dir / "config" / "agent.conf"
        
        try:
            with open(config_file, 'w') as f:
                json.dump(config, f, indent=2)
            
            print(f"✅ Configuration saved to {config_file}")
            return True
        except Exception as e:
            print(f"❌ Failed to save configuration: {e}")
            return False
    
    def create_service(self):
        """Create system service"""
        print("🔧 Creating system service...")
        
        if self.platform == "linux":
            return self.create_systemd_service()
        elif self.platform == "windows":
            return self.create_windows_service()
        else:
            print("⚠️  Manual service creation required for this platform")
            return True
    
    def create_systemd_service(self):
        """Create systemd service for Linux"""
        
        service_content = f"""[Unit]
Description=AdFlow Billboard Agent
After=network.target
Wants=network.target

[Service]
Type=simple
User=adflow
Group=adflow
WorkingDirectory={self.install_dir}
ExecStart={sys.executable} {self.install_dir}/agent.py
Restart=always
RestartSec=10
Environment=PYTHONPATH={self.install_dir}

[Install]
WantedBy=multi-user.target
"""
        
        service_file = Path(f"/etc/systemd/system/{self.service_name}.service")
        
        try:
            with open(service_file, 'w') as f:
                f.write(service_content)
            
            # Reload systemd and enable service
            subprocess.run(["systemctl", "daemon-reload"])
            subprocess.run(["systemctl", "enable", self.service_name])
            
            print(f"✅ Systemd service created: {self.service_name}")
            return True
        except PermissionError:
            print("❌ Permission denied. Run installer as root/sudo")
            return False
        except Exception as e:
            print(f"❌ Failed to create service: {e}")
            return False
    
    def create_windows_service(self):
        """Create Windows service"""
        
        # For Windows, we'll create a batch file for now
        # In production, use proper Windows service tools
        
        batch_content = f"""@echo off
cd /d "{self.install_dir}"
"{sys.executable}" agent.py
pause
"""
        
        batch_file = self.install_dir / "start_agent.bat"
        
        try:
            with open(batch_file, 'w') as f:
                f.write(batch_content)
            
            print(f"✅ Startup script created: {batch_file}")
            print("   Add this to Windows startup folder for auto-start")
            return True
        except Exception as e:
            print(f"❌ Failed to create startup script: {e}")
            return False
    
    def test_connection(self):
        """Test connection to AdFlow platform"""
        print("🔌 Testing connection...")
        
        try:
            # Run a quick test of the agent
            test_script = f"""
import sys
sys.path.append('{self.install_dir}')
from agent import AdFlowAgent
import asyncio
import json

async def test():
    config_file = '{self.install_dir}/config/agent.conf'
    with open(config_file, 'r') as f:
        config = json.load(f)
    
    agent = AdFlowAgent(config['billboard_id'], config['api_key'], config)
    await agent.register_billboard()
    print("✅ Connection test successful")

asyncio.run(test())
"""
            
            result = subprocess.run([
                sys.executable, "-c", test_script
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print("✅ Connection test passed")
                return True
            else:
                print(f"❌ Connection test failed: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Connection test error: {e}")
            return False
    
    def start_service(self):
        """Start the agent service"""
        print("🚀 Starting agent service...")
        
        if self.platform == "linux":
            try:
                subprocess.run(["systemctl", "start", self.service_name], check=True)
                subprocess.run(["systemctl", "status", self.service_name], check=True)
                print(f"✅ Service {self.service_name} started")
                return True
            except subprocess.CalledProcessError:
                print(f"❌ Failed to start service {self.service_name}")
                return False
        else:
            print("   Please run the startup script manually")
            return True

def main():
    """Main installer function"""
    
    print("🎯 AdFlow Billboard Agent Installer")
    print("=" * 50)
    
    # Get credentials from user
    print("\n📝 Please provide your billboard credentials:")
    billboard_id = input("Billboard ID: ").strip()
    api_key = input("API Key: ").strip()
    
    if not billboard_id or not api_key:
        print("❌ Billboard ID and API Key are required")
        sys.exit(1)
    
    # Create installer
    installer = AgentInstaller()
    
    # Run installation steps
    steps = [
        ("Checking requirements", installer.check_requirements),
        ("Installing dependencies", installer.install_dependencies),
        ("Creating directories", installer.create_directories),
        ("Downloading agent", installer.download_agent),
        ("Configuring agent", lambda: installer.configure_agent(billboard_id, api_key)),
        ("Creating service", installer.create_service),
        ("Testing connection", installer.test_connection),
        ("Starting service", installer.start_service)
    ]
    
    print(f"\n🔧 Starting installation...")
    
    for step_name, step_func in steps:
        print(f"\n{step_name}...")
        
        if not step_func():
            print(f"\n❌ Installation failed at: {step_name}")
            sys.exit(1)
    
    print("\n🎉 Installation completed successfully!")
    print("\nNext steps:")
    print("1. Your billboard is now connected to AdFlow")
    print("2. Check the admin dashboard for your billboard status")
    print("3. Monitor logs for any issues")
    print(f"4. Service name: {installer.service_name}")
    
    if installer.platform == "linux":
        print(f"\nService commands:")
        print(f"  Start:   sudo systemctl start {installer.service_name}")
        print(f"  Stop:    sudo systemctl stop {installer.service_name}")
        print(f"  Status:  sudo systemctl status {installer.service_name}")
        print(f"  Logs:    sudo journalctl -u {installer.service_name} -f")

if __name__ == "__main__":
    main()
