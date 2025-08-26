'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Facebook, Instagram, Twitter, Loader2 } from "lucide-react"

export default function TestOAuthPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const platforms = [
    {
      name: 'facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      label: 'Test Facebook OAuth'
    },
    {
      name: 'instagram',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      label: 'Test Instagram OAuth'
    },
    {
      name: 'twitter',
      icon: Twitter,
      color: 'bg-blue-400 hover:bg-blue-500',
      label: 'Test Twitter OAuth'
    }
  ]

  const testOAuth = async (platform: string) => {
    setLoading(platform)

    try {
      // Test the OAuth URL generation
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social/auth/${platform}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(`Error: ${errorData.detail || 'Failed to get OAuth URL'}`)
        return
      }

      const data = await response.json()
      console.log(`${platform} OAuth URL:`, data.auth_url)
      
      // Ask user if they want to proceed
      if (confirm(`Generated OAuth URL for ${platform}. Do you want to redirect to test it?`)) {
        window.location.href = data.auth_url
      }

    } catch (error) {
      console.error(`Error testing ${platform} OAuth:`, error)
      alert(`Error testing ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">OAuth Test Page</h1>
          <p className="text-lg text-gray-600">
            Test the OAuth flow for each social media platform
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {platforms.map((platform) => {
            const Icon = platform.icon
            const isLoading = loading === platform.name

            return (
              <Card key={platform.name} className="shadow-lg">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${platform.color} text-white`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                  <CardTitle className="text-xl capitalize">{platform.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    className={`w-full ${platform.color} text-white`}
                    onClick={() => testOAuth(platform.name)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      platform.label
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">How to Test:</h3>
          <ol className="text-sm text-blue-800 space-y-2">
            <li>1. Click a platform button above</li>
            <li>2. Check the console for the generated OAuth URL</li>
            <li>3. If you want to test the full flow, click "OK" when prompted</li>
            <li>4. You'll be redirected to the platform's OAuth page</li>
            <li>5. After authorization, you'll be redirected back to the callback page</li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
