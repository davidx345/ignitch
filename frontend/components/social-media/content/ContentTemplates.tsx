/**
 * Content Templates Component - Phase 2
 * Template library and customization system
 * Integrates with existing BusinessGoal enums and content generation
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Layout, 
  Search, 
  Plus, 
  Star, 
  Copy, 
  Edit, 
  Trash2,
  Filter,
  Sparkles,
  Target,
  Zap
} from 'lucide-react'
import { colors, spacing } from '@/lib/design-system'

interface ContentTemplate {
  id: string
  name: string
  description: string
  category: 'promotional' | 'educational' | 'engagement' | 'announcement' | 'seasonal'
  platforms: string[]
  businessGoal: string
  content: string
  hashtags: string[]
  isPublic: boolean
  isFavorite: boolean
  usageCount: number
  created_at: string
  updated_at: string
  variables?: TemplateVariable[]
}

interface TemplateVariable {
  name: string
  placeholder: string
  type: 'text' | 'number' | 'url' | 'date'
  required: boolean
}

interface ContentTemplatesProps {
  onTemplateSelect?: (template: ContentTemplate) => void
  onCreateFromTemplate?: (content: string, template: ContentTemplate) => void
  className?: string
}

const ContentTemplates: React.FC<ContentTemplatesProps> = ({
  onTemplateSelect,
  onCreateFromTemplate,
  className = ''
}) => {
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<ContentTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null)
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({})
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock templates (in production, fetch from backend)
  const mockTemplates: ContentTemplate[] = [
    {
      id: '1',
      name: 'Product Launch Announcement',
      description: 'Professional product launch template with call-to-action',
      category: 'promotional',
      platforms: ['instagram', 'facebook', 'linkedin'],
      businessGoal: 'sales',
      content: `🚀 Exciting News! Introducing {{product_name}} 

{{product_description}}

✨ Key Features:
• {{feature_1}}
• {{feature_2}}
• {{feature_3}}

Available now at {{website_url}}

#ProductLaunch #Innovation #{{brand_name}}`,
      hashtags: ['ProductLaunch', 'Innovation', 'NewProduct'],
      isPublic: true,
      isFavorite: false,
      usageCount: 24,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      variables: [
        { name: 'product_name', placeholder: 'Enter product name', type: 'text', required: true },
        { name: 'product_description', placeholder: 'Brief product description', type: 'text', required: true },
        { name: 'feature_1', placeholder: 'First key feature', type: 'text', required: true },
        { name: 'feature_2', placeholder: 'Second key feature', type: 'text', required: true },
        { name: 'feature_3', placeholder: 'Third key feature', type: 'text', required: true },
        { name: 'website_url', placeholder: 'Product website URL', type: 'url', required: true },
        { name: 'brand_name', placeholder: 'Your brand name', type: 'text', required: true }
      ]
    },
    {
      id: '2',
      name: 'Educational Tip Post',
      description: 'Share knowledge and build authority in your niche',
      category: 'educational',
      platforms: ['instagram', 'linkedin', 'twitter'],
      businessGoal: 'awareness',
      content: `💡 Pro Tip: {{tip_title}}

{{tip_explanation}}

📝 Quick Steps:
1. {{step_1}}
2. {{step_2}}
3. {{step_3}}

💬 Have you tried this? Share your experience below!

#Education #Tips #{{industry}}`,
      hashtags: ['Education', 'Tips', 'ProTip'],
      isPublic: true,
      isFavorite: true,
      usageCount: 56,
      created_at: '2024-01-10T14:30:00Z',
      updated_at: '2024-01-10T14:30:00Z',
      variables: [
        { name: 'tip_title', placeholder: 'Main tip title', type: 'text', required: true },
        { name: 'tip_explanation', placeholder: 'Explain the tip in detail', type: 'text', required: true },
        { name: 'step_1', placeholder: 'First step', type: 'text', required: true },
        { name: 'step_2', placeholder: 'Second step', type: 'text', required: true },
        { name: 'step_3', placeholder: 'Third step', type: 'text', required: true },
        { name: 'industry', placeholder: 'Your industry/niche', type: 'text', required: true }
      ]
    },
    {
      id: '3',
      name: 'Behind the Scenes',
      description: 'Show your process and build authentic connections',
      category: 'engagement',
      platforms: ['instagram', 'tiktok', 'facebook'],
      businessGoal: 'engagement',
      content: `🎬 Behind the Scenes: {{process_name}}

Today I'm sharing a peek into {{what_youre_showing}}

{{interesting_detail}}

✨ Fun fact: {{fun_fact}}

What would you like to see behind the scenes next?

#BehindTheScenes #Process #{{brand_name}}`,
      hashtags: ['BehindTheScenes', 'Process', 'Authentic'],
      isPublic: true,
      isFavorite: false,
      usageCount: 31,
      created_at: '2024-01-08T09:15:00Z',
      updated_at: '2024-01-08T09:15:00Z',
      variables: [
        { name: 'process_name', placeholder: 'Name of the process', type: 'text', required: true },
        { name: 'what_youre_showing', placeholder: 'What are you revealing?', type: 'text', required: true },
        { name: 'interesting_detail', placeholder: 'Share an interesting detail', type: 'text', required: true },
        { name: 'fun_fact', placeholder: 'A fun fact about the process', type: 'text', required: true },
        { name: 'brand_name', placeholder: 'Your brand name', type: 'text', required: true }
      ]
    },
    {
      id: '4',
      name: 'Customer Success Story',
      description: 'Showcase customer achievements and build trust',
      category: 'promotional',
      platforms: ['linkedin', 'facebook', 'instagram'],
      businessGoal: 'sales',
      content: `🌟 Customer Success Story

Meet {{customer_name}} who achieved {{achievement}}!

"{{customer_quote}}"

📈 Results:
• {{result_1}}
• {{result_2}}
• {{result_3}}

Ready to achieve similar results? {{call_to_action}}

#CustomerSuccess #Testimonial #Results`,
      hashtags: ['CustomerSuccess', 'Testimonial', 'Results'],
      isPublic: true,
      isFavorite: true,
      usageCount: 18,
      created_at: '2024-01-05T16:45:00Z',
      updated_at: '2024-01-05T16:45:00Z',
      variables: [
        { name: 'customer_name', placeholder: 'Customer name (or "one of our clients")', type: 'text', required: true },
        { name: 'achievement', placeholder: 'What they achieved', type: 'text', required: true },
        { name: 'customer_quote', placeholder: 'Customer testimonial quote', type: 'text', required: true },
        { name: 'result_1', placeholder: 'First measurable result', type: 'text', required: true },
        { name: 'result_2', placeholder: 'Second measurable result', type: 'text', required: true },
        { name: 'result_3', placeholder: 'Third measurable result', type: 'text', required: true },
        { name: 'call_to_action', placeholder: 'Your call to action', type: 'text', required: true }
      ]
    }
  ]

  useEffect(() => {
    // Load templates (simulate API call)
    setLoading(true)
    setTimeout(() => {
      setTemplates(mockTemplates)
      setFilteredTemplates(mockTemplates)
      setLoading(false)
    }, 500)
  }, [])

  // Filter templates
  useEffect(() => {
    let filtered = templates

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    // Platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(template => template.platforms.includes(selectedPlatform))
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(template => template.isFavorite)
    }

    setFilteredTemplates(filtered)
  }, [templates, searchQuery, selectedCategory, selectedPlatform, showFavoritesOnly])

  // Replace variables in template content
  const replaceVariables = (content: string, variables: Record<string, string>): string => {
    let result = content
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return result
  }

  // Handle template usage
  const useTemplate = (template: ContentTemplate) => {
    if (template.variables && template.variables.length > 0) {
      setSelectedTemplate(template)
      setCustomVariables({})
    } else {
      // No variables, use template directly
      if (onCreateFromTemplate) {
        onCreateFromTemplate(template.content, template)
      }
    }
  }

  // Handle variable submission
  const handleVariableSubmit = () => {
    if (!selectedTemplate) return

    const processedContent = replaceVariables(selectedTemplate.content, customVariables)
    
    if (onCreateFromTemplate) {
      onCreateFromTemplate(processedContent, selectedTemplate)
    }
    
    setSelectedTemplate(null)
    setCustomVariables({})
  }

  // Toggle favorite
  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ))
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors = {
      promotional: 'bg-blue-100 text-blue-800',
      educational: 'bg-green-100 text-green-800',
      engagement: 'bg-purple-100 text-purple-800',
      announcement: 'bg-orange-100 text-orange-800',
      seasonal: 'bg-pink-100 text-pink-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Content Templates</h2>
          <p className="text-gray-600">Choose from proven templates to create engaging content</p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Platform Filter */}
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Favorites Toggle */}
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={showFavoritesOnly ? "bg-gray-900 text-white" : "text-gray-600 border-gray-300"}
            >
              <Star className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favorites
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge className={`text-xs ${getCategoryColor(template.category)}`}>
                  {template.category}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(template.id)}
                  className="p-1 h-auto"
                >
                  <Star className={`w-4 h-4 ${template.isFavorite ? 'fill-current text-yellow-500' : 'text-gray-400'}`} />
                </Button>
              </div>
              
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Content Preview */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 line-clamp-4 whitespace-pre-wrap">
                  {template.content.substring(0, 150)}...
                </p>
              </div>
              
              {/* Platform Tags */}
              <div className="flex flex-wrap gap-1">
                {template.platforms.map((platform) => (
                  <Badge key={platform} variant="secondary" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>
              
              {/* Stats and Actions */}
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-gray-500">
                  Used {template.usageCount} times
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => useTemplate(template)}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Use
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTemplateSelect?.(template)}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or create a new template.
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Template
          </Button>
        </div>
      )}

      {/* Variable Input Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Customize Template: {selectedTemplate.name}</CardTitle>
              <CardDescription>
                Fill in the variables to personalize your content
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {selectedTemplate.variables?.map((variable) => (
                <div key={variable.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {variable.placeholder}
                    {variable.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {variable.type === 'text' && variable.placeholder.includes('description') ? (
                    <Textarea
                      value={customVariables[variable.name] || ''}
                      onChange={(e) => setCustomVariables(prev => ({
                        ...prev,
                        [variable.name]: e.target.value
                      }))}
                      placeholder={variable.placeholder}
                      className="border-gray-300"
                      rows={3}
                    />
                  ) : (
                    <Input
                      type={variable.type}
                      value={customVariables[variable.name] || ''}
                      onChange={(e) => setCustomVariables(prev => ({
                        ...prev,
                        [variable.name]: e.target.value
                      }))}
                      placeholder={variable.placeholder}
                      className="border-gray-300"
                    />
                  )}
                </div>
              ))}
              
              {/* Preview */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">
                    {replaceVariables(selectedTemplate.content, customVariables)}
                  </p>
                </div>
              </div>
            </CardContent>
            
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-600 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVariableSubmit}
                  disabled={selectedTemplate.variables?.some(v => 
                    v.required && !customVariables[v.name]?.trim()
                  )}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Content
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ContentTemplates
