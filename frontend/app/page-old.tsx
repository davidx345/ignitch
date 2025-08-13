"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Sparkles,
  Calendar,
  BarChart3,
  Upload,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Instagram,
  Facebook,
  Youtube,
  Clock,
} from "lucide-react"

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

export default function AdEaseLanding() {
  const [email, setEmail] = useState("")
  const [isSigningUp, setIsSigningUp] = useState(false)

  const handleSignUp = async () => {
    setIsSigningUp(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSigningUp(false)
    // Redirect to signup page with email pre-filled
    window.location.href = `/signup${email ? `?email=${encodeURIComponent(email)}` : ""}`
  }

  const features = [
    {
      icon: Upload,
      title: "Smart Upload & Enhancement",
      description: "Drop any image or video. AI auto-crops, enhances, and optimizes for every platform.",
      color: colors.primary,
    },
    {
      icon: Sparkles,
      title: "AI Content Generation",
      description: "Set your business goals. AI creates viral captions, hashtags, and platform-specific content.",
      color: colors.coral,
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI finds optimal posting times. Schedule across Instagram, Facebook, TikTok automatically.",
      color: colors.mint,
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Track real business impact. Visibility score, engagement boost, and ROI predictions.",
      color: "#9C27B0",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      business: "Boutique Owner, Lagos",
      avatar: "/placeholder.svg?height=60&width=60&text=SC",
      quote:
        "AdEase increased my Instagram engagement by 340% in just 2 weeks. The AI knows exactly what my customers want!",
      rating: 5,
    },
    {
      name: "Michael Okafor",
      business: "Restaurant Chain, Abuja",
      avatar: "/placeholder.svg?height=60&width=60&text=MO",
      quote: "From 2 hours of content creation to 5 minutes. AdEase handles everything while I focus on my business.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      business: "Fitness Studio, Mumbai",
      avatar: "/placeholder.svg?height=60&width=60&text=PS",
      quote:
        "The local SEO boost is incredible. We're getting 3x more walk-ins since using AdEase's location optimization.",
      rating: 5,
    },
  ]

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: ["5 AI-generated posts per month", "2 connected platforms", "Basic scheduling", "Community support"],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For growing businesses",
      features: [
        "Unlimited AI-generated posts",
        "All platforms connected",
        "Smart scheduling & recurring posts",
        "Business analytics dashboard",
        "Local SEO optimization",
        "Priority support",
        "Brand color detection",
        "Goal-based optimization",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
  ]

  const stats = [
    { number: "10,000+", label: "Businesses Growing" },
    { number: "2.5M+", label: "Posts Generated" },
    { number: "340%", label: "Avg. Engagement Boost" },
    { number: "15min", label: "Time Saved Daily" },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.white }}>
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
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
                <h1 className="text-xl font-bold" style={{ color: colors.ink }}>
                  AdEase
                </h1>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                Reviews
              </a>
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/signin"}>
                Sign In
              </Button>
              <Button size="sm" style={{ backgroundColor: colors.primary }} onClick={() => window.location.href = "/signup"}>
                Start Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6" style={{ backgroundColor: colors.gray }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div>
                <Badge className="px-4 py-2 mb-6" style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}>
                  🚀 AI-Powered Business Growth
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: colors.ink }}>
                  Generate Social Media Ads in{" "}
                  <span
                    className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    style={{ color: colors.primary }}
                  >
                    Seconds
                  </span>{" "}
                  with AI
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Upload one image. Set your business goal. Watch AI create viral content, schedule posts, and drive
                  real results across Instagram, Facebook, and TikTok.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter your email to get started"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <Button
                  onClick={handleSignUp}
                  disabled={!email || isSigningUp}
                  size="lg"
                  className="h-12 px-8 font-semibold"
                  style={{ backgroundColor: colors.primary }}
                >
                  {isSigningUp ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Sign up <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: colors.mint }} />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: colors.mint }} />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: colors.mint }} />
                  <span>Setup in 2 minutes</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <Card className="overflow-hidden shadow-2xl">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 text-white">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">AI Working...</span>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-white/10 rounded-lg p-4">
                          <p className="text-sm opacity-90">
                            ✨ Just dropped this amazing piece! The quality is unreal...
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className="bg-white/20 text-white text-xs">#MustHave</Badge>
                          <Badge className="bg-white/20 text-white text-xs">#StyleInspo</Badge>
                          <Badge className="bg-white/20 text-white text-xs">#Perfect</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Instagram className="w-5 h-5 text-pink-500" />
                          <span className="font-semibold text-sm">Instagram</span>
                        </div>
                        <Badge style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}>
                          8.4% engagement
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="font-bold text-lg">23.4K</div>
                          <div className="text-gray-600">Reach</div>
                        </div>
                        <div>
                          <div className="font-bold text-lg">1.2K</div>
                          <div className="text-gray-600">Likes</div>
                        </div>
                        <div>
                          <div className="font-bold text-lg">89</div>
                          <div className="text-gray-600">Comments</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                  className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4"
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" style={{ color: colors.mint }} />
                    <span className="font-semibold text-sm">+340% boost</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4"
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" style={{ color: colors.primary }} />
                    <span className="font-semibold text-sm">2 min setup</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold mb-2" style={{ color: colors.primary }}>
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6" style={{ backgroundColor: colors.gray }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{ color: colors.ink }}>
              Everything You Need to Grow Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From content creation to business analytics, AdEase handles every aspect of your social media marketing
              with AI precision.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${feature.color}20` }}
                      >
                        <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                      </div>
                      <h3 className="text-xl font-bold" style={{ color: colors.ink }}>
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{ color: colors.ink }}>
              From Upload to Sales in 3 Steps
            </h2>
            <p className="text-xl text-gray-600">Simple enough for anyone, powerful enough for serious growth</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload & Set Goals",
                description:
                  "Drop your product image and tell us your business goal - more sales, store visits, or brand awareness.",
                icon: Upload,
              },
              {
                step: "02",
                title: "AI Creates Everything",
                description:
                  "Our AI generates viral captions, hashtags, and optimizes content for each platform automatically.",
                icon: Sparkles,
              },
              {
                step: "03",
                title: "Watch Results Grow",
                description: "Smart scheduling posts at optimal times while you track real business impact and ROI.",
                icon: TrendingUp,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div
                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {step.step}
                  </div>
                  <div
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.mint }}
                  >
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: colors.ink }}>
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6" style={{ backgroundColor: colors.gray }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{ color: colors.ink }}>
              Loved by 10,000+ Business Owners
            </h2>
            <p className="text-xl text-gray-600">See how AdEase is transforming businesses across emerging markets</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" style={{ color: "#FFD700" }} />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                    <div className="flex items-center space-x-4">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold" style={{ color: colors.ink }}>
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-600">{testimonial.business}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{ color: colors.ink }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you're ready to scale</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card
                  className={`relative h-full shadow-lg hover:shadow-xl transition-all duration-300 ${
                    plan.popular ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge
                        className="px-4 py-2 font-semibold"
                        style={{ backgroundColor: colors.primary, color: "white" }}
                      >
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-2" style={{ color: colors.ink }}>
                        {plan.name}
                      </h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold" style={{ color: colors.primary }}>
                          {plan.price}
                        </span>
                        <span className="text-gray-600">/{plan.period}</span>
                      </div>
                      <p className="text-gray-600">{plan.description}</p>
                    </div>

                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: colors.mint }} />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`w-full font-semibold py-3 ${plan.popular ? "" : "bg-transparent border-2"}`}
                      style={{
                        backgroundColor: plan.popular ? colors.primary : "transparent",
                        borderColor: plan.popular ? colors.primary : colors.primary,
                        color: plan.popular ? "white" : colors.primary,
                      }}
                    >
                      {plan.cta}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6" style={{ backgroundColor: colors.primary }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join 10,000+ business owners who've already boosted their social media presence with AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="h-12 text-base bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={handleSignUp}
                size="lg"
                className="h-12 px-8 font-semibold bg-white hover:bg-gray-100"
                style={{ color: colors.primary }}
              >
                Start Free Trial
              </Button>
            </div>
            <p className="text-blue-100 text-sm mt-4">No credit card required • Setup in 2 minutes</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: colors.ink }}>
                  AdEase
                </span>
              </div>
              <p className="text-gray-600">AI-powered social media marketing for growing businesses.</p>
              <div className="flex space-x-4">
                <Instagram className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <Facebook className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <Youtube className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: colors.ink }}>
                Product
              </h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-gray-900">
                  Features
                </a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">
                  Pricing
                </a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">
                  API
                </a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">
                  Integrations
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: colors.ink }}>
                Company
              </h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-gray-900">
                  About
                </a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">
                  Blog
                </a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">
                  Careers
                </a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">
                  Contact
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: colors.ink }}>
                Support
              </h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-gray-900">
                  Help Center
                </a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">
                  Documentation
                </a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">
                  Status
                </a>
                <a href="#" className="block text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-8 text-center">
            <p className="text-gray-600">© 2024 AdEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
