"""
Enhanced Media Service with Bulk Upload Support
Handles file uploads, processing, and metadata extraction
"""
import os
import uuid
import asyncio
import aiofiles
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import logging
from PIL import Image, ImageStat
import cv2
import hashlib
import magic
from concurrent.futures import ThreadPoolExecutor
import colorsys

logger = logging.getLogger(__name__)

class MediaService:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(exist_ok=True)
        self.max_file_size = 50 * 1024 * 1024  # 50MB
        self.allowed_image_types = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
        self.allowed_video_types = {'video/mp4', 'video/quicktime', 'video/x-msvideo'}
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def upload_bulk_files(
        self, 
        files: List[Dict[str, Any]], 
        user_id: str,
        batch_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload multiple files with batch processing"""
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
            
            # Create user upload directory
            user_dir = self.upload_dir / user_id
            user_dir.mkdir(exist_ok=True)
            
            # Process files concurrently
            upload_tasks = []
            for file_data in files:
                task = asyncio.create_task(
                    self._process_single_file(file_data, user_id, batch_id, user_dir)
                )
                upload_tasks.append(task)
            
            # Wait for all uploads to complete
            upload_results = await asyncio.gather(*upload_tasks, return_exceptions=True)
            
            # Process results
            for result in upload_results:
                if isinstance(result, Exception):
                    logger.error(f"Upload error: {str(result)}")
                    results["failed_uploads"] += 1
                    results["files"].append({
                        "error": str(result),
                        "upload_status": "failed"
                    })
                elif result.get("success"):
                    results["successful_uploads"] += 1
                    results["files"].append(result["file_data"])
                else:
                    results["failed_uploads"] += 1
                    results["files"].append(result.get("file_data", {"error": "Unknown error"}))
            
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
    
    async def _process_single_file(
        self, 
        file_data: Dict[str, Any], 
        user_id: str, 
        batch_id: str, 
        user_dir: Path
    ) -> Dict[str, Any]:
        """Process a single file upload"""
        try:
            file_content = file_data.get("content")  # File bytes
            filename = file_data.get("filename")
            content_type = file_data.get("content_type")
            
            if not all([file_content, filename, content_type]):
                raise ValueError("Missing required file data")
            
            # Validate file
            validation_result = await self._validate_file(file_content, content_type, filename)
            if not validation_result["valid"]:
                raise ValueError(validation_result["error"])
            
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_extension = Path(filename).suffix.lower()
            safe_filename = f"{file_id}{file_extension}"
            file_path = user_dir / safe_filename
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(file_content)
            
            # Extract metadata
            metadata = await self._extract_metadata(file_path, content_type)
            
            # Detect brand colors (for images)
            brand_colors = []
            if content_type.startswith('image/'):
                brand_colors = await self._extract_brand_colors(file_path)
            
            # Generate alt text (AI-powered)
            alt_text = await self._generate_alt_text(file_path, content_type)
            
            file_info = {
                "id": file_id,
                "filename": filename,
                "file_path": str(file_path),
                "file_type": "image" if content_type.startswith('image/') else "video",
                "content_type": content_type,
                "file_size": len(file_content),
                "upload_status": "completed",
                "processing_status": "completed",
                "upload_batch_id": batch_id,
                "brand_colors": brand_colors,
                "alt_text": alt_text,
                "metadata": metadata,
                "width": metadata.get("width"),
                "height": metadata.get("height"),
                "duration": metadata.get("duration"),
                "tags": self._extract_tags_from_filename(filename),
                "created_at": datetime.now()
            }
            
            return {
                "success": True,
                "file_data": file_info
            }
            
        except Exception as e:
            logger.error(f"Single file processing error: {str(e)}")
            return {
                "success": False,
                "file_data": {
                    "filename": file_data.get("filename", "unknown"),
                    "upload_status": "failed",
                    "error": str(e)
                }
            }
    
    async def _validate_file(self, file_content: bytes, content_type: str, filename: str) -> Dict[str, Any]:
        """Validate uploaded file"""
        try:
            # Check file size
            if len(file_content) > self.max_file_size:
                return {
                    "valid": False,
                    "error": f"File size exceeds {self.max_file_size // (1024*1024)}MB limit"
                }
            
            # Check content type
            allowed_types = self.allowed_image_types | self.allowed_video_types
            if content_type not in allowed_types:
                return {
                    "valid": False,
                    "error": f"File type {content_type} not supported"
                }
            
            # Verify actual file type matches declared type
            actual_type = magic.from_buffer(file_content[:2048], mime=True)
            if actual_type != content_type:
                logger.warning(f"Content type mismatch: declared {content_type}, actual {actual_type}")
            
            # Check for malicious content (basic)
            if b'<script' in file_content.lower() or b'javascript:' in file_content.lower():
                return {
                    "valid": False,
                    "error": "File contains potentially malicious content"
                }
            
            return {"valid": True}
            
        except Exception as e:
            return {
                "valid": False,
                "error": f"Validation error: {str(e)}"
            }
    
    async def _extract_metadata(self, file_path: Path, content_type: str) -> Dict[str, Any]:
        """Extract metadata from uploaded file"""
        try:
            metadata = {
                "file_hash": await self._calculate_file_hash(file_path),
                "created_at": datetime.now().isoformat()
            }
            
            if content_type.startswith('image/'):
                # Extract image metadata
                loop = asyncio.get_event_loop()
                image_metadata = await loop.run_in_executor(
                    self.executor, self._extract_image_metadata, file_path
                )
                metadata.update(image_metadata)
                
            elif content_type.startswith('video/'):
                # Extract video metadata
                loop = asyncio.get_event_loop()
                video_metadata = await loop.run_in_executor(
                    self.executor, self._extract_video_metadata, file_path
                )
                metadata.update(video_metadata)
            
            return metadata
            
        except Exception as e:
            logger.error(f"Metadata extraction error: {str(e)}")
            return {"error": str(e)}
    
    def _extract_image_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Extract image metadata using PIL"""
        try:
            with Image.open(file_path) as img:
                metadata = {
                    "width": img.width,
                    "height": img.height,
                    "format": img.format,
                    "mode": img.mode,
                    "has_transparency": img.mode in ('RGBA', 'LA') or 'transparency' in img.info
                }
                
                # Extract EXIF data if available
                if hasattr(img, '_getexif') and img._getexif():
                    exif = img._getexif()
                    if exif:
                        metadata["exif"] = {k: str(v) for k, v in exif.items() if isinstance(v, (str, int, float))}
                
                return metadata
                
        except Exception as e:
            logger.error(f"Image metadata extraction error: {str(e)}")
            return {"error": str(e)}
    
    def _extract_video_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Extract video metadata using OpenCV"""
        try:
            cap = cv2.VideoCapture(str(file_path))
            
            if not cap.isOpened():
                return {"error": "Could not open video file"}
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            duration = frame_count / fps if fps > 0 else 0
            
            cap.release()
            
            return {
                "width": width,
                "height": height,
                "fps": fps,
                "frame_count": frame_count,
                "duration": duration,
                "aspect_ratio": width / height if height > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Video metadata extraction error: {str(e)}")
            return {"error": str(e)}
    
    async def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA-256 hash of file"""
        try:
            sha256_hash = hashlib.sha256()
            async with aiofiles.open(file_path, 'rb') as f:
                while chunk := await f.read(8192):
                    sha256_hash.update(chunk)
            return sha256_hash.hexdigest()
            
        except Exception as e:
            logger.error(f"Hash calculation error: {str(e)}")
            return ""
    
    async def _extract_brand_colors(self, file_path: Path, max_colors: int = 5) -> List[str]:
        """Extract dominant colors from image"""
        try:
            loop = asyncio.get_event_loop()
            colors = await loop.run_in_executor(
                self.executor, self._get_dominant_colors, file_path, max_colors
            )
            return colors
            
        except Exception as e:
            logger.error(f"Color extraction error: {str(e)}")
            return []
    
    def _get_dominant_colors(self, file_path: Path, max_colors: int) -> List[str]:
        """Get dominant colors using PIL"""
        try:
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize for faster processing
                img.thumbnail((150, 150))
                
                # Get colors
                colors = img.getcolors(maxcolors=256*256*256)
                if not colors:
                    return []
                
                # Sort by frequency and get top colors
                colors.sort(key=lambda x: x[0], reverse=True)
                
                hex_colors = []
                for count, color in colors[:max_colors]:
                    # Skip very dark or very light colors
                    brightness = sum(color) / 3
                    if 30 < brightness < 225:
                        hex_color = '#%02x%02x%02x' % color
                        hex_colors.append(hex_color)
                
                return hex_colors[:max_colors]
                
        except Exception as e:
            logger.error(f"Dominant colors extraction error: {str(e)}")
            return []
    
    async def _generate_alt_text(self, file_path: Path, content_type: str) -> str:
        """Generate AI-powered alt text for accessibility"""
        try:
            if not content_type.startswith('image/'):
                return ""
            
            # Simple placeholder - in production, use Vision AI
            filename_base = file_path.stem.lower()
            
            # Basic keyword detection
            if any(word in filename_base for word in ['product', 'item', 'merchandise']):
                return "Product image showing merchandise or item"
            elif any(word in filename_base for word in ['team', 'staff', 'employee', 'people']):
                return "Photo of team members or staff"
            elif any(word in filename_base for word in ['office', 'workspace', 'building']):
                return "Image of office or workspace environment"
            elif any(word in filename_base for word in ['logo', 'brand', 'company']):
                return "Company logo or branding image"
            else:
                return "Business-related image"
                
        except Exception as e:
            logger.error(f"Alt text generation error: {str(e)}")
            return "Image"
    
    def _extract_tags_from_filename(self, filename: str) -> List[str]:
        """Extract potential tags from filename"""
        try:
            # Remove extension and split by common separators
            name_part = Path(filename).stem.lower()
            
            # Split by various separators
            words = []
            for separator in ['-', '_', ' ', '.']:
                name_part = name_part.replace(separator, '|')
            
            words = [word.strip() for word in name_part.split('|') if word.strip()]
            
            # Filter out common non-tag words
            stopwords = {'img', 'image', 'photo', 'pic', 'picture', 'file', 'new', 'old', 'final', 'copy'}
            tags = [word for word in words if word not in stopwords and len(word) > 2]
            
            return tags[:10]  # Limit to 10 tags
            
        except Exception as e:
            logger.error(f"Tag extraction error: {str(e)}")
            return []
    
    async def get_upload_progress(self, batch_id: str) -> Dict[str, Any]:
        """Get progress of bulk upload"""
        # In production, this would query a Redis cache or database
        # For now, return placeholder data
        return {
            "batch_id": batch_id,
            "status": "completed",
            "progress_percentage": 100,
            "estimated_completion": None
        }
    
    async def delete_file(self, file_path: str, user_id: str) -> bool:
        """Delete uploaded file"""
        try:
            full_path = Path(file_path)
            
            # Security check - ensure file is in user's directory
            if not str(full_path).startswith(str(self.upload_dir / user_id)):
                logger.warning(f"Attempted to delete file outside user directory: {file_path}")
                return False
            
            if full_path.exists():
                full_path.unlink()
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"File deletion error: {str(e)}")
            return False
    
    async def optimize_image(self, file_path: Path, quality: int = 85) -> bool:
        """Optimize image for web use"""
        try:
            loop = asyncio.get_event_loop()
            success = await loop.run_in_executor(
                self.executor, self._optimize_image_sync, file_path, quality
            )
            return success
            
        except Exception as e:
            logger.error(f"Image optimization error: {str(e)}")
            return False
    
    def _optimize_image_sync(self, file_path: Path, quality: int) -> bool:
        """Synchronous image optimization"""
        try:
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too large
                max_dimension = 2048
                if max(img.width, img.height) > max_dimension:
                    img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                
                # Save with optimization
                img.save(file_path, optimize=True, quality=quality)
                
            return True
            
        except Exception as e:
            logger.error(f"Sync image optimization error: {str(e)}")
            return False

# Singleton instance
media_service = MediaService()
