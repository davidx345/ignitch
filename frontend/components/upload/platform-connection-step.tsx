"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Wand2,
  Share2,
  Settings,
  Zap,
  Eye,
  Calendar,
  BarChart3
} from "lucide-react"
import { PlatformConnection } from "@/types/upload"
import { colors } from "@/constants/upload"

interface PlatformConnectionStepProps {
  connectedPlatforms: PlatformConnection[]
  onConnectPlatform: (platform: string) => void
  onBack: () => void
  onContinue: () => void
}

export default function PlatformConnectionStep({ 
  connectedPlatforms,
  onConnectPlatform,
  onBack,
  onContinue
}: PlatformConnectionStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.ink }}>
          Connect Your Platforms
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Let's connect your social accounts to preview how your content will look live and enable auto-posting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {connectedPlatforms.map((platform) => (
          <Card key={platform.platform} className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <platform.icon className="w-8 h-8" style={{ color: colors.primary }} />
                </div>
                <h3 className="font-semibold capitalize" style={{ color: colors.ink }}>
                  {platform.platform}
                </h3>
              </div>

              {platform.connected ? (
                <div className="space-y-3">
                  <Badge
                    className="px-3 py-1"
                    style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}
                  >
                    ✓ Connected
                  </Badge>
                  <div className="text-sm text-gray-600">
                    <p>{platform.followers.toLocaleString()} followers</p>
                    <p>{platform.engagement.toFixed(1)}% avg engagement</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Settings className="w-4 h-4 mr-1" />
                    Settings
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Connect to preview and auto-post your content</p>
                  <Button
                    onClick={() => onConnectPlatform(platform.platform)}
                    className="w-full font-semibold"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Connect {platform.platform}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Why Connect Explanation */}
      <Card className="mb-8 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center" style={{ color: colors.ink }}>
            <Zap className="w-5 h-5 mr-2" style={{ color: colors.primary }} />
            Why Connect Your Platforms?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5" style={{ color: colors.mint }} />
              <span className="text-sm">Preview how content looks live</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5" style={{ color: colors.primary }} />
              <span className="text-sm">Auto-schedule at optimal times</span>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5" style={{ color: colors.coral }} />
              <span className="text-sm">Track real performance metrics</span>
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
          Back to Prompt Builder
        </Button>

        {connectedPlatforms.some(p => p.connected) && (
          <Button
            size="lg"
            onClick={onContinue}
            className="font-semibold px-8"
            style={{ backgroundColor: colors.primary }}
          >
            <Wand2 className="w-5 h-5 mr-2" />
            Generate Full Ad Set
          </Button>
        )}
      </div>
    </motion.div>
  )
}
