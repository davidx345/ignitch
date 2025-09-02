'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Facebook, Instagram, Twitter, Youtube, Loader2, CheckCircle, XCircle } from "lucide-react"

interface PlatformConnection {
  platform: string
  connected: boolean
  followers: number
  engagement: number
  icon: any
  account_id?: string
  username?: string
  access_token?: string
  last_used?: string
}

interface RealPlatformConnectionsProps {
  onConnectionsUpdate?: (connections: PlatformConnection[]) => void
}

export default function RealPlatformConnections({ onConnectionsUpdate }: RealPlatformConnectionsProps) {
  const { user, session } = useAuth()
  const [connections, setConnections] = useState<PlatformConnection[]>([
    { platform: "instagram", connected: false, followers: 0, engagement: 0, icon: Instagram },
    { platform: "facebook", connected: false, followers: 0, engagement: 0, icon: Facebook },
    { platform: "twitter", connected: false, followers: 0, engagement: 0, icon: Twitter },
    { platform: "tiktok", connected: false, followers: 0, engagement: 0, icon: Youtube }
  ])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch real connections from backend
  const fetchConnections = async () => {
    if (!session) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`https://ignitch-api-8f7efad07047.herokuapp.com/api/social/accounts`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Real connections data:', data)
        
        // Update connections with real data
        const updatedConnections = connections.map(conn => {
          const realData = data.accounts?.find((acc: any) => acc.platform === conn.platform)
          if (realData) {
            return {
              ...conn,
              connected: true,
              followers: realData.followers_count || 0,
              engagement: realData.avg_engagement || 0,
              account_id: realData.account_id,
              username: realData.username,
              access_token: realData.access_token,
              last_used: realData.last_used
            }
          }
          return conn
        })
        
        setConnections(updatedConnections)
        onConnectionsUpdate?.(updatedConnections)
      } else {
        console.error('Failed to fetch connections:', response.status)
        setError('Failed to load connected accounts')
      }
    } catch (err) {
      console.error('Error fetching connections:', err)
      setError('Network error loading accounts')
    } finally {
      setLoading(false)
    }
  }

  // Connect a platform
  const connectPlatform = async (platform: string) => {
    if (!session) {
      setError('Please sign in first')
      return
    }

    try {
      setConnecting(platform)
      setError(null)
      
      const response = await fetch(`https://ignitch-api-8f7efad07047.herokuapp.com/api/social/auth/${platform}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('OAuth URL:', data.auth_url)
        
        // Redirect to OAuth
        window.location.href = data.auth_url
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to start OAuth')
      }
    } catch (err) {
      console.error('Error connecting platform:', err)
      setError('Network error connecting platform')
    } finally {
      setConnecting(null)
    }
  }

  // Disconnect a platform
  const disconnectPlatform = async (platform: string) => {
    if (!session) return

    try {
      const response = await fetch(`https://ignitch-api-8f7efad07047.herokuapp.com/api/social/accounts/${platform}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Update local state
        const updatedConnections = connections.map(conn => 
          conn.platform === platform 
            ? { ...conn, connected: false, followers: 0, engagement: 0 }
            : conn
        )
        setConnections(updatedConnections)
        onConnectionsUpdate?.(updatedConnections)
      }
    } catch (err) {
      console.error('Error disconnecting platform:', err)
      setError('Failed to disconnect platform')
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading connected accounts...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((connection) => {
          const IconComponent = connection.icon
          return (
            <Card key={connection.platform} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-6 h-6" />
                    <CardTitle className="text-lg capitalize">
                      {connection.platform}
                    </CardTitle>
                  </div>
                  {connection.connected ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {connection.connected ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Followers:</span>
                      <span className="font-semibold">{connection.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Engagement:</span>
                      <span className="font-semibold">{connection.engagement.toFixed(1)}%</span>
                    </div>
                    {connection.username && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Username:</span>
                        <span className="font-semibold">@{connection.username}</span>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => disconnectPlatform(connection.platform)}
                      className="w-full"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Connect your {connection.platform} account to enable auto-posting
                    </p>
                    <Button 
                      onClick={() => connectPlatform(connection.platform)}
                      disabled={connecting === connection.platform}
                      className="w-full"
                    >
                      {connecting === connection.platform ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        `Connect ${connection.platform}`
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
