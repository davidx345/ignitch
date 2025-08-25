"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion"

// Landing page components
import LandingNavigation from "@/components/landing/navigation"
import HeroSection from "@/components/landing/hero-section"
import FeaturesSection from "@/components/landing/features-section"
import HowItWorksSection from "@/components/landing/how-it-works-section"
import TestimonialsSection from "@/components/landing/testimonials-section"
import PricingSection from "@/components/landing/pricing-section"
import CTASection from "@/components/landing/cta-section"
import Footer from "@/components/landing/footer"

// Professional loading states and error handling
import { Loader2, AlertCircle } from "lucide-react"

interface LandingPageState {
  email: string
  isLoading: boolean
  error: string | null
  isEmailValid: boolean
}

export default function LandingPage() {
  const [state, setState] = useState<LandingPageState>({
    email: "",
    isLoading: false,
    error: null,
    isEmailValid: false
  })

  const router = useRouter()
  
  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle email change with validation
  const handleEmailChange = (email: string) => {
    const isValid = validateEmail(email)
    setState(prev => ({
      ...prev,
      email,
      isEmailValid: isValid,
      error: null
    }))
  }

  // Professional email submission with error handling
  const handleEmailSubmit = async () => {
    if (!state.email.trim()) {
      setState(prev => ({ ...prev, error: "Please enter your email address" }))
      return
    }

    if (!state.isEmailValid) {
      setState(prev => ({ ...prev, error: "Please enter a valid email address" }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate API call for professional feel
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Store email and redirect to signup
      localStorage.setItem('adease_email', state.email)
      router.push("/signup")
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Something went wrong. Please try again.",
        isLoading: false
      }))
    }
  }

  // Handle keyboard navigation
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEmailSubmit()
    }
  }

  // Scroll to top on mount for professional UX
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <LandingNavigation />
          
          <HeroSection
            email={state.email}
            onEmailChange={handleEmailChange}
            onEmailSubmit={handleEmailSubmit}
            onKeyPress={handleKeyPress}
            isLoading={state.isLoading}
            error={state.error}
            isEmailValid={state.isEmailValid}
          />
          
          <FeaturesSection />
          
          <HowItWorksSection />
          
          <TestimonialsSection />
          
          <PricingSection />
          
          <CTASection
            email={state.email}
            onEmailChange={handleEmailChange}
            onEmailSubmit={handleEmailSubmit}
            onKeyPress={handleKeyPress}
            isLoading={state.isLoading}
            error={state.error}
            isEmailValid={state.isEmailValid}
          />
          
          <Footer />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
