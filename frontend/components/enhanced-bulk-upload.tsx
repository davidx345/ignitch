"use client"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { 
  Upload, 
  ImageIcon, 
  Video, 
  Folder, 
  X, 
  Package, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  Download,
  Trash2,
  Tag,
  FileImage,
  Zap
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

interface MediaFile {
  id: string
  filename: string
  file_type: string
  file_size: number
  upload_status: "uploading" | "completed" | "failed"
  processing_status: "pending" | "processing" | "completed" | "failed"
  brand_colors?: string[]
  alt_text?: string
  tags?: string[]
  width?: number
  height?: number
  duration?: number
  created_at: string
  url?: string
  preview?: string
}

interface BulkUploadResponse {
  upload_id: string
  total_files: number
  successful_uploads: number
  failed_uploads: number
  processing_status: string
  files: MediaFile[]
  estimated_completion_time?: string
}

interface EnhancedBulkUploadProps {
  onFilesUploaded: (files: MediaFile[]) => void
  uploadedFiles: MediaFile[]
}

export default function EnhancedBulkUpload({ onFilesUploaded, uploadedFiles }: EnhancedBulkUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentBatch, setCurrentBatch] = useState<BulkUploadResponse | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewFiles, setPreviewFiles] = useState<{ file: File; preview: string }[]>([])
  const [uploadSettings, setUploadSettings] = useState({
    organizeByDate: true,
    autoDetectBrandColors: true,
    generateAltText: true,
    createVariations: false,
    optimizeForWeb: true
  })
  const [bulkTags, setBulkTags] = useState("")
  const [selectedUploadedFiles, setSelectedUploadedFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  const MAX_FILES = 50

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const createPreview = (file: File): string => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    } else if (file.type.startsWith('video/')) {
      // For videos, we'd normally create a thumbnail
      return '/video-placeholder.png'
    }
    return '/file-placeholder.png'
  }

  const validateFiles = (files: File[]): { valid: File[]; rejected: { file: File; reason: string }[] } => {
    const valid: File[] = []
    const rejected: { file: File; reason: string }[] = []

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        rejected.push({ file, reason: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)}` })
        continue
      }

      if (!file.type.match(/^(image|video)\//)) {
        rejected.push({ file, reason: 'Only images and videos are supported' })
        continue
      }

      valid.push(file)
    }

    if (valid.length + uploadedFiles.length > MAX_FILES) {
      const excess = valid.length + uploadedFiles.length - MAX_FILES
      const excessFiles = valid.splice(-excess)
      rejected.push(...excessFiles.map(file => ({ file, reason: `Maximum ${MAX_FILES} files allowed` })))
    }

    return { valid, rejected }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const { valid, rejected } = validateFiles(acceptedFiles)

    if (rejected.length > 0) {
      rejected.forEach(({ file, reason }) => {
        toast.error(`${file.name}: ${reason}`)
      })
    }

    if (valid.length > 0) {
      setSelectedFiles(prev => [...prev, ...valid])
      const newPreviews = valid.map(file => ({
        file,
        preview: createPreview(file)
      }))
      setPreviewFiles(prev => [...prev, ...newPreviews])
      toast.success(`${valid.length} files ready for upload`)
    }
  }, [uploadedFiles.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi', '.quicktime']
    },
    multiple: true,
    disabled: isUploading
  })

  const removeSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previewFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setPreviewFiles(newPreviews)
  }

  const startBulkUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })
      
      formData.append('organize_by_date', uploadSettings.organizeByDate.toString())
      formData.append('auto_detect_brand_colors', uploadSettings.autoDetectBrandColors.toString())
      formData.append('generate_alt_text', uploadSettings.generateAltText.toString())

      // Start upload
      const response = await fetch('/api/media/v2/upload/bulk', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result: BulkUploadResponse = await response.json()
      setCurrentBatch(result)

      // Poll for progress
      await pollUploadProgress(result.upload_id)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const pollUploadProgress = async (batchId: string) => {
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/media/v2/upload/bulk/${batchId}/status`)
        const data = await response.json()

        if (data.processing_status === 'completed') {
          // Upload completed
          onFilesUploaded([...uploadedFiles, ...data.files])
          setSelectedFiles([])
          setPreviewFiles([])
          setCurrentBatch(null)
          toast.success(`Upload completed! ${data.successful_uploads} files uploaded successfully`)
          return
        } else if (data.processing_status === 'failed') {
          throw new Error('Upload processing failed')
        }

        // Update progress
        const progress = (data.successful_uploads + data.failed_uploads) / data.total_files * 100
        setUploadProgress(progress)

        // Continue polling
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          throw new Error('Upload timeout')
        }

      } catch (error) {
        console.error('Polling error:', error)
        toast.error('Failed to get upload status')
        setCurrentBatch(null)
      }
    }

    await poll()
  }

  const deleteSelectedFiles = async () => {
    if (selectedUploadedFiles.length === 0) return

    try {
      const response = await fetch('/api/media/v2/files/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          file_ids: selectedUploadedFiles
        })
      })

      if (!response.ok) throw new Error('Delete failed')

      const result = await response.json()
      
      // Update local state
      const remainingFiles = uploadedFiles.filter(file => !selectedUploadedFiles.includes(file.id))
      onFilesUploaded(remainingFiles)
      setSelectedUploadedFiles([])
      
      toast.success(`${result.successful_actions} files deleted successfully`)

    } catch (error) {
      toast.error('Failed to delete files')
    }
  }

  const addBulkTags = async () => {
    if (selectedUploadedFiles.length === 0 || !bulkTags.trim()) return

    try {
      const tags = bulkTags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      const response = await fetch('/api/media/v2/files/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_tags',
          file_ids: selectedUploadedFiles,
          tags
        })
      })

      if (!response.ok) throw new Error('Tag update failed')

      toast.success('Tags added successfully')
      setBulkTags('')
      setSelectedUploadedFiles([])

    } catch (error) {
      toast.error('Failed to add tags')
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-purple-600" />
            <span>Enhanced Bulk Upload</span>
            <Badge variant="secondary" className="ml-2">v2.0</Badge>
          </CardTitle>
          <CardDescription>
            Upload multiple files with AI-powered processing, brand color detection, and automated tagging.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Settings */}
          <div className="mb-6 space-y-4">
            <Label className="text-sm font-medium">Upload Settings</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="organize"
                  checked={uploadSettings.organizeByDate}
                  onCheckedChange={(checked) => 
                    setUploadSettings(prev => ({ ...prev, organizeByDate: checked as boolean }))
                  }
                />
                <Label htmlFor="organize" className="text-sm">Organize by date</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="colors"
                  checked={uploadSettings.autoDetectBrandColors}
                  onCheckedChange={(checked) => 
                    setUploadSettings(prev => ({ ...prev, autoDetectBrandColors: checked as boolean }))
                  }
                />
                <Label htmlFor="colors" className="text-sm">Detect brand colors</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="alt-text"
                  checked={uploadSettings.generateAltText}
                  onCheckedChange={(checked) => 
                    setUploadSettings(prev => ({ ...prev, generateAltText: checked as boolean }))
                  }
                />
                <Label htmlFor="alt-text" className="text-sm">Generate alt text</Label>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              isDragActive
                ? "border-purple-400 bg-purple-50"
                : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/50"
            } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                  {isDragActive ? "Drop files here" : "Bulk Upload Media"}
                </h3>
                <p className="text-gray-600 mt-2">
                  {isUploading 
                    ? "Upload in progress..." 
                    : "Drag and drop multiple files, or click to browse"
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports: Images (JPEG, PNG, WebP, GIF) and Videos (MP4, MOV) • Max {formatFileSize(MAX_FILE_SIZE)} per file • Up to {MAX_FILES} files
                </p>
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
                  <Zap className="w-3 h-3 mr-1" />
                  AI Processing
                </Badge>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-purple-600 animate-spin" />
                  <span className="text-sm font-medium">Processing upload...</span>
                </div>
                <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              {currentBatch && (
                <div className="text-sm text-gray-600">
                  {currentBatch.successful_uploads} of {currentBatch.total_files} files processed
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileImage className="w-5 h-5 text-blue-600" />
                <span>Ready to Upload ({selectedFiles.length})</span>
              </CardTitle>
              <Button 
                onClick={startBulkUpload} 
                disabled={isUploading || selectedFiles.length === 0}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {isUploading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Start Upload
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {previewFiles.map((item, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeSelectedFile(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <div className="mt-1 text-xs text-gray-600 truncate">
                    {item.file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(item.file.size)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files Management */}
      {uploadedFiles.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Uploaded Files ({uploadedFiles.length})</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {selectedUploadedFiles.length > 0 && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Add tags (comma-separated)"
                        value={bulkTags}
                        onChange={(e) => setBulkTags(e.target.value)}
                        className="w-48"
                      />
                      <Button size="sm" onClick={addBulkTags}>
                        <Tag className="w-4 h-4 mr-1" />
                        Tag
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={deleteSelectedFiles}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete ({selectedUploadedFiles.length})
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="relative group">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={selectedUploadedFiles.includes(file.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUploadedFiles(prev => [...prev, file.id])
                            } else {
                              setSelectedUploadedFiles(prev => prev.filter(id => id !== file.id))
                            }
                          }}
                        />
                      </div>
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        {file.file_type === "image" ? (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        ) : (
                          <Video className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Badge 
                          variant={file.upload_status === "completed" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {file.upload_status === "completed" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {file.upload_status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2 truncate">{file.filename}</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span>{formatFileSize(file.file_size)}</span>
                        </div>
                        {file.width && file.height && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Dimensions:</span>
                            <span>{file.width}×{file.height}</span>
                          </div>
                        )}
                        {file.brand_colors && file.brand_colors.length > 0 && (
                          <div>
                            <span className="text-gray-600">Brand Colors:</span>
                            <div className="flex space-x-1 mt-1">
                              {file.brand_colors.map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {file.tags && file.tags.length > 0 && (
                          <div>
                            <span className="text-gray-600">Tags:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {file.tags.slice(0, 3).map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {file.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{file.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
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
