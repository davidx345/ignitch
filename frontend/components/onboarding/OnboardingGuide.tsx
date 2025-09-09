'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Megaphone, ArrowRight, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface OnboardingGuideProps {
  onClose: () => void
  onNavigate: (tab: string) => void
}

export default function OnboardingGuide({ onClose, onNavigate }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showGuide, setShowGuide] = useState(true)

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Ignitch! 🎉',
      description: 'Your all-in-one marketing automation platform',
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      content: (
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg">
            <p className="text-gray-700 text-lg">
              Ready to supercharge your digital marketing? Let's get you started with the essentials!
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900">Social Media Manager</h4>
              <p className="text-sm text-gray-600">Create & schedule content</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <Megaphone className="w-6 h-6 text-green-600 mb-2" />
              <h4 className="font-semibold text-gray-900">Billboard Marketplace</h4>
              <p className="text-sm text-gray-600">Discover ad spaces</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'social-media',
      title: 'Start Creating Content',
      description: 'Your AI-powered social media assistant awaits',
      icon: <Users className="w-8 h-8 text-blue-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">🎯 Social Media Manager Features:</h4>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI-powered content generation
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Multi-platform scheduling
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Performance analytics
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Content calendar management
              </li>
            </ul>
          </div>
          <Button 
            onClick={() => {
              onNavigate('social-media')
              onClose()
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
            size="lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Go to Social Media Manager
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )
    },
    {
      id: 'billboard',
      title: 'Explore Billboard Marketplace',
      description: 'Find the perfect advertising spaces for your campaigns',
      icon: <Megaphone className="w-8 h-8 text-green-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3">🎪 Billboard Marketplace Features:</h4>
            <ul className="space-y-2 text-green-800">
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Premium advertising locations
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Real-time availability
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Competitive pricing
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Campaign performance tracking
              </li>
            </ul>
          </div>
          <Button 
            onClick={() => {
              window.open('/billboards', '_blank')
              onClose()
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
            size="lg"
          >
            <Megaphone className="w-5 h-5 mr-2" />
            Explore Billboard Marketplace
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const closeGuide = () => {
    setShowGuide(false)
    setTimeout(onClose, 300)
  }

  return (
    <AnimatePresence>
      {showGuide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative"
          >
            <Card className="w-full max-w-2xl mx-auto bg-white shadow-2xl border-0">
              <CardContent className="p-0">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
                  <button
                    onClick={closeGuide}
                    className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 10, -10, 0] 
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse" 
                      }}
                    >
                      {steps[currentStep].icon}
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
                      <p className="text-purple-100">{steps[currentStep].description}</p>
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="flex gap-2 mt-4">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          index <= currentStep ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {steps[currentStep].content}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center p-6 bg-gray-50 rounded-b-lg">
                  <Button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-gray-500">
                    {currentStep + 1} of {steps.length}
                  </span>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={nextStep}
                      className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={closeGuide}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      Get Started
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
