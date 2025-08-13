"""
Enhanced Media Router with Bulk Upload Support
Handles file uploads, processing, and management
"""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json
import uuid
from datetime import datetime
import logging

from database import get_db
from models import User, MediaFile, BulkUploadBatch
from schemas import MediaFileResponse, BulkUploadResponse, ErrorResponse
from routers.auth import get_current_user
from services.media_service import media_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/upload/bulk", response_model=BulkUploadResponse)
async def upload_bulk_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    organize_by_date: bool = Form(True),
    auto_detect_brand_colors: bool = Form(True),
    generate_alt_text: bool = Form(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload multiple files at once"""
    try:
        if not files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No files provided"
            )
        
        if len(files) > 50:  # Limit bulk uploads
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 50 files allowed per batch"
            )
        
        # Create bulk upload batch record
        batch_id = str(uuid.uuid4())
        batch = BulkUploadBatch(
            id=batch_id,
            user_id=current_user.id,
            batch_name=f"Bulk upload {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            total_files=len(files),
            processing_status="processing"
        )
        db.add(batch)
        db.commit()
        
        # Prepare file data for processing
        file_data_list = []
        for upload_file in files:
            content = await upload_file.read()
            file_data_list.append({
                "content": content,
                "filename": upload_file.filename,
                "content_type": upload_file.content_type
            })
        
        # Process files asynchronously
        background_tasks.add_task(
            process_bulk_upload, 
            file_data_list, 
            current_user.id, 
            batch_id, 
            db,
            auto_detect_brand_colors,
            generate_alt_text
        )
        
        return BulkUploadResponse(
            upload_id=batch_id,
            total_files=len(files),
            successful_uploads=0,
            failed_uploads=0,
            processing_status="processing",
            files=[],
            estimated_completion_time=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Bulk upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk upload failed: {str(e)}"
        )

@router.get("/upload/bulk/{batch_id}/status")
async def get_bulk_upload_status(
    batch_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get status of bulk upload"""
    try:
        batch = db.query(BulkUploadBatch).filter(
            BulkUploadBatch.id == batch_id,
            BulkUploadBatch.user_id == current_user.id
        ).first()
        
        if not batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Batch not found"
            )
        
        # Get uploaded files for this batch
        files = db.query(MediaFile).filter(
            MediaFile.upload_batch_id == batch_id,
            MediaFile.user_id == current_user.id
        ).all()
        
        files_data = []
        for file in files:
            files_data.append({
                "id": file.id,
                "filename": file.filename,
                "file_type": file.file_type,
                "file_size": file.file_size,
                "upload_status": file.upload_status,
                "processing_status": file.processing_status,
                "brand_colors": file.brand_colors,
                "alt_text": file.alt_text,
                "tags": file.tags,
                "created_at": file.created_at.isoformat()
            })
        
        return {
            "batch_id": batch_id,
            "total_files": batch.total_files,
            "successful_uploads": batch.successful_uploads,
            "failed_uploads": batch.failed_uploads,
            "processing_status": batch.processing_status,
            "files": files_data,
            "completed_at": batch.completed_at.isoformat() if batch.completed_at else None
        }
        
    except Exception as e:
        logger.error(f"Get bulk upload status error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get upload status: {str(e)}"
        )

@router.post("/upload/single", response_model=MediaFileResponse)
async def upload_single_file(
    file: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),  # JSON string of tags array
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a single file"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No filename provided"
            )
        
        content = await file.read()
        
        # Process single file
        result = await media_service.upload_bulk_files(
            [{
                "content": content,
                "filename": file.filename,
                "content_type": file.content_type
            }],
            current_user.id
        )
        
        if not result.get("files") or result["failed_uploads"] > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File upload failed"
            )
        
        file_data = result["files"][0]
        
        # Parse tags if provided
        parsed_tags = []
        if tags:
            try:
                parsed_tags = json.loads(tags)
            except json.JSONDecodeError:
                parsed_tags = [tag.strip() for tag in tags.split(",")]
        
        # Create database record
        media_file = MediaFile(
            id=file_data["id"],
            user_id=current_user.id,
            filename=file_data["filename"],
            file_path=file_data["file_path"],
            file_type=file_data["file_type"],
            content_type=file_data["content_type"],
            file_size=file_data["file_size"],
            brand_colors=file_data["brand_colors"],
            alt_text=alt_text or file_data["alt_text"],
            tags=parsed_tags or file_data["tags"],
            upload_status=file_data["upload_status"],
            processing_status=file_data["processing_status"],
            width=file_data.get("width"),
            height=file_data.get("height"),
            duration=file_data.get("duration"),
            metadata=file_data.get("metadata", {})
        )
        
        db.add(media_file)
        db.commit()
        db.refresh(media_file)
        
        return MediaFileResponse(
            id=media_file.id,
            filename=media_file.filename,
            file_type=media_file.file_type,
            file_size=media_file.file_size,
            brand_colors=media_file.brand_colors,
            alt_text=media_file.alt_text,
            tags=media_file.tags,
            upload_status=media_file.upload_status,
            processing_status=media_file.processing_status,
            created_at=media_file.created_at
        )
        
    except Exception as e:
        logger.error(f"Single file upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )

@router.get("/files")
async def get_user_files(
    page: int = 1,
    limit: int = 50,
    file_type: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's uploaded files with pagination and filtering"""
    try:
        offset = (page - 1) * limit
        
        query = db.query(MediaFile).filter(MediaFile.user_id == current_user.id)
        
        # Apply filters
        if file_type:
            query = query.filter(MediaFile.file_type == file_type)
        
        if search:
            query = query.filter(
                MediaFile.filename.ilike(f"%{search}%") |
                MediaFile.alt_text.ilike(f"%{search}%")
            )
        
        # Get total count
        total_count = query.count()
        
        # Get paginated results
        files = query.order_by(MediaFile.created_at.desc()).offset(offset).limit(limit).all()
        
        files_data = []
        for file in files:
            files_data.append({
                "id": file.id,
                "filename": file.filename,
                "file_type": file.file_type,
                "file_size": file.file_size,
                "brand_colors": file.brand_colors,
                "alt_text": file.alt_text,
                "tags": file.tags,
                "upload_status": file.upload_status,
                "processing_status": file.processing_status,
                "width": file.width,
                "height": file.height,
                "duration": file.duration,
                "created_at": file.created_at.isoformat()
            })
        
        return {
            "files": files_data,
            "total_count": total_count,
            "page": page,
            "limit": limit,
            "total_pages": (total_count + limit - 1) // limit
        }
        
    except Exception as e:
        logger.error(f"Get user files error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get files: {str(e)}"
        )

@router.delete("/files/{file_id}")
async def delete_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a file"""
    try:
        file = db.query(MediaFile).filter(
            MediaFile.id == file_id,
            MediaFile.user_id == current_user.id
        ).first()
        
        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Delete physical file
        deletion_success = await media_service.delete_file(file.file_path, current_user.id)
        
        # Delete database record
        db.delete(file)
        db.commit()
        
        return {
            "message": "File deleted successfully",
            "file_id": file_id,
            "physical_file_deleted": deletion_success
        }
        
    except Exception as e:
        logger.error(f"Delete file error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )

@router.put("/files/{file_id}")
async def update_file_metadata(
    file_id: str,
    metadata: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update file metadata"""
    try:
        file = db.query(MediaFile).filter(
            MediaFile.id == file_id,
            MediaFile.user_id == current_user.id
        ).first()
        
        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Update allowed fields
        if "alt_text" in metadata:
            file.alt_text = metadata["alt_text"]
        
        if "tags" in metadata:
            file.tags = metadata["tags"]
        
        db.commit()
        
        return {
            "message": "File metadata updated successfully",
            "file_id": file_id
        }
        
    except Exception as e:
        logger.error(f"Update file metadata error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update file metadata: {str(e)}"
        )

@router.post("/files/bulk-action")
async def bulk_file_action(
    action_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform bulk actions on files"""
    try:
        action = action_data.get("action")
        file_ids = action_data.get("file_ids", [])
        
        if not action or not file_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action and file_ids are required"
            )
        
        files = db.query(MediaFile).filter(
            MediaFile.id.in_(file_ids),
            MediaFile.user_id == current_user.id
        ).all()
        
        if len(files) != len(file_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Some files not found"
            )
        
        results = []
        
        if action == "delete":
            for file in files:
                try:
                    await media_service.delete_file(file.file_path, current_user.id)
                    db.delete(file)
                    results.append({"file_id": file.id, "success": True})
                except Exception as e:
                    results.append({"file_id": file.id, "success": False, "error": str(e)})
            
        elif action == "add_tags":
            new_tags = action_data.get("tags", [])
            for file in files:
                try:
                    current_tags = file.tags or []
                    file.tags = list(set(current_tags + new_tags))
                    results.append({"file_id": file.id, "success": True})
                except Exception as e:
                    results.append({"file_id": file.id, "success": False, "error": str(e)})
        
        elif action == "update_alt_text":
            alt_text_template = action_data.get("alt_text", "")
            for file in files:
                try:
                    file.alt_text = alt_text_template
                    results.append({"file_id": file.id, "success": True})
                except Exception as e:
                    results.append({"file_id": file.id, "success": False, "error": str(e)})
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown action: {action}"
            )
        
        db.commit()
        
        successful_actions = sum(1 for r in results if r.get("success"))
        
        return {
            "message": f"Bulk action completed",
            "action": action,
            "total_files": len(file_ids),
            "successful_actions": successful_actions,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Bulk file action error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk action failed: {str(e)}"
        )

# Background task for processing bulk uploads
async def process_bulk_upload(
    file_data_list: List[Dict[str, Any]], 
    user_id: str, 
    batch_id: str, 
    db: Session,
    auto_detect_brand_colors: bool = True,
    generate_alt_text: bool = True
):
    """Background task to process bulk file uploads"""
    try:
        # Process files with media service
        result = await media_service.upload_bulk_files(file_data_list, user_id, batch_id)
        
        # Update batch status
        batch = db.query(BulkUploadBatch).filter(BulkUploadBatch.id == batch_id).first()
        if batch:
            batch.successful_uploads = result["successful_uploads"]
            batch.failed_uploads = result["failed_uploads"]
            batch.processing_status = result["processing_status"]
            batch.completed_at = datetime.now()
        
        # Save individual files to database
        for file_data in result["files"]:
            if file_data.get("id"):  # Only save successful uploads
                media_file = MediaFile(
                    id=file_data["id"],
                    user_id=user_id,
                    filename=file_data["filename"],
                    file_path=file_data["file_path"],
                    file_type=file_data["file_type"],
                    content_type=file_data.get("content_type", ""),
                    file_size=file_data["file_size"],
                    brand_colors=file_data.get("brand_colors", []),
                    alt_text=file_data.get("alt_text", ""),
                    tags=file_data.get("tags", []),
                    upload_status=file_data["upload_status"],
                    processing_status=file_data["processing_status"],
                    upload_batch_id=batch_id,
                    width=file_data.get("width"),
                    height=file_data.get("height"),
                    duration=file_data.get("duration"),
                    metadata=file_data.get("metadata", {}),
                    processed_at=datetime.now()
                )
                db.add(media_file)
        
        db.commit()
        logger.info(f"Bulk upload processing completed for batch {batch_id}")
        
    except Exception as e:
        logger.error(f"Background bulk upload processing error: {str(e)}")
        # Update batch with error status
        try:
            batch = db.query(BulkUploadBatch).filter(BulkUploadBatch.id == batch_id).first()
            if batch:
                batch.processing_status = "failed"
                batch.completed_at = datetime.now()
                db.commit()
        except Exception:
            pass
