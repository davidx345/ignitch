/**
 * Content Creator Component
 * AI-powered content creation interface
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Sparkles, 
  Wand2, 
  Target, 
  Hash, 
  Image as ImageIcon, 
  Send,
  Instagram,
  Facebook,
  MessageCircle,
  Loader2,
  RefreshCw,
  TrendingUp,
  Layers,
  Brain,
  BarChart3,
  Copy,
  Eye,
  Shuffle
} from 'lucide-react'

interface ContentCreatorProps {
  onStatsUpdate?: (stats: any) => void
}

interface GeneratedContent {
  id: string
  platform: string
  content: string
  hashtags: string[]
  engagement_prediction: number
  variations?: ContentVariation[]
  performance_prediction?: PerformancePrediction
  trend_integration?: TrendData[]
  optimization_score?: number
  optimization_suggestions?: string[]
}

interface ContentVariation {
  id: string
  variant_type: 'casual' | 'professional' | 'creative' | 'urgency' | 'emotional'
  content: string
  predicted_engagement: number
  audience_match: number
}

interface PerformancePrediction {
  estimated_reach: number
  estimated_engagement: number
  optimal_posting_time: string
  confidence_score: number
  factors: string[]
}

interface TrendData {
  keyword: string
  trend_score: number
  relevance: number
  suggestion: string
}

const ContentCreator: React.FC<ContentCreatorProps> = ({ onStatsUpdate }) => {
  const [prompt, setPrompt] = useState('')
  const [businessGoal, setBusinessGoal] = useState('engagement')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram'])
  const [tone, setTone] = useState('professional')
  const [loading, setLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [showVariations, setShowVariations] = useState(false)
  const [generateVariations, setGenerateVariations] = useState(true)
  const [includeTrends, setIncludeTrends] = useState(true)
  const [showPerformancePrediction, setShowPerformancePrediction] = useState(false)
  const [enableSmartOptimization, setEnableSmartOptimization] = useState(true)
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([])
  const [contentScore, setContentScore] = useState<number>(0)

  const businessGoals = [
    { value: 'engagement', label: 'Boost Engagement', icon: '💬' },
    { value: 'sales', label: 'Drive Sales', icon: '💰' },
    { value: 'awareness', label: 'Brand Awareness', icon: '📢' },
    { value: 'followers', label: 'Gain Followers', icon: '👥' },
    { value: 'visits', label: 'Website Visits', icon: '🌐' }
  ]

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual & Friendly' },
    { value: 'exciting', label: 'Exciting & Bold' },
    { value: 'educational', label: 'Educational' },
    { value: 'humorous', label: 'Humorous' }
  ]

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: <Instagram className="w-4 h-4" />, color: 'bg-pink-500' },
    { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-4 h-4" />, color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: <MessageCircle className="w-4 h-4" />, color: 'bg-blue-400' }
  ]

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  // Phase 5: Smart Content Optimization
  const analyzeContentQuality = (content: string, platform: string): { score: number, suggestions: string[] } => {
    let score = 60 // Base score
    const suggestions: string[] = []

    // Length optimization
    const wordCount = content.split(' ').length
    if (platform === 'twitter' && wordCount > 25) {
      suggestions.push('Consider shortening for Twitter (current: ' + wordCount + ' words)')
    } else if (platform === 'instagram' && wordCount < 10) {
      suggestions.push('Add more descriptive text for Instagram engagement')
      score -= 10
    } else {
      score += 10
    }

    // Emoji and engagement elements
    const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content)
    if (!hasEmojis && platform !== 'linkedin') {
      suggestions.push('Add relevant emojis to increase engagement')
      score -= 5
    } else {
      score += 5
    }

    // Call-to-action
    const hasCTA = /\b(visit|check|click|learn|discover|explore|comment|share|like|follow)\b/i.test(content)
    if (!hasCTA) {
      suggestions.push('Include a call-to-action to drive engagement')
      score -= 10
    } else {
      score += 10
    }

    // Platform-specific optimization
    if (platform === 'instagram' && !content.includes('\n')) {
      suggestions.push('Use line breaks for better readability on Instagram')
      score -= 5
    }

    if (platform === 'linkedin' && content.includes('😊')) {
      suggestions.push('Consider more professional tone for LinkedIn')
      score -= 5
    }

    return { score: Math.min(100, Math.max(0, score)), suggestions }
  }

  const generateContent = async () => {
    if (!prompt.trim()) {
      setError('Please provide a content description')
      return
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Mock AI generation with Phase 5 features - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockContent: GeneratedContent[] = selectedPlatforms.map((platform, index) => {
        const baseContent = generateMockContent(prompt, platform, tone)
        
        // Phase 5: Smart Content Optimization
        const optimization = enableSmartOptimization ? analyzeContentQuality(baseContent, platform) : null
        
        return {
          id: `generated-${Date.now()}-${index}`,
          platform,
          content: baseContent,
          hashtags: generateMockHashtags(prompt, platform),
          engagement_prediction: Math.floor(Math.random() * 30) + 70,
          // Phase 5: Content Variations
          variations: generateVariations ? generateContentVariations(baseContent, platform) : undefined,
          // Phase 5: Performance Prediction
          performance_prediction: generatePerformancePrediction(platform),
          // Phase 5: Trend Integration
          trend_integration: includeTrends ? generateTrendData(prompt) : undefined,
          // Phase 5: Content Optimization
          optimization_score: optimization?.score,
          optimization_suggestions: optimization?.suggestions
        }
      })

      setGeneratedContent(mockContent)
      onStatsUpdate?.({ content_generated: mockContent.length })
    } catch (err: any) {
      setError('Failed to generate content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Phase 5: Content Variation Generation
  const generateContentVariations = (baseContent: string, platform: string): ContentVariation[] => {
    const variations: ContentVariation[] = [
      {
        id: 'casual',
        variant_type: 'casual',
        content: `Hey everyone! ${baseContent.replace(/[.!]/g, '!')} 😊`,
        predicted_engagement: Math.floor(Math.random() * 20) + 75,
        audience_match: Math.floor(Math.random() * 20) + 80
      },
      {
        id: 'professional',
        variant_type: 'professional',
        content: `${baseContent.replace(/[!]/g, '.')} We look forward to your engagement.`,
        predicted_engagement: Math.floor(Math.random() * 20) + 65,
        audience_match: Math.floor(Math.random() * 20) + 85
      },
      {
        id: 'creative',
        variant_type: 'creative',
        content: `✨ ${baseContent} 🚀 #Innovation #Creative`,
        predicted_engagement: Math.floor(Math.random() * 20) + 80,
        audience_match: Math.floor(Math.random() * 20) + 70
      },
      {
        id: 'urgency',
        variant_type: 'urgency',
        content: `⏰ LIMITED TIME: ${baseContent} Don't miss out!`,
        predicted_engagement: Math.floor(Math.random() * 20) + 85,
        audience_match: Math.floor(Math.random() * 20) + 75
      }
    ]
    return variations
  }

  // Phase 5: Performance Prediction
  const generatePerformancePrediction = (platform: string): PerformancePrediction => {
    const predictions = {
      instagram: {
        estimated_reach: Math.floor(Math.random() * 5000) + 2000,
        estimated_engagement: Math.floor(Math.random() * 10) + 5,
        optimal_posting_time: "6:00 PM - 8:00 PM",
        confidence_score: Math.floor(Math.random() * 20) + 80,
        factors: ["High engagement history", "Optimal hashtag mix", "Trending topic"]
      },
      facebook: {
        estimated_reach: Math.floor(Math.random() * 3000) + 1500,
        estimated_engagement: Math.floor(Math.random() * 8) + 3,
        optimal_posting_time: "12:00 PM - 2:00 PM",
        confidence_score: Math.floor(Math.random() * 20) + 75,
        factors: ["Good audience match", "Platform-optimized format", "Engaging content"]
      },
      twitter: {
        estimated_reach: Math.floor(Math.random() * 4000) + 1000,
        estimated_engagement: Math.floor(Math.random() * 12) + 4,
        optimal_posting_time: "9:00 AM - 11:00 AM",
        confidence_score: Math.floor(Math.random() * 20) + 70,
        factors: ["Trending hashtags", "Good timing", "Conversational tone"]
      }
    }
    return predictions[platform as keyof typeof predictions] || predictions.instagram
  }

  // Phase 5: Trend Integration
  const generateTrendData = (prompt: string): TrendData[] => {
    const trendKeywords = ["AI", "sustainability", "productivity", "wellness", "innovation"]
    return trendKeywords.slice(0, 3).map(keyword => ({
      keyword,
      trend_score: Math.floor(Math.random() * 30) + 70,
      relevance: Math.floor(Math.random() * 40) + 60,
      suggestion: `Consider incorporating "${keyword}" into your content for better reach`
    }))
  }

  const generateMockContent = (prompt: string, platform: string, tone: string): string => {
    const baseContent = prompt.charAt(0).toUpperCase() + prompt.slice(1)
    
    switch (platform) {
      case 'instagram':
        return `${baseContent} ✨\n\nWhat do you think? Let us know in the comments! 📸`
      case 'facebook':
        return `${baseContent}\n\nWe're excited to share this with our community. What are your thoughts?`
      case 'twitter':
        return `${baseContent} 🚀\n\nWhat's your take on this?`
      default:
        return baseContent
    }
  }

  const generateMockHashtags = (prompt: string, platform: string): string[] => {
    const commonTags = ['socialmedia', 'content', 'digital']
    const promptWords = prompt.toLowerCase().split(' ').filter(word => word.length > 3)
    
    return [...commonTags, ...promptWords.slice(0, 2), platform].slice(0, 5)
  }

  const useContent = (content: GeneratedContent) => {
    // This would save the content as draft
    console.log('Using content:', content)
    // Show success message or redirect to content hub
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2 lg:grid-cols-1">
      {/* Content Generation Form */}
      <div className="space-y-6">
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-gray-900 text-lg">
              <Wand2 className="w-5 h-5 text-gray-600" />
              <span>AI Content Generator</span>
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Describe what you want to post about and let AI create engaging content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-gray-700 font-medium text-sm">
                What would you like to post about? *
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Our new product launch, behind the scenes at the office, tips for productivity..."
                className="min-h-[100px] border-gray-300 focus:border-gray-500 text-sm resize-none"
              />
            </div>

            {/* Business Goal */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Business Goal</Label>
              <Select value={businessGoal} onValueChange={setBusinessGoal}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessGoals.map((goal) => (
                    <SelectItem key={goal.value} value={goal.value}>
                      <span className="flex items-center space-x-2">
                        <span>{goal.icon}</span>
                        <span>{goal.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tone Selection */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Content Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((toneOption) => (
                    <SelectItem key={toneOption.value} value={toneOption.value}>
                      {toneOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium text-sm">Select Platforms *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    className={`justify-start h-auto p-4 border-2 transition-all text-sm ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => togglePlatform(platform.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center text-white flex-shrink-0`}>
                        {platform.icon}
                      </div>
                      <span className="font-medium text-gray-700">{platform.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Phase 5: Advanced Options */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Advanced AI Features</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generateVariations}
                    onChange={(e) => setGenerateVariations(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Generate content variations</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeTrends}
                    onChange={(e) => setIncludeTrends(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Include trending topics</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enableSmartOptimization}
                    onChange={(e) => setEnableSmartOptimization(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Smart content optimization</span>
                </label>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Generate Button */}
            <Button 
              onClick={generateContent} 
              disabled={loading || !prompt.trim() || selectedPlatforms.length === 0}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generated Content Results */}
      <div className="space-y-4">
        {generatedContent.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Target className="w-5 h-5 text-gray-600" />
              <span>Generated Content</span>
            </h3>
            
            {generatedContent.map((content) => (
                <Card key={content.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        {platforms.find(p => p.id === content.platform)?.icon}
                        <span className="font-medium text-gray-900 capitalize text-sm">
                          {content.platform}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs self-start sm:self-auto">
                        {content.engagement_prediction}% predicted engagement
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {content.content}
                      </p>
                    </div>                  {content.hashtags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {content.hashtags.map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-blue-50 text-blue-700 text-sm px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                    {/* Phase 5: Performance Prediction */}
                    {content.performance_prediction && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900 text-sm">Performance Prediction</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between sm:flex-col sm:justify-start">
                            <span className="text-gray-600">Est. Reach:</span>
                            <span className="font-medium sm:mt-1">{content.performance_prediction.estimated_reach.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between sm:flex-col sm:justify-start">
                            <span className="text-gray-600">Est. Engagement:</span>
                            <span className="font-medium sm:mt-1">{content.performance_prediction.estimated_engagement}%</span>
                          </div>
                          <div className="flex justify-between sm:flex-col sm:justify-start">
                            <span className="text-gray-600">Best Time:</span>
                            <span className="font-medium sm:mt-1">{content.performance_prediction.optimal_posting_time}</span>
                          </div>
                          <div className="flex justify-between sm:flex-col sm:justify-start">
                            <span className="text-gray-600">Confidence:</span>
                            <span className="font-medium sm:mt-1">{content.performance_prediction.confidence_score}%</span>
                          </div>
                        </div>
                      </div>
                    )}                  {/* Phase 5: Content Variations */}
                  {content.variations && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Shuffle className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">Content Variations</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowVariations(!showVariations)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {showVariations ? 'Hide' : 'Show'} ({content.variations.length})
                        </Button>
                      </div>
                      
                      {showVariations && (
                        <div className="space-y-3">
                          {content.variations.map((variation) => (
                            <div key={variation.id} className="bg-gray-50 p-3 rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="capitalize">
                                  {variation.variant_type}
                                </Badge>
                                <div className="flex space-x-2 text-xs text-gray-600">
                                  <span>Engagement: {variation.predicted_engagement}%</span>
                                  <span>Match: {variation.audience_match}%</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">{variation.content}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-xs"
                                onClick={() => setSelectedVariation(variation.id)}
                              >
                                Use This Variation
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Phase 5: Trend Integration */}
                  {content.trend_integration && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-900">Trending Topics</span>
                      </div>
                      <div className="space-y-2">
                        {content.trend_integration.map((trend, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-purple-900">#{trend.keyword}</span>
                              <div className="flex space-x-2 text-xs text-purple-600">
                                <span>Trend: {trend.trend_score}%</span>
                                <span>Relevance: {trend.relevance}%</span>
                              </div>
                            </div>
                            <p className="text-purple-700 text-xs">{trend.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Phase 5: Content Optimization */}
                  {content.optimization_score !== undefined && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-orange-600" />
                          <span className="font-medium text-orange-900">Content Optimization</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-orange-600">Score:</span>
                          <Badge 
                            variant="outline" 
                            className={`${
                              content.optimization_score >= 80 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : content.optimization_score >= 60 
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {content.optimization_score}/100
                          </Badge>
                        </div>
                      </div>
                      {content.optimization_suggestions && content.optimization_suggestions.length > 0 && (
                        <div className="space-y-1">
                          {content.optimization_suggestions.map((suggestion, index) => (
                            <div key={index} className="text-sm text-orange-700 flex items-start space-x-2">
                              <span className="text-orange-400 mt-1">•</span>
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-10"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-10"
                      onClick={() => useContent(content)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Use Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {generatedContent.length === 0 && !loading && (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to create amazing content?
              </h3>
              <p className="text-gray-600">
                Fill out the form to generate AI-powered social media content
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ContentCreator
