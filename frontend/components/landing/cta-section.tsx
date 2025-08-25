"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Loader2, AlertCircle, CheckCircle, Shield, Zap, Users } from "lucide-react"
import { colors } from "@/constants/landing"

interface CTASectionProps {
  email: string
  onEmailChange: (email: string) => void
  onEmailSubmit: () => Promise<void>
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  error: string | null
  isEmailValid: boolean
}

export default function CTASection({ 
  email, 
  onEmailChange, 
  onEmailSubmit, 
  onKeyPress,
  isLoading,
  error,
  isEmailValid
}: CTASectionProps) {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Professional gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="relative max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                Ready to Scale Your Business with{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Enterprise AI
                </span>
                ?
              </h2>
            </motion.div>

            <motion.p 
              className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Join 15,000+ business leaders who've transformed their social media strategy 
              and achieved measurable ROI with our enterprise-grade AI platform.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="relative flex-1">
                <Input
                  placeholder="Enter your business email"
                  className={`h-14 text-base bg-white/95 backdrop-blur-sm border-2 transition-all duration-200 ${
                    error ? 'border-red-300 focus:border-red-500' : 
                    isEmailValid ? 'border-green-300 focus:border-green-500' : 
                    'border-white/20 focus:border-blue-400'
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
                className="h-14 px-8 font-semibold text-lg bg-white hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-50"
                style={{ color: colors.primary }}
                onClick={onEmailSubmit}
                disabled={isLoading || !isEmailValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>

            {error && (
              <motion.p 
                className="text-sm text-red-400 flex items-center justify-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.p>
            )}

            <motion.div 
              className="flex items-center justify-center gap-6 text-slate-300 text-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>No Credit Card</span>
              </div>
            </motion.div>
          </div>

          {/* Trust indicators */}
          <motion.div 
            className="pt-12 border-t border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p className="text-slate-400 text-sm mb-6">Trusted by leading businesses worldwide</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="text-slate-300 font-semibold">Fortune 500</div>
              <div className="text-slate-300 font-semibold">Startups</div>
              <div className="text-slate-300 font-semibold">Agencies</div>
              <div className="text-slate-300 font-semibold">E-commerce</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
