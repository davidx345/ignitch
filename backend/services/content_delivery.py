"""
Content Delivery Service
Handles media file upload, processing, and distribution for billboard campaigns
"""

import os
import asyncio
import aiofiles
import hashlib
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from fastapi import UploadFile, HTTPException
from PIL import Image, ImageOps
import ffmpeg
import boto3
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

class MediaProcessor:
    """Handles media file processing and optimization"""
    
    def __init__(self):
        self.supported_image_formats = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
        self.supported_video_formats = {'.mp4', '.mov', '.avi', '.mkv', '.webm'}
        self.max_file_size = 100 * 1024 * 1024  # 100MB
    
    async def validate_file(self, file: UploadFile) -> Dict[str, Any]:
        """Validate uploaded media file"""
        
        # Check file size
        content = await file.read()
        await file.seek(0)  # Reset file pointer
        
        if len(content) > self.max_file_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {self.max_file_size // (1024*1024)}MB"
            )
        
        # Check file extension
        file_ext = Path(file.filename).suffix.lower()
        
        if file_ext in self.supported_image_formats:
            media_type = "image"
        elif file_ext in self.supported_video_formats:
            media_type = "video"
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format: {file_ext}"
            )
        
        # Generate file hash
        file_hash = hashlib.sha256(content).hexdigest()
        
        return {
            "media_type": media_type,
            "file_extension": file_ext,
            "file_size": len(content),
            "file_hash": file_hash,
            "original_filename": file.filename
        }
    
    async def process_image(
        self, 
        input_path: Path, 
        output_path: Path,
        target_resolutions: List[Tuple[int, int]] = None
    ) -> List[Dict[str, Any]]:
        """Process and optimize image for different billboard resolutions"""
        
        if not target_resolutions:
            target_resolutions = [
                (1920, 1080),  # Full HD
                (3840, 2160),  # 4K
                (1366, 768),   # HD
                (1024, 768)    # Standard
            ]
        
        processed_files = []
        
        try:
            with Image.open(input_path) as img:
                # Convert to RGB if needed
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                original_size = img.size
                
                for width, height in target_resolutions:
                    # Skip if original is smaller
                    if original_size[0] < width and original_size[1] < height:
                        continue
                    
                    # Resize image
                    resized_img = ImageOps.fit(img, (width, height), Image.Resampling.LANCZOS)
                    
                    # Generate output filename
                    output_file = output_path / f"{input_path.stem}_{width}x{height}.jpg"
                    
                    # Save optimized image
                    resized_img.save(
                        output_file,
                        "JPEG",
                        quality=85,
                        optimize=True
                    )
                    
                    processed_files.append({
                        "resolution": f"{width}x{height}",
                        "file_path": str(output_file),
                        "file_size": output_file.stat().st_size,
                        "width": width,
                        "height": height
                    })
                    
        except Exception as e:
            logger.error(f"Image processing failed: {e}")
            raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
        
        return processed_files
    
    async def process_video(
        self,
        input_path: Path,
        output_path: Path,
        target_resolutions: List[Tuple[int, int]] = None
    ) -> List[Dict[str, Any]]:
        """Process and optimize video for different billboard resolutions"""
        
        if not target_resolutions:
            target_resolutions = [
                (1920, 1080),  # Full HD
                (1366, 768),   # HD
                (1024, 768)    # Standard
            ]
        
        processed_files = []
        
        try:
            # Get video info
            probe = ffmpeg.probe(str(input_path))
            video_info = next(s for s in probe['streams'] if s['codec_type'] == 'video')
            original_width = int(video_info['width'])
            original_height = int(video_info['height'])
            duration = float(video_info.get('duration', 0))
            
            for width, height in target_resolutions:
                # Skip if original is smaller
                if original_width < width and original_height < height:
                    continue
                
                output_file = output_path / f"{input_path.stem}_{width}x{height}.mp4"
                
                # Process video with ffmpeg
                (
                    ffmpeg
                    .input(str(input_path))
                    .video.filter('scale', width, height)
                    .output(
                        str(output_file),
                        vcodec='libx264',
                        acodec='aac',
                        crf=23,
                        preset='medium'
                    )
                    .overwrite_output()
                    .run(quiet=True)
                )
                
                processed_files.append({
                    "resolution": f"{width}x{height}",
                    "file_path": str(output_file),
                    "file_size": output_file.stat().st_size,
                    "width": width,
                    "height": height,
                    "duration": duration
                })
                
        except Exception as e:
            logger.error(f"Video processing failed: {e}")
            raise HTTPException(status_code=500, detail=f"Video processing failed: {str(e)}")
        
        return processed_files

class CloudStorage:
    """Handles cloud storage operations for media files"""
    
    def __init__(self):
        self.bucket_name = os.getenv("AWS_S3_BUCKET", "adflow-media")
        self.region = os.getenv("AWS_REGION", "us-east-1")
        
        # Initialize S3 client
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=self.region
            )
        except Exception as e:
            logger.warning(f"S3 client initialization failed: {e}")
            self.s3_client = None
    
    async def upload_file(self, local_path: Path, s3_key: str) -> str:
        """Upload file to S3 and return public URL"""
        
        if not self.s3_client:
            # Fallback to local storage
            return await self.store_locally(local_path, s3_key)
        
        try:
            # Upload to S3
            self.s3_client.upload_file(
                str(local_path),
                self.bucket_name,
                s3_key,
                ExtraArgs={
                    'ContentType': self.get_content_type(local_path),
                    'CacheControl': 'max-age=31536000'  # 1 year cache
                }
            )
            
            # Return public URL
            url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{s3_key}"
            return url
            
        except ClientError as e:
            logger.error(f"S3 upload failed: {e}")
            # Fallback to local storage
            return await self.store_locally(local_path, s3_key)
    
    async def store_locally(self, local_path: Path, key: str) -> str:
        """Store file locally as fallback"""
        
        # Create media directory structure
        media_dir = Path("/var/adflow/media") / Path(key).parent
        media_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy file to media directory
        destination = media_dir / Path(key).name
        
        async with aiofiles.open(local_path, 'rb') as src:
            async with aiofiles.open(destination, 'wb') as dst:
                await dst.write(await src.read())
        
        # Return local URL
        base_url = os.getenv("MEDIA_BASE_URL", "https://api.adflow.app/media")
        return f"{base_url}/{key}"
    
    def get_content_type(self, file_path: Path) -> str:
        """Get content type for file"""
        
        ext = file_path.suffix.lower()
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg', 
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.mp4': 'video/mp4',
            '.mov': 'video/quicktime',
            '.avi': 'video/x-msvideo',
            '.mkv': 'video/x-matroska',
            '.webm': 'video/webm'
        }
        
        return content_types.get(ext, 'application/octet-stream')

class ContentDeliveryService:
    """Main content delivery service"""
    
    def __init__(self):
        self.media_processor = MediaProcessor()
        self.cloud_storage = CloudStorage()
        self.temp_dir = Path("/tmp/adflow")
        self.temp_dir.mkdir(parents=True, exist_ok=True)
    
    async def upload_campaign_media(
        self,
        files: List[UploadFile],
        campaign_id: str
    ) -> List[Dict[str, Any]]:
        """Upload and process media files for a campaign"""
        
        processed_media = []
        
        for file in files:
            try:
                # Validate file
                validation = await self.media_processor.validate_file(file)
                
                # Save temporary file
                temp_file = self.temp_dir / f"{validation['file_hash']}{validation['file_extension']}"
                
                async with aiofiles.open(temp_file, 'wb') as f:
                    content = await file.read()
                    await f.write(content)
                
                # Process media
                if validation['media_type'] == 'image':
                    processed = await self.process_and_upload_image(
                        temp_file, campaign_id, validation
                    )
                else:  # video
                    processed = await self.process_and_upload_video(
                        temp_file, campaign_id, validation
                    )
                
                processed_media.append(processed)
                
                # Cleanup temp file
                temp_file.unlink(missing_ok=True)
                
            except Exception as e:
                logger.error(f"Failed to process file {file.filename}: {e}")
                raise
        
        return processed_media
    
    async def process_and_upload_image(
        self,
        temp_file: Path,
        campaign_id: str,
        validation: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process image and upload variants"""
        
        # Create output directory
        output_dir = self.temp_dir / f"processed_{validation['file_hash']}"
        output_dir.mkdir(exist_ok=True)
        
        try:
            # Process image
            processed_files = await self.media_processor.process_image(
                temp_file, output_dir
            )
            
            # Upload all variants
            variants = []
            for processed in processed_files:
                s3_key = f"campaigns/{campaign_id}/images/{Path(processed['file_path']).name}"
                url = await self.cloud_storage.upload_file(
                    Path(processed['file_path']), s3_key
                )
                
                variants.append({
                    "resolution": processed["resolution"],
                    "url": url,
                    "file_size": processed["file_size"],
                    "width": processed["width"],
                    "height": processed["height"]
                })
            
            return {
                "media_type": "image",
                "original_filename": validation["original_filename"],
                "file_hash": validation["file_hash"],
                "variants": variants
            }
            
        finally:
            # Cleanup processed files
            for file_path in output_dir.glob("*"):
                file_path.unlink(missing_ok=True)
            output_dir.rmdir()
    
    async def process_and_upload_video(
        self,
        temp_file: Path,
        campaign_id: str,
        validation: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process video and upload variants"""
        
        # Create output directory
        output_dir = self.temp_dir / f"processed_{validation['file_hash']}"
        output_dir.mkdir(exist_ok=True)
        
        try:
            # Process video
            processed_files = await self.media_processor.process_video(
                temp_file, output_dir
            )
            
            # Upload all variants
            variants = []
            for processed in processed_files:
                s3_key = f"campaigns/{campaign_id}/videos/{Path(processed['file_path']).name}"
                url = await self.cloud_storage.upload_file(
                    Path(processed['file_path']), s3_key
                )
                
                variants.append({
                    "resolution": processed["resolution"],
                    "url": url,
                    "file_size": processed["file_size"],
                    "width": processed["width"],
                    "height": processed["height"],
                    "duration": processed.get("duration")
                })
            
            return {
                "media_type": "video",
                "original_filename": validation["original_filename"],
                "file_hash": validation["file_hash"],
                "variants": variants
            }
            
        finally:
            # Cleanup processed files
            for file_path in output_dir.glob("*"):
                file_path.unlink(missing_ok=True)
            output_dir.rmdir()
    
    async def get_media_for_billboard(
        self,
        campaign_media: List[Dict[str, Any]],
        billboard_resolution: str = "1920x1080"
    ) -> List[Dict[str, Any]]:
        """Get optimized media files for specific billboard resolution"""
        
        optimized_media = []
        
        for media in campaign_media:
            # Find best matching variant
            best_variant = None
            
            for variant in media["variants"]:
                if variant["resolution"] == billboard_resolution:
                    best_variant = variant
                    break
            
            # Fallback to highest resolution if exact match not found
            if not best_variant:
                best_variant = max(
                    media["variants"],
                    key=lambda v: v["width"] * v["height"]
                )
            
            optimized_media.append({
                "filename": f"{media['file_hash']}_{best_variant['resolution']}{Path(media['original_filename']).suffix}",
                "url": best_variant["url"],
                "file_size": best_variant["file_size"],
                "checksum": media["file_hash"],
                "media_type": media["media_type"],
                "duration": best_variant.get("duration", 10)  # Default 10s for images
            })
        
        return optimized_media

# Global content delivery service instance
content_delivery_service = ContentDeliveryService()
