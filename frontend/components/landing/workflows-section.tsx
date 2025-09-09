"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  Rss, 
  ShoppingBag, 
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
  Send,
  Calendar,
  Brain,
  Zap
} from "lucide-react"
import { colors } from "@/constants/landing"

const workflows = [
  {
    id: "schedule",
    title: "On schedule",
    description: "Content creation on a regular schedule. Trigger every few hours or days - perfect for consistent brand presence.",
    frequency: "Every 2 days",
    icon: Clock,
    color: "bg-blue-500",
    steps: [
      { icon: Sparkles, text: "Write AI caption", color: "bg-purple-500" },
      { icon: ImageIcon, text: "Create AI image", color: "bg-green-500" },
      { icon: Send, text: "Publish social post", color: "bg-blue-500" }
    ]
  },
  {
    id: "rss",
    title: "On RSS update",
    description: "Connect your blog or content feed to automatically turn new posts into social content.",
    frequency: "New RSS item",
    icon: Rss,
    color: "bg-orange-500",
    steps: [
      { icon: Brain, text: "Use AI agent", color: "bg-purple-500" },
      { icon: Send, text: "Publish social post", color: "bg-blue-500" }
    ]
  },
  {
    id: "product",
    title: "On new product",
    description: "Transform product updates into marketing content. When a new product is added, post about it.",
    frequency: "New WooCommerce product",
    icon: ShoppingBag,
    color: "bg-green-500",
    steps: [
      { icon: Sparkles, text: "Write AI caption", color: "bg-purple-500" },
      { icon: ImageIcon, text: "Select product images", color: "bg-green-500" },
      { icon: Send, text: "Publish social post", color: "bg-blue-500" }
    ]
  }
]

export default function WorkflowsSection() {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
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
            className="text-5xl lg:text-6xl font-bold mb-8 tracking-tight"
            style={{ color: colors.ink }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Automated workflows.
          </motion.h2>

          <motion.p 
            className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Sometimes, stories move faster than approval processes. Create workflows with various triggers to automatically generate content.
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
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{workflow.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{workflow.description}</p>
                  </div>

                  {/* Workflow Steps */}
                  <div className="space-y-4">
                    {/* Trigger */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className={`w-8 h-8 ${workflow.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <workflow.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-slate-900 text-sm">{workflow.frequency}</span>
                    </div>

                    {/* Steps */}
                    {workflow.steps.map((step, stepIndex) => (
                      <div key={stepIndex}>
                        <div className="flex justify-center">
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200">
                          <div className={`w-8 h-8 ${step.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <step.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-slate-900 text-sm">{step.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
            className="h-14 px-8 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            style={{ backgroundColor: colors.primary }}
          >
            View All Automations
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
