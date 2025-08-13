# AdFlow Production Deployment Guide

## 🚀 Production-Ready Architecture

This comprehensive guide covers deploying AdFlow with multiple options:
- **Option 1**: Docker Compose (VPS/Self-hosted) - **Recommended for full control**
- **Option 2**: Railway + Supabase (Cloud-native)
- **Option 3**: AWS/GCP/Azure (Enterprise)

## 📋 Prerequisites

- Docker and Docker Compose installed
- Domain name (for SSL/HTTPS)
- API keys for social media platforms
- PostgreSQL and Redis (or use containerized versions)

## 🏗️ Architecture Overview

### Production Docker Stack
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Nginx     │    │  Frontend   │    │   Backend   │
│ (Port 80)   │────│ (Port 3000) │────│ (Port 8000) │
│ Load Balancer│    │  Next.js    │    │   FastAPI   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                                      │
       │            ┌─────────────┐          │
       │            │   Redis     │          │
       └────────────│ (Port 6379) │──────────│
                    │ Rate Limiting│          │
                    └─────────────┘          │
                                             │
                            ┌─────────────┐  │
                            │ PostgreSQL  │  │
                            │ (Port 5432) │──┘
                            │  Database   │
                            └─────────────┘
```

## � Option 1: Docker Compose Deployment (Recommended)

### 1. Environment Setup

```bash
# Clone and navigate to project
git clone <your-repo>
cd adflow

# Copy environment template
cp .env.example .env

# Edit .env with your actual values
nano .env  # or your preferred editor
```

### 2. Build and Deploy

```bash
# Build and start all services
docker-compose up -d

# Check service health
docker-compose ps
docker-compose logs -f
```

### 3. Initialize Database

```bash
# Run database migrations (if needed)
docker-compose exec backend python -c "
from database import engine, Base
Base.metadata.create_all(bind=engine)
print('Database initialized successfully')
"
```

### Production Features Included

#### ✅ Bulk Photo Upload System
- **Frontend**: Enhanced dropzone with real-time progress tracking
- **Backend**: Concurrent processing of up to 50 files simultaneously
- **AI Integration**: Automatic metadata extraction, brand color detection
- **Validation**: File type verification, size limits, duplicate detection

#### ✅ Production Middleware Stack
- **Rate Limiting**: Redis-backed sliding window (100 req/hour per IP)
- **Error Handling**: Structured logging with categorization and monitoring hooks
- **Health Checks**: Comprehensive service monitoring endpoints
- **CORS**: Properly configured for frontend integration

#### ✅ Enterprise Security
- **Non-root containers**: Security-hardened Docker images
- **JWT Authentication**: Secure token-based auth with refresh tokens
- **File Upload Security**: Type validation, size limits, virus scanning
- **API Protection**: Rate limiting, input validation, SQL injection prevention

## 🔐 Security Configuration

### Environment Variables (.env)
```bash
# Database Configuration
POSTGRES_PASSWORD=your_secure_postgres_password_here
DATABASE_URL=postgresql://adflow_user:your_secure_postgres_password_here@localhost:5432/adflow

# Redis Configuration
REDIS_PASSWORD=your_secure_redis_password_here
REDIS_URL=redis://:your_secure_redis_password_here@localhost:6379/0

# Application Security
SECRET_KEY=your_super_secret_jwt_key_minimum_32_characters_long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Social Media APIs
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token_here

# Application Settings
ENVIRONMENT=production
MAX_UPLOAD_SIZE=10485760  # 10MB
MAX_BULK_FILES=50
RATE_LIMIT_PER_HOUR=100
```

### Rate Limiting Configuration
- **API endpoints**: 100 requests/hour per IP
- **Upload endpoints**: 2 requests/second per IP  
- **Bulk uploads**: 50 files maximum per request
- **Burst protection**: 10 request burst allowance

## 📊 Monitoring & Health Checks

### Service Health Monitoring
```bash
# Check all service health
curl http://localhost/health

# Individual service checks
curl http://localhost:8000/health  # Backend
curl http://localhost:3000         # Frontend

# Database health
docker-compose exec db pg_isready -U adflow_user

# Redis health  
docker-compose exec redis redis-cli ping
```

### Performance Monitoring
```bash
# Container resource usage
docker stats

# Application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Database performance
docker-compose exec db psql -U adflow_user -d adflow -c "
SELECT schemaname,tablename,attname,n_distinct,correlation 
FROM pg_stats WHERE schemaname='public';"
```

## 🔧 Production Optimizations

### Backend Performance
- **Gunicorn**: 4 worker processes for concurrent request handling
- **Connection Pooling**: Optimized database connections
- **Async Processing**: Background tasks for file uploads and AI processing
- **Caching**: Redis-based caching for session data and rate limits

### Frontend Performance  
- **Static Generation**: Optimized Next.js build with static exports
- **Image Optimization**: WebP conversion and compression
- **Code Splitting**: Automatic bundle optimization
- **CDN Ready**: Static assets optimized for CDN delivery

### Database Optimizations
- **Indexing**: Optimized indexes for common queries
- **Connection Limits**: Proper connection pool management
- **Health Checks**: Automatic failover and recovery
- **Backup Strategy**: Automated daily backups

## 🚀 Option 2: Railway + Supabase (Cloud)

### Railway Project Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Supabase Configuration
- **Authentication**: Built-in user management
- **Database**: Managed PostgreSQL with realtime
- **Storage**: File upload and management
- **Edge Functions**: Serverless API endpoints

### Cost Estimation (1000 Users)
- **Railway Pro**: $20/month
- **Supabase Pro**: $25/month  
- **Total**: ~$45/month for 1000+ users

## 🎯 Option 3: Enterprise Cloud Deployment

### AWS ECS + RDS
- **Compute**: Elastic Container Service
- **Database**: RDS PostgreSQL with Multi-AZ
- **Cache**: ElastiCache Redis
- **Storage**: S3 for media files
- **CDN**: CloudFront distribution

### Google Cloud Run + Cloud SQL
- **Compute**: Fully managed containers
- **Database**: Cloud SQL PostgreSQL  
- **Cache**: Memorystore Redis
- **Storage**: Cloud Storage
- **CDN**: Cloud CDN

## 🛠️ Maintenance & Operations

### Database Backups
```bash
# Automated backup script
docker-compose exec db pg_dump -U adflow_user adflow > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker-compose exec -i db psql -U adflow_user adflow < backup_20241201_120000.sql
```

### Updates and Rollbacks
```bash
# Update application
git pull origin main
docker-compose down
docker-compose build --no-cache  
docker-compose up -d

# Rollback if needed
git checkout previous-commit
docker-compose down
docker-compose build
docker-compose up -d
```

### Log Management
```bash
# View application logs
docker-compose logs -f --tail=100

# Log rotation (add to crontab)
0 0 * * * docker-compose exec backend find /app/logs -name "*.log" -mtime +7 -delete
```

## 🚨 Troubleshooting Guide

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :8000
   sudo systemctl stop apache2  # if conflicting
   ```

2. **Permission Errors**
   ```bash
   # Fix upload permissions
   sudo chown -R 1001:1001 backend/uploads
   chmod 755 backend/uploads
   ```

3. **Database Connection Issues**
   ```bash
   # Reset database
   docker-compose down -v
   docker-compose up db -d
   docker-compose logs db
   ```

4. **Memory Issues**
   ```bash
   # Increase Docker memory
   # Edit docker-compose.yml:
   deploy:
     resources:
       limits:
         memory: 2G
         cpus: '1.0'
   ```

### Performance Issues
1. **Slow file uploads**: Check disk space and network bandwidth
2. **High CPU usage**: Monitor worker processes and optimize queries
3. **Memory leaks**: Restart services and check logs for errors
4. **Database locks**: Monitor slow queries and optimize indexes

## 📈 Scaling Strategies

### Horizontal Scaling
```yaml
# docker-compose.yml scaling
services:
  backend:
    deploy:
      replicas: 3
    environment:
      - WORKERS=2
      
  frontend:
    deploy:
      replicas: 2
```

### Load Balancing
- **Nginx**: Round-robin load balancing
- **Health Checks**: Automatic failover for unhealthy instances
- **Session Affinity**: Redis-based session storage

### Database Scaling
- **Read Replicas**: For analytics and reporting
- **Connection Pooling**: PgBouncer for connection management
- **Partitioning**: Table partitioning for large datasets

## ✅ Production Checklist

### Security
- [ ] Environment variables configured securely
- [ ] SSL certificates installed and configured
- [ ] API keys obtained and tested
- [ ] Rate limiting enabled and tested
- [ ] File upload validation working
- [ ] Database access properly restricted
- [ ] Firewall rules configured

### Performance  
- [ ] Health checks responding correctly
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] CDN configured for static assets
- [ ] Database indexes optimized

### Features
- [ ] Bulk photo upload tested (50 files)
- [ ] AI metadata extraction working
- [ ] Social media integrations tested
- [ ] Rate limiting enforced
- [ ] Error handling comprehensive
- [ ] User authentication functional

### Operations
- [ ] Domain DNS configured
- [ ] Monitoring alerts set up
- [ ] Log rotation configured
- [ ] Backup verification completed
- [ ] Update/rollback procedures tested
- [ ] Documentation updated

## � Support & Resources

### Documentation
- [FastAPI Production Guide](https://fastapi.tiangolo.com/deployment/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Compose Production](https://docs.docker.com/compose/production/)

### Community Support
- **Railway Discord**: Active community support
- **Supabase Discord**: Developer community
- **Docker Forums**: Container deployment help

---

**🎉 Your AdFlow production deployment is now complete!**

- **Application**: `http://your-domain.com`
- **Admin Dashboard**: `http://your-domain.com/dashboard`  
- **API Documentation**: `http://your-domain.com/api/docs`
- **Health Status**: `http://your-domain.com/health`

**Production Features Active:**
✅ Bulk photo upload (50 files)  
✅ AI-powered metadata extraction  
✅ Rate limiting (100 req/hour)  
✅ Error handling & monitoring  
✅ Social media integrations  
✅ Secure authentication  
✅ High availability setup

## 🚀 Performance Optimizations

1. **Railway Scaling**
   - Auto-scaling enabled by default
   - Multi-region deployment available

2. **Database Optimization**
   - Connection pooling with pgBouncer
   - Database indexes for common queries
   - Read replicas for analytics

3. **CDN & Caching**
   - Railway provides automatic CDN
   - Implement Redis for session caching

## 📊 Monitoring & Analytics

1. **Railway Metrics**
   - Built-in performance monitoring
   - Custom metrics dashboard
   - Log aggregation

2. **Supabase Analytics**
   - User authentication metrics
   - Database performance
   - API usage tracking

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use Railway's built-in secrets management

2. **CORS Configuration**
   ```python
   # In your FastAPI backend
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-frontend-domain.railway.app"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Rate Limiting**
   - Implement API rate limiting
   - Use Supabase Edge Functions for additional security

## 🎯 Next Steps After Deployment

1. **Domain Setup**
   - Configure custom domain in Railway
   - Set up SSL certificates (automatic)

2. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure uptime monitoring

3. **Backup Strategy**
   - Regular database backups
   - Media file backup strategy

## 📞 Support Resources

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Discord Communities**: Both platforms have active Discord servers

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Update CORS origins in backend
   - Verify environment variables

2. **Database Connection**
   - Check DATABASE_URL format
   - Verify Railway PostgreSQL service status

3. **Authentication Issues**
   - Verify Supabase keys
   - Check RLS policies

4. **Build Failures**
   - Check build logs in Railway dashboard
   - Verify package.json dependencies

This architecture will easily handle 1000+ users with room to scale to 10,000+ users as your platform grows!
