/**
 * Core Social Media Manager Component
 * Minimalist design with neutral colors and modular architecture
 */

'use client'

import React, { useState, useEffect, Suspense, lazy } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  PenTool, 
  Calendar, 
  BarChart3, 
  Settings, 
  Zap,
  Users,
  Clock,
  Target,
  RefreshCw
} from 'lucide-react'
import { colors, spacing, typography } from '@/lib/design-system'
import { useApiService } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

// Import our modular components with lazy loading for performance
const ContentHub = lazy(() => import('./core/ContentHub'))
const ContentCreator = lazy(() => import('./content/ContentCreator'))
const SmartScheduler = lazy(() => import('./scheduling/SmartScheduler'))
const SocialAnalytics = lazy(() => import('./analytics/SocialAnalytics'))
const PlatformManager = lazy(() => import('./core/PlatformManager'))

// Loading component for Suspense
const ComponentLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
)

// Types for the main component
interface SocialMediaManagerProps {
  className?: string
}

interface TabConfig {
  id: string
  label: string
  icon: React.ReactNode
  component: React.ComponentType<any>
  badge?: string
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ className = '' }) => {
  const { user, session } = useAuth()
  const api = useApiService()
  const [activeTab, setActiveTab] = useState('content-hub')
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    connectedPlatforms: 0,
    avgEngagement: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Tab configuration
  const tabs: TabConfig[] = [
    {
      id: 'content-hub',
      label: 'Content Hub',
      icon: <PenTool className="w-4 h-4" />,
      component: ContentHub
    },
    {
      id: 'create',
      label: 'Create',
      icon: <Zap className="w-4 h-4" />,
      component: ContentCreator
    },
    {
      id: 'scheduler',
      label: 'Schedule',
      icon: <Calendar className="w-4 h-4" />,
      component: SmartScheduler,
      badge: stats.scheduledPosts > 0 ? stats.scheduledPosts.toString() : undefined
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      component: SocialAnalytics
    },
    {
      id: 'platforms',
      label: 'Platforms',
      icon: <Users className="w-4 h-4" />,
      component: PlatformManager
    }
  ]

  useEffect(() => {
    if (user && session) {
      loadDashboardStats()
    }
  }, [user, session])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get dashboard stats from backend
      const statsResponse = await api.getDashboardStats()
      
      if (statsResponse.success && statsResponse.data) {
        const dashboardData = statsResponse.data as any
        setStats({
          totalPosts: dashboardData?.stats?.total_posts || dashboardData?.total_posts || 0,
          scheduledPosts: dashboardData?.stats?.scheduled_posts || dashboardData?.scheduled_posts || 0,
          connectedPlatforms: dashboardData?.stats?.connected_platforms || dashboardData?.connected_platforms || 0,
          avgEngagement: dashboardData?.stats?.avg_engagement || dashboardData?.avg_engagement || 0
        })
      }

      // Get social accounts to count connected platforms as fallback
      const accountsResponse = await api.getSocialAccounts()
      if (accountsResponse.success && accountsResponse.data && Array.isArray(accountsResponse.data)) {
        const connectedPlatforms = accountsResponse.data.filter((account: any) => account.is_active).length
        setStats(prev => ({
          ...prev,
          connectedPlatforms: Math.max(prev.connectedPlatforms, connectedPlatforms)
        }))
      }
    } catch (err: any) {
      console.error('Dashboard stats error:', err)
      setError('Unable to load dashboard data')
      
      // Fallback to default values
      setStats({
        totalPosts: 0,
        scheduledPosts: 0,
        connectedPlatforms: 0,
        avgEngagement: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardStats()
    setRefreshing(false)
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 
                className="text-3xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: typography.fonts.sans.join(', ') }}
              >
                Social Media Manager
              </h1>
              <p className="text-gray-600 text-base">
                Create, schedule, and analyze your social media content
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Posts</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loading ? '—' : stats.totalPosts}
                    </p>
                  </div>
                  <PenTool className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Scheduled</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loading ? '—' : stats.scheduledPosts}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Platforms</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loading ? '—' : stats.connectedPlatforms}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg. Engagement</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loading ? '—' : `${stats.avgEngagement}%`}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 shadow-sm h-12">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-600 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {tab.icon}
                  <span className="hidden sm:inline text-sm font-medium">
                    {tab.label}
                  </span>
                  {tab.badge && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 bg-gray-100 text-gray-700 text-xs"
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="space-y-6 mt-6"
            >
              <div className="min-h-[500px]">
                <Suspense fallback={<ComponentLoader />}>
                  <tab.component 
                    onStatsUpdate={setStats} 
                    apiService={api}
                    refreshStats={loadDashboardStats}
                  />
                </Suspense>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

export default SocialMediaManager
