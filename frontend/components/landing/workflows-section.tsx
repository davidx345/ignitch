"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  Monitor, 
  Upload, 
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Send,
  Calendar,
  BarChart,
  Zap
} from "lucide-react"
import { colors } from "@/constants/landing"

const workflows = [
  {
    id: "schedule",
    title: "Social Media Automation",
    description: "AI-powered content creation and scheduling for Instagram, Facebook, TikTok, and Twitter. Maintain consistent brand presence across all platforms.",
    frequency: "Every 2 days",
    icon: Clock,
    color: "bg-blue-500",
    steps: [
      { icon: TrendingUp, text: "Generate AI content", color: "bg-purple-500" },
      { icon: ImageIcon, text: "Auto-crop for platforms", color: "bg-green-500" },
      { icon: Send, text: "Post to social media", color: "bg-blue-500" }
    ]
  },
  {
    id: "billboard",
    title: "Billboard Campaign Distribution",
    description: "Automatically deploy your campaigns to connected digital billboards across Nigeria. Real-time monitoring and performance tracking.",
    frequency: "Campaign launch",
    icon: Monitor,
    color: "bg-orange-500",
    steps: [
      { icon: Upload, text: "Upload campaign assets", color: "bg-orange-500" },
      { icon: Zap, text: "Distribute to billboards", color: "bg-purple-500" },
      { icon: BarChart, text: "Monitor performance", color: "bg-blue-500" }
    ]
  },
  {
    id: "analytics",
    title: "Cross-Platform Analytics",
    description: "Unified analytics dashboard combining social media engagement metrics with billboard impression data for complete campaign insights.",
    frequency: "Real-time updates",
    icon: BarChart,
    color: "bg-green-500",
    steps: [
      { icon: TrendingUp, text: "Collect engagement data", color: "bg-green-500" },
      { icon: Monitor, text: "Track billboard metrics", color: "bg-orange-500" },
      { icon: BarChart, text: "Generate insights", color: "bg-blue-500" }
    ]
  }
]

export default function WorkflowsSection() {
  return (
    <section className="relative py-24 px-6 bg-gray-50 overflow-hidden">
      {/* Professional dotted background pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        opacity: 0.6
      }}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-gray-50/60 to-white/80"></div>
      <div className="relative max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <Badge 
              className="px-4 py-2 mb-6 border-0 font-medium tracking-wide"
              style={{ 
                backgroundColor: `${colors.primary}15`, 
                color: colors.primary,
                backdropFilter: 'blur(10px)'
              }}
            >
              Automation
            </Badge>
          </motion.div>

          <motion.h2 
            className="text-5xl lg:text-6xl font-bold mb-8 tracking-tight text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Multi-Platform Advertising.
          </motion.h2>

          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Seamlessly manage both social media campaigns and digital billboard advertising from one powerful platform. 
            Reach your audience everywhere they are.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {workflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className={`w-12 h-12 ${workflow.color} rounded-xl flex items-center justify-center mb-4`}>
                      <workflow.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{workflow.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{workflow.description}</p>
                  </div>

                  {/* Workflow Steps */}
                  <div className="space-y-4">
                    {/* Trigger */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className={`w-8 h-8 ${workflow.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <workflow.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{workflow.frequency}</span>
                    </div>

                    {/* Steps */}
                    {workflow.steps.map((step, stepIndex) => (
                      <div key={stepIndex}>
                        <div className="flex justify-center">
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                          <div className={`w-8 h-8 ${step.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <step.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{step.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Set up workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Button
            size="lg"
            className="h-14 px-8 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white"
          >
            View All Automations
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
