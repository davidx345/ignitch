'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugAuth() {
  const { user, session, loading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [cookies, setCookies] = useState<string>('')

  useEffect(() => {
    // Get detailed session info
    const getSessionInfo = async () => {
      const { data, error } = await supabase.auth.getSession()
      setSessionInfo({ data, error })
    }
    
    getSessionInfo()
    
    // Get cookies
    setCookies(document.cookie)
  }, [])

  const testRedirect = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Auth Debug Page</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Auth Context State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? user.email : 'None'}</p>
              <p><strong>Session:</strong> {session ? 'Present' : 'None'}</p>
              <p><strong>Session User:</strong> {session?.user?.email || 'None'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct Supabase Session</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {cookies || 'No cookies found'}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button onClick={testRedirect}>
                Test Redirect to /dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/signin'}
              >
                Go to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
