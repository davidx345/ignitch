"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle } from "lucide-react"
import { steps, colors } from "@/constants/landing"

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 px-6 bg-gray-50 overflow-hidden">
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
                backgroundColor: `${colors.mint}15`, 
                color: colors.mint,
                backdropFilter: 'blur(10px)'
              }}
            >
              Simple 3-Step Process
            </Badge>
          </motion.div>

          <motion.h2 
            className="text-5xl lg:text-6xl font-bold mb-8 tracking-tight text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            From Upload to{" "}
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Multi-Platform
            </span>{" "}
            Success
          </motion.h2>

          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Simple enough for anyone, powerful enough for enterprise growth across social media and billboard networks. 
            Our streamlined process ensures maximum efficiency and results.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="group"
            >
              <Card className="h-full shadow-lg hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden bg-white/80 backdrop-blur-sm group-hover:bg-white">
                <CardContent className="p-8 h-full flex flex-col relative">
                  {/* Step number and icon */}
                  <div className="relative mb-8">
                    <div
                      className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 bg-blue-600"
                    >
                      {step.step}
                    </div>
                    <div
                      className="absolute -bottom-2 -right-2 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-green-600"
                    >
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-4 group-hover:text-gray-900 transition-colors duration-300 text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-6 pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Step {index + 1} Complete</span>
                      </div>
                      {index < steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Connection line between steps */}
        <motion.div 
          className="hidden md:block relative mb-16"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent transform -translate-y-1/2"></div>
        </motion.div>

        {/* Results showcase */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              Average Results in First 30 Days
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-blue-600">
                  +247%
                </div>
                <div className="text-gray-600">Revenue Increase</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-green-600">
                  +3.2x
                </div>
                <div className="text-gray-600">Engagement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-purple-600">
                  89%
                </div>
                <div className="text-gray-600">Time Saved</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
