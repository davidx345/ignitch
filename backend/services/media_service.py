"""
Simple Media Service with Google Cloud Storage for MVP
Handles file uploads using Google Cloud Storage - simple and free setup
"""
import os
import uuid
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
from PIL import Image
import tempfile
from services.cloud_storage import cloud_storage

logger = logging.getLogger(__name__)

class MediaService:
    def __init__(self):
        self.max_file_size = 50 * 1024 * 1024  # 50MB
        self.allowed_image_types = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
        self.allowed_video_types = {'video/mp4', 'video/quicktime', 'video/x-msvideo'}
    
    async def upload_single_file(self, file_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Upload a single file to Google Cloud Storage"""
        try:
            # Create a mock UploadFile object for cloud_storage
            class MockUploadFile:
                def __init__(self, content: bytes, filename: str, content_type: str):
                    self.content = content
                    self.filename = filename
                    self.content_type = content_type
                
                async def read(self):
                    return self.content
            
            mock_file = MockUploadFile(
                content=file_data.get("content"),
                filename=file_data.get("filename"),
                content_type=file_data.get("content_type")
            )
            
            # Upload to Google Cloud Storage
            folder = f"users/{user_id}"
            result = await cloud_storage.upload_file(mock_file, folder)
            
            if result["success"]:
                return {
                    "success": True,
                    "file_data": {
                        "id": str(uuid.uuid4()),
                        "filename": result["original_filename"],
                        "cloud_url": result["public_url"],
                        "blob_name": result["blob_name"],
                        "file_size": result["size"],
                        "content_type": result["content_type"],
                        "upload_status": "completed",
                        "created_at": datetime.now()
                    }
                }
            else:
                return {
                    "success": False,
                    "error": result["error"]
                }
                
        except Exception as e:
            logger.error(f"Single file upload error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def upload_bulk_files(
        self, 
        files: List[Dict[str, Any]], 
        user_id: str,
        batch_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload multiple files to Google Cloud Storage"""
        try:
            if not batch_id:
                batch_id = str(uuid.uuid4())
            
            results = {
                "batch_id": batch_id,
                "total_files": len(files),
                "successful_uploads": 0,
                "failed_uploads": 0,
                "files": [],
                "processing_status": "processing"
            }
            
            # Process files one by one for simplicity in MVP
            for file_data in files:
                result = await self.upload_single_file(file_data, user_id)
                
                if result["success"]:
                    results["successful_uploads"] += 1
                    results["files"].append(result["file_data"])
                else:
                    results["failed_uploads"] += 1
                    results["files"].append({
                        "filename": file_data.get("filename", "unknown"),
                        "upload_status": "failed",
                        "error": result.get("error", "Unknown error")
                    })
            
            results["processing_status"] = "completed"
            return results
            
        except Exception as e:
            logger.error(f"Bulk upload error: {str(e)}")
            return {
                "batch_id": batch_id or "unknown",
                "total_files": len(files),
                "successful_uploads": 0,
                "failed_uploads": len(files),
                "files": [],
                "processing_status": "failed",
                "error": str(e)
            }
    
    async def delete_file(self, blob_name: str, user_id: str) -> bool:
        """Delete file from Google Cloud Storage"""
        try:
            # Security check - ensure file is in user's directory
            if not blob_name.startswith(f"users/{user_id}/"):
                logger.warning(f"Attempted to delete file outside user directory: {blob_name}")
                return False
            
            return cloud_storage.delete_file(blob_name)
            
        except Exception as e:
            logger.error(f"File deletion error: {str(e)}")
            return False
    
    async def get_file_url(self, blob_name: str) -> Optional[str]:
        """Get public URL for a file"""
        try:
            return cloud_storage.get_file_url(blob_name)
        except Exception as e:
            logger.error(f"Get file URL error: {str(e)}")
            return None
    
    def validate_file_type(self, content_type: str) -> bool:
        """Validate if file type is allowed"""
        allowed_types = self.allowed_image_types | self.allowed_video_types
        return content_type in allowed_types
    
    def validate_file_size(self, file_size: int) -> bool:
        """Validate if file size is within limits"""
        return file_size <= self.max_file_size

# Singleton instance
media_service = MediaService()
