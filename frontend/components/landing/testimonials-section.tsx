"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Quote, TrendingUp, Users, DollarSign } from "lucide-react"
import { testimonials, colors } from "@/constants/landing"

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-24 px-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20"></div>
      
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
              ⭐ Verified Success Stories
            </Badge>
          </motion.div>

          <motion.h2 
            className="text-5xl lg:text-6xl font-bold mb-8 tracking-tight"
            style={{ color: colors.ink }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Trusted by{" "}
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              15,000+ Businesses
            </span>{" "}
            Worldwide
          </motion.h2>

          <motion.p 
            className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            See how enterprise leaders are transforming their social media strategy 
            and achieving measurable business results with our AI platform.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="h-full shadow-lg hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden bg-white/80 backdrop-blur-sm group-hover:bg-white">
                <CardContent className="p-8 h-full flex flex-col relative">
                  {/* Quote icon */}
                  <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                    <Quote className="w-12 h-12 text-slate-400" />
                  </div>

                  <div className="relative z-10">
                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-slate-500 ml-2">Verified Customer</span>
                    </div>
                    
                    {/* Testimonial content */}
                    <blockquote className="text-slate-700 mb-8 leading-relaxed text-lg italic">
                      "{testimonial.content}"
                    </blockquote>
                    
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      {Object.entries(testimonial.metrics).map(([key, value]) => (
                        <div key={key} className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200/50">
                          <div className="font-bold text-lg" style={{ color: colors.primary }}>
                            {value}
                          </div>
                          <div className="text-xs text-slate-600 capitalize font-medium">{key}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Author */}
                    <div className="flex items-center space-x-4 pt-4 border-t border-slate-100">
                      <Avatar className="w-12 h-12 ring-2 ring-slate-100">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-slate-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <h3 className="text-2xl font-bold mb-8" style={{ color: colors.ink }}>
              Platform Trust & Reliability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
                  99.9%
                </div>
                <div className="text-slate-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold mb-2" style={{ color: colors.mint }}>
                  15K+
                </div>
                <div className="text-slate-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold mb-2" style={{ color: colors.coral }}>
                  $2.4M
                </div>
                <div className="text-slate-600">Revenue Generated</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
                  4.9/5
                </div>
                <div className="text-slate-600">Customer Rating</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
