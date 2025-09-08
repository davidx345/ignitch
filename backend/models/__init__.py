"""
Database Models Module
Centralized import for all database models
"""

# Import base from billboard models (primary base)
from .billboard import Base

# Import all models
from .billboard import (
    BillboardRegistration,
    Billboard, 
    User,
    BillboardStatus,
    BillboardType
)

from .campaign import (
    Campaign,
    Booking,
    Payment, 
    Analytics,
    CampaignStatus,
    BookingStatus,
    PaymentStatus
)

# Export everything for easy imports
__all__ = [
    # Base
    "Base",
    
    # Billboard models
    "BillboardRegistration",
    "Billboard",
    "User", 
    
    # Campaign models
    "Campaign",
    "Booking",
    "Payment",
    "Analytics",
    
    # Enums
    "BillboardStatus",
    "BillboardType", 
    "CampaignStatus",
    "BookingStatus",
    "PaymentStatus"
]
