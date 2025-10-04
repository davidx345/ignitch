"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Copy, RefreshCw, Heart, MessageCircle, Share, Instagram, Facebook, Youtube, Hash } from "lucide-react"

interface GeneratedContent {
  id: string
  productId: string
  type: "caption" | "hashtags" | "reel" | "carousel" | "story"
  platform: string
  content: string
  hashtags: string[]
  engagement: {
    likes: number
    comments: number
    shares: number
  }
  performance: "high" | "medium" | "low"
}

interface ContentGeneratorProps {
  uploadedProducts: any[]
  onContentGenerated: (content: GeneratedContent[]) => void
  generatedContent: GeneratedContent[]
}

export default function ContentGenerator({
  uploadedProducts,
  onContentGenerated,
  generatedContent,
}: ContentGeneratorProps) {
  const [selectedProduct, setSelectedProduct] = useState("")
  const [contentType, setContentType] = useState("caption")
  const [platform, setPlatform] = useState("instagram")
  const [tone, setTone] = useState("casual")
  const [isGenerating, setIsGenerating] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")

  const generateContent = async () => {
    if (!selectedProduct) return

    setIsGenerating(true)

    // Simulate AI content generation
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockContent: GeneratedContent[] = [
      {
        id: Math.random().toString(36).substr(2, 9),
        productId: selectedProduct,
        type: contentType as any,
        platform,
        content: getGeneratedContent(contentType, platform, tone),
        hashtags: getGeneratedHashtags(platform),
        engagement: {
          likes: Math.floor(Math.random() * 1000) + 100,
          comments: Math.floor(Math.random() * 50) + 10,
          shares: Math.floor(Math.random() * 25) + 5,
        },
        performance: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as any,
      },
    ]

    const allContent = [...generatedContent, ...mockContent]
    onContentGenerated(allContent)
    setIsGenerating(false)
  }

  type ContentType = "caption" | "reel";
  type PlatformType = "instagram" | "facebook";
  type ToneType = "casual" | "professional" | "gen-z";

  const getGeneratedContent = (type: string, platform: string, tone: string) => {
    const contents: Record<ContentType, Record<PlatformType, Record<ToneType, string>>> = {
      caption: {
        instagram: {
          casual:
            "Just dropped this amazing piece! The quality is unreal and the style is exactly what I've been looking for. Perfect for those days when you want to look effortless but put-together",
          professional:
            "Introducing our latest collection piece - expertly crafted with attention to detail and designed for the modern professional. Quality meets style in this versatile addition to your wardrobe.",
          "gen-z":
            "no bc this is actually everything the way it just hits different... bestie you NEED this in your life fr fr",
        },
        facebook: {
          casual:
            "Hey everyone! I'm so excited to share this new find with you all. The craftsmanship is incredible and it's become my new favorite piece. What do you think?",
          professional:
            "We're thrilled to present our newest product, designed with our customers' needs in mind. This piece represents our commitment to quality and innovation.",
          "gen-z": "okay but like... this is actually iconic??? the way it's giving main character energy 💯",
        },
      },
      reel: {
        instagram: {
          casual:
            "POV: You found the perfect piece that goes with everything in your closet 🤩 Swipe to see how I styled it 3 different ways!",
          professional:
            "Transform your look with one versatile piece. Here's how to style it for work, weekend, and everything in between.",
          "gen-z": "tell me you're obsessed without telling me you're obsessed... I'll go first 😍",
        },
        facebook: {
          casual: "",
          professional: "",
          "gen-z": "",
        },
      },
    };

    if (
      contents[type as ContentType] &&
      contents[type as ContentType][platform as PlatformType] &&
      contents[type as ContentType][platform as PlatformType][tone as ToneType]
    ) {
      return contents[type as ContentType][platform as PlatformType][tone as ToneType];
    }
    return "Generated content based on your product and preferences!";
  }

  const getGeneratedHashtags = (platform: string) => {
    const hashtags = {
      instagram: [
        "#fashion",
        "#style",
        "#ootd",
        "#trendy",
        "#quality",
        "#musthave",
        "#newdrop",
        "#aesthetic",
        "#vibes",
        "#instagood",
      ],
      facebook: ["#fashion", "#style", "#quality", "#newproduct", "#trendy"],
      tiktok: [
        "#fashion",
        "#style",
        "#ootd",
        "#trendy",
        "#fyp",
        "#viral",
        "#aesthetic",
        "#outfit",
        "#musthave",
        "#newdrop",
      ],
      youtube: ["#fashion", "#style", "#review", "#quality", "#trendy"],
    }

    return hashtags[platform as keyof typeof hashtags] || hashtags.instagram
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const regenerateContent = (contentId: string) => {
    // Simulate regeneration
    const updated = generatedContent.map((content) =>
      content.id === contentId
        ? { ...content, content: getGeneratedContent(content.type, content.platform, tone) }
        : content,
    )
    onContentGenerated(updated)
  }

  return (
    <div className="space-y-6">
      {/* Content Generation Controls */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <span>AI Content Generator</span>
          </CardTitle>
          <CardDescription>Generate engaging captions, hashtags, and post ideas powered by AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Product</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {uploadedProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Content Type</label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caption">Caption</SelectItem>
                  <SelectItem value="hashtags">Hashtags</SelectItem>
                  <SelectItem value="reel">Reel Idea</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="gen-z">Gen Z</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Custom Prompt (Optional)</label>
            <Textarea
              placeholder="Add specific instructions for content generation..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button
            onClick={generateContent}
            disabled={!selectedProduct || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle>Generated Content ({generatedContent.length})</CardTitle>
            <CardDescription>AI-generated content ready for scheduling and publishing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedContent.map((content) => {
                const product = uploadedProducts.find((p) => p.id === content.productId)
                return (
                  <Card key={content.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                            {product && (
                              <img
                                src={product.url || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold">{product?.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {content.platform === "instagram" && <Instagram className="w-3 h-3 mr-1" />}
                                {content.platform === "facebook" && <Facebook className="w-3 h-3 mr-1" />}
                                {content.platform === "youtube" && <Youtube className="w-3 h-3 mr-1" />}
                                {content.platform}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {content.type}
                              </Badge>
                              <Badge
                                variant={content.performance === "high" ? "default" : "secondary"}
                                className={`text-xs ${
                                  content.performance === "high"
                                    ? "bg-green-100 text-green-800"
                                    : content.performance === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {content.performance} performance
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => regenerateContent(content.id)}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(content.content)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium mb-2">Content</h5>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{content.content}</p>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2 flex items-center">
                            <Hash className="w-4 h-4 mr-1" />
                            Hashtags
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {content.hashtags.map((hashtag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {hashtag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{content.engagement.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{content.engagement.comments}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share className="w-4 h-4" />
                              <span>{content.engagement.shares}</span>
                            </div>
                          </div>
                          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                            Schedule Post
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
