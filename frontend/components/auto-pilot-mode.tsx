"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Calendar } from '@/components/ui/calendar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  Play, 
  Pause, 
  Calendar as CalendarIcon, 
  Target, 
  Zap,
  Bot,
  CheckCircle,
  Clock,
  TrendingUp,
  Lightbulb,
  Gauge,
  BarChart3,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

interface AutoPilotConfig {
  id: string
  is_enabled: boolean
  primary_goal: 'sales' | 'visits' | 'followers' | 'awareness' | 'engagement'
  target_value: number
  deadline: string
  content_style: 'casual' | 'professional' | 'creative' | 'balanced'
  posting_frequency: 'low' | 'medium' | 'high' | 'optimal'
  platforms: string[]
  ai_creativity_level: number
  brand_voice: string
  content_themes: string[]
  exclude_topics: string[]
  min_engagement_rate: number
  content_rotation_days: number
}

interface CalendarEntry {
  id: string
  content: string
  scheduled_for: string
  platforms: string[]
  content_type: string
  predicted_performance: Record<string, number>
  content_score: number
  is_published: boolean
}

interface AutoPilotStats {
  posts_generated: number
  posts_published: number
  avg_performance_score: number
  goal_progress: number
  time_saved_hours: number
  next_post_time: string
}

export function AutoPilotMode() {
  const [config, setConfig] = useState<AutoPilotConfig | null>(null)
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([])
  const [stats, setStats] = useState<AutoPilotStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    fetchAutoPilotData()
  }, [])

  const fetchAutoPilotData = async () => {
    try {
      setLoading(true)
      
      // Fetch configuration
      const configResponse = await fetch('/api/autopilot/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (configResponse.ok) {
        const configData = await configResponse.json()
        setConfig(configData)
      }

      // Fetch calendar
      const calendarResponse = await fetch('/api/autopilot/calendar', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (calendarResponse.ok) {
        const calendarData = await calendarResponse.json()
        setCalendarEntries(calendarData.entries)
      }

      // Fetch stats
      const statsResponse = await fetch('/api/autopilot/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching autopilot data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async (updatedConfig: Partial<AutoPilotConfig>) => {
    try {
      setSaving(true)
      const response = await fetch('/api/autopilot/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedConfig)
      })
      
      if (response.ok) {
        const newConfig = await response.json()
        setConfig(newConfig)
      }
    } catch (error) {
      console.error('Error saving config:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleAutoPilot = async () => {
    if (!config) return
    
    await saveConfig({
      ...config,
      is_enabled: !config.is_enabled
    })
  }

  const generateCalendar = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/autopilot/generate-calendar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        await fetchAutoPilotData()
      }
    } catch (error) {
      console.error('Error generating calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  const optimizeStrategy = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/autopilot/optimize-strategy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        await fetchAutoPilotData()
      }
    } catch (error) {
      console.error('Error optimizing strategy:', error)
    } finally {
      setLoading(false)
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'educational': return 'bg-blue-100 text-blue-800'
      case 'promotional': return 'bg-green-100 text-green-800'
      case 'engagement': return 'bg-purple-100 text-purple-800'
      case 'trending': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Bot className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Initializing Auto-Pilot Mode...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-purple-600" />
            Auto-Pilot Mode
            {config?.is_enabled && (
              <Badge variant="default" className="bg-green-600">
                <Play className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Let AI manage your content strategy and posting schedule</p>
        </div>
        
        <div className="flex items-center gap-4">
          {config && (
            <div className="flex items-center gap-2">
              <Label htmlFor="autopilot-toggle">Auto-Pilot</Label>
              <Switch
                id="autopilot-toggle"
                checked={config.is_enabled}
                onCheckedChange={toggleAutoPilot}
                disabled={saving}
              />
            </div>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {config?.is_enabled ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Auto-Pilot is active and managing your content strategy. 
            {stats?.next_post_time && ` Next post scheduled for ${formatDate(stats.next_post_time)}.`}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Auto-Pilot is currently disabled. Enable it to start autonomous content creation and posting.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.posts_generated}</div>
              <div className="text-sm text-muted-foreground">Posts Generated</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.posts_published}</div>
              <div className="text-sm text-muted-foreground">Posts Published</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.avg_performance_score.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Performance</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.goal_progress.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Goal Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.time_saved_hours}</div>
              <div className="text-sm text-muted-foreground">Hours Saved</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={generateCalendar} disabled={loading} className="h-20 flex flex-col">
                  <CalendarIcon className="h-6 w-6 mb-2" />
                  Generate New Calendar
                </Button>
                <Button onClick={optimizeStrategy} disabled={loading} variant="outline" className="h-20 flex flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Optimize Strategy
                </Button>
                <Button onClick={fetchAutoPilotData} disabled={loading} variant="outline" className="h-20 flex flex-col">
                  <RefreshCw className="h-6 w-6 mb-2" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Posts Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calendarEntries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg mb-3 last:mb-0">
                  <div className="flex-1">
                    <p className="font-medium line-clamp-2">{entry.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getContentTypeColor(entry.content_type)}>
                        {entry.content_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(entry.scheduled_for)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium">Score: {entry.content_score.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.platforms.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
              
              {calendarEntries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No scheduled posts. Generate a calendar to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Content Calendar
              </CardTitle>
              <CardDescription>
                AI-generated content scheduled for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {calendarEntries
                      .filter(entry => {
                        const entryDate = new Date(entry.scheduled_for)
                        return entryDate.toDateString() === selectedDate.toDateString()
                      })
                      .map((entry) => (
                        <div key={entry.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Badge className={getContentTypeColor(entry.content_type)}>
                              {entry.content_type}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {new Date(entry.scheduled_for).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          
                          <p className="text-sm mb-3">{entry.content}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {entry.platforms.map(platform => (
                                <Badge key={platform} variant="outline" className="text-xs">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Gauge className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {entry.content_score.toFixed(1)}
                              </span>
                              {entry.is_published && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                    
                    {calendarEntries.filter(entry => {
                      const entryDate = new Date(entry.scheduled_for)
                      return entryDate.toDateString() === selectedDate.toDateString()
                    }).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No posts scheduled for this date</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {config && (
            <>
              {/* Goal Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Goal Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary-goal">Primary Goal</Label>
                      <Select
                        value={config.primary_goal}
                        onValueChange={(value) => saveConfig({ ...config, primary_goal: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="visits">Website Visits</SelectItem>
                          <SelectItem value="followers">Followers</SelectItem>
                          <SelectItem value="awareness">Brand Awareness</SelectItem>
                          <SelectItem value="engagement">Engagement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="target-value">Target Value</Label>
                      <Input
                        id="target-value"
                        type="number"
                        value={config.target_value}
                        onChange={(e) => saveConfig({ ...config, target_value: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Content Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="content-style">Content Style</Label>
                      <Select
                        value={config.content_style}
                        onValueChange={(value) => saveConfig({ ...config, content_style: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="posting-frequency">Posting Frequency</Label>
                      <Select
                        value={config.posting_frequency}
                        onValueChange={(value) => saveConfig({ ...config, posting_frequency: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (2-3 per week)</SelectItem>
                          <SelectItem value="medium">Medium (4-6 per week)</SelectItem>
                          <SelectItem value="high">High (1-2 per day)</SelectItem>
                          <SelectItem value="optimal">Optimal (AI decides)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ai-creativity">AI Creativity Level: {config.ai_creativity_level.toFixed(1)}</Label>
                    <Slider
                      id="ai-creativity"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[config.ai_creativity_level]}
                      onValueChange={(value) => saveConfig({ ...config, ai_creativity_level: value[0] })}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Conservative</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="brand-voice">Brand Voice Description</Label>
                    <Textarea
                      id="brand-voice"
                      placeholder="Describe your brand's personality and tone..."
                      value={config.brand_voice}
                      onChange={(e) => saveConfig({ ...config, brand_voice: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-engagement">Minimum Engagement Rate (%)</Label>
                      <Input
                        id="min-engagement"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={config.min_engagement_rate * 100}
                        onChange={(e) => saveConfig({ 
                          ...config, 
                          min_engagement_rate: parseFloat(e.target.value) / 100 
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="rotation-days">Content Rotation (days)</Label>
                      <Input
                        id="rotation-days"
                        type="number"
                        min="1"
                        max="30"
                        value={config.content_rotation_days}
                        onChange={(e) => saveConfig({ 
                          ...config, 
                          content_rotation_days: parseInt(e.target.value) 
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
