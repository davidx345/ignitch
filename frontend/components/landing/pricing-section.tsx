"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Star, Shield, Zap } from "lucide-react"
import { pricingPlans, colors } from "@/constants/landing"

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 px-6 bg-gray-50 overflow-hidden">
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
              💰 Enterprise Pricing
            </Badge>
          </motion.div>

          <motion.h2 
            className="text-5xl lg:text-6xl font-bold mb-8 tracking-tight text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Transparent pricing.
          </motion.h2>

          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Complete social media and billboard advertising solution. Transparent pricing for businesses 
            of all sizes - from startups to enterprises. Try now with a 14-day free trial!
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className={`relative group ${plan.popular ? "scale-105" : ""}`}
            >
              {plan.popular && (
                <motion.div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <Badge
                    className="px-4 py-2 text-white font-semibold shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.coral}, ${colors.coral}dd)`,
                      boxShadow: `0 4px 20px ${colors.coral}40`
                    }}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Most Popular
                  </Badge>
                </motion.div>
              )}
              
              <Card className={`h-full shadow-lg hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden bg-white/80 backdrop-blur-sm group-hover:bg-white ${
                plan.popular ? "ring-2 ring-blue-500/20" : ""
              }`}>
                <CardContent className="p-8 h-full flex flex-col relative">
                  {/* Gradient overlay for popular plan */}
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  )}
                  
                  <div className="relative z-10 flex-1">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-gray-900 transition-colors duration-300 text-gray-900">
                        {plan.name}
                      </h3>
                      <div className="mb-4">
                        <span className="text-5xl font-bold text-blue-600">
                          {plan.price}
                        </span>
                        <span className="text-gray-600">/{plan.period}</span>
                      </div>
                      <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                        {plan.description}
                      </p>
                    </div>

                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                          <span className="text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <Button
                      className={`w-full font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
                        plan.popular 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                          : "bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enterprise guarantees */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <h3 className="text-2xl font-bold mb-8 text-gray-900">
              Enterprise Guarantees
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">30-Day Money Back</div>
                  <div className="text-sm text-gray-600">Full refund guarantee</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Instant Setup</div>
                  <div className="text-sm text-gray-600">No technical expertise needed</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Premium Support</div>
                  <div className="text-sm text-gray-600">24/7 enterprise support</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
