"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { colors } from "@/constants/landing"

export default function LandingNavigation() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: colors.primary }}
            >
              A
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: colors.ink }}>
                Ignitch
              </h1>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
              Reviews
            </a>
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/signin"}>
              Sign In
            </Button>
            <Button size="sm" style={{ backgroundColor: colors.primary }} onClick={() => window.location.href = "/signup"}>
              Start Free
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
