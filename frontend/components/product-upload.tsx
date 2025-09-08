"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, ImageIcon, Video, Folder, X, Sparkles, Package } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface Product {
  id: string
  name: string
  type: "image" | "video"
  url: string
  category: string
  brand: string
  aesthetic: string
}

interface ProductUploadProps {
  onProductsUploaded: (products: Product[]) => void
  uploadedProducts: Product[]
}

export default function ProductUpload({ onProductsUploaded, uploadedProducts }: ProductUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const analyzeProduct = async (file: File): Promise<Product> => {
    // Simulate basic analysis without AI
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name.split(".")[0],
      type: file.type.startsWith("video/") ? "video" : "image",
      url: URL.createObjectURL(file),
      category: "General",
      brand: "User Upload",
      aesthetic: "Modern",
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsAnalyzing(true)
      setAnalysisProgress(0)

      const newProducts: Product[] = []

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        setAnalysisProgress((i / acceptedFiles.length) * 100)

        const product = await analyzeProduct(file)
        newProducts.push(product)
      }

      setAnalysisProgress(100)
      const allProducts = [...uploadedProducts, ...newProducts]
      onProductsUploaded(allProducts)

      setTimeout(() => {
        setIsAnalyzing(false)
        setAnalysisProgress(0)
      }, 500)
    },
    [uploadedProducts, onProductsUploaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      "video/*": [".mp4", ".mov", ".avi"],
    },
    multiple: true,
  })

  const removeProduct = (id: string) => {
    const filtered = uploadedProducts.filter((p) => p.id !== id)
    onProductsUploaded(filtered)
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-purple-600" />
            <span>Product Upload</span>
          </CardTitle>
          <CardDescription>
            Upload product photos or videos for your content creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              isDragActive
                ? "border-purple-400 bg-purple-50"
                : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isDragActive ? "Drop files here" : "Upload Product Media"}
                </h3>
                <p className="text-gray-600 mt-2">Drag and drop your product images or videos, or click to browse</p>
                <p className="text-sm text-gray-500 mt-1">Supports: JPG, PNG, WebP, MP4, MOV (Max 50MB each)</p>
              </div>
              <div className="flex justify-center space-x-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Images
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Video className="w-3 h-3 mr-1" />
                  Videos
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Folder className="w-3 h-3 mr-1" />
                  Bulk Upload
                </Badge>
              </div>
            </div>
          </div>

          {isAnalyzing && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                <span className="text-sm font-medium">Processing uploads...</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Products */}
      {uploadedProducts.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle>Uploaded Products ({uploadedProducts.length})</CardTitle>
            <CardDescription>Uploaded products ready for content generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {product.type === "image" ? (
                        <img
                          src={product.url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <video src={product.url} className="w-full h-48 object-cover" muted />
                      )}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Badge variant="secondary" className="bg-white/90">
                          {product.type === "image" ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeProduct(product.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2">{product.name}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Category:</span>
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Style:</span>
                          <Badge variant="outline" className="text-xs">
                            {product.aesthetic}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
