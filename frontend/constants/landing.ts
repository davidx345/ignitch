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
    description: "Upload any image and AI automatically crops it perfectly for every platform - Instagram, TikTok, Facebook.",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    icon: Sparkles,
    title: "Business-Goal AI Content",
    description: "Tell us your goal (sales, visits, awareness) and AI creates viral captions, hashtags, and CTAs that convert.",
    gradient: "from-purple-500 to-pink-600"
  },
  {
    icon: TrendingUp,
    title: "Performance Prediction",
    description: "See predicted engagement rates before posting. AI analyzes trends to optimize timing and content style.",
    gradient: "from-green-500 to-teal-600"
  },
  {
    icon: Zap,
    title: "One-Click Distribution",
    description: "Publish to all platforms simultaneously or schedule for optimal times. Track performance in real-time.",
    gradient: "from-orange-500 to-red-600"
  },
  {
    icon: BarChart3,
    title: "ROI Analytics Dashboard",
    description: "Track actual business results - website clicks, store visits, sales conversions, not just likes.",
    gradient: "from-indigo-500 to-blue-600"
  },
  {
    icon: Users,
    title: "Audience Growth Engine",
    description: "AI identifies and targets your ideal customers with precision, growing quality followers who convert.",
    gradient: "from-pink-500 to-rose-600"
  }
]

export const steps = [
  {
    step: "01",
    title: "Upload & Set Goals",
    description: "Drop your product image and tell us your business goal - more sales, store visits, or brand awareness.",
    icon: Upload,
  },
  {
    step: "02", 
    title: "AI Creates Everything",
    description: "Our AI generates viral captions, hashtags, and optimizes content for each platform automatically.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Watch Results Grow", 
    description: "Smart scheduling posts at optimal times while you track real business impact and ROI.",
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
    description: "Perfect for testing the waters",
    features: [
      "5 AI-generated posts per month",
      "Basic auto-cropping",
      "Instagram + Facebook publishing",
      "Basic analytics dashboard",
      "Email support"
    ],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Growth", 
    price: "₦15,000",
    period: "month",
    description: "For serious business growth",
    features: [
      "Unlimited AI posts",
      "Advanced auto-cropping + enhancement",
      "All platforms (Instagram, TikTok, Facebook)",
      "ROI tracking & business analytics",
      "Smart scheduling & optimization",
      "Priority support"
    ],
    cta: "Start 14-Day Free Trial",
    popular: true
  },
  {
    name: "Scale",
    price: "₦45,000", 
    period: "month",
    description: "For growing teams and agencies",
    features: [
      "Everything in Growth",
      "Team collaboration tools",
      "Multiple business accounts",
      "Advanced audience targeting",
      "Custom brand voice training",
      "Dedicated account manager"
    ],
    cta: "Contact Sales",
    popular: false
  }
]
