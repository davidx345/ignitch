"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIBusinessCoach } from "@/components/ai-business-coach"
import { AutoPilotMode } from "@/components/auto-pilot-mode"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { 
  Sparkles, 
  Upload, 
  BarChart3, 
  Calendar, 
  Award, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart,
  Brain,
  Bot,
  Zap,
  Target,
  Loader
} from "lucide-react"

// Ignitch Color System
const colors = {
  primary: "#3D5AFE",
  coral: "#FF6B6B",
  ink: "#1B1F3B",
  gray: "#F4F6FA",
  white: "#FFFFFF",
  mint: "#24CCA0",
  charcoal: "#2E2E3A",
  purple: "#8B5CF6",
  orange: "#F59E0B"
}

interface DashboardStats {
  total_posts: number;
  total_reach: number;
  avg_engagement: number;
  connected_platforms: number;
  posts_this_week: number;
  visibility_score: number;
}

interface RecentPost {
  id: string;
  title: string;
  platform: string;
  content_preview: string;
  status: string;
  reach: number;
  engagement: number;
  created_at: string;
  has_media: boolean;
}

interface PerformanceInsight {
  metric: string;
  value: string;
  trend: string;
  period: string;
  description: string;
}

interface DashboardData {
  stats: DashboardStats;
  platform_performance: any[];
  recent_posts: RecentPost[];
  visibility_tips: string[];
  performance_insights?: PerformanceInsight[];
  trending_hashtags?: string[];
  best_performing_content?: any[];
}

export default function Dashboard() {
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null)

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin')
      return
    }
  }, [user, authLoading, router])

  // Fetch dashboard data from API
  useEffect(() => {
    if (!session || !user) return

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('https://ignitch-api-8f7efad07047.herokuapp.com/api/dashboard/overview', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: DashboardData = await response.json()
        setDashboardData(data)
        
        // TODO: Setup WebSocket for real-time updates when available
        // Remove WebSocket code for now since backend doesn't provide websocket_url
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    // Cleanup WebSocket on unmount
    return () => {
      if (wsConnection) {
        wsConnection.close()
      }
    }
  }, [session, user])

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.gray }}>
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null
  }

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.gray }}>
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.gray }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.gray }}>
        <p className="text-gray-600">No dashboard data available</p>
      </div>
    )
  }

  const stats = [
    { 
      label: "Total Posts", 
      value: dashboardData?.stats?.total_posts?.toString() || "0", 
      icon: Upload, 
      color: colors.primary 
    },
    { 
      label: "Total Reach", 
      value: formatNumber(dashboardData?.stats?.total_reach || 0), 
      icon: Eye, 
      color: colors.mint 
    },
    { 
      label: "Avg Engagement", 
      value: `${dashboardData?.stats?.avg_engagement || 0}%`, 
      icon: Heart, 
      color: colors.coral 
    },
    { 
      label: "Platforms", 
      value: dashboardData?.stats?.connected_platforms?.toString() || "0", 
      icon: Users, 
      color: colors.purple 
    },
  ]

  const aiFeatures = [
    { 
      title: "AI Business Coach", 
      description: "Get personalized insights and growth recommendations",
      icon: Brain,
      color: colors.primary,
      tab: "ai-coach"
    },
    { 
      title: "Auto-Pilot Mode", 
      description: "Let AI manage your content strategy automatically",
      icon: Bot,
      color: colors.purple,
      tab: "auto-pilot"
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.gray }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.ink }}>
                  Ignitch Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Welcome back! Your AI-powered social media assistant is ready.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Card className="px-3 py-2 sm:px-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Award className="w-4 h-4" style={{ color: colors.mint }} />
                  <span className="text-xs sm:text-sm font-semibold">
                    Visibility Score: {dashboardData?.stats?.visibility_score || 0}/100
                  </span>
                </div>
              </Card>
              <div className="flex space-x-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                  onClick={() => (window.location.href = "/billboards")}
                >
                  Billboard Marketplace
                </Button>
                <Button 
                  size="sm"
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                  style={{ backgroundColor: colors.primary }} 
                  onClick={() => (window.location.href = "/upload")}
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Create Ad
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="ai-coach" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">AI Coach</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="auto-pilot" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Auto-Pilot</span>
              <span className="sm:hidden">Auto</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid - REAL DATA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-2xl sm:text-3xl font-bold" style={{ color: colors.ink }}>
                            {stat.value}
                          </p>
                        </div>
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${stat.color}20` }}
                        >
                          <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: stat.color }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* AI Features Highlight */}
            <Card className="shadow-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2" style={{ color: colors.ink }}>
                      <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      AI-Powered Features
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">Experience the future of social media management</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 self-start sm:self-auto">New</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {aiFeatures.map((feature, index) => (
                    <Card key={index} className="bg-white border-0 shadow-md hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => setActiveTab(feature.tab)}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${feature.color}20` }}
                          >
                            <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg" style={{ color: colors.ink }}>
                              {feature.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6" style={{ color: colors.ink }}>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <Button
                    size="lg"
                    className="h-12 sm:h-16 flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm"
                    style={{ backgroundColor: colors.primary }}
                    onClick={() => (window.location.href = "/upload")}
                  >
                    <Upload className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span>Upload & Create</span>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 sm:h-16 flex-col space-y-1 sm:space-y-2 bg-transparent text-xs sm:text-sm">
                    <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span>Schedule Posts</span>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-12 sm:h-16 flex-col space-y-1 sm:space-y-2 bg-transparent text-xs sm:text-sm"
                    onClick={() => (window.location.href = "/billboards")}
                  >
                    <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span>Billboard Ads</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity - REAL DATA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: colors.ink }}>
                    Recent Posts
                  </h3>
                  <div className="space-y-4">
                    {dashboardData.recent_posts && dashboardData.recent_posts.length > 0 ? (
                      dashboardData.recent_posts.slice(0, 3).map((post, index) => (
                        <div key={post.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            {post.has_media ? (
                              <Eye className="w-6 h-6 text-gray-500" />
                            ) : (
                              <div className="text-xs font-bold text-gray-500">TXT</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{post.title || `${post.platform} Post`}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(post.created_at).toLocaleDateString()} • {formatNumber(post.reach)} reach
                            </p>
                          </div>
                          <Badge 
                            style={{ 
                              backgroundColor: post.status === 'published' ? `${colors.mint}20` : `${colors.orange}20`, 
                              color: post.status === 'published' ? colors.mint : colors.orange 
                            }}
                          >
                            {post.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-2">No posts yet</p>
                        <p className="text-xs text-gray-400">Create your first post to see it here</p>
                        <Button 
                          className="mt-4" 
                          size="sm"
                          style={{ backgroundColor: colors.primary }}
                          onClick={() => (window.location.href = "/upload")}
                        >
                          Create Post
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: colors.ink }}>
                    Performance Insights
                  </h3>
                  <div className="space-y-4">
                    {dashboardData.visibility_tips && dashboardData.visibility_tips.length > 0 ? (
                      dashboardData.visibility_tips.slice(0, 3).map((tip: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Target 
                              className="w-5 h-5" 
                              style={{ color: colors.mint }} 
                            />
                            <span className="text-sm font-medium">{tip}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-2">No tips yet</p>
                        <p className="text-xs text-gray-400">Start posting content to get visibility tips</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-coach">
            <AIBusinessCoach />
          </TabsContent>

          <TabsContent value="auto-pilot">
            <AutoPilotMode />
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: colors.ink }}>
                  Advanced Analytics
                </h3>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Advanced analytics dashboard coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
