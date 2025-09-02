// Upload workflow utility functions

import { BrandProfile, PlatformConnection, Product } from "@/types/upload"
import { businessGoals, colors } from "@/constants/upload"

export const calculateVisibilityBoost = (
  uploadedProducts: Product[],
  businessGoal: string,
  aiRewrittenPrompt: string,
  connectedPlatforms: PlatformConnection[],
  brandProfile: BrandProfile
) => {
  let boost = 0
  if (uploadedProducts.length > 0) boost += 10
  if (businessGoal) boost += 10
  if (aiRewrittenPrompt) boost += 15
  if (connectedPlatforms.some(p => p.connected)) boost += 20
  if (brandProfile.location) boost += 10
  return Math.min(boost, 100)
}

export const getVisibilityScoreColor = (score: number) => {
  if (score >= 80) return colors.mint
  if (score >= 60) return colors.primary
  if (score >= 40) return "#FF9800"
  return colors.coral
}

export const getStepProgress = (
  currentStep: number,
  uploadedProducts: Product[],
  businessGoal: string,
  aiRewrittenPrompt: string,
  connectedPlatforms: PlatformConnection[],
  generatedContent: any[]
) => {
  if (currentStep === 0) return uploadedProducts.length > 0 ? 100 : 0
  if (currentStep === 1) return businessGoal ? 100 : 0
  if (currentStep === 2) return aiRewrittenPrompt ? 100 : 0
  if (currentStep === 3) return connectedPlatforms.some(p => p.connected) ? 100 : 0
  if (currentStep === 4) return generatedContent.length > 0 ? 100 : 0
  if (currentStep === 5) return 100
  return 0
}

export const generateAIPrompt = async (
  userInput: string,
  goal: string,
  brandProfile: BrandProfile
) => {
  // Simulate AI rewriting with 2 second delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const selectedGoal = businessGoals.find(g => g.id === goal)
  const templates: Record<string, string> = {
    sales: `✨ ${userInput} ${selectedGoal?.strategy.cta[0]} and experience the difference! 💫`,
    visits: `🏪 ${userInput} Visit us ${brandProfile.location ? `in ${brandProfile.location}` : 'today'} and see for yourself! 🎯`,
    messages: `💬 ${userInput} DM us for details and let's make it happen! 📲`,
    awareness: `🌟 ${userInput} Discover what makes us special! ✨`,
    followers: `🔥 ${userInput} Follow us for more amazing content! 🚀`
  }
  
  return templates[goal] || templates.sales
}

export const simulateOAuthConnection = async (platform: string) => {
  // Simulate OAuth connection delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    connected: true,
    followers: 0, // Start with 0 until real data is fetched
    engagement: 0 // Start with 0 until real data is fetched
  }
}
