from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import os
import uuid
import shutil
from PIL import Image, ImageEnhance, ImageFilter
import colorsys
from collections import Counter
import asyncio
from typing import List, Optional

from database import get_db
from models import User, MediaFile
import schemas
from routers.auth import get_current_user

router = APIRouter()

# Upload directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed file types
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/avi", "video/mov", "video/quicktime"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

def extract_brand_colors(image_path: str, num_colors: int = 5) -> List[str]:
    """Extract dominant colors from an image using advanced color analysis"""
    try:
        with Image.open(image_path) as image:
            # Convert to RGB if not already
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize for faster processing while maintaining aspect ratio
            image.thumbnail((200, 200), Image.Resampling.LANCZOS)
            
            # Get all pixels
            pixels = list(image.getdata())
            
            # Filter out very dark and very light colors
            filtered_pixels = []
            for r, g, b in pixels:
                # Convert to HSL to filter by lightness
                h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)
                # Keep colors that are not too dark or too light and have decent saturation
                if 0.15 < l < 0.85 and s > 0.1:
                    filtered_pixels.append((r, g, b))
            
            if not filtered_pixels:
                filtered_pixels = pixels  # Fallback to all pixels
            
            # Count color frequency with clustering similar colors
            color_clusters = {}
            for color in filtered_pixels:
                # Round colors to reduce similar variations
                rounded_color = (
                    round(color[0] / 10) * 10,
                    round(color[1] / 10) * 10,
                    round(color[2] / 10) * 10
                )
                color_clusters[rounded_color] = color_clusters.get(rounded_color, 0) + 1
            
            # Get most common colors
            dominant_colors = sorted(color_clusters.items(), key=lambda x: x[1], reverse=True)[:num_colors]
            
            # Convert RGB to hex
            hex_colors = []
            for (r, g, b), count in dominant_colors:
                hex_color = f"#{r:02x}{g:02x}{b:02x}"
                hex_colors.append(hex_color)
            
            return hex_colors
    except Exception as e:
        print(f"Error extracting colors: {e}")
        return ["#3D5AFE", "#FF6B6B", "#24CCA0", "#1B1F3B", "#F4F6FA"]  # Default brand colors

def enhance_image_quality(image_path: str, output_path: str) -> bool:
    """Enhance image quality with AI-like processing"""
    try:
        with Image.open(image_path) as image:
            # Convert to RGB if needed
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Enhance sharpness
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(1.2)
            
            # Enhance color
            enhancer = ImageEnhance.Color(image)
            image = enhancer.enhance(1.1)
            
            # Enhance contrast slightly
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.05)
            
            # Save with high quality
            image.save(output_path, "JPEG", quality=95, optimize=True)
            return True
    except Exception as e:
        print(f"Error enhancing image: {e}")
        return False

def create_platform_crops(image_path: str, base_filename: str) -> dict:
    """Create optimized crops for different social media platforms"""
    crops = {}
    
    try:
        with Image.open(image_path) as image:
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Define platform dimensions
            platform_sizes = {
                "instagram_square": (1080, 1080),
                "instagram_portrait": (1080, 1350),
                "instagram_story": (1080, 1920),
                "facebook_post": (1200, 630),
                "facebook_story": (1080, 1920),
                "tiktok": (1080, 1920),
                "youtube_thumbnail": (1280, 720),
                "twitter_post": (1200, 675)
            }
            
            original_width, original_height = image.size
            
            for platform, (target_width, target_height) in platform_sizes.items():
                try:
                    # Calculate the best crop
                    target_ratio = target_width / target_height
                    original_ratio = original_width / original_height
                    
                    if original_ratio > target_ratio:
                        # Original is wider, crop width
                        new_width = int(original_height * target_ratio)
                        left = (original_width - new_width) // 2
                        crop_box = (left, 0, left + new_width, original_height)
                    else:
                        # Original is taller, crop height
                        new_height = int(original_width / target_ratio)
                        top = (original_height - new_height) // 2
                        crop_box = (0, top, original_width, top + new_height)
                    
                    # Crop and resize
                    cropped = image.crop(crop_box)
                    resized = cropped.resize((target_width, target_height), Image.Resampling.LANCZOS)
                    
                    # Save cropped version
                    crop_filename = f"{base_filename}_{platform}.jpg"
                    crop_path = os.path.join(UPLOAD_DIR, crop_filename)
                    resized.save(crop_path, "JPEG", quality=90, optimize=True)
                    
                    crops[platform] = crop_filename
                    
                except Exception as e:
                    print(f"Error creating {platform} crop: {e}")
                    
    except Exception as e:
        print(f"Error creating platform crops: {e}")
    
    return crops

async def analyze_image_content(image_path: str) -> dict:
    """Analyze image content for AI insights"""
    # Simulate AI analysis processing
    await asyncio.sleep(1)
    
    try:
        with Image.open(image_path) as image:
            width, height = image.size
            
            # Basic image analysis
            analysis = {
                "dimensions": {"width": width, "height": height},
                "aspect_ratio": round(width / height, 2),
                "orientation": "landscape" if width > height else "portrait" if height > width else "square",
                "estimated_quality": "high" if min(width, height) > 1000 else "medium" if min(width, height) > 500 else "low",
                "file_format": image.format,
                "has_transparency": image.mode in ('RGBA', 'LA') or 'transparency' in image.info,
                "color_mode": image.mode,
                "ai_suggestions": []
            }
            
            # Add AI suggestions based on analysis
            if analysis["orientation"] == "square":
                analysis["ai_suggestions"].append("Perfect for Instagram feed posts")
            elif analysis["orientation"] == "portrait":
                analysis["ai_suggestions"].append("Great for Instagram stories and TikTok")
            else:
                analysis["ai_suggestions"].append("Ideal for Facebook posts and covers")
            
            if analysis["estimated_quality"] == "high":
                analysis["ai_suggestions"].append("High resolution - perfect for all platforms")
            else:
                analysis["ai_suggestions"].append("Consider using AI enhancement for better quality")
            
            return analysis
            
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return {"error": "Analysis failed", "ai_suggestions": ["Unable to analyze image"]}

@router.post("/upload", response_model=schemas.MediaFileResponse)
async def upload_media(
    file: UploadFile = File(...),
    enhance_quality: bool = True,
    create_crops: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and process media file with AI enhancements"""
    
    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES and file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload images (JPEG, PNG, WebP) or videos (MP4, MOV, AVI)."
        )
    
    # Read file content to check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB."
        )
    
    # Reset file pointer
    await file.seek(0)
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1].lower()
    if not file_extension:
        file_extension = ".jpg" if file.content_type.startswith("image") else ".mp4"
    
    original_filename = f"{file_id}_original{file_extension}"
    original_path = os.path.join(UPLOAD_DIR, original_filename)
    
    # Save original file
    try:
        with open(original_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Process image
    file_type = "image" if file.content_type.startswith("image") else "video"
    brand_colors = []
    platform_crops = {}
    ai_analysis = {}
    
    if file_type == "image":
        try:
            # Extract brand colors
            brand_colors = extract_brand_colors(original_path)
            
            # Enhance quality if requested
            enhanced_filename = f"{file_id}_enhanced{file_extension}"
            enhanced_path = os.path.join(UPLOAD_DIR, enhanced_filename)
            
            if enhance_quality:
                if enhance_image_quality(original_path, enhanced_path):
                    # Use enhanced version as main file
                    main_path = enhanced_path
                    main_filename = enhanced_filename
                else:
                    main_path = original_path
                    main_filename = original_filename
            else:
                main_path = original_path
                main_filename = original_filename
            
            # Create platform-specific crops
            if create_crops:
                platform_crops = create_platform_crops(main_path, file_id)
            
            # AI analysis
            ai_analysis = await analyze_image_content(main_path)
            
        except Exception as e:
            print(f"Error processing image: {e}")
            main_filename = original_filename
    else:
        # For videos, use original file
        main_filename = original_filename
        ai_analysis = {
            "file_format": "video",
            "ai_suggestions": ["Video uploaded successfully", "Consider creating a thumbnail image"]
        }
    
    # Save to database
    try:
        media_file = MediaFile(
            id=file_id,
            user_id=current_user.id,
            filename=file.filename,
            file_path=main_filename,
            file_type=file_type,
            file_size=len(content),
            brand_colors=brand_colors
        )
        
        db.add(media_file)
        db.commit()
        db.refresh(media_file)
        
        # Update user visibility score
        current_user.visibility_score = (current_user.visibility_score or 0) + 10
        db.commit()
        
        return schemas.MediaFileResponse(
            id=media_file.id,
            filename=media_file.filename,
            file_type=media_file.file_type,
            file_size=media_file.file_size,
            brand_colors=media_file.brand_colors,
            created_at=media_file.created_at
        )
        
    except Exception as e:
        # Clean up files on database error
        try:
            if os.path.exists(original_path):
                os.remove(original_path)
            for crop_file in platform_crops.values():
                crop_path = os.path.join(UPLOAD_DIR, crop_file)
                if os.path.exists(crop_path):
                    os.remove(crop_path)
        except:
            pass
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save media file to database"
        )

@router.get("/files")
async def get_user_media_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all media files for the current user"""
    
    media_files = db.query(MediaFile).filter(
        MediaFile.user_id == current_user.id
    ).order_by(MediaFile.created_at.desc()).all()
    
    return [
        schemas.MediaFileResponse(
            id=file.id,
            filename=file.filename,
            file_type=file.file_type,
            file_size=file.file_size,
            brand_colors=file.brand_colors,
            created_at=file.created_at
        )
        for file in media_files
    ]

@router.delete("/files/{file_id}")
async def delete_media_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a media file"""
    
    media_file = db.query(MediaFile).filter(
        MediaFile.id == file_id,
        MediaFile.user_id == current_user.id
    ).first()
    
    if not media_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file not found"
        )
    
    # Delete file from filesystem
    try:
        file_path = os.path.join(UPLOAD_DIR, media_file.file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Also delete any platform-specific crops
        base_filename = os.path.splitext(media_file.file_path)[0]
        for platform in ["instagram_square", "instagram_portrait", "instagram_story", 
                        "facebook_post", "facebook_story", "tiktok", "youtube_thumbnail", "twitter_post"]:
            crop_path = os.path.join(UPLOAD_DIR, f"{base_filename}_{platform}.jpg")
            if os.path.exists(crop_path):
                os.remove(crop_path)
                
    except Exception as e:
        print(f"Error deleting files: {e}")
    
    # Delete from database
    db.delete(media_file)
    db.commit()
    
    return {"message": "Media file deleted successfully"}

@router.post("/enhance/{file_id}")
async def enhance_media_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply AI enhancement to an existing media file"""
    
    media_file = db.query(MediaFile).filter(
        MediaFile.id == file_id,
        MediaFile.user_id == current_user.id
    ).first()
    
    if not media_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file not found"
        )
    
    if media_file.file_type != "image":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enhancement is only available for images"
        )
    
    original_path = os.path.join(UPLOAD_DIR, media_file.file_path)
    if not os.path.exists(original_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original file not found"
        )
    
    # Create enhanced version
    enhanced_filename = f"{file_id}_enhanced.jpg"
    enhanced_path = os.path.join(UPLOAD_DIR, enhanced_filename)
    
    if enhance_image_quality(original_path, enhanced_path):
        # Update database with enhanced version
        media_file.file_path = enhanced_filename
        db.commit()
        
        return {"message": "Image enhanced successfully", "enhanced_path": enhanced_filename}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enhance image"
        )

@router.get("/analyze/{file_id}")
async def analyze_media_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analysis of a media file"""
    
    media_file = db.query(MediaFile).filter(
        MediaFile.id == file_id,
        MediaFile.user_id == current_user.id
    ).first()
    
    if not media_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file not found"
        )
    
    file_path = os.path.join(UPLOAD_DIR, media_file.file_path)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    if media_file.file_type == "image":
        analysis = await analyze_image_content(file_path)
        analysis["brand_colors"] = media_file.brand_colors
        return analysis
    else:
        return {
            "file_type": "video",
            "message": "Video analysis not yet available",
            "suggestions": ["Video files are supported for upload and posting"]
        }


