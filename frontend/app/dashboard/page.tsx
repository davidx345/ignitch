"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { AIBusinessCoach } from "@/components/ai-business-coach"
import { AutoPilotMode } from "@/components/auto-pilot-mode"
import SocialMediaManager from "@/components/social-media/SocialMediaManager"
import OnboardingTrigger from "@/components/onboarding/OnboardingTrigger"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { 
  Upload, 
  BarChart3, 
  Calendar, 
  Award, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Eye, 
  Heart,
  Brain,
  Bot,
  Target,
  Loader,
  ChevronUp,
  ChevronDown,
  Activity,
  Globe,
  Layers,
  Clock,
  Star,
  Bell,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Share2
} from "lucide-react"

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
  const [notifications, setNotifications] = useState(3)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [socialMediaTab, setSocialMediaTab] = useState('content-hub')

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

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
      setIsRefreshing(true)
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
        
        // Check if this is a new user and show onboarding
        const hasSeenOnboarding = localStorage.getItem('adflow-onboarding-seen')
        if (!hasSeenOnboarding && (!data.recent_posts || data.recent_posts.length === 0)) {
          setShowOnboarding(true)
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
        setIsRefreshing(false)
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
            <div className="absolute inset-0 w-12 h-12 mx-auto border-2 border-transparent border-t-brand-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-neutral-600 font-medium">Authenticating...</p>
        </motion.div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null
  }

  // Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-8 bg-neutral-200 rounded-lg w-64 animate-pulse"></div>
                  <div className="h-4 bg-neutral-200 rounded w-96 animate-pulse"></div>
                </div>
                <div className="h-10 bg-neutral-200 rounded-lg w-32 animate-pulse"></div>
              </div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-200 rounded w-20 animate-pulse"></div>
                      <div className="h-8 bg-neutral-200 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="h-12 w-12 bg-neutral-200 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 bg-semantic-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-semantic-error" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">Connection Error</h3>
          <p className="text-neutral-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/settings')}
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              Check Settings
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-600 font-medium">No dashboard data available</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </motion.div>
      </div>
    )
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

  // Calculate trends (mock data for demo)
  const getTrendData = (value: number) => {
    const trend = Math.random() > 0.5 ? 'up' : 'down'
    const percentage = Math.floor(Math.random() * 25) + 1
    return { trend, percentage }
  }

  // Enhanced stats with trends and icons
  const stats = [
    { 
      label: "Total Posts", 
      value: dashboardData?.stats?.total_posts?.toString() || "0", 
      icon: Upload, 
      color: "brand-primary",
      trend: getTrendData(dashboardData?.stats?.total_posts || 0)
    },
    { 
      label: "Total Reach", 
      value: formatNumber(dashboardData?.stats?.total_reach || 0), 
      icon: Eye, 
      color: "semantic-success",
      trend: getTrendData(dashboardData?.stats?.total_reach || 0)
    },
    { 
      label: "Engagement Rate", 
      value: `${dashboardData?.stats?.avg_engagement || 0}%`, 
      icon: Heart, 
      color: "accent-coral",
      trend: getTrendData(dashboardData?.stats?.avg_engagement || 0)
    },
    { 
      label: "Connected Platforms", 
      value: dashboardData?.stats?.connected_platforms?.toString() || "0", 
      icon: Globe, 
      color: "accent-purple",
      trend: getTrendData(dashboardData?.stats?.connected_platforms || 0)
    },
  ]

  const quickActions = [
    {
      title: "Create Content",
      description: "Generate AI-powered social media content",
      icon: Upload,
      color: "brand-primary",
      href: "#",
      featured: true,
      onClick: () => {
        setSocialMediaTab('create')
        setActiveTab("social-media")
      }
    },
    {
      title: "Billboard Marketplace",
      description: "Advertise on global digital billboards",
      icon: Layers,
      color: "accent-purple",
      href: "/billboards"
    },
    {
      title: "Schedule Posts",
      description: "Plan your content calendar",
      icon: Calendar,
      color: "semantic-warning",
      onClick: () => {
        setSocialMediaTab('scheduler')
        setActiveTab("social-media")
      }
    },
    {
      title: "Analytics Deep Dive",
      description: "Detailed performance insights",
      icon: BarChart3,
      color: "semantic-success",
      onClick: () => {
        setSocialMediaTab('analytics')
        setActiveTab("social-media")
      }
    }
  ]

  const aiFeatures = [
    { 
      title: "AI Business Coach", 
      description: "Get personalized insights and growth recommendations powered by advanced AI",
      icon: Brain,
      color: "brand-primary",
      tab: "ai-coach",
      status: "Active",
      metrics: "94% accuracy rate"
    },
    { 
      title: "Auto-Pilot Mode", 
      description: "Let AI manage your content strategy and posting schedule automatically",
      icon: Bot,
      color: "accent-purple",
      tab: "auto-pilot",
      status: "Beta",
      metrics: "3x engagement boost"
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and nav */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">Ignitch</h1>
                  <p className="text-xs text-neutral-500 leading-none">AI-Powered Growth</p>
                </div>
              </div>
            </div>

            {/* Right side - Actions and user */}
            <div className="flex items-center space-x-4">
              {/* Performance indicator */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-semantic-success/10 rounded-lg">
                <div className="w-2 h-2 bg-semantic-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-semantic-success">Live</span>
              </div>

              {/* Visibility score */}
              <Card className="hidden lg:block border-0 shadow-sm">
                <CardContent className="px-4 py-2">
                  <div className="flex items-center space-x-3">
                    <Award className="w-4 h-4 text-accent-orange" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-neutral-900">
                          {dashboardData?.stats?.visibility_score || 0}
                        </span>
                        <span className="text-xs text-neutral-500">/100</span>
                      </div>
                      <Progress 
                        value={dashboardData?.stats?.visibility_score || 0} 
                        className="h-1 w-16" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <button className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-coral text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Refresh button */}
              <button 
                onClick={() => window.location.reload()}
                disabled={isRefreshing}
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* CTA Buttons */}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => (window.location.href = "/billboards")}
                  className="hidden sm:flex"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Billboards
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    setSocialMediaTab('create')
                    setActiveTab("social-media")
                  }}
                  className="bg-brand-primary hover:bg-brand-primary/90"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="heading-2xl text-neutral-900 mb-2">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Creator'}! 👋
              </h2>
              <p className="body-large text-neutral-600">
                Your AI-powered growth dashboard is ready. Let's boost your social presence today.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
            </div>
          </div>
        </motion.div>

        {/* Professional Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-12 bg-neutral-100 p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="social-media" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Social Media
            </TabsTrigger>
            <TabsTrigger 
              value="ai-coach" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Coach
            </TabsTrigger>
            <TabsTrigger 
              value="auto-pilot" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
            >
              <Bot className="w-4 h-4 mr-2" />
              Auto-Pilot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Enhanced Stats Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="stat-card group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="body-small text-neutral-600 font-medium">{stat.label}</p>
                          <div className="flex items-end space-x-2">
                            <p className="heading-xl text-neutral-900">{stat.value}</p>
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                              stat.trend.trend === 'up' 
                                ? 'bg-semantic-success/10 text-semantic-success' 
                                : 'bg-semantic-warning/10 text-semantic-warning'
                            }`}>
                              {stat.trend.trend === 'up' ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                              <span>{stat.trend.percentage}%</span>
                            </div>
                          </div>
                          <p className="caption text-neutral-500">vs last month</p>
                        </div>
                        <div className={`icon-container bg-${stat.color}/10 group-hover:bg-${stat.color}/20 transition-colors duration-200`}>
                          <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <h3 className="heading-lg text-neutral-900">Quick Actions</h3>
                  <p className="body-small text-neutral-600">Jump into your most important tasks</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md group ${
                          action.featured 
                            ? 'border-2 border-brand-primary/20 bg-brand-primary/5' 
                            : 'hover:border-neutral-300'
                        }`}
                        onClick={() => action.onClick ? action.onClick() : (window.location.href = action.href)}
                      >
                        <CardContent className="p-6 text-center">
                          <div className={`icon-container mx-auto mb-4 bg-${action.color}/10 group-hover:bg-${action.color}/20`}>
                            <action.icon className={`w-6 h-6 text-${action.color}`} />
                          </div>
                          <h4 className="heading-sm text-neutral-900 mb-2">{action.title}</h4>
                          <p className="caption text-neutral-600 leading-relaxed">{action.description}</p>
                          {action.featured && (
                            <Badge className="mt-3 bg-brand-primary text-white border-0">
                              Recommended
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Activity Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Recent Posts - Enhanced */}
              <div className="xl:col-span-2">
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="heading-lg text-neutral-900">Recent Activity</h3>
                        <p className="body-small text-neutral-600">Your latest content performance</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recent_posts && dashboardData.recent_posts.length > 0 ? (
                        dashboardData.recent_posts.slice(0, 4).map((post, index) => (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-4 p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors group cursor-pointer"
                          >
                            <div className="relative">
                              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                {post.has_media ? (
                                  <Eye className="w-5 h-5 text-brand-primary" />
                                ) : (
                                  <div className="text-xs font-bold text-neutral-600">TXT</div>
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-semantic-success rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h4 className="body-medium font-medium text-neutral-900 truncate">
                                    {post.title || `${post.platform} Post`}
                                  </h4>
                                  <p className="caption text-neutral-500">
                                    {new Date(post.created_at).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })} • {post.platform}
                                  </p>
                                </div>
                                <Badge 
                                  className={`${
                                    post.status === 'published' 
                                      ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/20' 
                                      : 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20'
                                  }`}
                                >
                                  {post.status === 'published' ? 'Live' : 'Draft'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-6 mt-3">
                                <div className="flex items-center space-x-2">
                                  <Eye className="w-4 h-4 text-neutral-400" />
                                  <span className="caption text-neutral-600 font-medium">
                                    {formatNumber(post.reach)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Heart className="w-4 h-4 text-neutral-400" />
                                  <span className="caption text-neutral-600 font-medium">
                                    {post.engagement}%
                                  </span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary transition-colors ml-auto" />
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-8 h-8 text-neutral-400" />
                          </div>
                          <h4 className="heading-sm text-neutral-900 mb-2">No content yet</h4>
                          <p className="body-small text-neutral-600 mb-6">Start creating amazing content to see your analytics here</p>
                          <Button 
                            onClick={() => {
                              setSocialMediaTab('create')
                              setActiveTab("social-media")
                            }}
                            className="bg-brand-primary hover:bg-brand-primary/90"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Create Your First Post
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Insights - Enhanced */}
              <div>
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent-orange/10 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-accent-orange" />
                      </div>
                      <div>
                        <h3 className="heading-sm text-neutral-900">Growth Tips</h3>
                        <p className="caption text-neutral-600">AI-powered insights</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.visibility_tips && dashboardData.visibility_tips.length > 0 ? (
                        dashboardData.visibility_tips.slice(0, 3).map((tip: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-accent-orange/5 border border-accent-orange/10"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-accent-orange/10 rounded-full flex items-center justify-center mt-0.5">
                                <TrendingUp className="w-3 h-3 text-accent-orange" />
                              </div>
                              <p className="body-small text-neutral-700 leading-relaxed flex-1">{tip}</p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Target className="w-6 h-6 text-neutral-400" />
                          </div>
                          <p className="body-small text-neutral-600">Tips will appear as you create content</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Score */}
                <Card className="mt-6 shadow-sm">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <TrendingUp className="w-8 h-8 text-brand-primary" />
                      </div>
                      <div>
                        <h4 className="heading-sm text-neutral-900">Performance Score</h4>
                        <p className="caption text-neutral-600 mt-1">This week</p>
                      </div>
                      <div className="space-y-3">
                        <div className="text-3xl font-bold text-brand-primary">
                          {dashboardData?.stats?.visibility_score || 0}
                        </div>
                        <Progress 
                          value={dashboardData?.stats?.visibility_score || 0} 
                          className="h-2" 
                        />
                        <p className="caption text-neutral-500">
                          {dashboardData?.stats?.visibility_score >= 70 ? 'Excellent' : 
                           dashboardData?.stats?.visibility_score >= 50 ? 'Good' : 'Needs Improvement'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social-media">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SocialMediaManager initialTab={socialMediaTab} />
            </motion.div>
          </TabsContent>

          <TabsContent value="ai-coach">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AIBusinessCoach />
            </motion.div>
          </TabsContent>

          <TabsContent value="auto-pilot">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AutoPilotMode />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Onboarding System */}
      <OnboardingTrigger
        onNavigate={setActiveTab}
        showInitialGuide={showOnboarding}
      />
    </div>
  )
}
