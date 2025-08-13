"use client"

import React from "react"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { CheckCircle } from "lucide-react"
import { UploadStep } from "@/types/upload"
import { colors } from "@/constants/upload"

interface ProgressIndicatorProps {
  steps: UploadStep[]
  currentStep: number
  stepProgress: number
  onStepClick: (stepId: number) => void
}

export default function ProgressIndicator({ 
  steps, 
  currentStep, 
  stepProgress, 
  onStepClick 
}: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-4">
            <motion.div
              className={`flex flex-col items-center space-y-2 cursor-pointer`}
              onClick={() => onStepClick(step.id)}
              whileHover={{ scale: 1.05 }}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep >= step.id ? "text-white shadow-lg" : "text-gray-400 border-2 border-gray-300"
                }`}
                style={{
                  backgroundColor: currentStep >= step.id ? colors.primary : "transparent",
                }}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="w-8 h-8" />
                ) : (
                  <step.icon className="w-8 h-8" />
                )}
              </div>
              <div className="text-center">
                <div className={`font-semibold text-sm ${currentStep >= step.id ? "text-gray-900" : "text-gray-400"}`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 max-w-[120px]">
                  {step.description}
                </div>
              </div>
            </motion.div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 ${currentStep > step.id ? "bg-blue-500" : "bg-gray-300"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 max-w-2xl mx-auto">
        <Progress value={stepProgress} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{stepProgress}% Complete</span>
        </div>
      </div>
    </div>
  )
}
