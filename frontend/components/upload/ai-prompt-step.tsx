"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Share2,
  Brain,
  Sparkles,
  RefreshCw,
  Settings,
  Eye,
  Heart,
  Target
} from "lucide-react"
import { PromptTemplate } from "@/types/upload"
import { promptTemplates, colors } from "@/constants/upload"

interface AIPromptStepProps {
  businessGoal: string
  userPrompt: string
  aiRewrittenPrompt: string
  selectedTemplate: string
  isGeneratingPrompt: boolean
  onUserPromptChange: (prompt: string) => void
  onTemplateSelect: (templateId: string) => void
  onGeneratePrompt: () => void
  onBack: () => void
  onContinue: () => void
}

export default function AIPromptStep({ 
  businessGoal,
  userPrompt,
  aiRewrittenPrompt,
  selectedTemplate,
  isGeneratingPrompt,
  onUserPromptChange,
  onTemplateSelect,
  onGeneratePrompt,
  onBack,
  onContinue
}: AIPromptStepProps) {
  const filteredTemplates = promptTemplates
    .filter(template => !businessGoal || template.goal === businessGoal)
    .slice(0, 6)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.ink }}>
          AI Prompt Builder
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tell us your simple goal like "Sell more cakes this weekend" and watch AI transform it into viral content.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prompt Templates */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center" style={{ color: colors.ink }}>
              <Brain className="w-5 h-5 mr-2" style={{ color: colors.primary }} />
              Smart Templates
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {filteredTemplates.map((template) => (
                <motion.button
                  key={template.id}
                  onClick={() => {
                    onUserPromptChange(template.prompt)
                    onTemplateSelect(template.id)
                  }}
                  className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                    selectedTemplate === template.id 
                      ? "border-blue-400 bg-blue-50" 
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{template.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{template.prompt}</p>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Prompt Input & Output */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4" style={{ color: colors.ink }}>
              Your Business Goal
            </h3>
            
            {/* User Input */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What do you want to achieve?
                </label>
                <textarea
                  placeholder="e.g., 'Sell more cakes this weekend' or 'Get people to visit my new store'"
                  value={userPrompt}
                  onChange={(e) => onUserPromptChange(e.target.value)}
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <Button
                onClick={onGeneratePrompt}
                disabled={!userPrompt.trim() || isGeneratingPrompt}
                className="w-full"
                style={{ backgroundColor: colors.primary }}
              >
                {isGeneratingPrompt ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 mr-2"
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    AI is rewriting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Transform with AI
                  </>
                )}
              </Button>

              {/* AI Generated Output */}
              {aiRewrittenPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">
                        ✨ AI-Optimized Content
                      </span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="h-8 px-3">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Regenerate
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 px-3">
                          <Settings className="w-3 h-3 mr-1" />
                          Tone
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{aiRewrittenPrompt}</p>
                  </div>
                  
                  {/* Performance Preview */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Eye className="w-5 h-5 mx-auto mb-1" style={{ color: colors.primary }} />
                      <div className="text-sm font-bold">+28%</div>
                      <div className="text-xs text-gray-600">Expected Reach</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Heart className="w-5 h-5 mx-auto mb-1" style={{ color: colors.mint }} />
                      <div className="text-sm font-bold">+15%</div>
                      <div className="text-xs text-gray-600">Engagement</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <Target className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                      <div className="text-sm font-bold">95%</div>
                      <div className="text-xs text-gray-600">Goal Match</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4 mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Goals
        </Button>

        {aiRewrittenPrompt && (
          <Button
            size="lg"
            onClick={onContinue}
            className="font-semibold px-8"
            style={{ backgroundColor: colors.primary }}
          >
            <Share2 className="w-5 h-5 mr-2" />
            Continue to Platform Connection
          </Button>
        )}
      </div>
    </motion.div>
  )
}
