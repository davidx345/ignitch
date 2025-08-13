"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { features, colors } from "@/constants/landing"

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Badge className="px-4 py-2 mb-6" style={{ backgroundColor: `${colors.coral}20`, color: colors.coral }}>
            🎯 Business-Focused Features
          </Badge>
          <h2 className="text-4xl font-bold mb-6" style={{ color: colors.ink }}>
            Everything You Need to Turn Posts into{" "}
            <span>Profit</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Not just another social media tool. Ignitch is built specifically for businesses that want real results -
            more sales, customers, and growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
                <CardContent className="p-8 h-full flex flex-col">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: colors.ink }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed flex-grow">{feature.description}</p>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">Active & Working</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
