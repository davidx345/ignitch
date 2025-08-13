// Upload workflow constants and data

import {
  Package,
  Target,
  Brain,
  Share2,
  Wand2,
  Calendar,
  DollarSign,
  MapPin,
  MessageCircle,
  TrendingUp,
  Users,
  Instagram,
  Facebook,
  Youtube
} from "lucide-react"
import { BusinessGoal, PromptTemplate, UploadStep, PlatformConnection } from "@/types/upload"

// AdEase Color System
export const colors = {
  primary: "#3D5AFE",
  coral: "#FF6B6B",
  ink: "#1B1F3B",
  gray: "#F4F6FA",
  white: "#FFFFFF",
  mint: "#24CCA0",
  charcoal: "#2E2E3A",
}

export const businessGoals: BusinessGoal[] = [
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

export const promptTemplates: PromptTemplate[] = [
  { id: "sale", title: "Weekend Sale", prompt: "Special weekend discount on our bestsellers", category: "sales", goal: "sales" },
  { id: "new", title: "New Product Launch", prompt: "Introducing our latest must-have item", category: "product", goal: "awareness" },
  { id: "local", title: "Visit Our Store", prompt: "Come see our amazing collection in person", category: "location", goal: "visits" },
  { id: "testimonial", title: "Customer Love", prompt: "Our customers can't stop raving about this", category: "social", goal: "sales" },
  { id: "behind", title: "Behind the Scenes", prompt: "See how we make our products with love", category: "story", goal: "followers" },
  { id: "tip", title: "Expert Tips", prompt: "Pro tip for getting the best results", category: "education", goal: "awareness" },
  { id: "urgent", title: "Limited Time", prompt: "Only a few left - don't miss out", category: "urgency", goal: "sales" },
  { id: "community", title: "Join Community", prompt: "Be part of our growing family", category: "social", goal: "followers" }
]

export const steps: UploadStep[] = [
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

export const defaultConnectedPlatforms: PlatformConnection[] = [
  { platform: "instagram", connected: false, followers: 0, engagement: 0, icon: Instagram },
  { platform: "facebook", connected: false, followers: 0, engagement: 0, icon: Facebook },
  { platform: "tiktok", connected: false, followers: 0, engagement: 0, icon: Youtube }
]
