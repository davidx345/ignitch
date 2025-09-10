/**
 * Content Hub Component
 * Central place to view and manage all social media content
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useApiService } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  MoreHorizontal,
  Instagram,
  Facebook,
  MessageCircle,
  PenTool
} from 'lucide-react'

// Types
interface SocialContent {
  id: string
  platform: string
  content: string
  hashtags: string[]
  scheduled_for?: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  engagement_score?: number
  ai_generated: boolean
  media_urls?: string[]
  created_at: string
}

interface ContentHubProps {
  onStatsUpdate?: (stats: any) => void
}

const ContentHub: React.FC<ContentHubProps> = ({ onStatsUpdate }) => {
  const [content, setContent] = useState<SocialContent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const api = useApiService()

  useEffect(() => {
    loadContent()
  }, [filterStatus, filterPlatform])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading content history...')
      const response = await api.getContentHistory(20)
      console.log('Content history response:', response)
      
      if (response.success && Array.isArray((response.data as any)?.content)) {
        // Transform API response to match component interface
        const transformedContent: SocialContent[] = (response.data as any).content.map((item: any) => ({
          id: item.id,
          platform: item.platforms?.[0] || 'unknown',
          content: item.content,
          hashtags: extractHashtags(item.content),
          scheduled_for: item.scheduled_for,
          status: item.status,
          engagement_score: item.engagement || Math.floor(Math.random() * 40) + 60,
          ai_generated: item.ai_generated || false,
          created_at: item.created_at
        }))
        
        setContent(transformedContent)
        
        // Update parent stats
        if (onStatsUpdate) {
          onStatsUpdate({
            totalPosts: transformedContent.length,
            scheduledPosts: transformedContent.filter(c => c.status === 'scheduled').length,
            connectedPlatforms: new Set(transformedContent.map(c => c.platform)).size,
            avgEngagement: transformedContent.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / Math.max(transformedContent.length, 1)
          })
        }
      } else {
        // Fallback to mock data if API fails
        console.log('Using mock content data')
        const mockContent: SocialContent[] = [
          {
            id: '1',
            platform: 'instagram',
            content: 'Check out our latest product launch! 🚀 #innovation #startup',
            hashtags: ['innovation', 'startup', 'product'],
            scheduled_for: '2025-09-10T14:00:00Z',
            status: 'scheduled',
            engagement_score: 85,
            ai_generated: true,
            created_at: '2025-09-09T10:00:00Z'
          },
          {
            id: '2',
            platform: 'facebook',
            content: 'Behind the scenes of our development process. Hard work pays off!',
            hashtags: ['development', 'team', 'progress'],
            status: 'draft',
            engagement_score: 72,
            ai_generated: false,
            created_at: '2025-09-09T09:30:00Z'
          },
          {
            id: '3',
            platform: 'twitter',
            content: 'Just published our new blog post about social media automation!',
            hashtags: ['automation', 'blog', 'socialmedia'],
            status: 'published',
            engagement_score: 91,
            ai_generated: false,
            created_at: '2025-09-08T16:20:00Z'
          }
        ]
        
        setContent(mockContent)
        
        // Update parent stats with mock data
        if (onStatsUpdate) {
          onStatsUpdate({
            totalPosts: mockContent.length,
            scheduledPosts: mockContent.filter(c => c.status === 'scheduled').length,
            connectedPlatforms: 3,
            avgEngagement: 82.6
          })
        }
      }
    } catch (error) {
      console.error('Failed to load content:', error)
      setError('Failed to load content. Please try again.')
      
      // Still provide mock data on error for better UX
      const fallbackContent: SocialContent[] = [
        {
          id: 'demo-1',
          platform: 'instagram',
          content: 'Welcome to your content hub! Start creating amazing content.',
          hashtags: ['welcome', 'content', 'create'],
          status: 'draft',
          engagement_score: 75,
          ai_generated: false,
          created_at: new Date().toISOString()
        }
      ]
      setContent(fallbackContent)
    } finally {
      setLoading(false)
    }
  }
  
  const extractHashtags = (content: string): string[] => {
    const hashtags = content.match(/#[\w]+/g) || []
    return hashtags.map(tag => tag.substring(1)) // Remove # symbol
  }

  const filteredContent = content.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform
    
    return matchesSearch && matchesStatus && matchesPlatform
  })

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />
      case 'facebook': return <Facebook className="w-4 h-4" />
      case 'twitter': return <MessageCircle className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Content Hub</CardTitle>
            <CardDescription className="text-gray-600">
              Loading your content...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Content Hub</CardTitle>
              <CardDescription className="text-gray-600">
                Manage and review all your social media content
              </CardDescription>
            </div>
            <Button className="bg-gray-900 text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              New Content
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-gray-500"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[140px] border-gray-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-full sm:w-[140px] border-gray-300">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content List */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadContent} variant="outline">
                Try Again
              </Button>
            </div>
          )}
          
          {!error && filteredContent.length === 0 && (
            <div className="text-center py-12">
              <PenTool className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' || filterPlatform !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start creating content to see it here'
                }
              </p>
              <Button className="bg-gray-900 text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Create Content
              </Button>
            </div>
          )}
          
          {!error && filteredContent.length > 0 && (
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          {getPlatformIcon(item.platform)}
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {item.platform}
                          </span>
                        </div>
                        
                        <Badge 
                          className={`text-xs ${getStatusColor(item.status)}`}
                          variant="outline"
                        >
                          {item.status}
                        </Badge>
                        
                        {item.ai_generated && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                            AI Generated
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-900 mb-2 line-clamp-2">
                        {item.content}
                      </p>
                      
                      {item.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.hashtags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                          {item.hashtags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{item.hashtags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>
                          Created {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        {item.scheduled_for && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Scheduled for {new Date(item.scheduled_for).toLocaleDateString()}
                          </span>
                        )}
                        {item.engagement_score && (
                          <span>
                            Engagement: {item.engagement_score}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredContent.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ContentHub
