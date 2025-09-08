/**
 * AdFlow Platform API Integration
 * Complete API client for frontend-backend communication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// API Client Class
class AdFlowAPIClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = null
  }

  // Set authentication token
  setToken(token) {
    this.token = token
  }

  // Helper method for making requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // Upload files (FormData)
  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    })
  }

  // ===== CAMPAIGN MANAGEMENT API =====
  
  // Create new campaign
  async createCampaign(campaignData) {
    return this.post('/api/campaigns/create', campaignData)
  }

  // Upload campaign media
  async uploadCampaignMedia(campaignId, files) {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    
    return this.upload(`/api/campaigns/${campaignId}/upload-media`, formData)
  }

  // Get user campaigns
  async getCampaigns(status = null, skip = 0, limit = 100) {
    const params = new URLSearchParams({ skip, limit })
    if (status) params.append('status', status)
    
    return this.get(`/api/campaigns?${params}`)
  }

  // Get campaign details
  async getCampaignDetails(campaignId) {
    return this.get(`/api/campaigns/${campaignId}`)
  }

  // Update campaign
  async updateCampaign(campaignId, updateData) {
    return this.put(`/api/campaigns/${campaignId}/update`, updateData)
  }

  // Delete campaign
  async deleteCampaign(campaignId) {
    return this.delete(`/api/campaigns/${campaignId}`)
  }

  // ===== BOOKING MANAGEMENT API =====

  // Create booking for campaign
  async createBooking(campaignId) {
    return this.post('/api/bookings/create', { campaign_id: campaignId })
  }

  // Confirm booking payment
  async confirmBookingPayment(bookingId, paymentReference) {
    return this.post('/api/bookings/confirm-payment', {
      booking_id: bookingId,
      payment_reference: paymentReference
    })
  }

  // Get user bookings
  async getBookings(status = null, skip = 0, limit = 100) {
    const params = new URLSearchParams({ skip, limit })
    if (status) params.append('status', status)
    
    return this.get(`/api/bookings?${params}`)
  }

  // Get booking details
  async getBookingDetails(bookingId) {
    return this.get(`/api/bookings/${bookingId}`)
  }

  // Check billboard availability
  async checkBillboardAvailability(billboardId, startDate, endDate) {
    return this.post('/api/bookings/check-availability', {
      billboard_id: billboardId,
      start_date: startDate,
      end_date: endDate
    })
  }

  // Cancel booking
  async cancelBooking(bookingId, reason, refundAmount = null) {
    return this.post(`/api/bookings/${bookingId}/cancel`, {
      reason,
      refund_amount: refundAmount
    })
  }

  // ===== BILLBOARD MANAGEMENT API =====

  // Get billboards (marketplace)
  async getBillboards(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value)
      }
    })
    
    return this.get(`/api/billboards/search?${params}`)
  }

  // Get billboard details
  async getBillboardDetails(billboardId) {
    return this.get(`/api/billboards/${billboardId}`)
  }

  // Register new billboard
  async registerBillboard(registrationData) {
    return this.post('/api/billboards/register', registrationData)
  }

  // Upload billboard images
  async uploadBillboardImages(registrationId, images) {
    const formData = new FormData()
    images.forEach(image => formData.append('images', image))
    
    return this.upload(`/api/billboards/register/${registrationId}/images`, formData)
  }

  // ===== ADMIN DASHBOARD API =====

  // Get admin dashboard overview
  async getAdminDashboard() {
    return this.get('/api/admin/dashboard')
  }

  // Get system alerts
  async getSystemAlerts(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value)
      }
    })
    
    return this.get(`/api/admin/alerts?${params}`)
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId) {
    return this.post(`/api/admin/alerts/${alertId}/acknowledge`, {})
  }

  // Resolve alert
  async resolveAlert(alertId) {
    return this.post(`/api/admin/alerts/${alertId}/resolve`, {})
  }

  // Get support tickets
  async getSupportTickets(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value)
      }
    })
    
    return this.get(`/api/admin/support/tickets?${params}`)
  }

  // Get system health
  async getSystemHealth() {
    return this.get('/api/admin/system/health')
  }

  // Get billboard status
  async getBillboardsStatus() {
    return this.get('/api/admin/billboards/status')
  }

  // Force system checks
  async forceSystemChecks() {
    return this.post('/api/admin/force-checks', {})
  }

  // Get revenue analytics
  async getRevenueAnalytics(days = 30) {
    return this.get(`/api/admin/analytics/revenue?days=${days}`)
  }

  // ===== AUTHENTICATION API =====

  // Login user
  async login(email, password) {
    const response = await this.post('/api/auth/login', { email, password })
    if (response.access_token) {
      this.setToken(response.access_token)
    }
    return response
  }

  // Register user
  async register(userData) {
    return this.post('/api/auth/register', userData)
  }

  // Get current user
  async getCurrentUser() {
    return this.get('/api/auth/me')
  }

  // Logout user
  logout() {
    this.token = null
  }

  // ===== WEBSOCKET CONNECTIONS =====

  // Connect to billboard WebSocket
  connectToBillboard(billboardId, onMessage, onError = null, onClose = null) {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/api/ws/billboard/${billboardId}`
    const ws = new WebSocket(wsUrl)
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error('WebSocket message parse error:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      if (onError) onError(error)
    }

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason)
      if (onClose) onClose(event)
    }

    return ws
  }

  // ===== UTILITY METHODS =====

  // Health check
  async healthCheck() {
    return this.get('/health')
  }

  // Get API info
  async getAPIInfo() {
    return this.get('/api/info')
  }

  // Test connection
  async testConnection() {
    try {
      const response = await this.healthCheck()
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// Create and export API client instance
const apiClient = new AdFlowAPIClient()

// React hooks for API integration
export const useAdFlowAPI = () => {
  return apiClient
}

// Specific hooks for common operations
export const useCampaigns = () => {
  const api = useAdFlowAPI()
  
  return {
    createCampaign: api.createCampaign.bind(api),
    getCampaigns: api.getCampaigns.bind(api),
    getCampaignDetails: api.getCampaignDetails.bind(api),
    updateCampaign: api.updateCampaign.bind(api),
    deleteCampaign: api.deleteCampaign.bind(api),
    uploadMedia: api.uploadCampaignMedia.bind(api)
  }
}

export const useBookings = () => {
  const api = useAdFlowAPI()
  
  return {
    createBooking: api.createBooking.bind(api),
    getBookings: api.getBookings.bind(api),
    getBookingDetails: api.getBookingDetails.bind(api),
    confirmPayment: api.confirmBookingPayment.bind(api),
    checkAvailability: api.checkBillboardAvailability.bind(api),
    cancelBooking: api.cancelBooking.bind(api)
  }
}

export const useBillboards = () => {
  const api = useAdFlowAPI()
  
  return {
    getBillboards: api.getBillboards.bind(api),
    getBillboardDetails: api.getBillboardDetails.bind(api),
    registerBillboard: api.registerBillboard.bind(api),
    uploadImages: api.uploadBillboardImages.bind(api)
  }
}

export const useAdmin = () => {
  const api = useAdFlowAPI()
  
  return {
    getDashboard: api.getAdminDashboard.bind(api),
    getAlerts: api.getSystemAlerts.bind(api),
    acknowledgeAlert: api.acknowledgeAlert.bind(api),
    resolveAlert: api.resolveAlert.bind(api),
    getTickets: api.getSupportTickets.bind(api),
    getSystemHealth: api.getSystemHealth.bind(api),
    getBillboardsStatus: api.getBillboardsStatus.bind(api),
    forceChecks: api.forceSystemChecks.bind(api),
    getRevenue: api.getRevenueAnalytics.bind(api)
  }
}

// Error handling utilities
export const APIError = {
  isNetworkError: (error) => error.message.includes('fetch'),
  isAuthError: (error) => error.message.includes('401') || error.message.includes('unauthorized'),
  isValidationError: (error) => error.message.includes('422') || error.message.includes('validation'),
  isServerError: (error) => error.message.includes('500') || error.message.includes('internal server error')
}

// Export the main client
export default apiClient
