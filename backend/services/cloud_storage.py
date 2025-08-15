"""
Google Cloud Storage service for file uploads
Simple implementation for MVP - no complicated setup needed
"""
import os
import uuid
from typing import Optional, List
from fastapi import UploadFile
from google.cloud import storage
import tempfile
import logging

logger = logging.getLogger(__name__)

class CloudStorageService:
    def __init__(self):
        """
        Initialize Google Cloud Storage client
        For MVP: Uses service account key from environment
        """
        self.bucket_name = os.getenv("GCS_BUCKET_NAME", "ignitch-media-storage")
        
        # For MVP: Simple setup with service account key
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        
        if credentials_path:
            self.client = storage.Client.from_service_account_json(credentials_path)
        else:
            # For Railway deployment: Use service account key from env var
            service_account_info = os.getenv("GCS_SERVICE_ACCOUNT_KEY")
            if service_account_info:
                import json
                from google.oauth2 import service_account
                
                credentials_info = json.loads(service_account_info)
                credentials = service_account.Credentials.from_service_account_info(credentials_info)
                self.client = storage.Client(credentials=credentials)
            else:
                # Fallback: Default credentials (for local development)
                self.client = storage.Client()
        
        self.bucket = self.client.bucket(self.bucket_name)
    
    async def upload_file(self, file: UploadFile, folder: str = "uploads") -> dict:
        """
        Upload file to Google Cloud Storage
        Returns: dict with file info and public URL
        """
        try:
            # Generate unique filename
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            blob_name = f"{folder}/{unique_filename}"
            
            # Create blob in bucket
            blob = self.bucket.blob(blob_name)
            
            # Read file content
            file_content = await file.read()
            
            # Upload to GCS
            blob.upload_from_string(
                file_content,
                content_type=file.content_type or 'application/octet-stream'
            )
            
            # Make file publicly accessible (for MVP simplicity)
            blob.make_public()
            
            return {
                "success": True,
                "filename": unique_filename,
                "original_filename": file.filename,
                "blob_name": blob_name,
                "public_url": blob.public_url,
                "size": len(file_content),
                "content_type": file.content_type
            }
            
        except Exception as e:
            logger.error(f"Upload failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def upload_multiple_files(self, files: List[UploadFile], folder: str = "bulk-uploads") -> dict:
        """
        Upload multiple files for bulk upload feature
        """
        results = []
        successful_uploads = 0
        
        for file in files:
            result = await self.upload_file(file, folder)
            results.append(result)
            if result["success"]:
                successful_uploads += 1
        
        return {
            "total_files": len(files),
            "successful_uploads": successful_uploads,
            "failed_uploads": len(files) - successful_uploads,
            "results": results
        }
    
    def delete_file(self, blob_name: str) -> bool:
        """
        Delete file from Google Cloud Storage
        """
        try:
            blob = self.bucket.blob(blob_name)
            blob.delete()
            return True
        except Exception as e:
            logger.error(f"Delete failed: {str(e)}")
            return False
    
    def get_file_url(self, blob_name: str) -> Optional[str]:
        """
        Get public URL for a file
        """
        try:
            blob = self.bucket.blob(blob_name)
            if blob.exists():
                return blob.public_url
            return None
        except Exception as e:
            logger.error(f"Get URL failed: {str(e)}")
            return None

# Global instance for easy import
cloud_storage = CloudStorageService()
