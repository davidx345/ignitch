/**
 * Content Hub Component
 * Central place to view and manage all social media content
 */

'use client'

import React, { useState, useEffect } from 'react'
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
  MessageCircle
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

  useEffect(() => {
    loadContent()
  }, [filterStatus, filterPlatform])

  const loadContent = async () => {
    try {
      setLoading(true)
      // Mock data for now - will integrate with API
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
      
      // Update parent stats
      if (onStatsUpdate) {
        onStatsUpdate({
          totalPosts: mockContent.length,
          scheduledPosts: mockContent.filter(c => c.status === 'scheduled').length,
          connectedPlatforms: 3,
          avgEngagement: 82.6
        })
      }
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setLoading(false)
    }
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
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-gray-500"
            />
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 border-gray-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-32 border-gray-300">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {/* Content List */}
      {filteredContent.length === 0 ? (
        <Card className="bg-white border-gray-200">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' || filterPlatform !== 'all' 
                ? 'No content matches your filters' 
                : 'No content yet'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' || filterPlatform !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start creating amazing social media content'
              }
            </p>
            {!(searchTerm || filterStatus !== 'all' || filterPlatform !== 'all') && (
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Post
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredContent.map((item) => (
            <Card key={item.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Platform and Status */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(item.platform)}
                        <span className="font-medium text-gray-900 capitalize">
                          {item.platform}
                        </span>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      {item.ai_generated && (
                        <Badge variant="outline" className="text-gray-600 border-gray-300">
                          AI Generated
                        </Badge>
                      )}
                    </div>
                    
                    {/* Content */}
                    <p className="text-gray-700 line-clamp-2">
                      {item.content}
                    </p>
                    
                    {/* Hashtags */}
                    {item.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.hashtags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {item.hashtags.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{item.hashtags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Meta Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        Created {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      {item.scheduled_for && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Scheduled for {new Date(item.scheduled_for).toLocaleDateString()}
                          </span>
                        </span>
                      )}
                      {item.engagement_score && (
                        <span className="text-green-600 font-medium">
                          {item.engagement_score}% predicted engagement
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm" className="text-gray-600 border-gray-300">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-gray-600 border-gray-300">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-gray-600 border-gray-300">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ContentHub
