"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Lightbulb, ArrowUp, ArrowDown, Minus, Zap } from "lucide-react"

interface SearchTrend {
  keyword: string
  volume: number
  trend: "up" | "down" | "stable"
  difficulty: "low" | "medium" | "high"
  intent: "informational" | "commercial" | "transactional"
  suggestions: string[]
}

interface ContentIdea {
  id: string
  title: string
  keyword: string
  searchVolume: number
  difficulty: string
  contentType: "post" | "reel" | "story" | "carousel"
  platform: string
  estimatedReach: number
}

export default function SearchIntentEngine() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [trendingKeywords] = useState<SearchTrend[]>([
    {
      keyword: "sustainable fashion 2024",
      volume: 45200,
      trend: "up",
      difficulty: "medium",
      intent: "commercial",
      suggestions: ["eco-friendly clothing", "sustainable brands", "ethical fashion"],
    },
    {
      keyword: "affordable workout gear",
      volume: 32100,
      trend: "up",
      difficulty: "low",
      intent: "transactional",
      suggestions: ["budget fitness equipment", "cheap gym clothes", "discount activewear"],
    },
    {
      keyword: "home office setup ideas",
      volume: 28900,
      trend: "stable",
      difficulty: "medium",
      intent: "informational",
      suggestions: ["work from home desk", "office decor", "productivity setup"],
    },
    {
      keyword: "skincare routine for beginners",
      volume: 67800,
      trend: "up",
      difficulty: "high",
      intent: "informational",
      suggestions: ["basic skincare steps", "beginner skincare products", "simple skincare"],
    },
  ])

  const [contentIdeas] = useState<ContentIdea[]>([
    {
      id: "1",
      title: "5 Sustainable Fashion Brands You Need to Know",
      keyword: "sustainable fashion brands",
      searchVolume: 23400,
      difficulty: "medium",
      contentType: "carousel",
      platform: "instagram",
      estimatedReach: 15600,
    },
    {
      id: "2",
      title: "Budget-Friendly Workout Gear That Actually Works",
      keyword: "affordable workout gear",
      searchVolume: 18900,
      difficulty: "low",
      contentType: "reel",
      platform: "tiktok",
      estimatedReach: 28900,
    },
    {
      id: "3",
      title: "Transform Your Home Office on a Budget",
      keyword: "home office setup",
      searchVolume: 31200,
      difficulty: "medium",
      contentType: "post",
      platform: "facebook",
      estimatedReach: 12300,
    },
  ])

  const analyzeSearchIntent = async () => {
    if (!searchQuery.trim()) return

    setIsAnalyzing(true)

    // Simulate search intent analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsAnalyzing(false)

    // In a real app, this would update the trends and content ideas
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="w-4 h-4 text-green-600" />
      case "down":
        return <ArrowDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "transactional":
        return "bg-purple-100 text-purple-800"
      case "commercial":
        return "bg-blue-100 text-blue-800"
      case "informational":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Intent Analyzer */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-purple-600" />
            <span>Search Intent Engine</span>
          </CardTitle>
          <CardDescription>Analyze real-time trending searches and generate SEO-aligned content ideas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-3">
            <Input
              placeholder="Enter keyword or topic to analyze..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={analyzeSearchIntent}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">1.2M</div>
              <div className="text-sm text-gray-600">Monthly Searches</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">847</div>
              <div className="text-sm text-gray-600">Trending Keywords</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-sm text-gray-600">Content Ideas</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">92%</div>
              <div className="text-sm text-gray-600">Match Rate</div>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Keywords */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Trending Keywords</span>
            </CardTitle>
            <CardDescription>Real-time search trends and keyword opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingKeywords.map((keyword, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(keyword.trend)}
                        <h4 className="font-semibold">{keyword.keyword}</h4>
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {keyword.volume.toLocaleString()} searches/mo
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <Badge className={getDifficultyColor(keyword.difficulty)}>{keyword.difficulty} difficulty</Badge>
                      <Badge className={getIntentColor(keyword.intent)}>{keyword.intent}</Badge>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Related suggestions:</p>
                      <div className="flex flex-wrap gap-1">
                        {keyword.suggestions.map((suggestion, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Content Ideas */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <span>AI Content Ideas</span>
            </CardTitle>
            <CardDescription>SEO-optimized content suggestions based on search trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contentIdeas.map((idea) => (
                <Card key={idea.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{idea.title}</h4>
                        <p className="text-sm text-gray-600">
                          Target: <span className="font-medium">{idea.keyword}</span>
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {idea.contentType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <div>
                        <div className="font-medium">{idea.searchVolume.toLocaleString()}</div>
                        <div className="text-gray-600 text-xs">Volume</div>
                      </div>
                      <div>
                        <div className="font-medium capitalize">{idea.difficulty}</div>
                        <div className="text-gray-600 text-xs">Difficulty</div>
                      </div>
                      <div>
                        <div className="font-medium">{idea.estimatedReach.toLocaleString()}</div>
                        <div className="text-gray-600 text-xs">Est. Reach</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {idea.platform}
                      </Badge>
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                        Generate Content
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Intent Insights */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle>Search Intent Insights</CardTitle>
          <CardDescription>Understand what your audience is searching for and why</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="intent" className="space-y-4">
            <TabsList>
              <TabsTrigger value="intent">Search Intent</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
              <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="intent" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h4 className="font-semibold">Informational</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Users seeking knowledge or answers</p>
                  <div className="text-2xl font-bold text-green-600">42%</div>
                  <p className="text-xs text-gray-500">of your audience searches</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h4 className="font-semibold">Commercial</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Users researching before buying</p>
                  <div className="text-2xl font-bold text-blue-600">35%</div>
                  <p className="text-xs text-gray-500">of your audience searches</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <h4 className="font-semibold">Transactional</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Users ready to make a purchase</p>
                  <div className="text-2xl font-bold text-purple-600">23%</div>
                  <p className="text-xs text-gray-500">of your audience searches</p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="seasonal" className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Upcoming Seasonal Opportunities</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Holiday Shopping Season</span>
                    <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Year Fitness Goals</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Valentine's Day Gifts</span>
                    <Badge className="bg-green-100 text-green-800">Low Priority</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="competitors" className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2">Competitor Keyword Gaps</h4>
                <p className="text-sm text-purple-800 mb-3">
                  Keywords your competitors are missing that you could target
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">sustainable fashion tips</span>
                    <span className="text-xs text-gray-600">12.3k searches</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">eco-friendly lifestyle</span>
                    <span className="text-xs text-gray-600">8.7k searches</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">budget conscious shopping</span>
                    <span className="text-xs text-gray-600">6.2k searches</span>
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
