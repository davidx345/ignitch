/**
 * Shared Types for AdFlow Social Media Management
 * Used across frontend and backend components
 */

// Platform Types
export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'linkedin' | 'youtube'

export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'pending_approval' | 'approved' | 'rejected'

export type BusinessGoal = 'sales' | 'engagement' | 'awareness' | 'followers' | 'website_visits' | 'brand_building'

export type ContentType = 'text' | 'image' | 'video' | 'carousel' | 'story' | 'reel'

// Core Content Interface
export interface SocialContent {
  id: string
  user_id: string
  title?: string
  content: string
  platforms: SocialPlatform[]
  content_type: ContentType
  status: ContentStatus
  scheduled_for?: Date
  published_at?: Date
  created_at: Date
  updated_at: Date
  
  // Media
  media_urls: string[]
  thumbnail_url?: string
  
  // Metadata
  hashtags: string[]
  mentions: string[]
  business_goal: BusinessGoal
  ai_generated: boolean
  ai_prompt?: string
  
  // Performance
  engagement_score?: number
  predicted_reach?: number
  actual_performance?: ContentPerformance
  
  // Approval
  approval_status?: 'pending' | 'approved' | 'rejected'
  approval_notes?: string
  approved_by?: string
  approved_at?: Date
}

// Performance Metrics
export interface ContentPerformance {
  platform: SocialPlatform
  content_id: string
  likes: number
  comments: number
  shares: number
  views: number
  clicks: number
  reach: number
  impressions: number
  engagement_rate: number
  click_through_rate: number
  cost_per_engagement?: number
  revenue_attributed?: number
  measured_at: Date
}

// Content Templates
export interface ContentTemplate {
  id: string
  name: string
  description: string
  category: string
  template_content: string
  hashtag_suggestions: string[]
  platforms: SocialPlatform[]
  business_goal: BusinessGoal
  is_premium: boolean
  usage_count: number
  created_by: 'system' | 'user'
}

// Automation Rules
export interface AutomationRule {
  id: string
  user_id: string
  name: string
  description: string
  is_active: boolean
  
  // Trigger
  trigger_type: 'schedule' | 'rss' | 'ecommerce' | 'manual' | 'performance_based'
  trigger_config: AutomationTriggerConfig
  
  // Action
  action_type: 'generate_content' | 'repost' | 'schedule' | 'cross_post'
  action_config: AutomationActionConfig
  
  // Targeting
  platforms: SocialPlatform[]
  business_goal: BusinessGoal
  
  // Limits
  max_executions_per_day?: number
  max_executions_total?: number
  executions_count: number
  
  // Timing
  created_at: Date
  last_executed_at?: Date
  next_execution_at?: Date
}

// Automation Configuration Types
export interface AutomationTriggerConfig {
  // Schedule-based
  schedule_pattern?: string // cron pattern
  timezone?: string
  
  // RSS-based
  rss_url?: string
  keywords?: string[]
  
  // E-commerce based
  ecommerce_platform?: 'shopify' | 'woocommerce' | 'bigcommerce'
  webhook_url?: string
  product_categories?: string[]
  
  // Performance-based
  performance_threshold?: {
    metric: 'engagement_rate' | 'reach' | 'clicks'
    value: number
    comparison: 'greater_than' | 'less_than'
  }
}

export interface AutomationActionConfig {
  // Content generation
  ai_prompt_template?: string
  content_template_id?: string
  
  // Reposting
  original_content_filter?: {
    min_engagement_rate?: number
    max_age_days?: number
    platforms?: SocialPlatform[]
  }
  
  // Scheduling
  posting_schedule?: {
    days_of_week: number[] // 0-6 (Sunday-Saturday)
    times: string[] // HH:MM format
    timezone: string
  }
}

// Analytics and Insights
export interface SocialAnalytics {
  user_id: string
  date_range: {
    start_date: Date
    end_date: Date
  }
  
  // Overall metrics
  total_posts: number
  total_engagement: number
  total_reach: number
  total_clicks: number
  average_engagement_rate: number
  
  // Platform breakdown
  platform_metrics: PlatformMetrics[]
  
  // Goal performance
  goal_performance: GoalPerformance[]
  
  // Top performing content
  top_content: SocialContent[]
  
  // Trends
  engagement_trend: TrendData[]
  reach_trend: TrendData[]
  
  // Recommendations
  recommendations: AnalyticsRecommendation[]
}

export interface PlatformMetrics {
  platform: SocialPlatform
  posts_count: number
  total_engagement: number
  avg_engagement_rate: number
  total_reach: number
  total_clicks: number
  follower_growth: number
  best_posting_time: string
}

export interface GoalPerformance {
  business_goal: BusinessGoal
  posts_count: number
  success_rate: number
  avg_performance_score: number
  goal_specific_metrics: Record<string, number>
}

export interface TrendData {
  date: Date
  value: number
  change_percentage: number
}

export interface AnalyticsRecommendation {
  type: 'posting_time' | 'content_type' | 'hashtag' | 'platform_focus'
  title: string
  description: string
  impact_level: 'low' | 'medium' | 'high'
  action_required: string
}

// Platform Connection
export interface PlatformConnection {
  id: string
  user_id: string
  platform: SocialPlatform
  platform_user_id: string
  platform_username: string
  access_token: string
  refresh_token?: string
  token_expires_at?: Date
  is_active: boolean
  permissions: string[]
  connected_at: Date
  last_sync_at?: Date
  
  // Platform-specific data
  profile_data: PlatformProfile
  business_account: boolean
  verified: boolean
}

export interface PlatformProfile {
  id: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  follower_count: number
  following_count: number
  post_count: number
  website_url?: string
  is_business: boolean
  is_verified: boolean
  
  // Platform-specific fields
  platform_specific_data: Record<string, any>
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// Request Types
export interface CreateContentRequest {
  content: string
  platforms: SocialPlatform[]
  content_type: ContentType
  business_goal: BusinessGoal
  hashtags?: string[]
  mentions?: string[]
  scheduled_for?: Date
  media_files?: File[]
  ai_prompt?: string
}

export interface GenerateContentRequest {
  prompt: string
  business_goal: BusinessGoal
  platforms: SocialPlatform[]
  content_type?: ContentType
  style_preferences?: {
    tone: 'professional' | 'casual' | 'humorous' | 'inspiring'
    length: 'short' | 'medium' | 'long'
    include_hashtags: boolean
    include_emojis: boolean
  }
  reference_content?: string[]
}
