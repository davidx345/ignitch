"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Eye, 
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  current: boolean
}

interface OnboardingProgress {
  profile_completed: boolean
  bank_details_added: boolean
  first_billboard_created: boolean
  stripe_connected: boolean
  verification_completed: boolean
  overall_progress: number
}

export default function BillboardOwnerOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<OnboardingProgress>({
    profile_completed: false,
    bank_details_added: false,
    first_billboard_created: false,
    stripe_connected: false,
    verification_completed: false,
    overall_progress: 0
  })

  // Form states
  const [profileForm, setProfileForm] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    business_license: '',
    tax_id: ''
  })

  const [bankForm, setBankForm] = useState({
    account_holder_name: '',
    routing_number: '',
    account_number: '',
    account_type: 'checking'
  })

  const [billboardForm, setBillboardForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    latitude: 0,
    longitude: 0,
    width_feet: 0,
    height_feet: 0,
    billboard_type: 'digital',
    orientation: 'landscape',
    illuminated: false,
    daily_rate: 0,
    weekly_rate: 0,
    monthly_rate: 0,
    daily_impressions: 0,
    photos: [] as string[]
  })

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Company Profile',
      description: 'Set up your billboard company profile',
      completed: progress.profile_completed,
      current: currentStep === 0
    },
    {
      id: 'banking',
      title: 'Banking Details',
      description: 'Add your banking information for payments',
      completed: progress.bank_details_added,
      current: currentStep === 1
    },
    {
      id: 'billboard',
      title: 'First Billboard',
      description: 'Create your first billboard listing',
      completed: progress.first_billboard_created,
      current: currentStep === 2
    },
    {
      id: 'stripe',
      title: 'Payment Setup',
      description: 'Connect your Stripe account',
      completed: progress.stripe_connected,
      current: currentStep === 3
    },
    {
      id: 'verification',
      title: 'Verification',
      description: 'Complete account verification',
      completed: progress.verification_completed,
      current: currentStep === 4
    }
  ]

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/billboards/owner/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileForm)
      })

      if (response.ok) {
        toast.success('Company profile created successfully!')
        setProgress(prev => ({ ...prev, profile_completed: true }))
        setCurrentStep(1)
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to create profile')
      }
    } catch (error) {
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/billboards/owner/bank-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bankForm)
      })

      if (response.ok) {
        toast.success('Banking details added successfully!')
        setProgress(prev => ({ ...prev, bank_details_added: true }))
        setCurrentStep(2)
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to add banking details')
      }
    } catch (error) {
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleBillboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/billboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(billboardForm)
      })

      if (response.ok) {
        toast.success('Billboard created successfully!')
        setProgress(prev => ({ ...prev, first_billboard_created: true }))
        setCurrentStep(3)
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to create billboard')
      }
    } catch (error) {
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStripeConnect = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would redirect to Stripe Connect
      toast.success('Redirecting to Stripe Connect...')
      // Simulate Stripe connection
      setTimeout(() => {
        setProgress(prev => ({ ...prev, stripe_connected: true }))
        setCurrentStep(4)
        setLoading(false)
      }, 2000)
    } catch (error) {
      toast.error('Failed to connect to Stripe')
      setLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
            ${step.completed 
              ? 'bg-green-500 text-white' 
              : step.current 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-600'
            }
          `}>
            {step.completed ? <CheckCircle className="w-6 h-6" /> : index + 1}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${step.current ? 'text-blue-600' : 'text-gray-900'}`}>
              {step.title}
            </p>
            <p className="text-xs text-gray-500">{step.description}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 ml-4 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Onboarding Progress</span>
        <span className="text-sm text-gray-500">{Math.round(progress.overall_progress)}%</span>
      </div>
      <Progress value={progress.overall_progress} className="h-2" />
    </div>
  )

  const renderProfileForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Company Profile
        </CardTitle>
        <CardDescription>
          Tell us about your billboard company to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={profileForm.company_name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="ABC Billboard Company"
                required
              />
            </div>
            <div>
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                value={profileForm.contact_person}
                onChange={(e) => setProfileForm(prev => ({ ...prev, contact_person: e.target.value }))}
                placeholder="John Smith"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Business Address *</Label>
            <Textarea
              id="address"
              value={profileForm.address}
              onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main St, Suite 100, City, State 12345"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_license">Business License (Optional)</Label>
              <Input
                id="business_license"
                value={profileForm.business_license}
                onChange={(e) => setProfileForm(prev => ({ ...prev, business_license: e.target.value }))}
                placeholder="License number or upload URL"
              />
            </div>
            <div>
              <Label htmlFor="tax_id">Tax ID (Optional)</Label>
              <Input
                id="tax_id"
                value={profileForm.tax_id}
                onChange={(e) => setProfileForm(prev => ({ ...prev, tax_id: e.target.value }))}
                placeholder="XX-XXXXXXX"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating Profile...' : 'Continue to Banking'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  const renderBankingForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Banking Information
        </CardTitle>
        <CardDescription>
          Add your bank account details to receive payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBankSubmit} className="space-y-6">
          <div>
            <Label htmlFor="account_holder_name">Account Holder Name *</Label>
            <Input
              id="account_holder_name"
              value={bankForm.account_holder_name}
              onChange={(e) => setBankForm(prev => ({ ...prev, account_holder_name: e.target.value }))}
              placeholder="ABC Billboard Company LLC"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="routing_number">Routing Number *</Label>
              <Input
                id="routing_number"
                value={bankForm.routing_number}
                onChange={(e) => setBankForm(prev => ({ ...prev, routing_number: e.target.value }))}
                placeholder="123456789"
                required
              />
            </div>
            <div>
              <Label htmlFor="account_number">Account Number *</Label>
              <Input
                id="account_number"
                value={bankForm.account_number}
                onChange={(e) => setBankForm(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder="1234567890"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="account_type">Account Type *</Label>
            <Select value={bankForm.account_type} onValueChange={(value) => setBankForm(prev => ({ ...prev, account_type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Your banking information is encrypted and secure. We use bank-level encryption to protect your data.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving Banking Info...' : 'Continue to Billboard Creation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  const renderBillboardForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Create Your First Billboard
        </CardTitle>
        <CardDescription>
          Add your first billboard listing to start earning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBillboardSubmit} className="space-y-6">
          <div>
            <Label htmlFor="billboard_name">Billboard Name *</Label>
            <Input
              id="billboard_name"
              value={billboardForm.name}
              onChange={(e) => setBillboardForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Downtown Main Street Billboard"
              required
            />
          </div>

          <div>
            <Label htmlFor="billboard_description">Description</Label>
            <Textarea
              id="billboard_description"
              value={billboardForm.description}
              onChange={(e) => setBillboardForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="High-traffic location with excellent visibility..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="billboard_city">City *</Label>
              <Input
                id="billboard_city"
                value={billboardForm.city}
                onChange={(e) => setBillboardForm(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Los Angeles"
                required
              />
            </div>
            <div>
              <Label htmlFor="billboard_state">State *</Label>
              <Input
                id="billboard_state"
                value={billboardForm.state}
                onChange={(e) => setBillboardForm(prev => ({ ...prev, state: e.target.value }))}
                placeholder="CA"
                required
              />
            </div>
            <div>
              <Label htmlFor="billboard_zip">ZIP Code *</Label>
              <Input
                id="billboard_zip"
                value={billboardForm.zip_code}
                onChange={(e) => setBillboardForm(prev => ({ ...prev, zip_code: e.target.value }))}
                placeholder="90210"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billboard_type">Billboard Type *</Label>
              <Select value={billboardForm.billboard_type} onValueChange={(value) => setBillboardForm(prev => ({ ...prev, billboard_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="static">Static</SelectItem>
                  <SelectItem value="led">LED</SelectItem>
                  <SelectItem value="vinyl">Vinyl</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="billboard_orientation">Orientation *</Label>
              <Select value={billboardForm.orientation} onValueChange={(value) => setBillboardForm(prev => ({ ...prev, orientation: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billboard_width">Width (feet) *</Label>
              <Input
                id="billboard_width"
                type="number"
                value={billboardForm.width_feet}
                onChange={(e) => setBillboardForm(prev => ({ ...prev, width_feet: parseFloat(e.target.value) }))}
                placeholder="48"
                required
              />
            </div>
            <div>
              <Label htmlFor="billboard_height">Height (feet) *</Label>
              <Input
                id="billboard_height"
                type="number"
                value={billboardForm.height_feet}
                onChange={(e) => setBillboardForm(prev => ({ ...prev, height_feet: parseFloat(e.target.value) }))}
                placeholder="14"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="daily_rate">Daily Rate ($) *</Label>
              <Input
                id="daily_rate"
                type="number"
                value={billboardForm.daily_rate}
                onChange={(e) => setBillboardForm(prev => ({ ...prev, daily_rate: parseFloat(e.target.value) }))}
                placeholder="100"
                required
              />
            </div>
            <div>
              <Label htmlFor="weekly_rate">Weekly Rate ($) *</Label>
              <Input
                id="weekly_rate"
                type="number"
                value={billboardForm.weekly_rate}
                onChange={(e) => setBillboardForm(prev => ({ ...prev, weekly_rate: parseFloat(e.target.value) }))}
                placeholder="600"
                required
              />
            </div>
            <div>
              <Label htmlFor="monthly_rate">Monthly Rate ($) *</Label>
              <Input
                id="monthly_rate"
                type="number"
                value={billboardForm.monthly_rate}
                onChange={(e) => setBillboardForm(prev => ({ ...prev, monthly_rate: parseFloat(e.target.value) }))}
                placeholder="2000"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="daily_impressions">Daily Impressions *</Label>
            <Input
              id="daily_impressions"
              type="number"
              value={billboardForm.daily_impressions}
              onChange={(e) => setBillboardForm(prev => ({ ...prev, daily_impressions: parseInt(e.target.value) }))}
              placeholder="50000"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating Billboard...' : 'Continue to Payment Setup'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  const renderStripeConnect = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Payment Setup
        </CardTitle>
        <CardDescription>
          Connect your Stripe account to receive payments
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Secure Payment Processing
            </h3>
            <p className="text-sm text-gray-600">
              We use Stripe to process payments securely. You'll be redirected to Stripe to complete your account setup.
            </p>
          </div>

          <Button onClick={handleStripeConnect} disabled={loading} className="w-full">
            {loading ? 'Connecting to Stripe...' : 'Connect Stripe Account'}
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            By continuing, you agree to Stripe's Terms of Service
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderVerification = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Account Verification
        </CardTitle>
        <CardDescription>
          Your account is under review
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-yellow-50 p-6 rounded-lg mb-6">
            <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Verification in Progress
            </h3>
            <p className="text-sm text-gray-600">
              Our team is reviewing your application. This typically takes 1-2 business days. We'll notify you once your account is approved.
            </p>
          </div>

          <div className="text-left space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Profile information verified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Banking details confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">First billboard created</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Stripe account connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Manual verification pending</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Billboard Marketplace
        </h1>
        <p className="text-gray-600">
          Complete your onboarding to start listing and earning from your billboards
        </p>
      </div>

      {renderProgressBar()}
      {renderStepIndicator()}

      <div className="space-y-8">
        {currentStep === 0 && renderProfileForm()}
        {currentStep === 1 && renderBankingForm()}
        {currentStep === 2 && renderBillboardForm()}
        {currentStep === 3 && renderStripeConnect()}
        {currentStep === 4 && renderVerification()}
      </div>
    </div>
  )
}
