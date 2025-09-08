"""
Database Migration Script
Creates all tables for the billboard marketplace platform
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

# Import all models
from models import Base
from models.billboard import BillboardRegistration, Billboard, User
from models.campaign import Campaign, Booking, Payment, Analytics

def get_database_url():
    """Get database URL from environment variables"""
    
    # Try to get from environment
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        # Handle Heroku postgres URL format
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        return database_url
    
    # Fallback to individual components
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "adflow_db")
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "password")
    
    return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

def create_tables():
    """Create all database tables"""
    try:
        # Get database URL
        database_url = get_database_url()
        print(f"Connecting to database...")
        
        # Create engine
        engine = create_engine(database_url, echo=True)
        
        # Create all tables
        print("Creating tables...")
        Base.metadata.create_all(bind=engine)
        
        print("✅ All tables created successfully!")
        
        # Verify tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"\n📋 Created tables:")
        for table in sorted(tables):
            print(f"  - {table}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def create_admin_user():
    """Create initial admin user"""
    try:
        database_url = get_database_url()
        engine = create_engine(database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Check if admin user exists
        admin_email = "admin@adflow.app"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            print(f"Admin user already exists: {admin_email}")
            return True
        
        # Create admin user
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        admin_user = User(
            email=admin_email,
            username="admin",
            full_name="AdFlow Administrator", 
            hashed_password=pwd_context.hash("admin123!"),
            is_admin=True,
            is_active=True,
            is_verified=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✅ Admin user created: {admin_email}")
        print(f"   Password: admin123!")
        print(f"   Please change this password immediately!")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting database migration...")
    
    # Create tables
    if create_tables():
        print("\n👤 Creating admin user...")
        create_admin_user()
        
        print("\n🎉 Database migration completed successfully!")
        print("\nNext steps:")
        print("1. Update admin password")
        print("2. Test billboard registration")
        print("3. Set up payment processing")
    else:
        print("\n❌ Database migration failed!")
        sys.exit(1)
