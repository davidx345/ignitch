#!/usr/bin/env python3
"""Test script to check if social router can be imported without errors"""

try:
    print("Testing imports...")
    
    # Test basic imports
    from fastapi import FastAPI
    print("✅ FastAPI imported successfully")
    
    # Test database import
    from database import get_db
    print("✅ Database imported successfully")
    
    # Test models import
    from models import User, SocialAccount, Post
    print("✅ Models imported successfully")
    
    # Test schemas import
    from schemas import SocialAccountResponse, SocialAccountCreate, PostCreate
    print("✅ Schemas imported successfully")
    
    # Test auth import
    from routers.auth import get_current_user
    print("✅ Auth router imported successfully")
    
    # Test social router import
    from routers.social import router as social_router
    print("✅ Social router imported successfully")
    
    print("✅ All imports successful! Social router should work now.")
    
except Exception as e:
    print(f"❌ Import error: {e}")
    import traceback
    traceback.print_exc()
