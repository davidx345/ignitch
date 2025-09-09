/**
 * Social Media API Client
 * Handles all social media management API calls
 */

import { 
  SocialContent, 
  CreateContentRequest, 
  GenerateContentRequest,
  SocialPlatform,
  ContentStatus,
  BusinessGoal,
  APIResponse,
  PaginatedResponse 
} from '@/types/social-media'

class SocialMediaAPIClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL = '/api/social') {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // Content Management
  async createContent(data: CreateContentRequest): Promise<APIResponse<SocialContent>> {
    return this.request<APIResponse<SocialContent>>('/content', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getContent(params: {
    page?: number
    per_page?: number
    status?: ContentStatus
    platform?: SocialPlatform
    business_goal?: BusinessGoal
  } = {}): Promise<PaginatedResponse<SocialContent>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    const query = searchParams.toString()
    return this.request<PaginatedResponse<SocialContent>>(
      `/content${query ? `?${query}` : ''}`
    )
  }

  async getContentById(contentId: string): Promise<APIResponse<SocialContent>> {
    return this.request<APIResponse<SocialContent>>(`/content/${contentId}`)
  }

  async updateContent(
    contentId: string, 
    data: CreateContentRequest
  ): Promise<APIResponse<SocialContent>> {
    return this.request<APIResponse<SocialContent>>(`/content/${contentId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteContent(contentId: string): Promise<APIResponse<boolean>> {
    return this.request<APIResponse<boolean>>(`/content/${contentId}`, {
      method: 'DELETE'
    })
  }

  // AI Content Generation
  async generateContent(data: GenerateContentRequest): Promise<APIResponse<SocialContent[]>> {
    return this.request<APIResponse<SocialContent[]>>('/content/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Analytics
  async getAnalyticsOverview(days = 30): Promise<APIResponse<any>> {
    return this.request<APIResponse<any>>(`/analytics/overview?days=${days}`)
  }

  // Health Check
  async healthCheck(): Promise<any> {
    return this.request<any>('/health')
  }
}

// Create singleton instance
export const socialMediaAPI = new SocialMediaAPIClient()

// React hooks for social media management
import { useState, useEffect, useCallback } from 'react'

export function useSocialContent(initialFilters: any = {}) {
  const [content, setContent] = useState<SocialContent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  })

  const loadContent = useCallback(async (filters: any = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await socialMediaAPI.getContent({
        ...initialFilters,
        ...filters
      })
      
      if (response.success) {
        setContent(response.data || [])
        setPagination(response.pagination || pagination)
      } else {
        throw new Error(response.error || 'Failed to load content')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Failed to load social content:', err)
    } finally {
      setLoading(false)
    }
  }, [initialFilters])

  const createContent = useCallback(async (data: CreateContentRequest) => {
    try {
      setError(null)
      const response = await socialMediaAPI.createContent(data)
      
      if (response.success && response.data) {
        setContent(prev => [response.data!, ...prev])
        return response.data
      } else {
        throw new Error(response.error || 'Failed to create content')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    }
  }, [])

  const updateContent = useCallback(async (contentId: string, data: CreateContentRequest) => {
    try {
      setError(null)
      const response = await socialMediaAPI.updateContent(contentId, data)
      
      if (response.success && response.data) {
        setContent(prev => prev.map(item => 
          item.id === contentId ? response.data! : item
        ))
        return response.data
      } else {
        throw new Error(response.error || 'Failed to update content')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    }
  }, [])

  const deleteContent = useCallback(async (contentId: string) => {
    try {
      setError(null)
      const response = await socialMediaAPI.deleteContent(contentId)
      
      if (response.success) {
        setContent(prev => prev.filter(item => item.id !== contentId))
        return true
      } else {
        throw new Error(response.error || 'Failed to delete content')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    }
  }, [])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  return {
    content,
    loading,
    error,
    pagination,
    loadContent,
    createContent,
    updateContent,
    deleteContent,
    refresh: () => loadContent()
  }
}

export function useContentGeneration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState<SocialContent[]>([])

  const generateContent = useCallback(async (data: GenerateContentRequest) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await socialMediaAPI.generateContent(data)
      
      if (response.success && response.data) {
        setGeneratedContent(response.data)
        return response.data
      } else {
        throw new Error(response.error || 'Failed to generate content')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Content generation failed:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearGenerated = useCallback(() => {
    setGeneratedContent([])
    setError(null)
  }, [])

  return {
    loading,
    error,
    generatedContent,
    generateContent,
    clearGenerated
  }
}

export function useSocialAnalytics(days = 30) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async (period = days) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await socialMediaAPI.getAnalyticsOverview(period)
      
      if (response.success) {
        setAnalytics(response.data)
      } else {
        throw new Error(response.error || 'Failed to load analytics')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  return {
    analytics,
    loading,
    error,
    loadAnalytics,
    refresh: () => loadAnalytics()
  }
}
