"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { 
  Sparkles, 
  Upload, 
  Zap, 
  Calendar, 
  ArrowLeft,
  CheckCircle,
  Package,
  Wand2,
  Share2,
  BarChart3,
  Target,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Award,
  TrendingUp,
  DollarSign,
  MessageCircle,
  Users,
  Eye,
  Heart,
  Settings,
  Crop,
  Palette,
  Brain,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import ProductUpload from "@/components/product-upload"
import ContentGenerator from "@/components/content-generator"
import MultiPlatformDistribution from "@/components/multi-platform-distribution"
import RealPlatformConnections from "@/components/real-platform-connections"

// AdEase Color System
const colors = {
  primary: "#3D5AFE",
  coral: "#FF6B6B",
  ink: "#1B1F3B",
  gray: "#F4F6FA",
  white: "#FFFFFF",
  mint: "#24CCA0",
  charcoal: "#2E2E3A",
}

interface BusinessGoal {
  id: string
  title: string
  description: string
  icon: any
  color: string
  strategy: {
    tone: string
    cta: string[]
    hashtags: string[]
    platforms: string[]
  }
}

interface BrandProfile {
  colors: string[]
  fonts: string[]
  style: string
  location: string
  businessType: string
}

interface PlatformConnection {
  platform: string
  connected: boolean
  followers: number
  engagement: number
  icon: any
}

interface PromptTemplate {
  id: string
  title: string
  prompt: string
  category: string
  goal: string
}

interface Product {
  id: string
  name: string
  type: "image" | "video"
  url: string
  category: string
  brand: string
  aesthetic: string
  aiAnalysis: {
    productType: string
    colors: string[]
    style: string
    targetAudience: string
    keyFeatures: string[]
  }
}

interface GeneratedContent {
  id: string
  productId: string
  type: "caption" | "hashtags" | "reel" | "carousel" | "story"
  platform: string
  content: string
  hashtags: string[]
  engagement: {
    likes: number
    comments: number
    shares: number
  }
  performance: "high" | "medium" | "low"
}

export default function UploadPage() {
  const router = useRouter()
  const { user, session, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedProducts, setUploadedProducts] = useState<Product[]>([])
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([])
  const [distributionSettings, setDistributionSettings] = useState({})
  
  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      console.log('User not authenticated, redirecting to signin')
      router.replace('/signin?redirect=/upload')
    }
  }, [user, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }
  
  // New business-focused state
  const [businessGoal, setBusinessGoal] = useState("")
  const [userPrompt, setUserPrompt] = useState("")
  const [aiRewrittenPrompt, setAiRewrittenPrompt] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [brandProfile, setBrandProfile] = useState<BrandProfile>({
    colors: [],
    fonts: [],
    style: "",
    location: "",
    businessType: ""
  })
  const [connectedPlatforms, setConnectedPlatforms] = useState<PlatformConnection[]>([
    { platform: "instagram", connected: false, followers: 0, engagement: 0, icon: Instagram },
    { platform: "facebook", connected: false, followers: 0, engagement: 0, icon: Facebook },
    { platform: "tiktok", connected: false, followers: 0, engagement: 0, icon: Youtube }
  ])
  const [visibilityScore, setVisibilityScore] = useState(45)
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)

  const businessGoals: BusinessGoal[] = [
    {
      id: "sales",
      title: "Increase Product Sales",
      description: "Drive more purchases and conversions",
      icon: DollarSign,
      color: colors.mint,
      strategy: {
        tone: "Create urgency and highlight value",
        cta: ["Shop now", "Order today", "Get yours", "Limited time"],
        hashtags: ["#Sale", "#BuyNow", "#LimitedTime", "#Deal", "#ShopLocal"],
        platforms: ["instagram", "facebook"]
      }
    },
    {
      id: "visits",
      title: "Get More Store Visits",
      description: "Bring customers to your physical location",
      icon: MapPin,
      color: colors.coral,
      strategy: {
        tone: "Emphasize location and experience",
        cta: ["Visit us", "Come by", "Stop in", "See you there"],
        hashtags: ["#VisitUs", "#LocalBusiness", "#InStore", "#Community"],
        platforms: ["instagram", "facebook"]
      }
    },
    {
      id: "messages",
      title: "Get More DMs/WhatsApp",
      description: "Encourage direct customer contact",
      icon: MessageCircle,
      color: "#4CAF50",
      strategy: {
        tone: "Personal and direct",
        cta: ["DM us", "WhatsApp us", "Message for details", "Chat with us"],
        hashtags: ["#DMUs", "#WhatsApp", "#Contact", "#MessageUs"],
        platforms: ["instagram", "tiktok"]
      }
    },
    {
      id: "awareness",
      title: "Build Brand Awareness",
      description: "Get your brand noticed and remembered",
      icon: TrendingUp,
      color: "#9C27B0",
      strategy: {
        tone: "Educational and brand-focused",
        cta: ["Learn more", "Discover", "Explore", "Follow us"],
        hashtags: ["#Brand", "#Quality", "#Discover", "#NewBrand"],
        platforms: ["instagram", "tiktok", "facebook"]
      }
    },
    {
      id: "followers",
      title: "Grow Social Following",
      description: "Build your social media audience",
      icon: Users,
      color: colors.primary,
      strategy: {
        tone: "Engaging and shareable content",
        cta: ["Follow for more", "Tag a friend", "Share this", "Join us"],
        hashtags: ["#Follow", "#Community", "#JoinUs", "#NewFollowers"],
        platforms: ["instagram", "tiktok"]
      }
    }
  ]

  const promptTemplates: PromptTemplate[] = [
    { id: "sale", title: "Weekend Sale", prompt: "Special weekend discount on our bestsellers", category: "sales", goal: "sales" },
    { id: "new", title: "New Product Launch", prompt: "Introducing our latest must-have item", category: "product", goal: "awareness" },
    { id: "local", title: "Visit Our Store", prompt: "Come see our amazing collection in person", category: "location", goal: "visits" },
    { id: "testimonial", title: "Customer Love", prompt: "Our customers can't stop raving about this", category: "social", goal: "sales" },
    { id: "behind", title: "Behind the Scenes", prompt: "See how we make our products with love", category: "story", goal: "followers" },
    { id: "tip", title: "Expert Tips", prompt: "Pro tip for getting the best results", category: "education", goal: "awareness" },
    { id: "urgent", title: "Limited Time", prompt: "Only a few left - don't miss out", category: "urgency", goal: "sales" },
    { id: "community", title: "Join Community", prompt: "Be part of our growing family", category: "social", goal: "followers" }
  ]

  const steps = [
    { 
      id: 0, 
      title: "Upload & Enhance", 
      icon: Package,
      description: "Upload content + AI enhancement"
    },
    { 
      id: 1, 
      title: "Set Business Goals", 
      icon: Target,
      description: "Define what you want to achieve"
    },
    { 
      id: 2, 
      title: "AI Prompt Builder", 
      icon: Brain,
      description: "Smart content generation"
    },
    { 
      id: 3, 
      title: "Connect Platforms", 
      icon: Share2,
      description: "Link your social accounts"
    },
    { 
      id: 4, 
      title: "Generate Ad Set", 
      icon: Wand2,
      description: "Create full campaign"
    },
    { 
      id: 5, 
      title: "Schedule & Launch", 
      icon: Calendar,
      description: "Smart scheduling & optimization"
    }
  ]

  const handleProductsUploaded = (products: Product[]) => {
    setUploadedProducts(products)
    
    // Auto-detect brand colors and style
    if (products.length > 0) {
      setBrandProfile(prev => ({
        ...prev,
        colors: ["#3D5AFE", "#FF6B6B", "#24CCA0"], // Simulated color detection
        style: "Modern Professional"
      }))
      setVisibilityScore(prev => prev + 10) // Boost score for uploading
    }
    
    if (products.length > 0 && currentStep === 0) {
      setTimeout(() => setCurrentStep(1), 500)
    }
  }

  const handleGoalSelected = (goalId: string) => {
    setBusinessGoal(goalId)
    setVisibilityScore(prev => prev + 5)
    if (goalId && currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 300)
    }
  }

  const generateAIPrompt = async (userInput: string, goal: string) => {
    setIsGeneratingPrompt(true)
    
    // Simulate AI rewriting
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const selectedGoal = businessGoals.find(g => g.id === goal)
    const templates: Record<string, string> = {
      sales: `✨ ${userInput} ${selectedGoal?.strategy.cta[0]} and experience the difference! 💫`,
      visits: `🏪 ${userInput} Visit us ${brandProfile.location ? `in ${brandProfile.location}` : 'today'} and see for yourself! 🎯`,
      messages: `💬 ${userInput} DM us for details and let's make it happen! 📲`,
      awareness: `🌟 ${userInput} Discover what makes us special! ✨`,
      followers: `🔥 ${userInput} Follow us for more amazing content! 🚀`
    }
    
    setAiRewrittenPrompt(templates[goal] || templates.sales)
    setIsGeneratingPrompt(false)
    setVisibilityScore(prev => prev + 8)
  }

  const connectPlatform = async (platform: string) => {
    // Simulate OAuth connection
    setConnectedPlatforms(prev => prev.map(p => 
      p.platform === platform 
        ? { ...p, connected: true, followers: Math.floor(Math.random() * 5000) + 500, engagement: Math.random() * 5 + 2 }
        : p
    ))
    setVisibilityScore(prev => prev + 15)
  }

  const calculateVisibilityBoost = () => {
    let boost = 0
    if (uploadedProducts.length > 0) boost += 10
    if (businessGoal) boost += 10
    if (aiRewrittenPrompt) boost += 15
    if (connectedPlatforms.some(p => p.connected)) boost += 20
    if (brandProfile.location) boost += 10
    return Math.min(boost, 100)
  }

  const getVisibilityScoreColor = (score: number) => {
    if (score >= 80) return colors.mint
    if (score >= 60) return colors.primary
    if (score >= 40) return "#FF9800"
    return colors.coral
  }

  const handleContentGenerated = (content: GeneratedContent[]) => {
    setGeneratedContent(content)
    if (content.length > 0 && currentStep === 1) {
      // Auto-advance to distribution step
      setTimeout(() => setCurrentStep(2), 500)
    }
  }

  const getStepProgress = () => {
    if (currentStep === 0) return uploadedProducts.length > 0 ? 100 : 0
    if (currentStep === 1) return businessGoal ? 100 : 0
    if (currentStep === 2) return aiRewrittenPrompt ? 100 : 0
    if (currentStep === 3) return connectedPlatforms.some(p => p.connected) ? 100 : 0
    if (currentStep === 4) return generatedContent.length > 0 ? 100 : 0
    if (currentStep === 5) return 100
    return 0
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.gray }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: colors.ink }}>
                    Create & Upload
                  </h1>
                  <p className="text-sm text-gray-600">AI-powered content creation workflow</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Business Visibility Score Widget */}
              <Card className="px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4" style={{ color: getVisibilityScoreColor(visibilityScore) }} />
                    <span className="text-sm font-semibold" style={{ color: colors.ink }}>
                      Visibility Score
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: getVisibilityScoreColor(visibilityScore) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${visibilityScore}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <span className="text-sm font-bold" style={{ color: getVisibilityScoreColor(visibilityScore) }}>
                      {visibilityScore}/100
                    </span>
                  </div>
                </div>
              </Card>

              <Badge
                className="px-3 py-1"
                style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}
              >
                Pro Business Assistant
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4">
                <motion.div
                  className={`flex flex-col items-center space-y-2 cursor-pointer`}
                  onClick={() => setCurrentStep(step.id)}
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step.id ? "text-white shadow-lg" : "text-gray-400 border-2 border-gray-300"
                    }`}
                    style={{
                      backgroundColor: currentStep >= step.id ? colors.primary : "transparent",
                    }}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-8 h-8" />
                    ) : (
                      <step.icon className="w-8 h-8" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold text-sm ${currentStep >= step.id ? "text-gray-900" : "text-gray-400"}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 max-w-[120px]">
                      {step.description}
                    </div>
                  </div>
                </motion.div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ${currentStep > step.id ? "bg-blue-500" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6 max-w-2xl mx-auto">
            <Progress value={getStepProgress()} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{getStepProgress()}% Complete</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {/* Step 0: Product Upload */}
          {currentStep === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.ink }}>
                  Upload & Auto-Enhance
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Upload your content and let AI auto-crop, enhance quality, and optimize for every platform.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Component */}
                <div className="lg:col-span-2">
                  <ProductUpload
                    uploadedProducts={uploadedProducts}
                    onProductsUploaded={handleProductsUploaded}
                  />
                </div>

                {/* AI Enhancement Options */}
                <div className="space-y-6">
                  <Card className="shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center" style={{ color: colors.ink }}>
                        <Sparkles className="w-5 h-5 mr-2" style={{ color: colors.primary }} />
                        AI Enhancements
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Crop className="w-5 h-5" style={{ color: colors.primary }} />
                            <div>
                              <p className="font-medium text-sm">Auto-crop</p>
                              <p className="text-xs text-gray-600">Perfect sizing for all platforms</p>
                            </div>
                          </div>
                          <Badge style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}>
                            ✓ ON
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Wand2 className="w-5 h-5" style={{ color: colors.mint }} />
                            <div>
                              <p className="font-medium text-sm">Quality boost</p>
                              <p className="text-xs text-gray-600">Enhance resolution & clarity</p>
                            </div>
                          </div>
                          <Badge style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}>
                            ✓ ON
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Palette className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-medium text-sm">Brand colors</p>
                              <p className="text-xs text-gray-600">Auto-detect your brand palette</p>
                            </div>
                          </div>
                          <Badge style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}>
                            ✓ ON
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Brand Colors Detected */}
                  {brandProfile.colors.length > 0 && (
                    <Card className="shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4" style={{ color: colors.ink }}>
                          🎨 Detected Brand Colors
                        </h3>
                        <div className="flex space-x-2 mb-3">
                          {brandProfile.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          Style: <span className="font-medium">{brandProfile.style}</span>
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {uploadedProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-8"
                >
                  <Button
                    size="lg"
                    onClick={() => setCurrentStep(1)}
                    className="font-semibold px-8"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Continue to Business Goals
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 1: Set Business Goals */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.ink }}>
                  What's Your Business Goal?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Choose your primary goal so AI can optimize everything - content, platforms, timing, and strategy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {businessGoals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    onClick={() => handleGoalSelected(goal.id)}
                    className={`cursor-pointer transition-all duration-300 ${
                      businessGoal === goal.id
                        ? "ring-2 ring-blue-400 shadow-lg"
                        : "hover:shadow-lg"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-6 text-center">
                        <div
                          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          <goal.icon className="w-8 h-8" style={{ color: goal.color }} />
                        </div>
                        <h3 className="font-bold text-lg mb-2" style={{ color: colors.ink }}>
                          {goal.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {goal.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {goal.strategy.hashtags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex justify-center space-x-1">
                            {goal.strategy.platforms.map((platform, index) => {
                              const PlatformIcon = platform === 'instagram' ? Instagram : 
                                                 platform === 'facebook' ? Facebook : Youtube
                              return (
                                <PlatformIcon key={index} className="w-4 h-4 text-gray-400" />
                              )
                            })}
                          </div>
                        </div>
                        {businessGoal === goal.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-4"
                          >
                            <Badge style={{ backgroundColor: goal.color, color: 'white' }}>
                              ✓ Selected
                            </Badge>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Business Location Input */}
              <Card className="mb-8 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center" style={{ color: colors.ink }}>
                    <MapPin className="w-5 h-5 mr-2" style={{ color: colors.coral }} />
                    Business Location (for Local SEO boost)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="e.g., Lagos, Ikeja, Port Harcourt"
                        value={brandProfile.location}
                        onChange={(e) => setBrandProfile(prev => ({ ...prev, location: e.target.value }))}
                        className="h-12"
                      />
                    </div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" style={{ color: colors.mint }} />
                      Adding location can boost local discovery by up to 40%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                  className="bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Upload
                </Button>

                {businessGoal && (
                  <Button
                    size="lg"
                    onClick={() => setCurrentStep(2)}
                    className="font-semibold px-8"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    Continue to AI Prompt Builder
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: AI Prompt Builder */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.ink }}>
                  AI Prompt Builder
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Tell us your simple goal like "Sell more cakes this weekend" and watch AI transform it into viral content.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Prompt Templates */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center" style={{ color: colors.ink }}>
                      <Brain className="w-5 h-5 mr-2" style={{ color: colors.primary }} />
                      Smart Templates
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {promptTemplates
                        .filter(template => !businessGoal || template.goal === businessGoal)
                        .slice(0, 6)
                        .map((template) => (
                        <motion.button
                          key={template.id}
                          onClick={() => {
                            setUserPrompt(template.prompt)
                            setSelectedTemplate(template.id)
                          }}
                          className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                            selectedTemplate === template.id 
                              ? "border-blue-400 bg-blue-50" 
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{template.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{template.prompt}</p>
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Prompt Input & Output */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4" style={{ color: colors.ink }}>
                      Your Business Goal
                    </h3>
                    
                    {/* User Input */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          What do you want to achieve?
                        </label>
                        <textarea
                          placeholder="e.g., 'Sell more cakes this weekend' or 'Get people to visit my new store'"
                          value={userPrompt}
                          onChange={(e) => setUserPrompt(e.target.value)}
                          className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <Button
                        onClick={() => generateAIPrompt(userPrompt, businessGoal)}
                        disabled={!userPrompt.trim() || isGeneratingPrompt}
                        className="w-full"
                        style={{ backgroundColor: colors.primary }}
                      >
                        {isGeneratingPrompt ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 mr-2"
                            >
                              <Sparkles className="w-4 h-4" />
                            </motion.div>
                            AI is rewriting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Transform with AI
                          </>
                        )}
                      </Button>

                      {/* AI Generated Output */}
                      {aiRewrittenPrompt && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-800">
                                ✨ AI-Optimized Content
                              </span>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" className="h-8 px-3">
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Regenerate
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 px-3">
                                  <Settings className="w-3 h-3 mr-1" />
                                  Tone
                                </Button>
                              </div>
                            </div>
                            <p className="text-gray-800 leading-relaxed">{aiRewrittenPrompt}</p>
                          </div>
                          
                          {/* Performance Preview */}
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <Eye className="w-5 h-5 mx-auto mb-1" style={{ color: colors.primary }} />
                              <div className="text-sm font-bold">+28%</div>
                              <div className="text-xs text-gray-600">Expected Reach</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                              <Heart className="w-5 h-5 mx-auto mb-1" style={{ color: colors.mint }} />
                              <div className="text-sm font-bold">+15%</div>
                              <div className="text-xs text-gray-600">Engagement</div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <Target className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                              <div className="text-sm font-bold">95%</div>
                              <div className="text-xs text-gray-600">Goal Match</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Goals
                </Button>

                {aiRewrittenPrompt && (
                  <Button
                    size="lg"
                    onClick={() => setCurrentStep(3)}
                    className="font-semibold px-8"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Continue to Platform Connection
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Connect Platforms */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.ink }}>
                  Connect Your Platforms
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Let's connect your social accounts to preview how your content will look live and enable auto-posting.
                </p>
              </div>

              <RealPlatformConnections 
                onConnectionsUpdate={(updatedConnections) => {
                  setConnectedPlatforms(updatedConnections)
                }}
              />

              {/* Why Connect Explanation */}
              <Card className="mb-8 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center" style={{ color: colors.ink }}>
                    <Sparkles className="w-5 h-5 mr-2" style={{ color: colors.primary }} />
                    Why Connect Your Platforms?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <Eye className="w-5 h-5" style={{ color: colors.mint }} />
                      <span className="text-sm">Preview how content looks live</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5" style={{ color: colors.primary }} />
                      <span className="text-sm">Auto-schedule at optimal times</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5" style={{ color: colors.coral }} />
                      <span className="text-sm">Track real performance metrics</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Prompt Builder
                </Button>

                {connectedPlatforms.some(p => p.connected) && (
                  <Button
                    size="lg"
                    onClick={() => setCurrentStep(4)}
                    className="font-semibold px-8"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Full Ad Set
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Generate Ad Set */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.ink }}>
                  Generate Full Ad Set
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  AI creates platform-optimized content with captions, hashtags, and performance predictions.
                </p>
              </div>

              <ContentGenerator
                uploadedProducts={uploadedProducts}
                generatedContent={generatedContent}
                onContentGenerated={handleContentGenerated}
              />

              <div className="flex justify-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  className="bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Platforms
                </Button>

                {generatedContent.length > 0 && (
                  <Button
                    size="lg"
                    onClick={() => setCurrentStep(5)}
                    className="font-semibold px-8"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Continue to Scheduling
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 5: Schedule & Launch */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.ink }}>
                  Smart Schedule & Launch
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  AI schedules your content at optimal times for maximum engagement and business results.
                </p>
              </div>

              <MultiPlatformDistribution
                generatedContent={generatedContent}
              />

              <div className="flex justify-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(4)}
                  className="bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Ad Set
                </Button>

                <Button
                  size="lg"
                  onClick={() => window.location.href = "/dashboard"}
                  className="font-semibold px-8"
                  style={{ backgroundColor: colors.mint }}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete & Go to Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced Business Summary Card */}
        {(uploadedProducts.length > 0 || businessGoal || aiRewrittenPrompt) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <Card className="shadow-lg border-2 border-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold" style={{ color: colors.ink }}>
                    🚀 Business Growth Dashboard
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5" style={{ color: getVisibilityScoreColor(visibilityScore) }} />
                    <span className="font-bold" style={{ color: getVisibilityScoreColor(visibilityScore) }}>
                      {visibilityScore}/100 Visibility Score
                    </span>
                  </div>
                </div>
                
                {/* Progress Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Package className="w-6 h-6 mx-auto mb-2" style={{ color: colors.primary }} />
                    <div className="font-bold text-lg" style={{ color: colors.primary }}>
                      {uploadedProducts.length}
                    </div>
                    <div className="text-xs text-gray-600">Content Uploaded</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Target className="w-6 h-6 mx-auto mb-2" style={{ color: colors.mint }} />
                    <div className="font-bold text-lg" style={{ color: colors.mint }}>
                      {businessGoal ? "1" : "0"}
                    </div>
                    <div className="text-xs text-gray-600">Goal Set</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Brain className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <div className="font-bold text-lg text-purple-600">
                      {aiRewrittenPrompt ? "1" : "0"}
                    </div>
                    <div className="text-xs text-gray-600">AI Prompt</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Share2 className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <div className="font-bold text-lg text-orange-600">
                      {connectedPlatforms.filter(p => p.connected).length}
                    </div>
                    <div className="text-xs text-gray-600">Platforms</div>
                  </div>
                  
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <Wand2 className="w-6 h-6 mx-auto mb-2 text-teal-600" />
                    <div className="font-bold text-lg text-teal-600">
                      {generatedContent.length}
                    </div>
                    <div className="text-xs text-gray-600">Ads Created</div>
                  </div>
                  
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-pink-600" />
                    <div className="font-bold text-lg text-pink-600">
                      {currentStep >= 5 ? "Ready" : "Pending"}
                    </div>
                    <div className="text-xs text-gray-600">Scheduling</div>
                  </div>
                </div>

                {/* Business Insights */}
                {businessGoal && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center" style={{ color: colors.ink }}>
                      <TrendingUp className="w-4 h-4 mr-2" style={{ color: colors.primary }} />
                      Expected Business Impact
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Goal Alignment:</span>
                        <span className="font-bold text-green-600">95%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Reach Boost:</span>
                        <span className="font-bold text-blue-600">+28%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Engagement:</span>
                        <span className="font-bold text-purple-600">+15%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
