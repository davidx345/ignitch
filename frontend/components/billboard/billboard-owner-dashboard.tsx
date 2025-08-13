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
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { format } from "date-fns"
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  MapPin,
  Star,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Monitor,
  Lightbulb,
  Camera,
  Upload,
  Settings,
  Download
} from "lucide-react"

interface Billboard {
  id: string
  name: string
  description: string
  address: string
  city: string
  state: string
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
  is_active: boolean
  created_at: string
}

interface Booking {
  id: string
  billboard_id: string
  billboard_name: string
  start_date: string
  end_date: string
  status: string
  content_title: string
  total_amount: number
  platform_fee: number
  owner_payout: number
  created_at: string
  user_name?: string
}

interface Analytics {
  total_revenue: number
  monthly_revenue: number
  total_bookings: number
  monthly_bookings: number
  average_rating: number
  total_reviews: number
  revenue_trend: number
  booking_trend: number
  top_performing_billboard: string
  occupancy_rate: number
}

interface BillboardForm {
  name: string
  description: string
  address: string
  city: string
  state: string
  width_feet: number
  height_feet: number
  billboard_type: string
  orientation: string
  illuminated: boolean
  daily_rate: number
  weekly_rate: number
  monthly_rate: number
  daily_impressions: number
}

export default function BillboardOwnerDashboard() {
  const [billboards, setBillboards] = useState<Billboard[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddBillboard, setShowAddBillboard] = useState(false)
  const [editingBillboard, setEditingBillboard] = useState<Billboard | null>(null)

  const [billboardForm, setBillboardForm] = useState<BillboardForm>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    width_feet: 14,
    height_feet: 48,
    billboard_type: 'static',
    orientation: 'landscape',
    illuminated: false,
    daily_rate: 100,
    weekly_rate: 600,
    monthly_rate: 2000,
    daily_impressions: 10000
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadBillboards(),
        loadBookings(),
        loadAnalytics()
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadBillboards = async () => {
    try {
      const response = await fetch('/api/billboards/owner/billboards', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBillboards(data.billboards || [])
      }
    } catch (error) {
      toast.error('Failed to load billboards')
    }
  }

  const loadBookings = async () => {
    try {
      const response = await fetch('/api/billboards/owner/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      toast.error('Failed to load bookings')
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/billboards/owner/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      toast.error('Failed to load analytics')
    }
  }

  const saveBillboard = async () => {
    try {
      const url = editingBillboard 
        ? `/api/billboards/${editingBillboard.id}`
        : '/api/billboards'
      
      const method = editingBillboard ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(billboardForm)
      })

      if (response.ok) {
        toast.success(editingBillboard ? 'Billboard updated!' : 'Billboard created!')
        setShowAddBillboard(false)
        setEditingBillboard(null)
        setBillboardForm({
          name: '',
          description: '',
          address: '',
          city: '',
          state: '',
          width_feet: 14,
          height_feet: 48,
          billboard_type: 'static',
          orientation: 'landscape',
          illuminated: false,
          daily_rate: 100,
          weekly_rate: 600,
          monthly_rate: 2000,
          daily_impressions: 10000
        })
        loadBillboards()
      } else {
        const data = await response.json()
        toast.error(data.detail || 'Failed to save billboard')
      }
    } catch (error) {
      toast.error('Network error occurred')
    }
  }

  const deleteBillboard = async (billboardId: string) => {
    if (!confirm('Are you sure you want to delete this billboard?')) return

    try {
      const response = await fetch(`/api/billboards/${billboardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        toast.success('Billboard deleted!')
        loadBillboards()
      } else {
        toast.error('Failed to delete billboard')
      }
    } catch (error) {
      toast.error('Network error occurred')
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/billboards/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success('Booking status updated!')
        loadBookings()
      } else {
        toast.error('Failed to update booking status')
      }
    } catch (error) {
      toast.error('Network error occurred')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${analytics?.total_revenue?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              {analytics?.revenue_trend && analytics.revenue_trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span className="text-sm text-gray-600">
                ${analytics?.monthly_revenue?.toLocaleString() || '0'} this month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{analytics?.total_bookings || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">
                {analytics?.monthly_bookings || 0} this month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">{analytics?.average_rating?.toFixed(1) || '0.0'}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">
                {analytics?.total_reviews || 0} reviews
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold">{analytics?.occupancy_rate?.toFixed(1) || '0.0'}%</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Progress value={analytics?.occupancy_rate || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest booking requests and status updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{booking.content_title}</h4>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1">{booking.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{booking.billboard_name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(booking.start_date), 'MMM dd')} - {format(new Date(booking.end_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${booking.total_amount}</p>
                  <p className="text-sm text-green-600">+${booking.owner_payout} (your share)</p>
                </div>
              </div>
            ))}
            
            {bookings.length === 0 && (
              <p className="text-center text-gray-500 py-8">No bookings yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderBillboards = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Billboards</h2>
        <Button onClick={() => {
          setShowAddBillboard(true)
          setEditingBillboard(null)
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Billboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {billboards.map((billboard) => (
          <Card key={billboard.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{billboard.name}</h3>
                  <p className="text-sm text-gray-600">{billboard.city}, {billboard.state}</p>
                </div>
                <Badge variant={billboard.is_active ? 'default' : 'secondary'}>
                  {billboard.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{billboard.billboard_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{billboard.width_feet}' × {billboard.height_feet}'</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Rate:</span>
                  <span>${billboard.daily_rate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Views:</span>
                  <span>{billboard.daily_impressions.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                {billboard.illuminated && (
                  <Badge variant="outline" className="text-yellow-600">
                    <Lightbulb className="w-3 h-3 mr-1" />
                    Lit
                  </Badge>
                )}
                <Badge variant="outline">
                  <Monitor className="w-3 h-3 mr-1" />
                  {billboard.orientation}
                </Badge>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => {
                  setEditingBillboard(billboard)
                  setBillboardForm({
                    name: billboard.name,
                    description: billboard.description,
                    address: billboard.address,
                    city: billboard.city,
                    state: billboard.state,
                    width_feet: billboard.width_feet,
                    height_feet: billboard.height_feet,
                    billboard_type: billboard.billboard_type,
                    orientation: billboard.orientation,
                    illuminated: billboard.illuminated,
                    daily_rate: billboard.daily_rate,
                    weekly_rate: billboard.weekly_rate,
                    monthly_rate: billboard.monthly_rate,
                    daily_impressions: billboard.daily_impressions
                  })
                  setShowAddBillboard(true)
                }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Camera className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteBillboard(billboard.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {billboards.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No billboards yet</h3>
            <p className="text-gray-600 mb-4">Start earning by adding your first billboard to the marketplace</p>
            <Button onClick={() => setShowAddBillboard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Billboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderBookings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Booking Management</h2>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{booking.content_title}</h4>
                    <p className="text-sm text-gray-600">{booking.billboard_name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(booking.start_date), 'MMM dd')} - {format(new Date(booking.end_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-1">{booking.status}</span>
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="font-medium">${booking.total_amount}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Platform Fee:</span>
                    <p className="text-red-600">-${booking.platform_fee}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Your Payout:</span>
                    <p className="font-medium text-green-600">${booking.owner_payout}</p>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" onClick={() => updateBookingStatus(booking.id, 'confirmed')}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {bookings.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600">Bookings will appear here when customers book your billboards</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderBillboardForm = () => (
    <div className={`fixed inset-0 z-50 ${showAddBillboard ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddBillboard(false)} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {editingBillboard ? 'Edit Billboard' : 'Add New Billboard'}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowAddBillboard(false)}>
              ×
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Billboard Name</Label>
                <Input
                  id="name"
                  value={billboardForm.name}
                  onChange={(e) => setBillboardForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Downtown Highway Billboard"
                />
              </div>
              <div>
                <Label htmlFor="billboard_type">Type</Label>
                <Select value={billboardForm.billboard_type} onValueChange={(value) => setBillboardForm(prev => ({ ...prev, billboard_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="led">LED</SelectItem>
                    <SelectItem value="vinyl">Vinyl</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={billboardForm.description}
                onChange={(e) => setBillboardForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Describe your billboard location and visibility..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={billboardForm.address}
                  onChange={(e) => setBillboardForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Highway Blvd"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={billboardForm.city}
                  onChange={(e) => setBillboardForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Los Angeles"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={billboardForm.state}
                  onChange={(e) => setBillboardForm(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="CA"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="width_feet">Width (ft)</Label>
                <Input
                  id="width_feet"
                  type="number"
                  value={billboardForm.width_feet}
                  onChange={(e) => setBillboardForm(prev => ({ ...prev, width_feet: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="height_feet">Height (ft)</Label>
                <Input
                  id="height_feet"
                  type="number"
                  value={billboardForm.height_feet}
                  onChange={(e) => setBillboardForm(prev => ({ ...prev, height_feet: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="orientation">Orientation</Label>
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
              <div>
                <Label htmlFor="daily_impressions">Daily Views</Label>
                <Input
                  id="daily_impressions"
                  type="number"
                  value={billboardForm.daily_impressions}
                  onChange={(e) => setBillboardForm(prev => ({ ...prev, daily_impressions: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="daily_rate">Daily Rate ($)</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  value={billboardForm.daily_rate}
                  onChange={(e) => setBillboardForm(prev => ({ ...prev, daily_rate: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="weekly_rate">Weekly Rate ($)</Label>
                <Input
                  id="weekly_rate"
                  type="number"
                  value={billboardForm.weekly_rate}
                  onChange={(e) => setBillboardForm(prev => ({ ...prev, weekly_rate: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="monthly_rate">Monthly Rate ($)</Label>
                <Input
                  id="monthly_rate"
                  type="number"
                  value={billboardForm.monthly_rate}
                  onChange={(e) => setBillboardForm(prev => ({ ...prev, monthly_rate: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="illuminated"
                checked={billboardForm.illuminated}
                onCheckedChange={(checked) => setBillboardForm(prev => ({ ...prev, illuminated: !!checked }))}
              />
              <Label htmlFor="illuminated">Illuminated (lights at night)</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveBillboard} className="flex-1">
                {editingBillboard ? 'Update Billboard' : 'Create Billboard'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddBillboard(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Billboard Owner Dashboard</h1>
        <p className="text-gray-600">Manage your billboards and track performance</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billboards">My Billboards</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="billboards" className="mt-6">
          {renderBillboards()}
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          {renderBookings()}
        </TabsContent>
      </Tabs>

      {renderBillboardForm()}
    </div>
  )
}
