'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugAuthPage() {
  const { user, session, loading } = useAuth()
  const [supabaseSession, setSupabaseSession] = useState<any>(null)
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      setSupabaseSession({ data, error })
    }
    
    checkSession()
    
    // Check environment variables
    setEnvVars({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      nodeEnv: process.env.NODE_ENV
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication Debug</h1>
          <p className="text-lg text-gray-600">Debugging authentication issues</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Auth Context State */}
          <Card>
            <CardHeader>
              <CardTitle>Auth Context State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>User:</strong> {user ? 'Logged In' : 'Not Logged In'}
              </div>
              <div>
                <strong>Session:</strong> {session ? 'Active' : 'No Session'}
              </div>
              {user && (
                <div className="text-sm text-gray-600">
                  <div>Email: {user.email}</div>
                  <div>ID: {user.id}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supabase Session */}
          <Card>
            <CardHeader>
              <CardTitle>Supabase Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Session Data:</strong> {supabaseSession?.data?.session ? 'Present' : 'None'}
              </div>
              <div>
                <strong>Error:</strong> {supabaseSession?.error ? supabaseSession.error.message : 'None'}
              </div>
              {supabaseSession?.data?.session && (
                <div className="text-sm text-gray-600">
                  <div>User ID: {supabaseSession.data.session.user.id}</div>
                  <div>Email: {supabaseSession.data.session.user.email}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Supabase URL:</strong> {envVars.supabaseUrl || 'Not Set'}</div>
              <div><strong>Supabase Key:</strong> {envVars.supabaseKey}</div>
              <div><strong>API URL:</strong> {envVars.apiUrl || 'Not Set'}</div>
              <div><strong>Node Env:</strong> {envVars.nodeEnv}</div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => window.location.href = '/signin'}
                className="w-full"
              >
                Go to Sign In
              </Button>
              <Button 
                onClick={() => window.location.href = '/upload'}
                className="w-full"
                variant="outline"
              >
                Go to Upload
              </Button>
              {user && (
                <Button 
                  onClick={handleSignOut}
                  className="w-full"
                  variant="destructive"
                >
                  Sign Out
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Raw Data */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify({
                authContext: { user, session, loading },
                supabaseSession,
                envVars
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
