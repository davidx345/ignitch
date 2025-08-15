# Supabase Authentication Setup Guide

## 1. Enable Google OAuth in Supabase Dashboard

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication → Providers**

### Step 2: Configure Google Provider
1. Click on **Google** provider
2. **Enable** the provider
3. Add your Google OAuth credentials:
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console

### Step 3: Set Redirect URLs
Add these URLs in your Google Cloud Console:
```
https://your-project.supabase.co/auth/v1/callback
https://ignitch-1ygf4xhxq-ayodele-davids-projects-96cc0cc4.vercel.app/auth/callback
```

## 2. Frontend Integration (React/Next.js)

### Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### Example Auth Component
```tsx
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Google Sign In
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })
}

// Email Sign Up
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
}

// Email Sign In
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
}
```

## 3. Environment Variables Needed

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
```

### Backend (Railway)
```
DATABASE_URL=${{ Postgres.DATABASE_URL }}
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Database Tables (Auto-created)

The app will automatically create these tables:
- **users** - User profiles and info
- **social_accounts** - Connected social media accounts
- **media_files** - Uploaded images/videos
- **posts** - Social media posts

## 5. Quick Test

Once configured, test these endpoints:
- `GET /` - Check if database is connected
- `POST /auth/signup` - Check auth endpoints
- `POST /auth/signin` - Check signin
- `GET /auth/google` - Check Google OAuth
