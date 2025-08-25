"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'

// Landing page components
import LandingNavigation from "@/components/landing/navigation"
import HeroSection from "@/components/landing/hero-section"
import FeaturesSection from "@/components/landing/features-section"
import HowItWorksSection from "@/components/landing/how-it-works-section"

// Import remaining sections that need to be created
import TestimonialsSection from "@/components/landing/testimonials-section"
import PricingSection from "@/components/landing/pricing-section"
import CTASection from "@/components/landing/cta-section"
import Footer from "@/components/landing/footer"

export default function LandingPage() {
  const [email, setEmail] = useState("")

  const router = useRouter()
  
  const handleEmailSubmit = () => {
    if (email.trim()) {
      try {
        // Store email and redirect to signup
        localStorage.setItem('adease_email', email)
        router.push("/signup")
      } catch (error) {
        console.error('Error handling email submit:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingNavigation />
      
      <HeroSection
        email={email}
        onEmailChange={setEmail}
        onEmailSubmit={handleEmailSubmit}
      />
      
      <FeaturesSection />
      
      <HowItWorksSection />
      
      <TestimonialsSection />
      
      <PricingSection />
      
      <CTASection
        email={email}
        onEmailChange={setEmail}
        onEmailSubmit={handleEmailSubmit}
      />
      
      <Footer />
    </div>
  )
}
