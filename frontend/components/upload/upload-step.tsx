"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Target,
  Crop,
  Wand2,
  Palette
} from "lucide-react"
import ProductUpload from "@/components/product-upload"
import { Product, BrandProfile } from "@/types/upload"
import { colors } from "@/constants/upload"

interface UploadStepProps {
  uploadedProducts: Product[]
  brandProfile: BrandProfile
  onProductsUploaded: (products: Product[]) => void
  onContinue: () => void
}

export default function UploadStep({ 
  uploadedProducts, 
  brandProfile, 
  onProductsUploaded, 
  onContinue 
}: UploadStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.ink }}>
          Upload & Auto-Enhance
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your content and let AI auto-crop, enhance quality, and optimize for every platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Component */}
        <div className="lg:col-span-2">
          <ProductUpload
            uploadedProducts={uploadedProducts}
            onProductsUploaded={onProductsUploaded}
          />
        </div>

        {/* AI Enhancement Options */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center" style={{ color: colors.ink }}>
                <Sparkles className="w-5 h-5 mr-2" style={{ color: colors.primary }} />
                AI Enhancements
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Crop className="w-5 h-5" style={{ color: colors.primary }} />
                    <div>
                      <p className="font-medium text-sm">Auto-crop</p>
                      <p className="text-xs text-gray-600">Perfect sizing for all platforms</p>
                    </div>
                  </div>
                  <Badge style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}>
                    ✓ ON
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wand2 className="w-5 h-5" style={{ color: colors.mint }} />
                    <div>
                      <p className="font-medium text-sm">Quality boost</p>
                      <p className="text-xs text-gray-600">Enhance resolution & clarity</p>
                    </div>
                  </div>
                  <Badge style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}>
                    ✓ ON
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Palette className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Brand colors</p>
                      <p className="text-xs text-gray-600">Auto-detect your brand palette</p>
                    </div>
                  </div>
                  <Badge style={{ backgroundColor: `${colors.mint}20`, color: colors.mint }}>
                    ✓ ON
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Colors Detected */}
          {brandProfile.colors.length > 0 && (
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4" style={{ color: colors.ink }}>
                  🎨 Detected Brand Colors
                </h3>
                <div className="flex space-x-2 mb-3">
                  {brandProfile.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Style: <span className="font-medium">{brandProfile.style}</span>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {uploadedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-8"
        >
          <Button
            size="lg"
            onClick={onContinue}
            className="font-semibold px-8"
            style={{ backgroundColor: colors.primary }}
          >
            <Target className="w-5 h-5 mr-2" />
            Continue to Business Goals
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
