'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Facebook, Instagram, Twitter, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface SocialAuthButtonsProps {
  onConnectionSuccess?: (platform: string) => void
  onConnectionError?: (platform: string, error: string) => void
}

export default function SocialAuthButtons({ 
  onConnectionSuccess, 
  onConnectionError 
}: SocialAuthButtonsProps) {
  const { user } = useAuth()
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([])

  const platforms = [
    {
      name: 'facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      label: 'Connect Facebook'
    },
    {
      name: 'instagram',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      label: 'Connect Instagram'
    },
    {
      name: 'twitter',
      icon: Twitter,
      color: 'bg-blue-400 hover:bg-blue-500',
      label: 'Connect Twitter'
    }
  ]

  const handleConnect = async (platform: string) => {
    if (!user) {
      onConnectionError?.(platform, 'Please sign in first')
      return
    }

    setConnecting(platform)

    try {
      // Get OAuth URL from backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social/auth/${platform}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}` // You'll need to implement this
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get authorization URL')
      }

      const data = await response.json()
      
      // Redirect to OAuth URL
      window.location.href = data.auth_url
      
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error)
      onConnectionError?.(platform, error instanceof Error ? error.message : 'Connection failed')
      setConnecting(null)
    }
  }

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.name === platform)
    return platformData ? platformData.icon : null
  }

  const isConnected = (platform: string) => connectedAccounts.includes(platform)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Connect Your Social Media Accounts</h3>
        <p className="text-gray-600">
          Connect your accounts to enable automatic posting and analytics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {platforms.map((platform) => {
          const Icon = platform.icon
          const isConnecting = connecting === platform.name
          const connected = isConnected(platform.name)

          return (
            <Card key={platform.name} className="relative">
              <CardHeader className="text-center pb-3">
                <div className="flex justify-center mb-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${platform.color} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <CardTitle className="text-lg capitalize">{platform.name}</CardTitle>
                <CardDescription>
                  {connected ? 'Connected' : 'Connect to enable posting'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {connected ? (
                  <div className="space-y-2">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConnect(platform.name)}
                    >
                      Reconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    className={`w-full ${platform.color} text-white`}
                    onClick={() => handleConnect(platform.name)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Icon className="w-4 h-4 mr-2" />
                        {platform.label}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">What happens when you connect?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You'll be redirected to the platform's official login page</li>
          <li>• After logging in, you'll see a permission request</li>
          <li>• Click "Allow" to grant posting permissions</li>
          <li>• You'll be redirected back to AdFlow</li>
          <li>• Your account will be connected and ready for posting</li>
        </ul>
      </div>
    </div>
  )
}
