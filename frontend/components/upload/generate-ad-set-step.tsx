"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  Calendar
} from "lucide-react"
import ContentGenerator from "@/components/content-generator"
import { Product, GeneratedContent } from "@/types/upload"
import { colors } from "@/constants/upload"

interface GenerateAdSetStepProps {
  uploadedProducts: Product[]
  generatedContent: GeneratedContent[]
  onContentGenerated: (content: GeneratedContent[]) => void
  onBack: () => void
  onContinue: () => void
}

export default function GenerateAdSetStep({ 
  uploadedProducts,
  generatedContent,
  onContentGenerated,
  onBack,
  onContinue
}: GenerateAdSetStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.ink }}>
          Generate Full Ad Set
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI creates platform-optimized content with captions, hashtags, and performance predictions.
        </p>
      </div>

      <ContentGenerator
        uploadedProducts={uploadedProducts}
        generatedContent={generatedContent}
        onContentGenerated={onContentGenerated}
      />

      <div className="flex justify-center space-x-4 mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Platforms
        </Button>

        {generatedContent.length > 0 && (
          <Button
            size="lg"
            onClick={onContinue}
            className="font-semibold px-8"
            style={{ backgroundColor: colors.primary }}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Continue to Scheduling
          </Button>
        )}
      </div>
    </motion.div>
  )
}
