# AdFlow Backend API

A comprehensive AI-powered social media marketing platform backend built with FastAPI.

## Features

### 🤖 AI Content Generation
- Business goal-driven content creation
- Platform-specific optimization (Instagram, Facebook, TikTok, Twitter)
- Engagement prediction algorithms
- Audience tone learning and adaptation

### 📱 Multi-Platform Social Media Management
- OAuth integration for Instagram, Facebook, TikTok
- Cross-platform posting and scheduling
- Real-time analytics and performance tracking
- Account connection management

### 📊 Intelligent Analytics Dashboard
- Comprehensive performance metrics
- Goal tracking and progress monitoring
- AI-powered insights and recommendations
- Competitive benchmarking

### 🕒 Smart Scheduling System
- Optimal timing algorithms based on platform and business goals
- Bulk scheduling with intelligent timing
- Performance-based timing recommendations
- Timezone-aware scheduling

### 🖼️ Advanced Media Management
- AI-powered brand color extraction
- Automatic platform-specific cropping
- Image quality enhancement
- Multiple format support (JPEG, PNG, WebP, MP4, MOV, AVI)

## Tech Stack

- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with bcrypt password hashing
- **File Processing**: Pillow for image manipulation
- **HTTP Client**: httpx for OAuth and API calls
- **Scheduling**: Intelligent algorithm-based timing

## Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL database
- Virtual environment (recommended)

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb adflow_db
   
   # Tables will be created automatically on first run
   ```

6. **Run the application**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Documentation

### Base URL
- Development: `http://localhost:8000`
- API Docs: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### AI Content Generation
- `POST /api/ai/generate-content` - Generate AI content for specific business goals
- `POST /api/ai/optimize-content` - Optimize existing content for platforms
- `GET /api/ai/content-suggestions` - Get content suggestions based on performance

### Media Management
- `POST /api/media/upload` - Upload and process media files
- `GET /api/media/files` - Get user's media files
- `POST /api/media/enhance/{file_id}` - Apply AI enhancement to images
- `GET /api/media/analyze/{file_id}` - Get AI analysis of media files

### Social Media Integration
- `GET /api/social/auth/{platform}` - Get OAuth authorization URL
- `POST /api/social/auth/{platform}/callback` - Handle OAuth callback
- `GET /api/social/accounts` - Get connected social media accounts
- `POST /api/social/post` - Create cross-platform post
- `GET /api/social/analytics/{platform}` - Get platform-specific analytics

### Smart Scheduling
- `POST /api/scheduler/optimize-schedule` - Generate optimal posting schedule
- `POST /api/scheduler/schedule-post` - Schedule individual post
- `GET /api/scheduler/scheduled-posts` - Get scheduled posts
- `POST /api/scheduler/bulk-schedule` - Schedule multiple posts with optimal timing
- `GET /api/scheduler/analytics/timing` - Get timing analytics

### Analytics Dashboard
- `GET /api/dashboard/overview` - Comprehensive dashboard overview
- `GET /api/dashboard/analytics` - Detailed analytics for specified period
- `GET /api/dashboard/goals-tracking` - Business goals progress tracking

## Configuration

### Environment Variables

#### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key for token encryption

#### Social Media OAuth (Optional but recommended)
- `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`, `INSTAGRAM_REDIRECT_URI`
- `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `FACEBOOK_REDIRECT_URI`
- `TIKTOK_CLIENT_ID`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`

#### Optional Features
- `OPENAI_API_KEY` - For advanced AI features
- `REDIS_URL` - For caching and session management
- `SMTP_*` - For email notifications

### Database Schema

The application uses the following main models:
- **User** - User accounts with scoring system
- **SocialAccount** - Connected social media accounts
- **Post** - Content posts with scheduling and analytics
- **MediaFile** - Uploaded media with AI analysis
- **BusinessGoal** - User-defined business objectives

## Features Deep Dive

### AI Content Generation
The AI system creates content based on:
- **Business Goals**: Sales, awareness, engagement, followers, website visits
- **Platform Optimization**: Platform-specific templates and best practices
- **Audience Analysis**: Tone learning and engagement prediction
- **Performance Data**: Historical performance optimization

### Intelligent Scheduling
The scheduling system considers:
- **Platform-specific optimal times**: Research-based posting windows
- **Business goal alignment**: Different goals prefer different times
- **User timezone**: Automatic timezone conversion
- **Performance history**: Learning from past posting success

### Social Media Integration
OAuth flows for major platforms:
- **Instagram**: Basic Display API for posting and analytics
- **Facebook**: Graph API for pages and business accounts
- **TikTok**: For Developers API for video content

### Analytics Dashboard
Comprehensive metrics including:
- **Performance Tracking**: Engagement, reach, clicks across platforms
- **Goal Monitoring**: Progress towards business objectives
- **AI Insights**: Personalized recommendations and insights
- **Competitive Analysis**: Benchmark against industry standards

## Development

### Project Structure
```
backend/
├── main.py              # FastAPI application entry point
├── database.py          # Database configuration
├── models.py           # SQLAlchemy models
├── schemas.py          # Pydantic schemas
├── requirements.txt    # Python dependencies
├── .env.example       # Environment variables template
├── routers/           # API route modules
│   ├── auth.py        # Authentication endpoints
│   ├── ai.py          # AI content generation
│   ├── media.py       # Media upload and processing
│   ├── social.py      # Social media integration
│   ├── scheduler.py   # Intelligent scheduling
│   └── dashboard.py   # Analytics dashboard
└── uploads/           # Media file storage (created automatically)
```

### Adding New Features
1. Define models in `models.py`
2. Create Pydantic schemas in `schemas.py`
3. Implement router logic in `routers/`
4. Add router to `main.py`
5. Update database migrations if needed

### Testing
```bash
# Run basic endpoint tests
python -c "import requests; print(requests.get('http://localhost:8000/health').json())"

# Test authentication
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","full_name":"Test User"}'
```

## Production Deployment

### Security Considerations
- Change `SECRET_KEY` to a strong, unique value
- Use environment variables for all sensitive configuration
- Enable HTTPS in production
- Configure CORS origins appropriately
- Implement rate limiting
- Set up proper logging and monitoring

### Performance Optimization
- Use Redis for caching and sessions
- Configure PostgreSQL connection pooling
- Implement background task processing for heavy operations
- Set up CDN for media file delivery

### Monitoring
- Health check endpoint: `GET /health`
- API documentation: `GET /api/docs`
- Application logs for debugging and monitoring

## Support

For issues, feature requests, or questions:
1. Check the API documentation at `/api/docs`
2. Review environment configuration
3. Check database connection and migrations
4. Verify OAuth credentials for social media features

## License

This project is part of the AdFlow platform - AI-powered social media marketing solution.
