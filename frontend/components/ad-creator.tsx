"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Target, DollarSign, Users, Play, Pause, Eye, BarChart3, Zap, Facebook, Instagram, Youtube } from "lucide-react"

interface AdCampaign {
  id: string
  name: string
  platform: string
  budget: number
  status: "active" | "paused" | "draft"
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  roas: number
}

interface AdCreatorProps {
  uploadedProducts: any[]
  generatedContent: any[]
}

export default function AdCreator({ uploadedProducts, generatedContent }: AdCreatorProps) {
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedContent, setSelectedContent] = useState("")
  const [adObjective, setAdObjective] = useState("conversions")
  const [targetAudience, setTargetAudience] = useState("")
  const [budget, setBudget] = useState([50])
  const [duration, setDuration] = useState([7])
  const [isCreating, setIsCreating] = useState(false)

  const [campaigns] = useState<AdCampaign[]>([
    {
      id: "1",
      name: "Summer Collection Launch",
      platform: "facebook",
      budget: 150,
      status: "active",
      impressions: 45230,
      clicks: 1205,
      conversions: 89,
      ctr: 2.67,
      cpc: 0.12,
      roas: 4.2,
    },
    {
      id: "2",
      name: "Holiday Special Promo",
      platform: "instagram",
      budget: 200,
      status: "active",
      impressions: 67890,
      clicks: 2134,
      conversions: 156,
      ctr: 3.14,
      cpc: 0.09,
      roas: 5.8,
    },
    {
      id: "3",
      name: "Brand Awareness Campaign",
      platform: "youtube",
      budget: 100,
      status: "paused",
      impressions: 23450,
      clicks: 567,
      conversions: 23,
      ctr: 2.42,
      cpc: 0.18,
      roas: 2.1,
    },
  ])

  const createAd = async () => {
    if (!selectedProduct || !selectedContent) return

    setIsCreating(true)

    // Simulate ad creation
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setIsCreating(false)

    // Show success message or redirect
    alert("Ad campaign created successfully!")
  }

  const platformIcons: { [key: string]: any } = {
    facebook: Facebook,
    instagram: Instagram,
    youtube: Youtube,
    google: Target,
    tiktok: Target,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Ad Creation Form */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span>AI Ad Creator & Launcher</span>
          </CardTitle>
          <CardDescription>Create and launch targeted ads across multiple platforms in seconds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="setup" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="creative">Creative</TabsTrigger>
              <TabsTrigger value="targeting">Targeting</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Campaign Name</label>
                  <Input placeholder="Enter campaign name" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Objective</label>
                  <Select value={adObjective} onValueChange={setAdObjective}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversions">Conversions</SelectItem>
                      <SelectItem value="traffic">Traffic</SelectItem>
                      <SelectItem value="awareness">Brand Awareness</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="leads">Lead Generation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Product</label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {uploadedProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Platform</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="google">Google Ads</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="creative" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Use Generated Content</label>
                <Select value={selectedContent} onValueChange={setSelectedContent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content" />
                  </SelectTrigger>
                  <SelectContent>
                    {generatedContent.map((content) => (
                      <SelectItem key={content.id} value={content.id}>
                        {content.content.substring(0, 50)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Headline</label>
                  <Input placeholder="AI will generate based on product" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Call to Action</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CTA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shop_now">Shop Now</SelectItem>
                      <SelectItem value="learn_more">Learn More</SelectItem>
                      <SelectItem value="sign_up">Sign Up</SelectItem>
                      <SelectItem value="download">Download</SelectItem>
                      <SelectItem value="contact_us">Contact Us</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ad Copy</label>
                <Textarea
                  placeholder="AI will generate compelling ad copy based on your product and audience"
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="targeting" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Age Range</label>
                  <div className="flex items-center space-x-4">
                    <Input placeholder="18" className="w-20" />
                    <span>to</span>
                    <Input placeholder="65" className="w-20" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Gender</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input placeholder="Enter countries, states, or cities" />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Interests</label>
                <Textarea
                  placeholder="AI will suggest interests based on your product (e.g., fashion, technology, fitness)"
                  className="min-h-[80px]"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">AI Audience Insights</span>
                </div>
                <p className="text-sm text-blue-800">
                  Based on your product, we recommend targeting users interested in sustainable fashion, aged 25-45,
                  with household income $50k+
                </p>
              </div>
            </TabsContent>

            <TabsContent value="budget" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-4 block">Daily Budget: ${budget[0]}</label>
                  <Slider value={budget} onValueChange={setBudget} max={500} min={5} step={5} className="w-full" />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>$5</span>
                    <span>$500</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-4 block">Duration: {duration[0]} days</label>
                  <Slider value={duration} onValueChange={setDuration} max={30} min={1} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1 day</span>
                    <span>30 days</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-lg font-bold text-purple-600">${budget[0] * duration[0]}</div>
                  <div className="text-sm text-gray-600">Total Budget</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-lg font-bold text-green-600">{Math.round(budget[0] * duration[0] * 20)}</div>
                  <div className="text-sm text-gray-600">Est. Reach</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-lg font-bold text-blue-600">{Math.round(budget[0] * duration[0] * 0.8)}</div>
                  <div className="text-sm text-gray-600">Est. Clicks</div>
                </Card>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Budget Optimization</span>
                </div>
                <p className="text-sm text-green-800">
                  AI suggests increasing budget by 20% during peak hours (6-9 PM) for better performance
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline">Save as Draft</Button>
            <Button
              onClick={createAd}
              disabled={!selectedProduct || isCreating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isCreating ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Launch Campaign
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
          <CardDescription>Monitor and manage your running ad campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const Icon = platformIcons[campaign.platform] || Target
              return (
                <Card key={campaign.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-6 h-6 text-gray-600" />
                        <div>
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{campaign.platform}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            {campaign.status === "active" ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">${campaign.budget}</div>
                        <div className="text-xs text-gray-600">Daily Budget</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{campaign.impressions.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Impressions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{campaign.clicks.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{campaign.conversions}</div>
                        <div className="text-xs text-gray-600">Conversions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{campaign.ctr}%</div>
                        <div className="text-xs text-gray-600">CTR</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{campaign.roas}x</div>
                        <div className="text-xs text-gray-600">ROAS</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
