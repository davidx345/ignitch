"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Award,
  TrendingUp,
  Package,
  Target,
  Brain,
  Share2,
  Wand2,
  Calendar
} from "lucide-react"
import { Product, GeneratedContent, PlatformConnection, BrandProfile } from "@/types/upload"
import { colors } from "@/constants/upload"
import { getVisibilityScoreColor } from "@/utils/upload"

interface BusinessSummaryProps {
  uploadedProducts: Product[]
  generatedContent: GeneratedContent[]
  businessGoal: string
  aiRewrittenPrompt: string
  connectedPlatforms: PlatformConnection[]
  visibilityScore: number
  currentStep: number
}

export default function BusinessSummary({
  uploadedProducts,
  generatedContent,
  businessGoal,
  aiRewrittenPrompt,
  connectedPlatforms,
  visibilityScore,
  currentStep
}: BusinessSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12"
    >
      <Card className="shadow-lg border-2 border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold" style={{ color: colors.ink }}>
              🚀 Business Growth Dashboard
            </h3>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" style={{ color: getVisibilityScoreColor(visibilityScore) }} />
              <span className="font-bold" style={{ color: getVisibilityScoreColor(visibilityScore) }}>
                {visibilityScore}/100 Visibility Score
              </span>
            </div>
          </div>
          
          {/* Progress Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 mx-auto mb-2" style={{ color: colors.primary }} />
              <div className="font-bold text-lg" style={{ color: colors.primary }}>
                {uploadedProducts.length}
              </div>
              <div className="text-xs text-gray-600">Content Uploaded</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="w-6 h-6 mx-auto mb-2" style={{ color: colors.mint }} />
              <div className="font-bold text-lg" style={{ color: colors.mint }}>
                {businessGoal ? "1" : "0"}
              </div>
              <div className="text-xs text-gray-600">Goal Set</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Brain className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="font-bold text-lg text-purple-600">
                {aiRewrittenPrompt ? "1" : "0"}
              </div>
              <div className="text-xs text-gray-600">AI Prompt</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Share2 className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="font-bold text-lg text-orange-600">
                {connectedPlatforms.filter(p => p.connected).length}
              </div>
              <div className="text-xs text-gray-600">Platforms</div>
            </div>
            
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <Wand2 className="w-6 h-6 mx-auto mb-2 text-teal-600" />
              <div className="font-bold text-lg text-teal-600">
                {generatedContent.length}
              </div>
              <div className="text-xs text-gray-600">Ads Created</div>
            </div>
            
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-pink-600" />
              <div className="font-bold text-lg text-pink-600">
                {currentStep >= 5 ? "Ready" : "Pending"}
              </div>
              <div className="text-xs text-gray-600">Scheduling</div>
            </div>
          </div>

          {/* Business Insights */}
          {businessGoal && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center" style={{ color: colors.ink }}>
                <TrendingUp className="w-4 h-4 mr-2" style={{ color: colors.primary }} />
                Expected Business Impact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Goal Alignment:</span>
                  <span className="font-bold text-green-600">95%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Reach Boost:</span>
                  <span className="font-bold text-blue-600">+28%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Engagement:</span>
                  <span className="font-bold text-purple-600">+15%</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
