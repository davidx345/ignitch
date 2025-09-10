// Landing page constants and data

import {
  Upload,
  Sparkles,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Zap,
  BarChart3,
  Users,
  Instagram,
  Facebook,
  Youtube,
  Brain
} from "lucide-react"

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

export const features = [
  {
    icon: Upload,
    title: "Smart Upload & Auto-Crop",
    description: "Upload any image and AI automatically crops it perfectly for every platform - Instagram, TikTok, Facebook, and digital billboards.",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    icon: TrendingUp,
    title: "Business-Goal AI Content",
    description: "Tell us your goal (sales, visits, awareness) and AI creates viral captions, hashtags, and CTAs that convert across all channels.",
    gradient: "from-purple-500 to-pink-600"
  },
  {
    icon: TrendingUp,
    title: "Digital Billboard Network",
    description: "Access Nigeria's largest digital billboard network. Deploy campaigns instantly with real-time monitoring and performance tracking.",
    gradient: "from-green-500 to-teal-600"
  },
  {
    icon: Zap,
    title: "Multi-Platform Distribution",
    description: "Publish to social media and billboards simultaneously. Track performance across all channels from one unified dashboard.",
    gradient: "from-orange-500 to-red-600"
  },
  {
    icon: BarChart3,
    title: "Unified Analytics Dashboard",
    description: "Track social media engagement, billboard impressions, website clicks, store visits, and sales conversions in one place.",
    gradient: "from-indigo-500 to-blue-600"
  },
  {
    icon: Users,
    title: "Cross-Platform Targeting",
    description: "AI identifies and targets your ideal customers across social media and high-traffic billboard locations for maximum reach.",
    gradient: "from-pink-500 to-rose-600"
  }
]

export const steps = [
  {
    step: "01",
    title: "Upload & Set Campaign Goals",
    description: "Upload your creative assets and set your advertising goals - social media engagement, billboard impressions, or both.",
    icon: Upload,
  },
  {
    step: "02", 
    title: "AI Optimizes Everything",
    description: "Our AI generates platform-specific content, optimizes for each social channel, and prepares billboard-ready formats.",
    icon: TrendingUp,
  },
  {
    step: "03",
    title: "Deploy & Track Results", 
    description: "Launch campaigns across social media and billboard networks simultaneously while tracking unified analytics and ROI.",
    icon: TrendingUp,
  },
]

export const testimonials = [
  {
    name: "Sarah Chen",
    role: "Boutique Owner, Lagos",
    avatar: "/placeholder-user.jpg",
    content: "Went from 50 to 2,500 followers in 3 months. More importantly, my boutique sales doubled! The AI really understands what my customers want.",
    rating: 5,
    metrics: { followers: "+2,450", sales: "+120%", engagement: "8.4%" }
  },
  {
    name: "Ahmed Okafor", 
    role: "Restaurant Owner, Abuja",
    avatar: "/placeholder-user.jpg",
    content: "AdEase helped me fill my restaurant every weekend. The AI creates posts that actually bring customers through the door, not just likes.",
    rating: 5,
    metrics: { visits: "+300%", bookings: "+250%", revenue: "+180%" }
  },
  {
    name: "Funmi Adebayo",
    role: "Fashion Designer, Ibadan", 
    avatar: "/placeholder-user.jpg",
    content: "I was spending hours creating content. Now AI does it in seconds, and my engagement is 3x higher. Game changer for my fashion brand!",
    rating: 5,
    metrics: { engagement: "+300%", orders: "+90%", reach: "+500%" }
  }
]

export const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for testing social media automation",
    features: [
      "5 AI-generated social posts per month",
      "Basic auto-cropping for all platforms",
      "Instagram + Facebook publishing",
      "Basic analytics dashboard",
      "Email support"
    ],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Professional", 
    price: "₦25,000",
    period: "month",
    description: "Complete advertising solution",
    features: [
      "Unlimited AI social media posts",
      "All social platforms (Instagram, TikTok, Facebook, Twitter)",
      "Digital billboard campaign management", 
      "Billboard network access (Nigeria)",
      "Advanced ROI tracking & analytics",
      "Smart scheduling & optimization",
      "Priority support"
    ],
    cta: "Start 14-Day Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "₦75,000", 
    period: "month",
    description: "For agencies and large businesses",
    features: [
      "Everything in Professional",
      "Team collaboration tools",
      "Multiple business accounts",
      "Custom billboard targeting",
      "Advanced audience analytics",
      "Custom brand voice training",
      "Dedicated account manager",
      "API access"
    ],
    cta: "Contact Sales",
    popular: false
  }
]
