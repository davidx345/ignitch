"""
Campaign Management Router
Handles campaign creation, scheduling, and management
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, validator
from datetime import datetime, timedelta
import uuid

from database import get_db
from models import Campaign, Billboard, Booking, CampaignStatus, BookingStatus
from auth_enhanced import get_current_active_user
from services.content_delivery import content_delivery_service
from services.billboard_websocket import billboard_ws_manager

router = APIRouter(prefix="/campaigns", tags=["Campaign Management"])

# Request/Response Models
class CampaignCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    brand_name: Optional[str] = None
    billboard_id: str
    start_date: datetime
    end_date: datetime
    special_instructions: Optional[str] = None
    
    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('End date must be after start date')
        return v
    
    @validator('start_date')
    def start_date_must_be_future(cls, v):
        if v <= datetime.utcnow():
            raise ValueError('Start date must be in the future')
        return v

class CampaignResponse(BaseModel):
    id: int
    campaign_id: str
    title: str
    description: Optional[str]
    brand_name: Optional[str]
    billboard_id: str
    billboard_name: str
    start_date: datetime
    end_date: datetime
    duration_days: int
    status: str
    total_amount: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class CampaignDetailResponse(CampaignResponse):
    creative_urls: Optional[List[Dict]] = []
    special_instructions: Optional[str]
    daily_rate: float
    platform_fee: float
    owner_payout: float
    estimated_impressions: Optional[int]
    total_impressions: int
    deployed_at: Optional[datetime]

@router.post("/create", response_model=Dict[str, Any])
async def create_campaign(
    campaign_data: CampaignCreateRequest,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new advertising campaign"""
    
    # Validate billboard exists and is available
    billboard = db.query(Billboard).filter(
        Billboard.billboard_id == campaign_data.billboard_id
    ).first()
    
    if not billboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billboard not found"
        )
    
    # Check billboard availability for the requested dates
    conflicting_bookings = db.query(Booking).filter(
        Booking.billboard_id == billboard.id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.ACTIVE]),
        Booking.start_date < campaign_data.end_date,
        Booking.end_date > campaign_data.start_date
    ).all()
    
    if conflicting_bookings:
        conflict_dates = [
            f"{booking.start_date.date()} to {booking.end_date.date()}" 
            for booking in conflicting_bookings
        ]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Billboard not available. Conflicts with: {', '.join(conflict_dates)}"
        )
    
    try:
        # Calculate pricing
        duration_days = (campaign_data.end_date - campaign_data.start_date).days
        daily_rate = billboard.daily_rate
        subtotal = daily_rate * duration_days
        platform_fee = subtotal * 0.2  # 20% platform fee
        total_amount = subtotal + platform_fee
        owner_payout = subtotal * 0.8  # 80% to billboard owner
        
        # Generate campaign ID
        campaign_id = f"CAMP_{str(uuid.uuid4())[:8].upper()}"
        
        # Create campaign
        new_campaign = Campaign(
            campaign_id=campaign_id,
            advertiser_id=current_user.id,
            billboard_id=billboard.id,
            title=campaign_data.title,
            description=campaign_data.description,
            brand_name=campaign_data.brand_name,
            start_date=campaign_data.start_date,
            end_date=campaign_data.end_date,
            duration_days=duration_days,
            daily_rate=daily_rate,
            total_amount=total_amount,
            platform_fee=platform_fee,
            owner_payout=owner_payout,
            estimated_impressions=billboard.daily_impressions * duration_days if billboard.daily_impressions else None,
            special_instructions=campaign_data.special_instructions,
            status=CampaignStatus.DRAFT
        )
        
        db.add(new_campaign)
        db.commit()
        db.refresh(new_campaign)
        
        return {
            "success": True,
            "campaign_id": campaign_id,
            "message": "Campaign created successfully. Upload media files to proceed.",
            "next_step": "upload_media",
            "pricing": {
                "daily_rate": daily_rate,
                "duration_days": duration_days,
                "subtotal": subtotal,
                "platform_fee": platform_fee,
                "total_amount": total_amount
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create campaign: {str(e)}"
        )

@router.post("/{campaign_id}/upload-media")
async def upload_campaign_media(
    campaign_id: str,
    files: List[UploadFile] = File(...),
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload media files for a campaign"""
    
    # Get campaign
    campaign = db.query(Campaign).filter(
        Campaign.campaign_id == campaign_id,
        Campaign.advertiser_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign.status != CampaignStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Media can only be uploaded to draft campaigns"
        )
    
    try:
        # Process and upload media files
        processed_media = await content_delivery_service.upload_campaign_media(
            files, campaign_id
        )
        
        # Update campaign with media URLs
        campaign.creative_urls = processed_media
        campaign.content_type = "mixed" if len(processed_media) > 1 else processed_media[0]["media_type"]
        campaign.status = CampaignStatus.PENDING_APPROVAL
        
        db.commit()
        
        return {
            "success": True,
            "message": "Media uploaded successfully. Campaign submitted for approval.",
            "media_files": len(processed_media),
            "status": "pending_approval"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload media: {str(e)}"
        )

@router.get("/", response_model=List[CampaignResponse])
async def get_user_campaigns(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's campaigns"""
    
    query = db.query(Campaign).filter(Campaign.advertiser_id == current_user.id)
    
    # Filter by status if provided
    if status:
        try:
            status_enum = CampaignStatus(status)
            query = query.filter(Campaign.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}"
            )
    
    # Join with Billboard to get billboard name
    campaigns = query.join(Billboard).offset(skip).limit(limit).all()
    
    # Convert to response format
    result = []
    for campaign in campaigns:
        result.append(CampaignResponse(
            id=campaign.id,
            campaign_id=campaign.campaign_id,
            title=campaign.title,
            description=campaign.description,
            brand_name=campaign.brand_name,
            billboard_id=campaign.billboard.billboard_id,
            billboard_name=campaign.billboard.name,
            start_date=campaign.start_date,
            end_date=campaign.end_date,
            duration_days=campaign.duration_days,
            status=campaign.status.value,
            total_amount=campaign.total_amount,
            created_at=campaign.created_at
        ))
    
    return result

@router.get("/{campaign_id}", response_model=CampaignDetailResponse)
async def get_campaign_details(
    campaign_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get detailed campaign information"""
    
    campaign = db.query(Campaign).filter(
        Campaign.campaign_id == campaign_id,
        Campaign.advertiser_id == current_user.id
    ).join(Billboard).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return CampaignDetailResponse(
        id=campaign.id,
        campaign_id=campaign.campaign_id,
        title=campaign.title,
        description=campaign.description,
        brand_name=campaign.brand_name,
        billboard_id=campaign.billboard.billboard_id,
        billboard_name=campaign.billboard.name,
        start_date=campaign.start_date,
        end_date=campaign.end_date,
        duration_days=campaign.duration_days,
        status=campaign.status.value,
        total_amount=campaign.total_amount,
        created_at=campaign.created_at,
        creative_urls=campaign.creative_urls or [],
        special_instructions=campaign.special_instructions,
        daily_rate=campaign.daily_rate,
        platform_fee=campaign.platform_fee,
        owner_payout=campaign.owner_payout,
        estimated_impressions=campaign.estimated_impressions,
        total_impressions=campaign.total_impressions,
        deployed_at=campaign.deployed_at
    )

@router.put("/{campaign_id}/update")
async def update_campaign(
    campaign_id: str,
    update_data: Dict[str, Any],
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update campaign details (only for draft campaigns)"""
    
    campaign = db.query(Campaign).filter(
        Campaign.campaign_id == campaign_id,
        Campaign.advertiser_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign.status != CampaignStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft campaigns can be updated"
        )
    
    try:
        # Update allowed fields
        allowed_fields = ['title', 'description', 'brand_name', 'special_instructions']
        
        for field, value in update_data.items():
            if field in allowed_fields:
                setattr(campaign, field, value)
        
        campaign.updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "message": "Campaign updated successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update campaign: {str(e)}"
        )

@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete campaign (only draft campaigns)"""
    
    campaign = db.query(Campaign).filter(
        Campaign.campaign_id == campaign_id,
        Campaign.advertiser_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    if campaign.status not in [CampaignStatus.DRAFT, CampaignStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft or cancelled campaigns can be deleted"
        )
    
    try:
        db.delete(campaign)
        db.commit()
        
        return {
            "success": True,
            "message": "Campaign deleted successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete campaign: {str(e)}"
        )
