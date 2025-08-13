"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Instagram, Sparkles } from "lucide-react"
import { colors } from "@/constants/landing"

interface HeroSectionProps {
  email: string
  onEmailChange: (email: string) => void
  onEmailSubmit: () => void
}

export default function HeroSection({ email, onEmailChange, onEmailSubmit }: HeroSectionProps) {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: colors.gray }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div>
              <Badge className="px-4 py-2 mb-6" style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}>
                🚀 AI-Powered Business Growth
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: colors.ink }}>
                Generate Social Media Ads in{" "}
                <span
                  className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  style={{ color: colors.primary }}
                >
                  Seconds
                </span>{" "}
                with AI
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Upload one image. Set your business goal. Watch AI create viral content, schedule posts, and drive
                real results across Instagram, Facebook, and TikTok.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Input
                  placeholder="Enter your email to start free"
                  className="h-14 text-base"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                />
                <Button
                  size="lg"
                  className="h-14 px-8 font-semibold text-lg"
                  style={{ backgroundColor: colors.primary }}
                  onClick={onEmailSubmit}
                >
                  Create My First Ad
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                🎯 <span className="font-semibold">Free forever plan.</span> No credit card required. Generate 5
                viral posts monthly.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              <Card className="overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 text-white">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="font-semibold">AI Working...</span>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-sm opacity-90">
                          ✨ Just dropped this amazing piece! The quality is unreal...
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className="bg-white/20 text-white text-xs">#MustHave</Badge>
                        <Badge className="bg-white/20 text-white text-xs">#StyleInspo</Badge>
                        <Badge className="bg-white/20 text-white text-xs">#Perfect</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        <span className="font-semibold text-sm">Instagram</span>
                      </div>
                      <Badge style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}>
                        8.4% engagement
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-bold text-lg">23.4K</div>
                        <div className="text-gray-600">Reach</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">1.2K</div>
                        <div className="text-gray-600">Likes</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">89</div>
                        <div className="text-gray-600">Comments</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <motion.div
                className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">Sales: +127% this month</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="text-center">
                  <div className="font-bold text-lg" style={{ color: colors.primary }}>
                    2.3x
                  </div>
                  <div className="text-xs text-gray-600">ROI Boost</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
