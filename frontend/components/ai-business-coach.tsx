"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  Target, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Lightbulb,
  Zap,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react'

interface Insight {
  id: string
  type: 'performance' | 'optimization' | 'strategy'
  title: string
  content: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  action_required: boolean
  is_read: boolean
  confidence_score: number
  predicted_impact: string
  created_at: string
}

interface PerformanceData {
  overall_score: number
  visibility_score: number
  content_score: number
  engagement_score: number
  growth_rate: number
  goal_progress: {
    goal_type: string
    current: number
    target: number
    progress_percentage: number
    days_remaining: number
  }
}

interface WeeklyReport {
  week_start: string
  week_end: string
  posts_published: number
  total_reach: number
  total_engagement: number
  avg_engagement_rate: number
  best_performing_post: {
    content: string
    platform: string
    engagement_rate: number
  }
  improvement_areas: string[]
  next_week_recommendations: string[]
}

export function AIBusinessCoach() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('insights')

  useEffect(() => {
    fetchCoachData()
  }, [])

  const fetchCoachData = async () => {
    try {
      setLoading(true)
      
      // Fetch insights
      const insightsResponse = await fetch('/api/ai-coach/insights', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json()
        setInsights(insightsData.insights)
      }

      // Fetch performance analysis
      const performanceResponse = await fetch('/api/ai-coach/performance-analysis', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json()
        setPerformance(performanceData)
      }

      // Fetch weekly report
      const reportResponse = await fetch('/api/ai-coach/weekly-report', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (reportResponse.ok) {
        const reportData = await reportResponse.json()
        setWeeklyReport(reportData)
      }
    } catch (error) {
      console.error('Error fetching coach data:', error)
    } finally {
      setLoading(false)
    }
  }

  const markInsightAsRead = async (insightId: string) => {
    try {
      await fetch(`/api/ai-coach/insights/${insightId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      setInsights(insights.map(insight => 
        insight.id === insightId 
          ? { ...insight, is_read: true }
          : insight
      ))
    } catch (error) {
      console.error('Error marking insight as read:', error)
    }
  }

  const generateNewInsights = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ai-coach/generate-insights', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        await fetchCoachData()
      }
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'high': return <Zap className="h-4 w-4" />
      case 'medium': return <Clock className="h-4 w-4" />
      case 'low': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>AI Coach is analyzing your performance...</p>
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
            <Brain className="h-8 w-8 text-blue-600" />
            AI Business Coach
          </h1>
          <p className="text-muted-foreground">Get personalized insights and recommendations to grow your business</p>
        </div>
        <Button onClick={generateNewInsights} disabled={loading}>
          <Lightbulb className="h-4 w-4 mr-2" />
          Generate New Insights
        </Button>
      </div>

      {/* Performance Overview */}
      {performance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{performance.overall_score}</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
                <Progress value={performance.overall_score} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{performance.visibility_score}</div>
                <div className="text-sm text-muted-foreground">Visibility</div>
                <Progress value={performance.visibility_score} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{performance.content_score}</div>
                <div className="text-sm text-muted-foreground">Content Quality</div>
                <Progress value={performance.content_score} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{performance.engagement_score}</div>
                <div className="text-sm text-muted-foreground">Engagement</div>
                <Progress value={performance.engagement_score} className="mt-2" />
              </div>
            </div>

            {performance.goal_progress && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4" />
                  Goal Progress: {performance.goal_progress.goal_type}
                </h4>
                <div className="flex items-center justify-between mb-2">
                  <span>{performance.goal_progress.current.toLocaleString()} / {performance.goal_progress.target.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">{performance.goal_progress.days_remaining} days remaining</span>
                </div>
                <Progress value={performance.goal_progress.progress_percentage} className="h-2" />
                <div className="text-sm text-muted-foreground mt-1">
                  {performance.goal_progress.progress_percentage.toFixed(1)}% complete
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="weekly-report">Weekly Report</TabsTrigger>
          <TabsTrigger value="growth-predictions">Growth Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No insights available</h3>
                <p className="text-muted-foreground mb-4">
                  Your AI coach is still learning about your business. Publish a few posts to get personalized insights.
                </p>
                <Button onClick={generateNewInsights}>
                  Generate Initial Insights
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {insights.map((insight) => (
                <Card key={insight.id} className={!insight.is_read ? 'border-blue-200 bg-blue-50/50' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(insight.priority)}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <Badge variant={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                      </div>
                      {insight.action_required && (
                        <Badge variant="destructive">Action Required</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Confidence: {(insight.confidence_score * 100).toFixed(0)}%</span>
                      <span>Impact: {insight.predicted_impact}</span>
                      <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p>{insight.content}</p>
                    </div>
                    {!insight.is_read && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => markInsightAsRead(insight.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="weekly-report">
          {weeklyReport ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Performance Report
                </CardTitle>
                <CardDescription>
                  {new Date(weeklyReport.week_start).toLocaleDateString()} - {new Date(weeklyReport.week_end).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{weeklyReport.posts_published}</div>
                    <div className="text-sm text-muted-foreground">Posts Published</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{weeklyReport.total_reach.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Reach</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{weeklyReport.total_engagement.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Engagement</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{(weeklyReport.avg_engagement_rate * 100).toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Avg. Engagement Rate</div>
                  </div>
                </div>

                {/* Best Performing Post */}
                {weeklyReport.best_performing_post && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Best Performing Post
                    </h4>
                    <Alert>
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">"{weeklyReport.best_performing_post.content.substring(0, 100)}..."</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>Platform: {weeklyReport.best_performing_post.platform}</span>
                            <span>Engagement Rate: {(weeklyReport.best_performing_post.engagement_rate * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Improvement Areas */}
                {weeklyReport.improvement_areas.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      {weeklyReport.improvement_areas.map((area, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Week Recommendations */}
                {weeklyReport.next_week_recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Recommendations for Next Week</h4>
                    <ul className="space-y-2">
                      {weeklyReport.next_week_recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No weekly report available</h3>
                <p className="text-muted-foreground">
                  Weekly reports are generated after you've been active for at least a week.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="growth-predictions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Predictions
              </CardTitle>
              <CardDescription>
                AI-powered predictions based on your current performance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Growth predictions will be available after you have at least 2 weeks of posting history.
                    Keep posting consistently to unlock this feature!
                  </AlertDescription>
                </Alert>
                
                {performance?.growth_rate && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold">+{(performance.growth_rate * 100).toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Projected Monthly Growth</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">Positive</div>
                      <div className="text-sm text-muted-foreground">Growth Trend</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold">Coming Soon</div>
                      <div className="text-sm text-muted-foreground">Revenue Predictions</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
