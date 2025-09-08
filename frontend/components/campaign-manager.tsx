/**
 * Campaign Management Component
 * React component for creating and managing billboard campaigns
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { useCampaigns, useBillboards, useBookings } from '@/lib/api-client'
import { CalendarIcon, Upload, Eye, Edit, Trash2, Play, Pause, BarChart } from 'lucide-react'
import { format } from 'date-fns'

// Types for the component
interface Campaign {
  id: number
  campaign_id: string
  title: string
  description?: string
  brand_name?: string
  billboard_id: string
  billboard_name: string
  start_date: string
  end_date: string
  duration_days: number
  status: string
  total_amount: number
  created_at: string
}

interface Billboard {
  billboard_id: string
  name: string
  location: string
  daily_rate: number
  city?: string
  state?: string
}

const CampaignManager = () => {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [billboards, setBillboards] = useState<Billboard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // API hooks
  const campaignAPI = useCampaigns()
  const billboardAPI = useBillboards()
  const bookingAPI = useBookings()

  // Load data on mount
  useEffect(() => {
    loadCampaigns()
    loadBillboards()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const response = await campaignAPI.getCampaigns()
      setCampaigns(response)
    } catch (err: any) {
      setError('Failed to load campaigns: ' + (err?.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const loadBillboards = async () => {
    try {
      const response = await billboardAPI.getBillboards()
      setBillboards(response.billboards || [])
    } catch (err) {
      console.error('Failed to load billboards:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaign Manager</h1>
          <p className="text-muted-foreground">
            Create and manage your billboard advertising campaigns
          </p>
        </div>
        <CreateCampaignForm onCampaignCreated={loadCampaigns} billboards={billboards} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignList 
            campaigns={campaigns} 
            loading={loading} 
            onRefresh={loadCampaigns}
          />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <CreateCampaignForm 
            billboards={billboards} 
            onCampaignCreated={loadCampaigns}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <CampaignAnalytics campaigns={campaigns} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Campaign List Component
interface CampaignListProps {
  campaigns: Campaign[]
  loading: boolean
  onRefresh: () => void
}

const CampaignList = ({ campaigns, loading, onRefresh }: CampaignListProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <BarChart className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No campaigns yet</h3>
              <p className="text-muted-foreground">
                Create your first billboard campaign to get started
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} onRefresh={onRefresh} />
      ))}
    </div>
  )
}

// Individual Campaign Card
interface CampaignCardProps {
  campaign: Campaign
  onRefresh: () => void
}

const CampaignCard = ({ campaign, onRefresh }: CampaignCardProps) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending_approval': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'live': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getProgress = () => {
    const now = new Date()
    const start = new Date(campaign.start_date)
    const end = new Date(campaign.end_date)
    
    if (campaign.status === 'live') {
      const total = end.getTime() - start.getTime()
      const elapsed = now.getTime() - start.getTime()
      return Math.min(100, Math.max(0, (elapsed / total) * 100))
    }
    return 0
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{campaign.title}</CardTitle>
            <CardDescription>{campaign.billboard_name}</CardDescription>
          </div>
          <Badge className={getStatusColor(campaign.status)}>
            {campaign.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Duration:</span>
            <span>{campaign.duration_days} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Cost:</span>
            <span>₦{campaign.total_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Start:</span>
            <span>{format(new Date(campaign.start_date), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {campaign.status === 'live' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress:</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} />
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          {campaign.status === 'draft' && (
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Create Campaign Form
interface CreateCampaignFormProps {
  billboards: Billboard[]
  onCampaignCreated: () => void
}

const CreateCampaignForm = ({ billboards, onCampaignCreated }: CreateCampaignFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand_name: '',
    billboard_id: '',
    start_date: null as Date | null,
    end_date: null as Date | null,
    special_instructions: ''
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const campaignAPI = useCampaigns()

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const createCampaign = async () => {
    try {
      setLoading(true)
      setError(null)

      // Create campaign
      const response = await campaignAPI.createCampaign(formData)
      
      if (response.success) {
        // Upload media if files selected
        if (selectedFiles.length > 0) {
          await campaignAPI.uploadMedia(response.campaign_id, selectedFiles)
        }
        
        onCampaignCreated()
        // Reset form
        setFormData({
          title: '',
          description: '',
          brand_name: '',
          billboard_id: '',
          start_date: null,
          end_date: null,
          special_instructions: ''
        })
        setSelectedFiles([])
        setCurrentStep(1)
      }
    } catch (err: any) {
      setError('Failed to create campaign: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
        <CardDescription>
          Set up your billboard advertising campaign
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="My Awesome Campaign"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand Name</Label>
              <Input
                id="brand_name"
                value={formData.brand_name}
                onChange={(e) => handleInputChange('brand_name', e.target.value)}
                placeholder="Your Brand"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your campaign..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billboard">Select Billboard</Label>
            <select
              id="billboard"
              value={formData.billboard_id}
              onChange={(e) => handleInputChange('billboard_id', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Choose a billboard...</option>
              {billboards.map((billboard) => (
                <option key={billboard.billboard_id} value={billboard.billboard_id}>
                  {billboard.name} - {billboard.location} (₦{billboard.daily_rate}/day)
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date || undefined}
                    onSelect={(date) => handleInputChange('start_date', date)}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date || undefined}
                    onSelect={(date) => handleInputChange('end_date', date)}
                    disabled={(date) => date < (formData.start_date || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="media">Upload Media Files</Label>
            <Input
              id="media"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
            />
            {selectedFiles.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedFiles.length} file(s) selected
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.special_instructions}
              onChange={(e) => handleInputChange('special_instructions', e.target.value)}
              placeholder="Any special requirements or notes..."
            />
          </div>
        </div>

        <Button 
          onClick={createCampaign} 
          disabled={loading || !formData.title || !formData.billboard_id || !formData.start_date || !formData.end_date}
          className="w-full"
        >
          {loading ? 'Creating Campaign...' : 'Create Campaign'}
        </Button>
      </CardContent>
    </Card>
  )
}

// Campaign Analytics Component
interface CampaignAnalyticsProps {
  campaigns: Campaign[]
}

const CampaignAnalytics = ({ campaigns }: CampaignAnalyticsProps) => {
  const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.total_amount, 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'live').length
  const completedCampaigns = campaigns.filter(c => c.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <div className="text-muted-foreground">₦</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{campaign.title}</h4>
                    <p className="text-sm text-muted-foreground">{campaign.billboard_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₦{campaign.total_amount.toLocaleString()}</p>
                    <Badge className="text-xs">{campaign.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CampaignManager
