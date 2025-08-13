# GitHub Secrets Configuration

## Required GitHub Secrets

For the CI/CD pipeline to work properly, configure these secrets in your GitHub repository:

**Repository Settings > Secrets and variables > Actions**

### API Keys
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Production Deployment
```
PRODUCTION_HOST=your_production_server_ip
PRODUCTION_USER=deploy_user
PRODUCTION_SSH_KEY=your_private_ssh_key
PRODUCTION_ENV=complete_production_env_file_content
```

### Railway Deployment
```
RAILWAY_TOKEN=your_railway_deployment_token
```

### Performance Testing
```
K6_CLOUD_TOKEN=your_k6_cloud_token
STAGING_URL=https://your-staging-url.railway.app
```

### Notifications
```
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

## Environment File Template for PRODUCTION_ENV Secret

```env
# Database Configuration
POSTGRES_PASSWORD=your_secure_postgres_password
DATABASE_URL=postgresql://adflow_user:password@db:5432/adflow

# Redis Configuration  
REDIS_PASSWORD=your_secure_redis_password
REDIS_URL=redis://:password@redis:6379/0

# Application Security
SECRET_KEY=your_super_secret_jwt_key_minimum_32_characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Keys
OPENAI_API_KEY=your_openai_api_key
FACEBOOK_ACCESS_TOKEN=your_facebook_token
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TIKTOK_ACCESS_TOKEN=your_tiktok_token

# Application Settings
ENVIRONMENT=production
LOG_LEVEL=info
MAX_UPLOAD_SIZE=10485760
MAX_BULK_FILES=50
RATE_LIMIT_PER_HOUR=100
```

## SSH Key Setup for Production Deployment

1. Generate SSH key pair:
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy"
```

2. Add public key to production server:
```bash
# On production server
echo "your_public_key_content" >> ~/.ssh/authorized_keys
```

3. Add private key content to GitHub secret `PRODUCTION_SSH_KEY`

## Railway Token Setup

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and get token:
```bash
railway login
railway whoami --token
```

3. Add token to GitHub secret `RAILWAY_TOKEN`
