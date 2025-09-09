/**
 * Media Uploader Component - Phase 2
 * Advanced media upload and management with batch processing
 * Builds on existing MediaFile backend model and cloud storage service
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Image, 
  Video, 
  X, 
  Check, 
  AlertCircle,
  FileText,
  Eye,
  Download
} from 'lucide-react'
import { colors, spacing } from '@/lib/design-system'

interface MediaFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadProgress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  preview?: string
  dimensions?: { width: number; height: number }
  metadata?: {
    altText?: string
    tags?: string[]
    platform_optimized?: boolean
  }
}

interface MediaUploaderProps {
  onUploadComplete?: (files: MediaFile[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  className?: string
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUploadComplete,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*'],
  className = ''
}) => {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle file selection
  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: MediaFile[] = []
    
    for (let i = 0; i < fileList.length && files.length + newFiles.length < maxFiles; i++) {
      const file = fileList[i]
      
      // Validate file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1))
        }
        return file.type === type
      })
      
      if (!isValidType) continue
      
      // Create preview URL for images
      let preview = undefined
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file)
      }
      
      const mediaFile: MediaFile = {
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        status: 'pending',
        preview,
        metadata: {
          tags: [],
          platform_optimized: false
        }
      }
      
      newFiles.push(mediaFile)
    }
    
    setFiles(prev => [...prev, ...newFiles])
    setError(null)
  }, [files.length, maxFiles, acceptedTypes])

  // Upload files to backend
  const uploadFiles = async () => {
    if (files.filter(f => f.status === 'pending').length === 0) return
    
    setUploading(true)
    setError(null)
    
    try {
      for (const file of files.filter(f => f.status === 'pending')) {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'uploading' } : f
        ))
        
        // Create form data
        const formData = new FormData()
        
        // Get the actual file from the file input (this is simplified - you'd need to store the File object)
        // For now, simulate upload with progress
        await simulateUpload(file.id)
        
        // Update status to completed
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: 'completed',
            url: `https://example.com/uploads/${file.name}`, // Mock URL
            uploadProgress: 100
          } : f
        ))
      }
      
      // Notify parent component
      const completedFiles = files.filter(f => f.status === 'completed')
      if (onUploadComplete && completedFiles.length > 0) {
        onUploadComplete(completedFiles)
      }
      
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      
      // Mark failed files as error
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { ...f, status: 'error' } : f
      ))
    } finally {
      setUploading(false)
    }
  }

  // Simulate upload progress (replace with actual upload logic)
  const simulateUpload = (fileId: string): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 20
        
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, uploadProgress: Math.min(progress, 95) } : f
        ))
        
        if (progress >= 95) {
          clearInterval(interval)
          
          // Final update to 100%
          setTimeout(() => {
            setFiles(prev => prev.map(f => 
              f.id === fileId ? { ...f, uploadProgress: 100 } : f
            ))
            resolve()
          }, 200)
        }
      }, 100)
    })
  }

  // Remove file
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      
      // Clean up preview URLs
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      
      return updated
    })
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'uploading': return 'text-blue-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Media Upload</h2>
          <p className="text-gray-600">Upload images and videos for your content</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiles([])}
            disabled={files.length === 0}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            Clear All
          </Button>
          
          <Button
            onClick={uploadFiles}
            disabled={files.filter(f => f.status === 'pending').length === 0 || uploading}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {uploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} Files`}
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-gray-900 bg-gray-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center ${
              dragActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              <Upload className="w-6 h-6" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Drop files here or click to browse
              </h3>
              <p className="text-gray-600 text-sm">
                Supports JPG, PNG, MP4, MOV up to 50MB each
              </p>
            </div>
            
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            
            <Button 
              asChild
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
              </label>
            </Button>
            
            <div className="text-xs text-gray-500">
              {files.length} / {maxFiles} files selected
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Selected Files</CardTitle>
            <CardDescription>
              Review and manage your selected media files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getStatusColor(file.status)}`}
                    >
                      {file.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{file.type}</span>
                    {file.dimensions && (
                      <span>{file.dimensions.width}×{file.dimensions.height}</span>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <Progress value={file.uploadProgress} className="h-1" />
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {file.status === 'completed' && file.url && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MediaUploader
