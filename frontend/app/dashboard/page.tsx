"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIBusinessCoach } from "@/components/ai-business-coach"
import { AutoPilotMode } from "@/components/auto-pilot-mode"
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
  Target
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

export default function Dashboard() {
  const [visibilityScore] = useState(73)
  const [activeTab, setActiveTab] = useState("overview")

  const stats = [
    { label: "Total Posts", value: "24", icon: Upload, color: colors.primary },
    { label: "Total Reach", value: "156K", icon: Eye, color: colors.mint },
    { label: "Avg Engagement", value: "8.4%", icon: Heart, color: colors.coral },
    { label: "Platforms", value: "4", icon: Users, color: colors.purple },
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.ink }}>
                  Ignitch Dashboard
                </h1>
                <p className="text-sm text-gray-600">Welcome back! Your AI-powered social media assistant is ready.</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Card className="px-4 py-2">
                <div className="flex items-center space-x-3">
                  <Award className="w-4 h-4" style={{ color: colors.mint }} />
                  <span className="text-sm font-semibold">Visibility Score: {visibilityScore}/100</span>
                </div>
              </Card>
              <Button variant="outline" onClick={() => (window.location.href = "/billboards")}>
                Billboard Marketplace
              </Button>
              <Button style={{ backgroundColor: colors.primary }} onClick={() => (window.location.href = "/upload")}>
                <Upload className="w-4 h-4 mr-2" />
                Create New Ad
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-coach" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Coach
            </TabsTrigger>
            <TabsTrigger value="auto-pilot" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Auto-Pilot
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-3xl font-bold" style={{ color: colors.ink }}>
                            {stat.value}
                          </p>
                        </div>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${stat.color}20` }}
                        >
                          <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* AI Features Highlight */}
            <Card className="shadow-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: colors.ink }}>
                      <Zap className="h-6 w-6 text-purple-600" />
                      AI-Powered Features
                    </h3>
                    <p className="text-sm text-gray-600">Experience the future of social media management</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">New</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    size="lg"
                    className="h-16 flex-col space-y-2"
                    style={{ backgroundColor: colors.primary }}
                    onClick={() => (window.location.href = "/upload")}
                  >
                    <Upload className="w-6 h-6" />
                    <span>Upload & Create</span>
                  </Button>
                  <Button size="lg" variant="outline" className="h-16 flex-col space-y-2 bg-transparent">
                    <Calendar className="w-6 h-6" />
                    <span>Schedule Posts</span>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-16 flex-col space-y-2 bg-transparent"
                    onClick={() => (window.location.href = "/billboards")}
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span>Billboard Ads</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: colors.ink }}>
                    Recent Posts
                  </h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Instagram Post #{index + 1}</p>
                          <p className="text-xs text-gray-600">2 hours ago • 1.2K reach</p>
                        </div>
                        <Badge style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}>Published</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: colors.ink }}>
                    Performance Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5" style={{ color: colors.mint }} />
                        <span className="text-sm font-medium">Engagement up 23%</span>
                      </div>
                      <span className="text-xs text-gray-600">vs last week</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Eye className="w-5 h-5" style={{ color: colors.primary }} />
                        <span className="text-sm font-medium">Reach increased 18%</span>
                      </div>
                      <span className="text-xs text-gray-600">this month</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium">340 new followers</span>
                      </div>
                      <span className="text-xs text-gray-600">this week</span>
                    </div>
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
