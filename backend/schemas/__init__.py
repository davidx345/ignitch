# Import all schemas from the main schemas module
import sys
import os

# Add the parent directory to the path to import from schemas.py
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

try:
    from schemas import *
except ImportError:
    # Fallback - define minimal schemas to prevent import errors
    from pydantic import BaseModel
    
    class Token(BaseModel):
        access_token: str
        token_type: str
    
    class UserBase(BaseModel):
        email: str
    
    class UserCreate(UserBase):
        password: str
        full_name: str = None
    
    class UserResponse(UserBase):
        id: int
        full_name: str = None
        is_active: bool = True
        created_at: str = None
        
        class Config:
            from_attributes = True