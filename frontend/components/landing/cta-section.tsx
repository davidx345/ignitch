"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"
import { colors } from "@/constants/landing"

interface CTASectionProps {
  email: string
  onEmailChange: (email: string) => void
  onEmailSubmit: () => void
}

export default function CTASection({ email, onEmailChange, onEmailSubmit }: CTASectionProps) {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: colors.primary }}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 10,000+ business owners who've already boosted their social media presence with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              placeholder="Enter your email"
              className="h-12 text-base bg-white"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
            />
            <Button
              size="lg"
              className="h-12 px-6 font-semibold bg-white hover:bg-gray-100"
              style={{ color: colors.primary }}
              onClick={onEmailSubmit}
            >
              Start Free Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <p className="text-blue-100 text-sm mt-4">✅ Free forever • ✅ No credit card • ✅ 5 viral posts monthly</p>
        </motion.div>
      </div>
    </section>
  )
}
