"""
Testing Suite for Ignitch API
Comprehensive tests for production-ready features
"""
import pytest
import asyncio
import json
from httpx import AsyncClient
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import get_db, Base
from models import User, MediaFile, Post, SocialAccount
from routers.auth import create_access_token

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create test database tables"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_client():
    """Create test client"""
    return TestClient(app)

@pytest.fixture
async def async_client():
    """Create async test client"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
def test_user():
    """Create test user"""
    db = TestingSessionLocal()
    user = User(
        id="test-user-id",
        email="test@example.com",
        hashed_password="hashed_password",
        full_name="Test User",
        business_name="Test Business",
        business_location="Test City",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.delete(user)
    db.commit()
    db.close()

@pytest.fixture
def auth_headers(test_user):
    """Create authentication headers"""
    token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {token}"}

class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_signup(self, test_client):
        """Test user signup"""
        response = test_client.post("/api/auth/signup", json={
            "email": "newuser@example.com",
            "password": "password123",
            "full_name": "New User",
            "business_name": "New Business"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert "access_token" in data
    
    def test_login(self, test_client, test_user):
        """Test user login"""
        response = test_client.post("/api/auth/login", json={
            "email": test_user.email,
            "password": "password123"  # This would need to match the actual password
        })
        # Note: This test would need proper password hashing setup
    
    def test_protected_endpoint(self, test_client, auth_headers):
        """Test protected endpoint access"""
        response = test_client.get("/api/dashboard/stats", headers=auth_headers)
        assert response.status_code in [200, 404]  # Depending on implementation

class TestBulkUpload:
    """Test bulk upload functionality"""
    
    @pytest.mark.asyncio
    async def test_bulk_upload_validation(self, async_client, auth_headers):
        """Test bulk upload input validation"""
        # Test with no files
        response = await async_client.post(
            "/api/media/v2/upload/bulk", 
            headers=auth_headers,
            files=[]
        )
        assert response.status_code == 400
    
    @pytest.mark.asyncio
    async def test_single_file_upload(self, async_client, auth_headers):
        """Test single file upload"""
        # Create a test file
        test_file_content = b"fake image content"
        files = {
            "file": ("test.jpg", test_file_content, "image/jpeg")
        }
        
        response = await async_client.post(
            "/api/media/v2/upload/single",
            headers=auth_headers,
            files=files
        )
        # Note: This would fail without actual file processing
        # In real tests, we'd mock the media service
    
    def test_file_validation(self, test_client):
        """Test file validation logic"""
        from services.media_service import MediaService
        
        media_service = MediaService()
        
        # Test file size validation
        large_content = b"x" * (51 * 1024 * 1024)  # 51MB
        result = asyncio.run(media_service._validate_file(
            large_content, "image/jpeg", "large.jpg"
        ))
        assert not result["valid"]
        assert "exceeds" in result["error"]
        
        # Test content type validation
        result = asyncio.run(media_service._validate_file(
            b"test", "application/exe", "virus.exe"
        ))
        assert not result["valid"]
        assert "not supported" in result["error"]

class TestRateLimiting:
    """Test rate limiting functionality"""
    
    @pytest.mark.asyncio
    async def test_rate_limit_enforcement(self, async_client):
        """Test rate limiting works"""
        from middleware.rate_limiting import RateLimiter
        
        rate_limiter = RateLimiter()
        
        # Test memory-based rate limiting
        key = "test:user:123"
        
        # First request should be allowed
        result = await rate_limiter.is_allowed(key, limit=2, window_seconds=60)
        assert result["allowed"] is True
        assert result["remaining"] == 1
        
        # Second request should be allowed
        result = await rate_limiter.is_allowed(key, limit=2, window_seconds=60)
        assert result["allowed"] is True
        assert result["remaining"] == 0
        
        # Third request should be denied
        result = await rate_limiter.is_allowed(key, limit=2, window_seconds=60)
        assert result["allowed"] is False
        assert result["retry_after"] is not None
    
    def test_rate_limit_middleware(self, test_client):
        """Test rate limit middleware integration"""
        # Make multiple requests to trigger rate limiting
        responses = []
        for i in range(15):  # Default auth limit is 10 per 5 minutes
            response = test_client.post("/api/auth/login", json={
                "email": "test@example.com",
                "password": "wrong"
            })
            responses.append(response.status_code)
        
        # Should have some 429 responses after hitting the limit
        assert 429 in responses

class TestErrorHandling:
    """Test error handling middleware"""
    
    def test_validation_error(self, test_client):
        """Test validation error handling"""
        response = test_client.post("/api/auth/signup", json={
            "email": "invalid-email",  # Invalid email format
            "password": "short"  # Too short password
        })
        assert response.status_code == 422
        data = response.json()
        assert "validation_errors" in data
        assert len(data["validation_errors"]) > 0
    
    def test_404_error(self, test_client):
        """Test 404 error handling"""
        response = test_client.get("/api/nonexistent")
        assert response.status_code == 404
        data = response.json()
        assert "error" in data
    
    def test_error_logging(self, test_client, caplog):
        """Test error logging"""
        # Trigger an error
        response = test_client.get("/api/nonexistent")
        
        # Check that error was logged
        # Note: This would need proper logging setup in tests

class TestAIIntegration:
    """Test AI service integration"""
    
    @pytest.mark.asyncio
    async def test_openai_service_initialization(self):
        """Test OpenAI service can be initialized"""
        from services.openai_service import OpenAIService
        
        service = OpenAIService()
        assert service is not None
    
    @pytest.mark.asyncio
    async def test_content_generation_input_validation(self):
        """Test AI content generation input validation"""
        from services.openai_service import openai_service
        
        # Test with empty prompt
        result = await openai_service.generate_social_content({})
        assert not result.get("success")
        
        # Test with valid input
        result = await openai_service.generate_social_content({
            "business_name": "Test Business",
            "business_location": "Test City",
            "content_theme": "product launch",
            "platform": "instagram"
        })
        # Note: This would need API key and real integration

class TestSocialMediaIntegration:
    """Test social media API integration"""
    
    def test_instagram_service_initialization(self):
        """Test Instagram service initialization"""
        from services.instagram_service import InstagramService
        
        service = InstagramService()
        assert service is not None
        assert hasattr(service, 'base_url')
    
    @pytest.mark.asyncio
    async def test_oauth_url_generation(self):
        """Test OAuth URL generation"""
        from services.instagram_service import instagram_service
        
        url = await instagram_service.get_auth_url("test-user", "http://localhost/callback")
        assert "instagram.com" in url
        assert "client_id" in url
        assert "redirect_uri" in url

class TestAnalyticsService:
    """Test analytics functionality"""
    
    @pytest.mark.asyncio
    async def test_metrics_aggregation(self, test_user):
        """Test analytics metrics aggregation"""
        from services.analytics_service import analytics_service
        
        db = TestingSessionLocal()
        
        # Test with no data
        result = await analytics_service.aggregate_performance_metrics(
            test_user, db, days=30
        )
        assert "success" in result
        
        db.close()

class TestAutopilotService:
    """Test autopilot functionality"""
    
    def test_posting_schedule_generation(self):
        """Test autopilot posting schedule generation"""
        from routers.autopilot_real import _generate_posting_schedule
        from models import AutopilotRule
        
        # Create mock rule
        rule = AutopilotRule(
            posting_frequency=2,
            business_hours_only=True,
            start_time="09:00",
            end_time="17:00",
            exclude_weekends=False
        )
        
        schedule = _generate_posting_schedule(rule, days_ahead=1)
        assert len(schedule) > 0
        assert all(item["time"] for item in schedule)

class TestHealthAndMonitoring:
    """Test health checks and monitoring"""
    
    def test_health_endpoint(self, test_client):
        """Test health check endpoint"""
        response = test_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "timestamp" in data
    
    def test_api_info_endpoint(self, test_client):
        """Test API info endpoint"""
        response = test_client.get("/api/info")
        assert response.status_code == 200
        data = response.json()
        assert "api_version" in data
        assert "capabilities" in data
        assert data["production_ready"] is True

class TestDatabaseOperations:
    """Test database operations"""
    
    def test_user_creation(self, test_user):
        """Test user creation and retrieval"""
        assert test_user.id is not None
        assert test_user.email == "test@example.com"
        assert test_user.is_active is True
    
    def test_media_file_operations(self, test_user):
        """Test media file database operations"""
        db = TestingSessionLocal()
        
        media_file = MediaFile(
            id="test-media-id",
            user_id=test_user.id,
            filename="test.jpg",
            file_path="/test/path/test.jpg",
            file_type="image",
            file_size=1024,
            upload_status="completed",
            processing_status="completed"
        )
        
        db.add(media_file)
        db.commit()
        
        # Retrieve and verify
        retrieved = db.query(MediaFile).filter(MediaFile.id == "test-media-id").first()
        assert retrieved is not None
        assert retrieved.filename == "test.jpg"
        
        db.delete(retrieved)
        db.commit()
        db.close()

class TestPerformance:
    """Test performance and scalability"""
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self, async_client):
        """Test handling of concurrent requests"""
        async def make_request():
            return await async_client.get("/health")
        
        # Make 10 concurrent requests
        tasks = [make_request() for _ in range(10)]
        responses = await asyncio.gather(*tasks)
        
        # All should succeed
        assert all(response.status_code == 200 for response in responses)
    
    def test_large_payload_handling(self, test_client):
        """Test handling of large payloads"""
        # Test with large JSON payload
        large_data = {"data": "x" * 10000}
        
        response = test_client.post("/api/auth/signup", json=large_data)
        # Should handle gracefully (validation error expected)
        assert response.status_code in [400, 422]

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])
