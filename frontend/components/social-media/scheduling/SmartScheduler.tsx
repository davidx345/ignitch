/**
 * Smart Scheduler Component - Phase 3
 * Full calendar interface with intelligent scheduling and automation
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Zap, 
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Facebook,
  MessageCircle,
  Youtube,
  MoreHorizontal,
  Target,
  BarChart3
} from 'lucide-react'
import { colors } from '@/lib/design-system'

// Types
interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduled_for: Date
  status: 'scheduled' | 'published' | 'failed' | 'draft'
  optimal_time: boolean
  engagement_prediction: number
  content_type: 'text' | 'image' | 'video' | 'carousel'
  created_at: Date
}

interface OptimalTime {
  platform: string
  day: string
  hour: number
  minute: number
  engagement_rate: number
  confidence: number
}

interface AutomationRule {
  id: string
  name: string
  trigger: 'schedule' | 'performance' | 'content_age'
  action: 'repost' | 'boost' | 'archive'
  enabled: boolean
  platforms: string[]
  conditions: Record<string, any>
}

interface SmartSchedulerProps {
  onStatsUpdate?: (stats: any) => void
}

const SmartScheduler: React.FC<SmartSchedulerProps> = ({ onStatsUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [optimalTimes, setOptimalTimes] = useState<OptimalTime[]>([])
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('calendar')

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: MessageCircle, color: 'bg-blue-400' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-500' }
  ]

  useEffect(() => {
    loadScheduledPosts()
    loadOptimalTimes()
    loadAutomationRules()
  }, [])

  const loadScheduledPosts = async () => {
    // Mock data - replace with API call
    const mockPosts: ScheduledPost[] = [
      {
        id: '1',
        content: 'Check out our latest product launch! 🚀',
        platforms: ['instagram', 'facebook'],
        scheduled_for: new Date(2025, 8, 12, 14, 30),
        status: 'scheduled',
        optimal_time: true,
        engagement_prediction: 87,
        content_type: 'image',
        created_at: new Date()
      },
      {
        id: '2',
        content: 'Behind the scenes of our creative process ✨',
        platforms: ['instagram', 'twitter'],
        scheduled_for: new Date(2025, 8, 13, 16, 0),
        status: 'scheduled',
        optimal_time: true,
        engagement_prediction: 92,
        content_type: 'video',
        created_at: new Date()
      },
      {
        id: '3',
        content: 'Weekend vibes! What are your plans? 😎',
        platforms: ['facebook', 'twitter'],
        scheduled_for: new Date(2025, 8, 14, 10, 0),
        status: 'scheduled',
        optimal_time: false,
        engagement_prediction: 74,
        content_type: 'text',
        created_at: new Date()
      }
    ]
    setScheduledPosts(mockPosts)
    
    // Update parent stats
    if (onStatsUpdate) {
      onStatsUpdate({
        scheduledPosts: mockPosts.length,
        upcomingPosts: mockPosts.filter(p => p.scheduled_for > new Date()).length
      })
    }
  }

  const loadOptimalTimes = async () => {
    // Mock optimal times data
    const mockOptimalTimes: OptimalTime[] = [
      { platform: 'instagram', day: 'tuesday', hour: 11, minute: 0, engagement_rate: 92, confidence: 95 },
      { platform: 'instagram', day: 'wednesday', hour: 14, minute: 30, engagement_rate: 89, confidence: 88 },
      { platform: 'facebook', day: 'wednesday', hour: 13, minute: 0, engagement_rate: 86, confidence: 91 },
      { platform: 'twitter', day: 'tuesday', hour: 9, minute: 0, engagement_rate: 94, confidence: 97 },
      { platform: 'youtube', day: 'saturday', hour: 14, minute: 0, engagement_rate: 85, confidence: 83 }
    ]
    setOptimalTimes(mockOptimalTimes)
  }

  const loadAutomationRules = async () => {
    // Mock automation rules
    const mockRules: AutomationRule[] = [
      {
        id: '1',
        name: 'High Performance Repost',
        trigger: 'performance',
        action: 'repost',
        enabled: true,
        platforms: ['instagram', 'facebook'],
        conditions: { min_engagement_rate: 5.0, min_age_days: 30 }
      },
      {
        id: '2',
        name: 'Weekly Tuesday Posts',
        trigger: 'schedule',
        action: 'repost',
        enabled: false,
        platforms: ['twitter'],
        conditions: { day_of_week: 2, time: '09:00' }
      }
    ]
    setAutomationRules(mockRules)
  }

  const isOptimalTime = (platform: string, date: Date): boolean => {
    const optimal = optimalTimes.find(ot => 
      ot.platform === platform && 
      ot.day === getDayName(date.getDay()) &&
      ot.hour === date.getHours()
    )
    return !!optimal
  }

  const getDayName = (dayIndex: number): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[dayIndex]
  }

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform ? <platform.icon className="w-4 h-4" /> : null
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDay = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => 
      post.scheduled_for.toDateString() === date.toDateString()
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
          <TabsTrigger value="calendar" className="text-gray-600 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="optimal" className="text-gray-600 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Optimal Times
          </TabsTrigger>
          <TabsTrigger value="automation" className="text-gray-600 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
            <Zap className="w-4 h-4 mr-2" />
            Automation
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Content Calendar</CardTitle>
                  <CardDescription className="text-gray-600">
                    Schedule posts at optimal times for maximum engagement
                  </CardDescription>
                </div>
                <Button className="bg-gray-900 text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((date, index) => (
                  <div
                    key={index}
                    className={`min-h-[80px] p-2 border border-gray-200 rounded-lg ${
                      date ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                    } ${date && date.toDateString() === new Date().toDateString() ? 'ring-2 ring-blue-200' : ''}`}
                    onClick={() => date && setSelectedDate(date)}
                  >
                    {date && (
                      <>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {getPostsForDate(date).slice(0, 2).map(post => (
                            <div
                              key={post.id}
                              className={`text-xs p-1 rounded truncate ${
                                post.optimal_time ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {post.content.slice(0, 20)}...
                            </div>
                          ))}
                          {getPostsForDate(date).length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{getPostsForDate(date).length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Posts List */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Upcoming Posts</CardTitle>
              <CardDescription className="text-gray-600">
                Posts scheduled for the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledPosts
                .filter(post => post.scheduled_for > new Date() && post.scheduled_for <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
                .map(post => (
                  <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex space-x-1">
                          {post.platforms.map(platform => (
                            <div key={platform} className={`p-1 rounded ${platforms.find(p => p.id === platform)?.color} text-white`}>
                              {getPlatformIcon(platform)}
                            </div>
                          ))}
                        </div>
                        {post.optimal_time && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            Optimal Time
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {post.engagement_prediction}% predicted engagement
                        </Badge>
                      </div>
                      <p className="text-gray-900 mb-1">{post.content}</p>
                      <p className="text-sm text-gray-500">
                        {post.scheduled_for.toLocaleDateString()} at {post.scheduled_for.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimal Times */}
        <TabsContent value="optimal" className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Optimal Posting Times</CardTitle>
              <CardDescription className="text-gray-600">
                AI-analyzed best times for maximum engagement on each platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {platforms.map(platform => {
                  const platformOptimalTimes = optimalTimes.filter(ot => ot.platform === platform.id)
                  return (
                    <Card key={platform.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded ${platform.color} text-white`}>
                            <platform.icon className="w-4 h-4" />
                          </div>
                          <CardTitle className="text-base text-gray-900">{platform.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {platformOptimalTimes.map((time, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900 capitalize">
                                {time.day}s at {time.hour}:{time.minute.toString().padStart(2, '0')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {time.engagement_rate}% avg engagement
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`${time.confidence > 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                            >
                              {time.confidence}% confidence
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Rules */}
        <TabsContent value="automation" className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Automation Rules</CardTitle>
                  <CardDescription className="text-gray-600">
                    Set up automatic actions based on content performance and schedules
                  </CardDescription>
                </div>
                <Button className="bg-gray-900 text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  New Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {automationRules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{rule.name}</h4>
                      <Badge 
                        variant={rule.enabled ? "default" : "secondary"}
                        className={rule.enabled ? "bg-green-100 text-green-700" : ""}
                      >
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      When content {rule.trigger === 'performance' ? 'performs well' : 'matches schedule'}, 
                      automatically {rule.action} on {rule.platforms.join(', ')}
                    </p>
                    <div className="flex space-x-1">
                      {rule.platforms.map(platform => (
                        <div key={platform} className={`p-1 rounded ${platforms.find(p => p.id === platform)?.color} text-white`}>
                          {getPlatformIcon(platform)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SmartScheduler
