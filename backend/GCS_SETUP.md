# Google Cloud Storage Setup for MVP

## Quick Setup for Railway Deployment

### Step 1: Create Google Cloud Project (Free)
1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable Google Cloud Storage API

### Step 2: Create Storage Bucket
1. Go to Cloud Storage > Buckets
2. Create bucket with these settings:
   - Name: `ignitch-media-storage` (or your preferred name)
   - Region: Choose closest to your users
   - Standard storage class
   - Public access: Allow (for MVP simplicity)

### Step 3: Create Service Account
1. Go to IAM & Admin > Service Accounts
2. Create service account
3. Add role: "Storage Admin"
4. Create key (JSON format)
5. Download the JSON file

### Step 4: Railway Environment Variables
Add these to your Railway project:

```bash
# Google Cloud Storage
GCS_BUCKET_NAME=ignitch-media-storage
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project"...}
```

**Important**: Copy the entire contents of the JSON file as the value for `GCS_SERVICE_ACCOUNT_KEY`

### Alternative: Simple Setup (Local Development)
1. Install Google Cloud CLI
2. Run: `gcloud auth application-default login`
3. Set only: `GCS_BUCKET_NAME=your-bucket-name`

## Bucket Permissions (Public Access for MVP)
Run this command to make your bucket publicly readable:

```bash
gsutil iam ch allUsers:objectViewer gs://ignitch-media-storage
```

## Cost Estimate
- **Storage**: $0.02/GB/month (first 5GB free)
- **Operations**: Very low cost for MVP usage
- **Bandwidth**: Free egress to many regions

For a typical MVP with < 10GB of images: **~$0-2/month**
