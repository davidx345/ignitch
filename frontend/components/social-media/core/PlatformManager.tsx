/**
 * Platform Manager Component
 * Manage social media platform connections and settings
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useApiService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Linkedin,
  Settings,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCw
} from 'lucide-react'

interface PlatformConnection {
  id: string
  platform: string
  connected: boolean
  account_name?: string
  followers?: number
  last_sync?: string
  status: 'active' | 'error' | 'disconnected'
}

interface PlatformManagerProps {
  onStatsUpdate?: (stats: any) => void
}

const PlatformManager: React.FC<PlatformManagerProps> = ({ onStatsUpdate }) => {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const api = useApiService();

  const platformConfigs = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-6 h-6" />,
      color: 'bg-pink-500',
      description: 'Connect your Instagram Business account'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="w-6 h-6" />,
      color: 'bg-blue-600',
      description: 'Connect your Facebook Pages'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <MessageCircle className="w-6 h-6" />,
      color: 'bg-blue-400',
      description: 'Connect your Twitter account'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin className="w-6 h-6" />,
      color: 'bg-blue-700',
      description: 'Connect your LinkedIn Company Page'
    }
  ]

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockConnections: PlatformConnection[] = [
        {
          id: '1',
          platform: 'instagram',
          connected: true,
          account_name: '@adflow_official',
          followers: 12500,
          last_sync: '2025-09-09T10:30:00Z',
          status: 'active'
        },
        {
          id: '2',
          platform: 'facebook',
          connected: true,
          account_name: 'AdFlow Marketing',
          followers: 8200,
          last_sync: '2025-09-09T10:25:00Z',
          status: 'active'
        },
        {
          id: '3',
          platform: 'twitter',
          connected: false,
          status: 'disconnected'
        },
        {
          id: '4',
          platform: 'linkedin',
          connected: false,
          status: 'disconnected'
        }
      ]
      
      setConnections(mockConnections)
      
      // Update parent stats
      if (onStatsUpdate) {
        const connectedCount = mockConnections.filter(c => c.connected).length
        onStatsUpdate({
          connectedPlatforms: connectedCount,
          totalFollowers: mockConnections.reduce((sum, c) => sum + (c.followers || 0), 0)
        })
      }
    } catch (err: any) {
      setError('Failed to load platform connections')
    } finally {
      setLoading(false)
    }
  }

  const connectPlatform = async (platformId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Connecting to platform:', platformId)
      
      const response = await api.connectSocialAccount(platformId)
      console.log('Connect platform response:', response)
      
      if (response.success && response.data?.auth_url) {
        // Open auth URL in new window
        const authWindow = window.open(
          response.data.auth_url,
          'social-auth',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        )
        
        // Listen for auth completion
        const pollTimer = setInterval(() => {
          try {
            if (authWindow?.closed) {
              clearInterval(pollTimer)
              // Refresh connections after auth window closes
              setTimeout(() => {
                loadConnections()
              }, 1000)
            }
          } catch (e) {
            // Ignore cross-origin errors
          }
        }, 1000)
        
        // Auto-close timer (5 minutes)
        setTimeout(() => {
          clearInterval(pollTimer)
          if (authWindow && !authWindow.closed) {
            authWindow.close()
          }
        }, 300000)
        
        setSuccess(`Opening ${platformId} authentication window...`)
        setTimeout(() => setSuccess(null), 3000)
        
      } else {
        throw new Error(response.error || 'Failed to get authentication URL')
      }
    } catch (err: any) {
      console.error('Platform connection error:', err)
      
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError('Please sign in to connect social media accounts')
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        setError('Network error. Please check your connection.')
      } else {
        setError(err.message || `Failed to connect to ${platformId}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const disconnectPlatform = async (platformId: string) => {
    try {
      // This would disconnect the platform
      setConnections(prev => 
        prev.map(conn => 
          conn.platform === platformId 
            ? { ...conn, connected: false, status: 'disconnected', account_name: undefined, followers: undefined }
            : conn
        )
      )
    } catch (err: any) {
      setError(`Failed to disconnect from ${platformId}`)
    }
  }

  const syncPlatform = async (platformId: string) => {
    try {
      // This would sync latest data from platform
      console.log('Syncing', platformId)
      // Update last_sync timestamp
      setConnections(prev =>
        prev.map(conn =>
          conn.platform === platformId
            ? { ...conn, last_sync: new Date().toISOString() }
            : conn
        )
      )
    } catch (err: any) {
      setError(`Failed to sync ${platformId}`)
    }
  }

  const getConnectionStatus = (platform: string) => {
    return connections.find(c => c.platform === platform)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (connection: PlatformConnection | undefined) => {
    if (!connection || !connection.connected) {
      return <Badge variant="outline" className="text-gray-600">Disconnected</Badge>
    }
    
    switch (connection.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Platform Connections</h2>
          <p className="text-gray-600">Manage your social media platform integrations</p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadConnections}
          className="text-gray-600 border-gray-300 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Platform Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {platformConfigs.map((platform) => {
          const connection = getConnectionStatus(platform.id)
          const isConnected = connection?.connected || false

          return (
            <Card key={platform.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center text-white`}>
                      {platform.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                        {getStatusIcon(connection?.status || 'disconnected')}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{platform.description}</p>
                      
                      {isConnected && connection && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            {connection.account_name}
                          </p>
                          {connection.followers && (
                            <p className="text-sm text-gray-600">
                              {connection.followers.toLocaleString()} followers
                            </p>
                          )}
                          {connection.last_sync && (
                            <p className="text-xs text-gray-500">
                              Last sync: {new Date(connection.last_sync).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(connection)}
                    
                    <div className="flex space-x-2">
                      {isConnected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncPlatform(platform.id)}
                            className="text-gray-600 border-gray-300 hover:bg-gray-50"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disconnectPlatform(platform.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => connectPlatform(platform.id)}
                          className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Stats */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {connections.filter(c => c.connected).length}
              </p>
              <p className="text-sm text-gray-600">Connected Platforms</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {connections.reduce((sum, c) => sum + (c.followers || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Followers</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {connections.filter(c => c.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Active Connections</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {connections.filter(c => c.status === 'error').length}
              </p>
              <p className="text-sm text-gray-600">Connection Issues</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PlatformManager
