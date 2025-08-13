"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Eye, Heart, DollarSign, Target, Download } from "lucide-react"

interface AnalyticsData {
  period: string
  metrics: {
    totalReach: number
    totalEngagement: number
    totalImpressions: number
    totalClicks: number
    conversionRate: number
    roas: number
  }
  growth: {
    reach: number
    engagement: number
    followers: number
    revenue: number
  }
}

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [selectedPlatform, setSelectedPlatform] = useState("all")

  const [analyticsData] = useState<AnalyticsData>({
    period: "7d",
    metrics: {
      totalReach: 156780,
      totalEngagement: 12450,
      totalImpressions: 2340000,
      totalClicks: 8920,
      conversionRate: 3.2,
      roas: 4.8,
    },
    growth: {
      reach: 15.3,
      engagement: 8.7,
      followers: 12.1,
      revenue: 23.4,
    },
  })

  const platformData = [
    { platform: "Instagram", reach: 67890, engagement: 5.2, color: "bg-pink-500" },
    { platform: "Facebook", reach: 45230, engagement: 3.8, color: "bg-blue-500" },
    { platform: "TikTok", reach: 89340, engagement: 7.1, color: "bg-black" },
    { platform: "YouTube", reach: 23450, engagement: 2.9, color: "bg-red-500" },
  ]

  const topContent = [
    {
      id: "1",
      title: "Summer Collection Launch Post",
      platform: "Instagram",
      reach: 23400,
      engagement: 8.2,
      clicks: 1240,
      conversions: 89,
    },
    {
      id: "2",
      title: "Behind the Scenes Reel",
      platform: "TikTok",
      reach: 45600,
      engagement: 12.1,
      clicks: 2340,
      conversions: 156,
    },
    {
      id: "3",
      title: "Product Tutorial Video",
      platform: "YouTube",
      reach: 12300,
      engagement: 6.4,
      clicks: 890,
      conversions: 67,
    },
  ]

  const audienceInsights = {
    demographics: {
      age: [
        { range: "18-24", percentage: 28 },
        { range: "25-34", percentage: 42 },
        { range: "35-44", percentage: 23 },
        { range: "45+", percentage: 7 },
      ],
      gender: [
        { type: "Female", percentage: 68 },
        { type: "Male", percentage: 30 },
        { type: "Other", percentage: 2 },
      ],
      location: [
        { country: "United States", percentage: 45 },
        { country: "Canada", percentage: 18 },
        { country: "United Kingdom", percentage: 15 },
        { country: "Australia", percentage: 12 },
        { country: "Other", percentage: 10 },
      ],
    },
  }

  const exportData = () => {
    // Simulate data export
    alert("Analytics data exported successfully!")
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>Analytics Dashboard</span>
          </CardTitle>
          <CardDescription>Comprehensive insights across all platforms and campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportData} variant="outline" className="w-full sm:w-auto bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="p-4 text-center">
              <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analyticsData.metrics.totalReach.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Reach</div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1">
                +{analyticsData.growth.reach}%
              </Badge>
            </Card>

            <Card className="p-4 text-center">
              <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analyticsData.metrics.totalEngagement.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Engagement</div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1">
                +{analyticsData.growth.engagement}%
              </Badge>
            </Card>

            <Card className="p-4 text-center">
              <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{(analyticsData.metrics.totalImpressions / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-gray-600">Impressions</div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1">
                +18.2%
              </Badge>
            </Card>

            <Card className="p-4 text-center">
              <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analyticsData.metrics.totalClicks.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Clicks</div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1">
                +12.4%
              </Badge>
            </Card>

            <Card className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analyticsData.metrics.conversionRate}%</div>
              <div className="text-sm text-gray-600">Conversion</div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1">
                +0.8%
              </Badge>
            </Card>

            <Card className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analyticsData.metrics.roas}x</div>
              <div className="text-sm text-gray-600">ROAS</div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1">
                +{analyticsData.growth.revenue}%
              </Badge>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Compare performance across all connected platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformData.map((platform, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${platform.color}`}></div>
                    <div>
                      <div className="font-semibold">{platform.platform}</div>
                      <div className="text-sm text-gray-600">{platform.reach.toLocaleString()} reach</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{platform.engagement}%</div>
                    <div className="text-sm text-gray-600">engagement</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Content */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
            <CardDescription>Your best performing posts and campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topContent.map((content, index) => (
                <Card key={content.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-sm">{content.title}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {content.platform}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{content.engagement}%</div>
                        <div className="text-xs text-gray-600">engagement</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div>
                        <div className="font-medium">{content.reach.toLocaleString()}</div>
                        <div className="text-gray-600">Reach</div>
                      </div>
                      <div>
                        <div className="font-medium">{content.clicks}</div>
                        <div className="text-gray-600">Clicks</div>
                      </div>
                      <div>
                        <div className="font-medium">{content.conversions}</div>
                        <div className="text-gray-600">Conversions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
          <CardDescription>Deep dive into your audience and content performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="audience" className="space-y-4">
            <TabsList>
              <TabsTrigger value="audience">Audience Insights</TabsTrigger>
              <TabsTrigger value="content">Content Analysis</TabsTrigger>
              <TabsTrigger value="revenue">Revenue Tracking</TabsTrigger>
              <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="audience" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-4">Age Distribution</h4>
                  <div className="space-y-3">
                    {audienceInsights.demographics.age.map((age, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{age.range}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${age.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{age.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-4">Gender Split</h4>
                  <div className="space-y-3">
                    {audienceInsights.demographics.gender.map((gender, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{gender.type}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${gender.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{gender.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-4">Top Locations</h4>
                  <div className="space-y-3">
                    {audienceInsights.demographics.location.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{location.country}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${location.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{location.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-4">Content Type Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Carousel Posts</span>
                      <Badge className="bg-green-100 text-green-800">8.2% avg engagement</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Reels/Videos</span>
                      <Badge className="bg-blue-100 text-blue-800">6.4% avg engagement</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Single Images</span>
                      <Badge className="bg-yellow-100 text-yellow-800">4.1% avg engagement</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Stories</span>
                      <Badge className="bg-purple-100 text-purple-800">12.3% completion rate</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-4">Best Posting Times</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tuesday 2-4 PM</span>
                      <Badge className="bg-green-100 text-green-800">Highest engagement</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Thursday 6-8 PM</span>
                      <Badge className="bg-blue-100 text-blue-800">Best reach</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sunday 10 AM-12 PM</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Most shares</Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">$12,450</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
                    +23.4% this month
                  </Badge>
                </Card>
                <Card className="p-4 text-center">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">$2,890</div>
                  <div className="text-sm text-gray-600">Ad Spend</div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 mt-2">
                    4.3x ROAS
                  </Badge>
                </Card>
                <Card className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">$89.50</div>
                  <div className="text-sm text-gray-600">Avg Order Value</div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 mt-2">
                    +12.1% increase
                  </Badge>
                </Card>
                <Card className="p-4 text-center">
                  <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">139</div>
                  <div className="text-sm text-gray-600">Conversions</div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 mt-2">
                    3.2% conversion rate
                  </Badge>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <h4 className="font-semibold mb-4 text-purple-900">Trending Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-purple-800 mb-2">
                      <strong>🔥 Hot Trend:</strong> Sustainable fashion content is performing 40% better than average
                    </p>
                    <p className="text-purple-800 mb-2">
                      <strong>📈 Growth Opportunity:</strong> Video content on TikTok showing 3x engagement increase
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-800 mb-2">
                      <strong>⏰ Timing Insight:</strong> Evening posts (6-8 PM) generate 25% more conversions
                    </p>
                    <p className="text-purple-800 mb-2">
                      <strong>🎯 Audience Behavior:</strong> Your audience is most active on weekends
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
