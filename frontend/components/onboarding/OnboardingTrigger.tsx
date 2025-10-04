'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import OnboardingGuide from './OnboardingGuide'

interface OnboardingTriggerProps {
  onNavigate: (tab: string) => void
  showInitialGuide?: boolean
}

export default function OnboardingTrigger({ onNavigate, showInitialGuide = false }: OnboardingTriggerProps) {
  const [showGuide, setShowGuide] = useState(showInitialGuide)
  const [hasSeenGuide, setHasSeenGuide] = useState(false)

  useEffect(() => {
    // Check if user has seen the guide before
    const hasSeenOnboarding = localStorage.getItem('adflow-onboarding-seen')
    if (!hasSeenOnboarding && showInitialGuide) {
      setShowGuide(true)
    } else {
      setHasSeenGuide(true)
    }
  }, [showInitialGuide])

  const handleOpenGuide = () => {
    setShowGuide(true)
  }

  const handleCloseGuide = () => {
    setShowGuide(false)
    setHasSeenGuide(true)
    localStorage.setItem('adflow-onboarding-seen', 'true')
  }

  return (
    <>
      {/* Floating Action Button */}
      {hasSeenGuide && !showGuide && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring", damping: 15, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 4px 20px rgba(139, 92, 246, 0.3)",
                "0 8px 30px rgba(139, 92, 246, 0.5)",
                "0 4px 20px rgba(139, 92, 246, 0.3)"
              ]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            <Button
              onClick={handleOpenGuide}
              size="lg"
              className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg border-0 p-0"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <HelpCircle className="w-6 h-6" />
              </motion.div>
            </Button>
          </motion.div>
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2 }}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg"
          >
            Need help? Click for guide!
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </motion.div>
        </motion.div>
      )}

      {/* Onboarding Guide Modal */}
      {showGuide && (
        <OnboardingGuide
          onClose={handleCloseGuide}
          onNavigate={onNavigate}
        />
      )}
    </>
  )
}
