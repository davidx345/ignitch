"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { testimonials, colors } from "@/constants/landing"

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 px-6" style={{ backgroundColor: colors.gray }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Badge className="px-4 py-2 mb-6" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
            ⭐ Real Success Stories
          </Badge>
          <h2 className="text-4xl font-bold mb-6" style={{ color: colors.ink }}>
            Nigerian Businesses Growing with{" "}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Ignitch</span>
          </h2>
          <p className="text-xl text-gray-600">Join thousands of business owners seeing real results</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                    {Object.entries(testimonial.metrics).map(([key, value]) => (
                      <div key={key} className="p-2 bg-blue-50 rounded-lg">
                        <div className="font-bold text-sm" style={{ color: colors.primary }}>
                          {value}
                        </div>
                        <div className="text-xs text-gray-600 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold" style={{ color: colors.ink }}>
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
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
