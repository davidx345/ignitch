"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Instagram,
  Facebook,
  Youtube,
  MessageSquare,
  Share2,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Eye,
} from "lucide-react"

interface Platform {
  id: string
  name: string
  icon: any
  connected: boolean
  followers: number
  engagement: number
  status: "active" | "pending" | "error"
  lastPost: string
  postsScheduled: number
}

interface DistributionStats {
  totalReach: number
  totalEngagement: number
  platformsActive: number
  postsPublished: number
}

interface MultiPlatformDistributionProps {
  generatedContent: any[]
}

export default function MultiPlatformDistribution({ generatedContent }: MultiPlatformDistributionProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      connected: true,
      followers: 12500,
      engagement: 4.2,
      status: "active",
      lastPost: "2 hours ago",
      postsScheduled: 8,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      connected: true,
      followers: 8900,
      engagement: 3.1,
      status: "active",
      lastPost: "5 hours ago",
      postsScheduled: 5,
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: MessageSquare,
      connected: true,
      followers: 23400,
      engagement: 6.8,
      status: "active",
      lastPost: "1 day ago",
      postsScheduled: 12,
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: Youtube,
      connected: true,
      followers: 5600,
      engagement: 2.9,
      status: "pending",
      lastPost: "3 days ago",
      postsScheduled: 3,
    },
    {
      id: "whatsapp",
      name: "WhatsApp Status",
      icon: MessageSquare,
      connected: false,
      followers: 0,
      engagement: 0,
      status: "error",
      lastPost: "Never",
      postsScheduled: 0,
    },
  ])

  const [distributionStats] = useState<DistributionStats>({
    totalReach: 156780,
    totalEngagement: 12450,
    platformsActive: 4,
    postsPublished: 89,
  })

  const [isDistributing, setIsDistributing] = useState(false)

  const togglePlatform = (platformId: string) => {
    setPlatforms(
      platforms.map((platform) =>
        platform.id === platformId ? { ...platform, connected: !platform.connected } : platform,
      ),
    )
  }

  const distributeContent = async () => {
    setIsDistributing(true)

    // Simulate content distribution
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setIsDistributing(false)

    // Show success message
    alert("Content distributed successfully across all connected platforms!")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Distribution Overview */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-purple-600" />
            <span>Multi-Platform Distribution</span>
          </CardTitle>
          <CardDescription>
            Distribute content across all connected social media platforms simultaneously
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{distributionStats.totalReach.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Reach</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {distributionStats.totalEngagement.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Engagement</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{distributionStats.platformsActive}</div>
              <div className="text-sm text-gray-600">Active Platforms</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{distributionStats.postsPublished}</div>
              <div className="text-sm text-gray-600">Posts Published</div>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={distributeContent}
              disabled={isDistributing || generatedContent.length === 0}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isDistributing ? (
                <>
                  <Share2 className="w-4 h-4 mr-2 animate-spin" />
                  Distributing Content...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Distribute to All Platforms
                </>
              )}
            </Button>
          </div>

          {isDistributing && (
            <div className="mt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Publishing to platforms...</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="w-full" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Management */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
          <CardDescription>Manage your social media platform connections and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => {
              const Icon = platform.icon
              return (
                <Card key={platform.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-6 h-6 text-gray-600" />
                        <div>
                          <h4 className="font-semibold">{platform.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusIcon(platform.status)}
                            <Badge className={getStatusColor(platform.status)}>{platform.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <Switch checked={platform.connected} onCheckedChange={() => togglePlatform(platform.id)} />
                    </div>

                    {platform.connected && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-lg">{platform.followers.toLocaleString()}</div>
                            <div className="text-gray-600 text-xs">Followers</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg">{platform.engagement}%</div>
                            <div className="text-gray-600 text-xs">Engagement</div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Last post:</span>
                            <span>{platform.lastPost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Scheduled:</span>
                            <span>{platform.postsScheduled} posts</span>
                          </div>
                        </div>

                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          Configure Settings
                        </Button>
                      </div>
                    )}

                    {!platform.connected && (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-3">
                          Connect your {platform.name} account to start distributing content
                        </p>
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                          Connect Account
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Analytics */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle>Distribution Analytics</CardTitle>
          <CardDescription>Track performance across all platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="reach">Reach & Impressions</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                    Top Performing Platforms
                  </h4>
                  <div className="space-y-3">
                    {platforms
                      .filter((p) => p.connected)
                      .sort((a, b) => b.engagement - a.engagement)
                      .map((platform, index) => {
                        const Icon = platform.icon
                        return (
                          <div key={platform.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">#{index + 1}</span>
                              <Icon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm">{platform.name}</span>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {platform.engagement}% engagement
                            </Badge>
                          </div>
                        )
                      })}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    Audience Distribution
                  </h4>
                  <div className="space-y-3">
                    {platforms
                      .filter((p) => p.connected)
                      .map((platform) => {
                        const Icon = platform.icon
                        const percentage = Math.round(
                          (platform.followers /
                            platforms.filter((p) => p.connected).reduce((sum, p) => sum + p.followers, 0)) *
                            100,
                        )
                        return (
                          <div key={platform.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Icon className="w-4 h-4 text-gray-600" />
                                <span className="text-sm">{platform.name}</span>
                              </div>
                              <span className="text-sm font-medium">{percentage}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reach" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">2.4M</div>
                  <div className="text-sm text-gray-600">Total Impressions</div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
                    +15% this week
                  </Badge>
                </Card>
                <Card className="p-4 text-center">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">156K</div>
                  <div className="text-sm text-gray-600">Unique Reach</div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
                    +8% this week
                  </Badge>
                </Card>
                <Card className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">4.2%</div>
                  <div className="text-sm text-gray-600">Avg. Engagement</div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
                    +0.3% this week
                  </Badge>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-purple-900">Engagement Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-purple-800 mb-2">
                      <strong>Best performing content type:</strong> Carousel posts
                    </p>
                    <p className="text-purple-800 mb-2">
                      <strong>Peak engagement time:</strong> 2-4 PM weekdays
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-800 mb-2">
                      <strong>Top hashtag:</strong> #sustainablefashion
                    </p>
                    <p className="text-purple-800 mb-2">
                      <strong>Avg. comments per post:</strong> 23
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
