"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Zap,
  Award
} from "lucide-react"
import Link from "next/link"
import { colors } from "@/constants/upload"
import { getVisibilityScoreColor } from "@/utils/upload"

interface UploadHeaderProps {
  visibilityScore: number
}

export default function UploadHeader({ visibilityScore }: UploadHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.ink }}>
                  Create & Upload
                </h1>
                <p className="text-sm text-gray-600">AI-powered content creation workflow</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Business Visibility Score Widget */}
            <Card className="px-4 py-2 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" style={{ color: getVisibilityScoreColor(visibilityScore) }} />
                  <span className="text-sm font-semibold" style={{ color: colors.ink }}>
                    Visibility Score
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: getVisibilityScoreColor(visibilityScore) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${visibilityScore}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <span className="text-sm font-bold" style={{ color: getVisibilityScoreColor(visibilityScore) }}>
                    {visibilityScore}/100
                  </span>
                </div>
              </div>
            </Card>

            <Badge
              className="px-3 py-1"
              style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}
            >
              Pro Business Assistant
            </Badge>
          </div>
        </div>
      </div>
    </header>
  )
}
