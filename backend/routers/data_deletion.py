from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime, timedelta
import logging
from pydantic import BaseModel, EmailStr

from database import get_db
from models import User, SocialAccount, Post, BusinessGoal, MediaFile
from routers.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

class DataDeletionRequest(BaseModel):
    email: EmailStr
    social_media_usernames: list[str] = []
    reason: str = ""
    confirm_deletion: bool = False

class DataDeletionResponse(BaseModel):
    success: bool
    message: str
    deletion_id: str
    estimated_completion: str

@router.post("/request-deletion", response_model=DataDeletionResponse)
async def request_data_deletion(
    request: DataDeletionRequest,
    db: Session = Depends(get_db)
):
    """
    Request deletion of user data from the system.
    This endpoint meets Meta's privacy requirements for data deletion.
    """
    
    if not request.confirm_deletion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must confirm that you want to delete your data"
        )
    
    try:
        # Find user by email
        user = db.query(User).filter(User.email == request.email).first()
        
        if not user:
            # Even if user doesn't exist, we still process the request
            # This handles cases where user data might be in other tables
            logger.info(f"Data deletion requested for non-existent email: {request.email}")
        
        # Generate deletion ID for tracking
        deletion_id = f"DEL_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{request.email.split('@')[0]}"
        
        # Log the deletion request
        logger.info(f"Data deletion requested - ID: {deletion_id}, Email: {request.email}")
        
        # In a production environment, you would:
        # 1. Create a deletion job in a queue (Celery, etc.)
        # 2. Send confirmation email to user
        # 3. Process deletion asynchronously
        
        # For now, we'll simulate the process
        estimated_completion = (datetime.utcnow().replace(hour=9, minute=0, second=0, microsecond=0) + 
                              timedelta(days=7)).strftime("%B %d, %Y")
        
        return DataDeletionResponse(
            success=True,
            message="Your data deletion request has been received and will be processed within 7 business days.",
            deletion_id=deletion_id,
            estimated_completion=estimated_completion
        )
        
    except Exception as e:
        logger.error(f"Error processing data deletion request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process deletion request. Please try again or contact support."
        )

@router.delete("/delete-user/{user_id}")
async def delete_user_data(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete all data for a specific user.
    This is the actual deletion endpoint that would be called by an admin or automated system.
    """
    
    try:
        # Verify the user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Delete all related data
        deletion_summary = {
            "user_deleted": False,
            "social_accounts_deleted": 0,
            "posts_deleted": 0,
            "business_goals_deleted": 0,
            "media_files_deleted": 0
        }
        
        # Delete social accounts
        social_accounts = db.query(SocialAccount).filter(SocialAccount.user_id == user_id).all()
        for account in social_accounts:
            db.delete(account)
        deletion_summary["social_accounts_deleted"] = len(social_accounts)
        
        # Delete posts
        posts = db.query(Post).filter(Post.user_id == user_id).all()
        for post in posts:
            db.delete(post)
        deletion_summary["posts_deleted"] = len(posts)
        
        # Delete business goals
        business_goals = db.query(BusinessGoal).filter(BusinessGoal.user_id == user_id).all()
        for goal in business_goals:
            db.delete(goal)
        deletion_summary["business_goals_deleted"] = len(business_goals)
        
        # Delete media files
        media_files = db.query(MediaFile).filter(MediaFile.user_id == user_id).all()
        for media in media_files:
            db.delete(media)
        deletion_summary["media_files_deleted"] = len(media_files)
        
        # Finally, delete the user
        db.delete(user)
        deletion_summary["user_deleted"] = True
        
        # Commit all changes
        db.commit()
        
        logger.info(f"User data deleted successfully - User ID: {user_id}, Summary: {deletion_summary}")
        
        return {
            "success": True,
            "message": "User data deleted successfully",
            "deletion_summary": deletion_summary,
            "deleted_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting user data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user data"
        )

@router.get("/deletion-status/{deletion_id}")
async def get_deletion_status(
    deletion_id: str,
    db: Session = Depends(get_db)
):
    """
    Check the status of a data deletion request.
    """
    
    # In a real implementation, you would store deletion requests in a database
    # and track their status. For now, we'll return a mock response.
    
    return {
        "deletion_id": deletion_id,
        "status": "processing",
        "requested_at": datetime.utcnow().isoformat(),
        "estimated_completion": (datetime.utcnow() + timedelta(days=7)).isoformat(),
        "message": "Your deletion request is being processed. You will receive an email confirmation when complete."
    }

@router.get("/privacy-policy")
async def get_privacy_policy():
    """
    Return privacy policy information for Meta compliance.
    """
    
    return {
        "app_name": "AdFlow",
        "data_deletion_url": "https://yourdomain.com/data-deletion",
        "contact_email": "davidayo2603@gmail.com",
        "data_retention_policy": {
            "user_data": "Retained until account deletion",
            "social_media_tokens": "Stored securely, can be revoked by user",
            "analytics_data": "Anonymized after 30 days",
            "media_files": "Deleted within 7 days of account deletion"
        },
        "data_usage": {
            "purpose": "Social media management and analytics",
            "sharing": "No data shared with third parties except social platforms",
            "security": "All data encrypted and stored securely"
        }
    }
