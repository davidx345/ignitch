// Upload workflow types and interfaces

import { LucideIcon } from "lucide-react"

export interface BusinessGoal {
  id: string
  title: string
  description: string
  icon: LucideIcon
  color: string
  strategy: {
    tone: string
    cta: string[]
    hashtags: string[]
    platforms: string[]
  }
}

export interface BrandProfile {
  colors: string[]
  fonts: string[]
  style: string
  location: string
  businessType: string
}

export interface PlatformConnection {
  platform: string
  connected: boolean
  followers: number
  engagement: number
  icon: LucideIcon
}

export interface PromptTemplate {
  id: string
  title: string
  prompt: string
  category: string
  goal: string
}

export interface Product {
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

export interface GeneratedContent {
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

export interface UploadStep {
  id: number
  title: string
  icon: LucideIcon
  description: string
}

export interface UploadPageState {
  currentStep: number
  uploadedProducts: Product[]
  generatedContent: GeneratedContent[]
  distributionSettings: Record<string, any>
  businessGoal: string
  userPrompt: string
  aiRewrittenPrompt: string
  selectedTemplate: string
  brandProfile: BrandProfile
  connectedPlatforms: PlatformConnection[]
  visibilityScore: number
  isGeneratingPrompt: boolean
}
