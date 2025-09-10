/**
 * API Service for Social Media Manager
 * Handles all backend communication
 */

import { useAuth } from '@/contexts/auth-context'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://adflow-production.up.railway.app'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface PostData {
  content: string
  platforms: string[]
  media_url?: string
  scheduled_for?: string
}

interface ContentGenerationRequest {
  prompt: string
  platforms: string[]
  tone: string
  business_goal: string
  generate_variations?: boolean
  include_trends?: boolean
}

interface SocialAccount {
  id: string
  platform: string
  username: string
  is_active: boolean
  connected_at: string
  last_used?: string
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    // Get the token from Supabase auth context or localStorage
    let token = '';
    
    // Try to get from Supabase session first
    if (typeof window !== 'undefined') {
      try {
        const supabaseSession = localStorage.getItem('sb-' + (process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'project') + '-auth-token');
        if (supabaseSession) {
          const sessionData = JSON.parse(supabaseSession);
          token = sessionData?.access_token || '';
        }
      } catch (e) {
        console.error('Error getting Supabase token:', e);
      }
      
      // Fallback to direct localStorage
      if (!token) {
        token = localStorage.getItem('supabase.auth.token') || '';
      }
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`
      console.log(`API Request: ${options.method || 'GET'} ${url}`)
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      })

      console.log(`API Response: ${response.status} ${response.statusText}`)

      // Handle different response types
      let data
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = text ? { message: text } : {}
      }

      if (!response.ok) {
        console.error('API Error Response:', data)
        return {
          success: false,
          error: data.detail || data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      console.log('API Success Response:', data)
      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('API Request failed:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error - please check your internet connection'
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // Social Media Accounts
  async getSocialAccounts(): Promise<ApiResponse<SocialAccount[]>> {
    try {
      const response = await this.request<SocialAccount[]>('/api/social/accounts')
      if (response.success) {
        return response
      }
      // If endpoint doesn't exist, return empty array
      return {
        success: true,
        data: []
      }
    } catch (error) {
      // Fallback to empty array
      return {
        success: true,
        data: []
      }
    }
  }

  async connectSocialAccount(platform: string): Promise<ApiResponse<{ auth_url: string }>> {
    return this.request<{ auth_url: string }>(`/api/social/auth/${platform}`, {
      method: 'POST'
    })
  }

  async disconnectSocialAccount(accountId: string): Promise<ApiResponse> {
    return this.request(`/api/social/accounts/${accountId}`, {
      method: 'DELETE'
    })
  }

  async testAccountConnection(accountId: string): Promise<ApiResponse<{ status: string, message: string }>> {
    return this.request<{ status: string, message: string }>(`/api/social/accounts/test-connection/${accountId}`, {
      method: 'POST'
    })
  }

  // Content Creation
  async generateContent(request: ContentGenerationRequest): Promise<ApiResponse> {
    console.log('API: Generating content with request:', request)
    
    try {
      const response = await this.request('/api/ai/generate-content', {
        method: 'POST',
        body: JSON.stringify(request)
      })
      
      console.log('API: Generate content response:', response)
      return response
    } catch (error) {
      console.error('API: Generate content error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Content generation failed'
      }
    }
  }

  async createPost(postData: PostData): Promise<ApiResponse> {
    console.log('API: Creating post with data:', postData)
    
    try {
      const response = await this.request('/api/social/post', {
        method: 'POST',
        body: JSON.stringify(postData)
      })
      
      console.log('API: Create post response:', response)
      return response
    } catch (error) {
      console.error('API: Create post error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Post creation failed'
      }
    }
  }

  // Analytics
  async getPlatformAnalytics(platform: string, days: number = 30): Promise<ApiResponse> {
    return this.request(`/api/social/analytics/${platform}?days=${days}`)
  }

  async getDashboardStats(): Promise<ApiResponse> {
    // Try the new endpoint first, fallback to mock data if it doesn't exist
    try {
      const response = await this.request('/api/dashboard/stats')
      if (response.success) {
        return response
      }
      // If endpoint doesn't exist (404), return mock data
      return {
        success: true,
        data: {
          stats: {
            total_posts: 0,
            scheduled_posts: 0,
            connected_platforms: 0,
            avg_engagement: 0
          }
        }
      }
    } catch (error) {
      // Fallback to mock data
      return {
        success: true,
        data: {
          stats: {
            total_posts: 0,
            scheduled_posts: 0,
            connected_platforms: 0,
            avg_engagement: 0
          }
        }
      }
    }
  }

  // Content Management
  async getContentHistory(limit: number = 20): Promise<ApiResponse> {
    console.log('API: Getting content history, limit:', limit)
    
    try {
      const response = await this.request(`/api/dashboard/content/recent?limit=${limit}`)
      console.log('API: Content history response:', response)
      return response
    } catch (error) {
      console.error('API: Content history error:', error)
      return {
        success: true,
        data: { content: [], total: 0 }
      }
    }
  }

  async schedulePost(postData: PostData): Promise<ApiResponse> {
    console.log('API: Scheduling post:', postData)
    
    try {
      const response = await this.request('/api/scheduler/schedule', {
        method: 'POST',
        body: JSON.stringify({
          content: postData.content,
          platforms: postData.platforms,
          scheduled_for: postData.scheduled_for,
          media_url: postData.media_url
        })
      })
      
      console.log('API: Schedule post response:', response)
      return response
    } catch (error) {
      console.error('API: Schedule post error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Scheduling failed'
      }
    }
  }

  async getScheduledPosts(): Promise<ApiResponse> {
    console.log('API: Getting scheduled posts')
    
    try {
      const response = await this.request('/api/scheduler/scheduled')
      console.log('API: Scheduled posts response:', response)
      return response
    } catch (error) {
      console.error('API: Scheduled posts error:', error)
      return {
        success: true,
        data: []
      }
    }
  }

  async cancelScheduledPost(postId: string): Promise<ApiResponse> {
    console.log('API: Cancelling scheduled post:', postId)
    
    try {
      const response = await this.request(`/api/scheduler/cancel/${postId}`, {
        method: 'DELETE'
      })
      
      console.log('API: Cancel post response:', response)
      return response
    } catch (error) {
      console.error('API: Cancel post error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Cancellation failed'
      }
    }
  }

  // Platform-specific operations
  async getInstagramInsights(accountId: string): Promise<ApiResponse> {
    return this.request(`/api/social/instagram/insights/${accountId}`)
  }

  async getFacebookPageInsights(accountId: string): Promise<ApiResponse> {
    return this.request(`/api/social/facebook/insights/${accountId}`)
  }

  async getTikTokAnalytics(accountId: string): Promise<ApiResponse> {
    return this.request(`/api/social/tiktok/analytics/${accountId}`)
  }

  async getTwitterAnalytics(accountId: string): Promise<ApiResponse> {
    return this.request(`/api/social/twitter/analytics/${accountId}`)
  }

  // Media Management
  async uploadMedia(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData()
    formData.append('file', file)

    const authHeaders = this.getAuthHeaders()
    const headers: HeadersInit = {}
    
    // Add authorization header if it exists
    if ('Authorization' in authHeaders) {
      headers['Authorization'] = authHeaders['Authorization'] as string
    }

    return this.request<{ url: string }>('/api/media/upload', {
      method: 'POST',
      headers,
      body: formData
    })
  }

  // Configuration
  async getSocialConfig(): Promise<ApiResponse> {
    return this.request('/api/social/config/check')
  }
}

export const apiService = new ApiService()
export default apiService

// Hook for using API service with auth context
export function useApiService() {
  const { session } = useAuth()
  
  const authenticatedRequest = async <T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const token = session?.access_token
    
    if (!token) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    try {
      const url = `${API_BASE_URL}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.message || 'Request failed'
        }
      }

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('API Request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  return {
    authenticatedRequest,
    getSocialAccounts: () => authenticatedRequest<SocialAccount[]>('/api/social/accounts'),
    connectSocialAccount: (platform: string) => 
      authenticatedRequest<{ auth_url: string }>(`/api/social/auth/${platform}`, { method: 'POST' }),
    generateContent: (request: ContentGenerationRequest) => 
      authenticatedRequest('/api/ai/generate-content', {
        method: 'POST',
        body: JSON.stringify(request)
      }),
    createPost: (postData: PostData) => 
      authenticatedRequest('/api/social/post', {
        method: 'POST',
        body: JSON.stringify(postData)
      }),
    getDashboardStats: () => authenticatedRequest('/api/dashboard/stats'),
    getPlatformAnalytics: (platform: string, days: number = 30) => 
      authenticatedRequest(`/api/social/analytics/${platform}?days=${days}`),
    getContentHistory: (limit: number = 20) => authenticatedRequest(`/api/dashboard/content/recent?limit=${limit}`),
    getScheduledPosts: () => authenticatedRequest('/api/scheduler/scheduled'),
    uploadMedia: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const token = session?.access_token
      if (!token) {
        return {
          success: false,
          error: 'Not authenticated'
        }
      }

      try {
        const url = `${API_BASE_URL}/api/media/upload`
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        })

        const data = await response.json()

        if (!response.ok) {
          return {
            success: false,
            error: data.detail || data.message || 'Upload failed'
          }
        }

        return {
          success: true,
          data: data
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        }
      }
    }
  }
}
