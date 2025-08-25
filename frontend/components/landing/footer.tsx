"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Shield,
  Zap,
  Users
} from "lucide-react"
import { colors } from "@/constants/landing"

export default function Footer() {
  return (
    <footer className="relative py-20 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
          {/* Company info */}
          <div className="lg:col-span-1">
            <motion.div 
              className="flex items-center space-x-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}dd)`,
                  boxShadow: `0 4px 20px ${colors.primary}40`
                }}
              >
                A
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Ignitch
                </h3>
                <p className="text-xs text-slate-400 -mt-1">Enterprise AI Platform</p>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-slate-300 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              AI-powered social media marketing that drives real business results. 
              Trusted by 15,000+ businesses worldwide.
            </motion.p>
            
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors duration-200 group">
                <Facebook className="w-5 h-5 text-slate-400 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors duration-200 group">
                <Twitter className="w-5 h-5 text-slate-400 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors duration-200 group">
                <Instagram className="w-5 h-5 text-slate-400 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors duration-200 group">
                <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-white" />
              </a>
            </motion.div>
          </div>

          {/* Product links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h4 className="font-semibold mb-6 text-white text-lg">
              Product
            </h4>
            <div className="space-y-4">
              <a href="#features" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Features
              </a>
              <a href="#pricing" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Pricing
              </a>
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                API Documentation
              </a>
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Integrations
              </a>
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Enterprise
              </a>
            </div>
          </motion.div>

          {/* Company links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h4 className="font-semibold mb-6 text-white text-lg">
              Company
            </h4>
            <div className="space-y-4">
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                About Us
              </a>
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Blog
              </a>
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Careers
              </a>
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Press
              </a>
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Partners
              </a>
            </div>
          </motion.div>

          {/* Support links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <h4 className="font-semibold mb-6 text-white text-lg">
              Support
            </h4>
            <div className="space-y-4">
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Help Center
              </a>
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Documentation
              </a>
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Status Page
              </a>
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Contact Support
              </a>
              <a href="#" className="block text-slate-300 hover:text-white transition-colors duration-200">
                Community
              </a>
            </div>
          </motion.div>
        </div>

        {/* Contact section */}
        <motion.div 
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-slate-700/50"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Scale Your Business?
              </h3>
              <p className="text-slate-300 mb-6">
                Get in touch with our enterprise team to discuss your business needs 
                and discover how Ignitch can transform your social media strategy.
              </p>
              <Button 
                className="bg-white hover:bg-slate-100 text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => window.location.href = "/signup"}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">enterprise@ignitch.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">SOC 2 Compliant</div>
              <div className="text-sm text-slate-400">Enterprise security</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">99.9% Uptime</div>
              <div className="text-sm text-slate-400">SLA guaranteed</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">24/7 Support</div>
              <div className="text-sm text-slate-400">Enterprise team</div>
            </div>
          </div>
        </motion.div>

        {/* Bottom section */}
        <motion.div 
          className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <p className="text-slate-400 text-sm">
            © 2024 Ignitch. All rights reserved. Enterprise AI Platform.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors duration-200">
              Cookie Policy
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
