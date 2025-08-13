"use client"

import React from "react"
import { motion } from "framer-motion"
import { steps, colors } from "@/constants/landing"

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6" style={{ color: colors.ink }}>
            From Upload to Sales in 3 Steps
          </h2>
          <p className="text-xl text-gray-600">Simple enough for anyone, powerful enough for serious growth</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="text-center"
            >
              <div className="relative mb-8">
                <div
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  {step.step}
                </div>
                <div
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.mint }}
                >
                  <step.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.ink }}>
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
