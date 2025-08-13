"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight } from "lucide-react"
import { pricingPlans, colors } from "@/constants/landing"

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Badge className="px-4 py-2 mb-6" style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}>
            💰 Transparent Pricing
          </Badge>
          <h2 className="text-4xl font-bold mb-6" style={{ color: colors.ink }}>
            Plans That Actually{" "}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Pay For Themselves</span>
          </h2>
          <p className="text-xl text-gray-600">Start free, upgrade when you see results. No surprises.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${plan.popular ? "scale-105" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge
                    className="px-4 py-2 text-white font-semibold"
                    style={{ backgroundColor: colors.coral }}
                  >
                    🔥 Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular ? "border-2" : ""
              }`} style={{ borderColor: plan.popular ? colors.primary : undefined }}>
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4" style={{ color: colors.ink }}>
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold" style={{ color: colors.primary }}>
                        {plan.price}
                      </span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: colors.mint }} />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full font-semibold py-3 ${plan.popular ? "" : "bg-transparent border-2"}`}
                    style={{
                      backgroundColor: plan.popular ? colors.primary : "transparent",
                      borderColor: plan.popular ? colors.primary : colors.primary,
                      color: plan.popular ? "white" : colors.primary,
                    }}
                  >
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
