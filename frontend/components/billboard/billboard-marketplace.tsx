"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { format } from "date-fns"
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Eye, 
  Star,
  Calendar as CalendarIcon,
  Filter,
  Heart,
  Share2,
  MessageSquare,
  Lightbulb,
  Monitor,
  Image as ImageIcon,
  Phone,
  Mail,
  Building,
  User,
  FileText,
  Upload,
  CreditCard
} from "lucide-react"

interface Billboard {
  id: string
  name: string
  description: string
  address: string
  city: string
  state: string
  latitude: number
  longitude: number
  width_feet: number
  height_feet: number
  billboard_type: string
  orientation: string
  illuminated: boolean
  daily_rate: number
  weekly_rate: number
  monthly_rate: number
  daily_impressions: number
  photos: string[]
  average_rating: number
  total_reviews: number
  availability_percentage: number
}

interface SearchFilters {
  city: string
  state: string
  min_daily_rate: string
  max_daily_rate: string
  billboard_type: string
  min_impressions: string
  illuminated: boolean | null
  available_from: Date | null
  available_to: Date | null
}

interface BookingForm {
  billboard_id: string
  start_date: Date | null
  end_date: Date | null
  content_title: string
  content_description: string
  creative_urls: string[]
  special_requests: string
}

export default function BillboardMarketplace() {
  const [billboards, setBillboards] = useState<Billboard[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  const [filters, setFilters] = useState<SearchFilters>({
    city: '',
    state: '',
    min_daily_rate: '',
    max_daily_rate: '',
    billboard_type: 'all',
    min_impressions: '',
    illuminated: null,
    available_from: null,
    available_to: null
  })

  const [bookingForm, setBookingForm] = useState<BookingForm>({
    billboard_id: '',
    start_date: null,
    end_date: null,
    content_title: '',
    content_description: '',
    creative_urls: [],
    special_requests: ''
  })

  const [quote, setQuote] = useState<any>(null)
  const [loadingQuote, setLoadingQuote] = useState(false)

  // Onboarding form state
  const [onboardingForm, setOnboardingForm] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    billboard_name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    latitude: '',
    longitude: '',
    width_feet: '',
    height_feet: '',
    billboard_type: 'digital',
    orientation: 'landscape',
    illuminated: true,
    daily_rate: '',
    weekly_rate: '',
    monthly_rate: '',
    daily_impressions: '',
    photos: [] as string[],
    account_holder_name: '',
    routing_number: '',
    account_number: '',
    account_type: 'checking'
  })
  const [submitingOnboarding, setSubmitingOnboarding] = useState(false)

  // Onboarding form handlers
  const handleOnboardingInputChange = (field: string, value: string | boolean | number) => {
    setOnboardingForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOnboardingSubmit = async () => {
    try {
      setSubmitingOnboarding(true)
      
      const payload = {
        ...onboardingForm,
        daily_rate: parseFloat(onboardingForm.daily_rate) || 0,
        weekly_rate: parseFloat(onboardingForm.weekly_rate) || 0,
        monthly_rate: parseFloat(onboardingForm.monthly_rate) || 0,
        daily_impressions: parseInt(onboardingForm.daily_impressions) || 0,
        width_feet: parseFloat(onboardingForm.width_feet) || 0,
        height_feet: parseFloat(onboardingForm.height_feet) || 0,
        latitude: parseFloat(onboardingForm.latitude) || 0,
        longitude: parseFloat(onboardingForm.longitude) || 0
      }

      const response = await fetch('/api/billboards/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        alert('Billboard registration submitted successfully! We will review and contact you soon.')
        setShowOnboarding(false)
        // Reset form
        setOnboardingForm({
          company_name: '',
          contact_person: '',
          phone: '',
          email: '',
          billboard_name: '',
          description: '',
          address: '',
          city: '',
          state: '',
          zip_code: '',
          latitude: '',
          longitude: '',
          width_feet: '',
          height_feet: '',
          billboard_type: 'digital',
          orientation: 'landscape',
          illuminated: true,
          daily_rate: '',
          weekly_rate: '',
          monthly_rate: '',
          daily_impressions: '',
          photos: [],
          account_holder_name: '',
          routing_number: '',
          account_number: '',
          account_type: 'checking'
        })
      } else {
        const error = await response.json()
        alert(`Error: ${error.detail || 'Failed to submit registration'}`)
      }
    } catch (error) {
      console.error('Error submitting billboard registration:', error)
      alert('Failed to submit registration. Please try again.')
    } finally {
      setSubmitingOnboarding(false)
    }
  }

  useEffect(() => {
    searchBillboards()
  }, [])

  const searchBillboards = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== '' && value !== 'all') {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString().split('T')[0])
          } else {
            queryParams.append(key, value.toString())
          }
        }
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/billboards/search?${queryParams}`)
      const data = await response.json()
      
      if (response.ok) {
        setBillboards(data.billboards || [])
      } else {
        toast.error('Failed to search billboards')
      }
    } catch (error) {
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (billboardId: string) => {
    setFavorites(prev => 
      prev.includes(billboardId) 
        ? prev.filter(id => id !== billboardId)
        : [...prev, billboardId]
    )
  }

  const getBookingQuote = async () => {
    if (!bookingForm.start_date || !bookingForm.end_date || !bookingForm.billboard_id) {
      toast.error('Please select dates and billboard')
      return
    }

    setLoadingQuote(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/billboards/bookings/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          billboard_id: bookingForm.billboard_id,
          start_date: bookingForm.start_date.toISOString().split('T')[0],
          end_date: bookingForm.end_date.toISOString().split('T')[0],
          content_title: bookingForm.content_title,
          content_description: bookingForm.content_description,
          creative_urls: bookingForm.creative_urls,
          special_requests: bookingForm.special_requests
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setQuote(data)
        if (!data.available) {
          toast.error(`Billboard not available: ${data.conflicts.join(', ')}`)
        }
      } else {
        toast.error(data.detail || 'Failed to get quote')
      }
    } catch (error) {
      toast.error('Network error occurred')
    } finally {
      setLoadingQuote(false)
    }
  }

  const createBooking = async () => {
    if (!quote?.available) {
      toast.error('Billboard not available for selected dates')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/billboards/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          billboard_id: bookingForm.billboard_id,
          start_date: bookingForm.start_date?.toISOString().split('T')[0],
          end_date: bookingForm.end_date?.toISOString().split('T')[0],
          content_title: bookingForm.content_title,
          content_description: bookingForm.content_description,
          creative_urls: bookingForm.creative_urls,
          special_requests: bookingForm.special_requests
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Booking created successfully!')
        setShowBookingModal(false)
        // Redirect to payment or booking management
      } else {
        toast.error(data.detail || 'Failed to create booking')
      }
    } catch (error) {
      toast.error('Network error occurred')
    }
  }

  const renderFilters = () => (
    <Card className={`mb-6 ${showFilters ? '' : 'hidden'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Search Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Los Angeles"
            />
          </div>
          
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={filters.state}
              onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
              placeholder="CA"
            />
          </div>

          <div>
            <Label htmlFor="billboard_type">Billboard Type</Label>
            <Select value={filters.billboard_type} onValueChange={(value) => setFilters(prev => ({ ...prev, billboard_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="static">Static</SelectItem>
                <SelectItem value="led">LED</SelectItem>
                <SelectItem value="vinyl">Vinyl</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="min_daily_rate">Min Daily Rate ($)</Label>
            <Input
              id="min_daily_rate"
              type="number"
              value={filters.min_daily_rate}
              onChange={(e) => setFilters(prev => ({ ...prev, min_daily_rate: e.target.value }))}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="max_daily_rate">Max Daily Rate ($)</Label>
            <Input
              id="max_daily_rate"
              type="number"
              value={filters.max_daily_rate}
              onChange={(e) => setFilters(prev => ({ ...prev, max_daily_rate: e.target.value }))}
              placeholder="1000"
            />
          </div>

          <div>
            <Label htmlFor="min_impressions">Min Daily Impressions</Label>
            <Input
              id="min_impressions"
              type="number"
              value={filters.min_impressions}
              onChange={(e) => setFilters(prev => ({ ...prev, min_impressions: e.target.value }))}
              placeholder="10000"
            />
          </div>

          <div>
            <Label>Available From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.available_from ? format(filters.available_from, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.available_from || undefined}
                  onSelect={(date) => setFilters(prev => ({ ...prev, available_from: date || null }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Available To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.available_to ? format(filters.available_to, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.available_to || undefined}
                  onSelect={(date) => setFilters(prev => ({ ...prev, available_to: date || null }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="illuminated"
            checked={filters.illuminated === true}
            onCheckedChange={(checked) => setFilters(prev => ({ ...prev, illuminated: checked ? true : null }))}
          />
          <Label htmlFor="illuminated">Illuminated only</Label>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={searchBillboards} disabled={loading}>
            {loading ? 'Searching...' : 'Search Billboards'}
          </Button>
          <Button variant="outline" onClick={() => {
            setFilters({
              city: '',
              state: '',
              min_daily_rate: '',
              max_daily_rate: '',
              billboard_type: 'all',
              min_impressions: '',
              illuminated: null,
              available_from: null,
              available_to: null
            })
            searchBillboards()
          }}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderBillboardCard = (billboard: Billboard) => (
    <Card key={billboard.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <div className="aspect-video bg-gray-200 relative">
          {billboard.photos && billboard.photos.length > 0 ? (
            <img 
              src={billboard.photos[0]} 
              alt={billboard.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          <div className="absolute top-2 left-2">
            <Badge variant={billboard.billboard_type === 'digital' ? 'default' : 'secondary'}>
              {billboard.billboard_type}
            </Badge>
          </div>
          
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleFavorite(billboard.id)}
              className="bg-white/80 hover:bg-white"
            >
              <Heart className={`w-4 h-4 ${favorites.includes(billboard.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button size="sm" variant="outline" className="bg-white/80 hover:bg-white">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {billboard.illuminated && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                <Lightbulb className="w-3 h-3 mr-1" />
                Illuminated
              </Badge>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate">{billboard.name}</h3>
          {billboard.average_rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">
                {billboard.average_rating} ({billboard.total_reviews})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{billboard.city}, {billboard.state}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Monitor className="w-4 h-4" />
            <span>{billboard.width_feet}' × {billboard.height_feet}'</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{billboard.daily_impressions.toLocaleString()}/day</span>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold text-green-600">
              ${billboard.daily_rate}/day
            </p>
            <p className="text-xs text-gray-500">
              ${billboard.weekly_rate}/week • ${billboard.monthly_rate}/month
            </p>
          </div>
          
          <Button 
            onClick={() => {
              setSelectedBillboard(billboard)
              setBookingForm(prev => ({ ...prev, billboard_id: billboard.id }))
              setShowBookingModal(true)
            }}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderBookingModal = () => (
    <div className={`fixed inset-0 z-50 ${showBookingModal ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50" onClick={() => setShowBookingModal(false)} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto mx-4">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Book Billboard</h2>
              <p className="text-gray-600">{selectedBillboard?.name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowBookingModal(false)}>
              ×
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingForm.start_date ? format(bookingForm.start_date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingForm.start_date || undefined}
                      onSelect={(date) => {
                        setBookingForm(prev => ({ ...prev, start_date: date || null }))
                        setQuote(null)
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingForm.end_date ? format(bookingForm.end_date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingForm.end_date || undefined}
                      onSelect={(date) => {
                        setBookingForm(prev => ({ ...prev, end_date: date || null }))
                        setQuote(null)
                      }}
                      disabled={(date) => date < new Date() || (bookingForm.start_date ? date <= bookingForm.start_date : false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="content_title">Campaign Title</Label>
              <Input
                id="content_title"
                value={bookingForm.content_title}
                onChange={(e) => setBookingForm(prev => ({ ...prev, content_title: e.target.value }))}
                placeholder="Summer Sale Campaign"
              />
            </div>

            <div>
              <Label htmlFor="content_description">Campaign Description</Label>
              <textarea
                id="content_description"
                value={bookingForm.content_description}
                onChange={(e) => setBookingForm(prev => ({ ...prev, content_description: e.target.value }))}
                placeholder="Describe your advertising campaign..."
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="special_requests">Special Requests (Optional)</Label>
              <textarea
                id="special_requests"
                value={bookingForm.special_requests}
                onChange={(e) => setBookingForm(prev => ({ ...prev, special_requests: e.target.value }))}
                placeholder="Any special requirements or requests..."
                className="w-full p-2 border rounded-md"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={getBookingQuote} disabled={loadingQuote} variant="outline">
                {loadingQuote ? 'Getting Quote...' : 'Get Quote'}
              </Button>
            </div>

            {quote && (
              <Card className={quote.available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">
                    {quote.available ? 'Booking Available' : 'Booking Unavailable'}
                  </h3>
                  
                  {quote.available ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{quote.total_days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily Rate:</span>
                        <span>${quote.daily_rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${quote.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee (12%):</span>
                        <span>${quote.platform_fee}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span>${quote.total_amount}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <p>This billboard is not available for the selected dates:</p>
                      <ul className="list-disc list-inside mt-2">
                        {quote.conflicts.map((conflict: string, index: number) => (
                          <li key={index}>{conflict}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {quote?.available && (
              <div className="flex gap-2">
                <Button onClick={createBooking} className="flex-1">
                  Create Booking
                </Button>
                <Button variant="outline" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Billboard Marketplace</h1>
          <p className="text-sm sm:text-base text-gray-600">Find the perfect billboard for your advertising campaign</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => setShowOnboarding(true)}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Register Your Billboard
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      {renderFilters()}

      <div className="mb-6">
        <p className="text-gray-600">
          {billboards.length} billboard{billboards.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-4 w-2/3" />
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : billboards.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No billboards found</h3>
            <p className="text-gray-600">Try adjusting your search filters to find more results</p>
          </div>
        ) : (
          billboards.map(renderBillboardCard)
        )}
      </div>

      {renderBookingModal()}

      {/* Billboard Onboarding Modal */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-6 w-6" />
              Register Your Billboard
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Join our Nigeria billboard network and start earning from your advertising space
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={onboardingForm.company_name}
                    onChange={(e) => handleOnboardingInputChange('company_name', e.target.value)}
                    placeholder="Your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="contact_person"
                      value={onboardingForm.contact_person}
                      onChange={(e) => handleOnboardingInputChange('contact_person', e.target.value)}
                      className="pl-10"
                      placeholder="Full name of contact person"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={onboardingForm.phone}
                      onChange={(e) => handleOnboardingInputChange('phone', e.target.value)}
                      className="pl-10"
                      placeholder="+234 (e.g., +234 80 1234 5678)"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={onboardingForm.email}
                      onChange={(e) => handleOnboardingInputChange('email', e.target.value)}
                      className="pl-10"
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Billboard Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Billboard Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billboard_name">Billboard Name *</Label>
                  <Input
                    id="billboard_name"
                    value={onboardingForm.billboard_name}
                    onChange={(e) => handleOnboardingInputChange('billboard_name', e.target.value)}
                    placeholder="e.g., Lagos Main Street Digital Board"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billboard_type">Billboard Type *</Label>
                  <Select value={onboardingForm.billboard_type} onValueChange={(value) => handleOnboardingInputChange('billboard_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="digital">Digital/LED</SelectItem>
                      <SelectItem value="static">Static/Print</SelectItem>
                      <SelectItem value="vinyl">Vinyl Banner</SelectItem>
                      <SelectItem value="backlit">Backlit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width_feet">Width (feet) *</Label>
                  <Input
                    id="width_feet"
                    type="number"
                    value={onboardingForm.width_feet}
                    onChange={(e) => handleOnboardingInputChange('width_feet', e.target.value)}
                    placeholder="e.g., 12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height_feet">Height (feet) *</Label>
                  <Input
                    id="height_feet"
                    type="number"
                    value={onboardingForm.height_feet}
                    onChange={(e) => handleOnboardingInputChange('height_feet', e.target.value)}
                    placeholder="e.g., 8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orientation">Orientation</Label>
                  <Select value={onboardingForm.orientation} onValueChange={(value) => handleOnboardingInputChange('orientation', value)}>
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
                <div className="space-y-2">
                  <Label htmlFor="illuminated">Illuminated</Label>
                  <Select value={onboardingForm.illuminated.toString()} onValueChange={(value) => handleOnboardingInputChange('illuminated', value === 'true')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={onboardingForm.description}
                  onChange={(e) => handleOnboardingInputChange('description', e.target.value)}
                  placeholder="Describe your billboard location, visibility, traffic, and any special features..."
                  rows={3}
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    value={onboardingForm.address}
                    onChange={(e) => handleOnboardingInputChange('address', e.target.value)}
                    placeholder="Street address, landmarks, nearest bus stop"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={onboardingForm.city}
                    onChange={(e) => handleOnboardingInputChange('city', e.target.value)}
                    placeholder="e.g., Lagos, Abuja, Port Harcourt"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={onboardingForm.state}
                    onChange={(e) => handleOnboardingInputChange('state', e.target.value)}
                    placeholder="e.g., Lagos State, FCT, Rivers"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code">Postal Code</Label>
                  <Input
                    id="zip_code"
                    value={onboardingForm.zip_code}
                    onChange={(e) => handleOnboardingInputChange('zip_code', e.target.value)}
                    placeholder="e.g., 101001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={onboardingForm.latitude}
                    onChange={(e) => handleOnboardingInputChange('latitude', e.target.value)}
                    placeholder="e.g., 6.5244"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={onboardingForm.longitude}
                    onChange={(e) => handleOnboardingInputChange('longitude', e.target.value)}
                    placeholder="e.g., 3.3792"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily_rate">Daily Rate (₦) *</Label>
                  <Input
                    id="daily_rate"
                    type="number"
                    value={onboardingForm.daily_rate}
                    onChange={(e) => handleOnboardingInputChange('daily_rate', e.target.value)}
                    placeholder="e.g., 50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekly_rate">Weekly Rate (₦)</Label>
                  <Input
                    id="weekly_rate"
                    type="number"
                    value={onboardingForm.weekly_rate}
                    onChange={(e) => handleOnboardingInputChange('weekly_rate', e.target.value)}
                    placeholder="e.g., 300000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_rate">Monthly Rate (₦)</Label>
                  <Input
                    id="monthly_rate"
                    type="number"
                    value={onboardingForm.monthly_rate}
                    onChange={(e) => handleOnboardingInputChange('monthly_rate', e.target.value)}
                    placeholder="e.g., 1200000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_impressions">Estimated Daily Impressions</Label>
                  <Input
                    id="daily_impressions"
                    type="number"
                    value={onboardingForm.daily_impressions}
                    onChange={(e) => handleOnboardingInputChange('daily_impressions', e.target.value)}
                    placeholder="e.g., 10000"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_holder_name">Account Holder Name *</Label>
                  <Input
                    id="account_holder_name"
                    value={onboardingForm.account_holder_name}
                    onChange={(e) => handleOnboardingInputChange('account_holder_name', e.target.value)}
                    placeholder="As it appears on bank account"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_type">Account Type</Label>
                  <Select value={onboardingForm.account_type} onValueChange={(value) => handleOnboardingInputChange('account_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Current Account</SelectItem>
                      <SelectItem value="savings">Savings Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routing_number">Bank Code *</Label>
                  <Input
                    id="routing_number"
                    value={onboardingForm.routing_number}
                    onChange={(e) => handleOnboardingInputChange('routing_number', e.target.value)}
                    placeholder="e.g., 011 (GTBank), 058 (Zenith)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number *</Label>
                  <Input
                    id="account_number"
                    value={onboardingForm.account_number}
                    onChange={(e) => handleOnboardingInputChange('account_number', e.target.value)}
                    placeholder="10-digit account number"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Billboard Photos
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Upload photos of your billboard (front view, location, traffic visibility)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Support: JPG, PNG up to 5MB each. Max 5 photos.
                </p>
                <Button variant="outline" className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Photos
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center pt-6 border-t">
            <div className="text-xs text-gray-500">
              * Required fields. All information will be verified before approval.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowOnboarding(false)} disabled={submitingOnboarding}>
                Cancel
              </Button>
              <Button onClick={handleOnboardingSubmit} disabled={submitingOnboarding}>
                {submitingOnboarding ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
