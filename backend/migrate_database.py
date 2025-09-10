"""
Database Migration - Add missing fields and fix schema
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float, JSON
from database import engine, Base
import logging

logger = logging.getLogger(__name__)

def migrate_database():
    """Run database migrations to add missing fields"""
    
    try:
        logger.info("🔄 Starting database migration...")
        
        # Create all tables with updated schema
        Base.metadata.create_all(bind=engine)
        
        logger.info("✅ Database migration completed successfully!")
        
        # Log tables created
        inspector = engine.inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"📊 Database tables: {', '.join(tables)}")
        
    except Exception as e:
        logger.error(f"❌ Database migration failed: {str(e)}")
        raise e

if __name__ == "__main__":
    migrate_database()
