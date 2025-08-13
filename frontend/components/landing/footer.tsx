"use client"

import React from "react"
import { colors } from "@/constants/landing"

export default function Footer() {
  return (
    <footer className="py-16 px-6 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: colors.primary }}
              >
                A
              </div>
              <h3 className="text-xl font-bold" style={{ color: colors.ink }}>
                Ignitch
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              AI-powered social media marketing that drives real business results for Nigerian entrepreneurs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Facebook</span>
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Instagram</span>
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Twitter</span>
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: colors.ink }}>
              Product
            </h4>
            <div className="space-y-2">
              <a href="#features" className="block text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                API
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                Integrations
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: colors.ink }}>
              Company
            </h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                About
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                Blog
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                Careers
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: colors.ink }}>
              Support
            </h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                Help Center
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                Documentation
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                Status
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-gray-600">© 2024 AdEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
