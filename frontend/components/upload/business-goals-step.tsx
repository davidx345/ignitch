"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft,
  Brain,
  MapPin,
  TrendingUp,
  Instagram,
  Facebook,
  Youtube
} from "lucide-react"
import { BusinessGoal, BrandProfile } from "@/types/upload"
import { businessGoals, colors } from "@/constants/upload"

interface BusinessGoalsStepProps {
  businessGoal: string
  brandProfile: BrandProfile
  onGoalSelected: (goalId: string) => void
  onLocationChanged: (location: string) => void
  onBack: () => void
  onContinue: () => void
}

export default function BusinessGoalsStep({ 
  businessGoal, 
  brandProfile, 
  onGoalSelected, 
  onLocationChanged, 
  onBack, 
  onContinue 
}: BusinessGoalsStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.ink }}>
          What's Your Business Goal?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose your primary goal so AI can optimize everything - content, platforms, timing, and strategy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {businessGoals.map((goal) => (
          <motion.div
            key={goal.id}
            onClick={() => onGoalSelected(goal.id)}
            className={`cursor-pointer transition-all duration-300 ${
              businessGoal === goal.id
                ? "ring-2 ring-blue-400 shadow-lg"
                : "hover:shadow-lg"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="h-full">
              <CardContent className="p-6 text-center">
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${goal.color}20` }}
                >
                  <goal.icon className="w-8 h-8" style={{ color: goal.color }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: colors.ink }}>
                  {goal.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {goal.description}
                </p>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {goal.strategy.hashtags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-center space-x-1">
                    {goal.strategy.platforms.map((platform, index) => {
                      const PlatformIcon = platform === 'instagram' ? Instagram : 
                                         platform === 'facebook' ? Facebook : Youtube
                      return (
                        <PlatformIcon key={index} className="w-4 h-4 text-gray-400" />
                      )
                    })}
                  </div>
                </div>
                {businessGoal === goal.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4"
                  >
                    <Badge style={{ backgroundColor: goal.color, color: 'white' }}>
                      ✓ Selected
                    </Badge>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Business Location Input */}
      <Card className="mb-8 shadow-lg">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center" style={{ color: colors.ink }}>
            <MapPin className="w-5 h-5 mr-2" style={{ color: colors.coral }} />
            Business Location (for Local SEO boost)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="e.g., Lagos, Ikeja, Port Harcourt"
                value={brandProfile.location}
                onChange={(e) => onLocationChanged(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" style={{ color: colors.mint }} />
              Adding location can boost local discovery by up to 40%
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Upload
        </Button>

        {businessGoal && (
          <Button
            size="lg"
            onClick={onContinue}
            className="font-semibold px-8"
            style={{ backgroundColor: colors.primary }}
          >
            <Brain className="w-5 h-5 mr-2" />
            Continue to AI Prompt Builder
          </Button>
        )}
      </div>
    </motion.div>
  )
}
