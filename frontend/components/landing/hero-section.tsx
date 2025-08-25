"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Instagram, Brain, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { colors } from "@/constants/landing"

interface HeroSectionProps {
  email: string
  onEmailChange: (email: string) => void
  onEmailSubmit: () => Promise<void>
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  error: string | null
  isEmailValid: boolean
}

export default function HeroSection({ 
  email, 
  onEmailChange, 
  onEmailSubmit, 
  onKeyPress,
  isLoading,
  error,
  isEmailValid
}: HeroSectionProps) {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Professional background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Badge 
                  className="px-4 py-2 mb-6 border-0 font-medium tracking-wide"
                  style={{ 
                    backgroundColor: `${colors.primary}15`, 
                    color: colors.primary,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Enterprise AI-Powered Growth Platform
                </Badge>
              </motion.div>

              <motion.h1 
                className="text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight"
                style={{ color: colors.ink }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Transform Your Business with{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Driven
                </span>{" "}
                Social Media
              </motion.h1>

              <motion.p 
                className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Upload one image. Define your business objectives. Watch our enterprise AI create viral content, 
                optimize posting schedules, and deliver measurable ROI across all major platforms.
              </motion.p>

              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Enter your business email"
                      className={`h-14 text-base border-2 transition-all duration-200 ${
                        error ? 'border-red-300 focus:border-red-500' : 
                        isEmailValid ? 'border-green-300 focus:border-green-500' : 
                        'border-slate-200 focus:border-blue-500'
                      }`}
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      onKeyPress={onKeyPress}
                      disabled={isLoading}
                    />
                    {isEmailValid && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    {error && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <Button
                    size="lg"
                    className="h-14 px-8 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    style={{ backgroundColor: colors.primary }}
                    onClick={onEmailSubmit}
                    disabled={isLoading || !isEmailValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Start Free Trial'
                    )}
                  </Button>
                </div>

                {error && (
                  <motion.p 
                    className="text-sm text-red-600 flex items-center gap-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.p>
                )}

                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Enterprise-grade security.</span> 
                  No credit card required. 14-day free trial.
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative">
              <Card className="overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-8 text-white">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Brain className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-semibold text-lg">AI Processing</span>
                        <div className="text-sm text-slate-300">Generating optimized content...</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-sm opacity-90 leading-relaxed">
                          "Just launched our latest collection! The craftsmanship and attention to detail is absolutely 
                          incredible. Every piece tells a story of quality and innovation..."
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-white/10 text-white text-xs border border-white/20">#LuxuryFashion</Badge>
                        <Badge className="bg-white/10 text-white text-xs border border-white/20">#QualityCraftsmanship</Badge>
                        <Badge className="bg-white/10 text-white text-xs border border-white/20">#Innovation</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-white">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Instagram className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">Instagram</span>
                          <div className="text-xs text-slate-500">Optimized for engagement</div>
                        </div>
                      </div>
                      <Badge 
                        className="border-0 font-medium"
                        style={{ backgroundColor: `${colors.mint}15`, color: colors.mint }}
                      >
                        12.4% engagement
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div className="space-y-1">
                        <div className="font-bold text-2xl text-slate-900">34.2K</div>
                        <div className="text-sm text-slate-600">Reach</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-2xl text-slate-900">2.8K</div>
                        <div className="text-sm text-slate-600">Likes</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-2xl text-slate-900">156</div>
                        <div className="text-sm text-slate-600">Comments</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <motion.div
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-slate-100"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Revenue Growth</div>
                    <div className="text-xs text-slate-500">+247% this quarter</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 border border-slate-100"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <div className="text-center">
                  <div className="font-bold text-xl" style={{ color: colors.primary }}>
                    3.2x
                  </div>
                  <div className="text-xs text-slate-600">ROI Increase</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
