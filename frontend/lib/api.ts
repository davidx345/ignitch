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
    // We'll get the token from Supabase auth context
    const token = localStorage.getItem('supabase.auth.token')
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
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
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

  // Social Media Accounts
  async getSocialAccounts(): Promise<ApiResponse<SocialAccount[]>> {
    return this.request<SocialAccount[]>('/api/social/accounts')
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
    return this.request('/api/ai/generate-content', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  async createPost(postData: PostData): Promise<ApiResponse> {
    return this.request('/api/social/post', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  }

  // Analytics
  async getPlatformAnalytics(platform: string, days: number = 30): Promise<ApiResponse> {
    return this.request(`/api/social/analytics/${platform}?days=${days}`)
  }

  async getDashboardStats(): Promise<ApiResponse> {
    return this.request('/api/dashboard/stats')
  }

  // Content Management
  async getContentHistory(limit: number = 20): Promise<ApiResponse> {
    return this.request(`/api/content/history?limit=${limit}`)
  }

  async schedulePost(postData: PostData): Promise<ApiResponse> {
    return this.request('/api/scheduler/schedule', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  }

  async getScheduledPosts(): Promise<ApiResponse> {
    return this.request('/api/scheduler/scheduled')
  }

  async cancelScheduledPost(postId: string): Promise<ApiResponse> {
    return this.request(`/api/scheduler/cancel/${postId}`, {
      method: 'DELETE'
    })
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
  }
}
