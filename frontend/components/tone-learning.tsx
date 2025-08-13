"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { MessageSquare, Brain, Sparkles, TrendingUp, Users, Heart, RefreshCw } from "lucide-react"

interface ToneProfile {
  id: string
  name: string
  description: string
  characteristics: string[]
  examples: string[]
  confidence: number
  usage: number
}

interface ToneAnalysis {
  dominant: string
  secondary: string
  confidence: number
  suggestions: string[]
}

export default function ToneLearning() {
  const [selectedTone, setSelectedTone] = useState("casual")
  const [customText, setCustomText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isTraining, setIsTraining] = useState(false)

  const [toneProfiles] = useState<ToneProfile[]>([
    {
      id: "casual",
      name: "Casual & Friendly",
      description: "Relaxed, approachable, and conversational tone",
      characteristics: ["Informal language", "Emojis", "Personal pronouns", "Contractions"],
      examples: [
        "Hey everyone! Just dropped this amazing piece 🔥",
        "Can't get enough of this style - what do you think?",
        "Sunday vibes with my new favorite outfit ✨",
      ],
      confidence: 92,
      usage: 68,
    },
    {
      id: "professional",
      name: "Professional",
      description: "Polished, authoritative, and business-focused",
      characteristics: ["Formal language", "Industry terms", "Clear structure", "Call-to-actions"],
      examples: [
        "Introducing our latest collection, designed for the modern professional.",
        "Elevate your wardrobe with premium quality and timeless design.",
        "Experience excellence in craftsmanship and attention to detail.",
      ],
      confidence: 87,
      usage: 23,
    },
    {
      id: "gen-z",
      name: "Gen Z",
      description: "Trendy, authentic, and culturally aware",
      characteristics: ["Slang terms", "Pop culture refs", "Authentic voice", "Social awareness"],
      examples: [
        "no bc this is actually everything 😭 bestie you NEED this",
        "the way this just hits different... main character energy fr",
        "okay but make it sustainable ✨ we love an eco-friendly queen",
      ],
      confidence: 78,
      usage: 9,
    },
  ])

  const [toneAnalysis, setToneAnalysis] = useState<ToneAnalysis>({
    dominant: "casual",
    secondary: "professional",
    confidence: 85,
    suggestions: [
      "Use more emojis to increase engagement",
      "Add personal anecdotes for authenticity",
      "Include trending hashtags naturally",
    ],
  })

  const analyzeTone = async () => {
    if (!customText.trim()) return

    setIsAnalyzing(true)

    // Simulate tone analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock analysis results
    setToneAnalysis({
      dominant: "casual",
      secondary: "gen-z",
      confidence: Math.floor(Math.random() * 20) + 80,
      suggestions: [
        "Consider adding more personality to your voice",
        "Your tone is well-balanced for your audience",
        "Try incorporating more storytelling elements",
      ],
    })

    setIsAnalyzing(false)
  }

  const trainTone = async () => {
    setIsTraining(true)

    // Simulate AI training
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setIsTraining(false)
    alert("Tone model updated successfully!")
  }

  const generateWithTone = (tone: string) => {
    const examples: { [key: string]: string } = {
      casual:
        "Just found the perfect piece for weekend vibes! 🌟 This style is giving me all the confidence I need. What's your go-to look for feeling amazing?",
      professional:
        "Discover our latest addition to the collection - expertly crafted for those who appreciate quality and sophistication. Elevate your style with timeless elegance.",
      "gen-z":
        "bestie this is IT 😍 the way this piece just understood the assignment... we're obsessed and you should be too fr fr ✨",
    }

    return examples[tone] || examples.casual
  }

  return (
    <div className="space-y-6">
      {/* Tone Learning Overview */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Adaptive AI Tone Learning</span>
          </CardTitle>
          <CardDescription>AI learns from your communication style to maintain consistent brand voice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">847</div>
              <div className="text-sm text-gray-600">Messages Analyzed</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">92%</div>
              <div className="text-sm text-gray-600">Tone Accuracy</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Tone Profiles</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-gray-600">Content Generated</div>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={trainTone}
              disabled={isTraining}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isTraining ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Training AI...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Train Tone Model
                </>
              )}
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Learning
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tone Profiles */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle>Your Tone Profiles</CardTitle>
            <CardDescription>AI-identified communication styles based on your content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {toneProfiles.map((profile) => (
                <Card key={profile.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{profile.name}</h4>
                        <p className="text-sm text-gray-600">{profile.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{profile.confidence}% confidence</div>
                        <div className="text-xs text-gray-600">{profile.usage}% usage</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <Progress value={profile.confidence} className="h-2 mb-2" />
                      <div className="flex flex-wrap gap-1">
                        {profile.characteristics.map((char, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">Example phrases:</p>
                      <div className="space-y-1">
                        {profile.examples.slice(0, 2).map((example, idx) => (
                          <p key={idx} className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded">
                            "{example}"
                          </p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tone Analysis */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle>Tone Analysis</CardTitle>
            <CardDescription>Analyze and improve your communication style</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Analyze Your Text</label>
              <Textarea
                placeholder="Paste your content here to analyze tone and style..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="min-h-[120px]"
              />
              <Button onClick={analyzeTone} disabled={!customText.trim() || isAnalyzing} className="mt-3 w-full">
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Analyze Tone
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Current Analysis</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-900">Dominant Tone</div>
                    <div className="text-sm text-purple-700 capitalize">{toneAnalysis.dominant}</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-900">Confidence</div>
                    <div className="text-sm text-blue-700">{toneAnalysis.confidence}%</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">AI Suggestions</h4>
                <div className="space-y-2">
                  {toneAnalysis.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tone Generator */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle>Tone-Based Content Generator</CardTitle>
          <CardDescription>Generate content in different tones to see the difference</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="casual" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="casual">Casual</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="gen-z">Gen Z</TabsTrigger>
            </TabsList>

            {["casual", "professional", "gen-z"].map((tone) => (
              <TabsContent key={tone} value={tone} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold capitalize">{tone.replace("-", " ")} Tone Example</h4>
                    <Badge variant="secondary" className="capitalize">
                      {tone.replace("-", " ")}
                    </Badge>
                  </div>
                  <p className="text-gray-700 italic">"{generateWithTone(tone)}"</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-semibold">Engagement</div>
                    <div className="flex items-center justify-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{tone === "gen-z" ? "8.2%" : tone === "casual" ? "6.4%" : "4.1%"}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Reach</div>
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>{tone === "professional" ? "12.3k" : tone === "casual" ? "8.7k" : "15.2k"}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Shares</div>
                    <div className="flex items-center justify-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span>{tone === "gen-z" ? "234" : tone === "casual" ? "156" : "89"}</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                  Generate More in {tone.replace("-", " ")} Tone
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
