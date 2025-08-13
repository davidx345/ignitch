"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  CheckCircle
} from "lucide-react"
import MultiPlatformDistribution from "@/components/multi-platform-distribution"
import { Product, GeneratedContent } from "@/types/upload"
import { colors } from "@/constants/upload"

interface ScheduleLaunchStepProps {
  uploadedProducts: Product[]
  generatedContent: GeneratedContent[]
  onBack: () => void
  onComplete: () => void
}

export default function ScheduleLaunchStep({ 
  uploadedProducts,
  generatedContent,
  onBack,
  onComplete
}: ScheduleLaunchStepProps) {
  return (
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
          onClick={onBack}
          className="bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Ad Set
        </Button>

        <Button
          size="lg"
          onClick={onComplete}
          className="font-semibold px-8"
          style={{ backgroundColor: colors.mint }}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Complete & Go to Dashboard
        </Button>
      </div>
    </motion.div>
  )
}
