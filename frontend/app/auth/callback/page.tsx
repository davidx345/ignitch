'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started')
        console.log('Current URL:', window.location.href)
        
        // Handle the hash fragment from OAuth callback
        const hash = window.location.hash.substring(1)
        console.log('Hash fragment:', hash)
        
        if (hash) {
          const params = new URLSearchParams(hash)
          const accessToken = params.get('access_token')
          const refreshToken = params.get('refresh_token')
          
          console.log('Access token present:', !!accessToken)
          console.log('Refresh token present:', !!refreshToken)
          
          // If we have tokens in the hash, set the session
          if (accessToken && refreshToken) {
            console.log('Setting session with tokens')
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            
            if (error) {
              console.error('Session set error:', error)
              setStatus('error')
              setMessage('Failed to set session')
              setTimeout(() => router.push('/signin?error=session_set_failed'), 2000)
              return
            }
            
            if (data.session) {
              console.log('Session set successfully')
              setStatus('success')
              setMessage('Authentication successful! Redirecting...')
              
              // Successful authentication - check for redirect parameter
              const redirectTo = searchParams.get('redirect') || '/upload'
              console.log('Redirecting to:', redirectTo)
              
              setTimeout(() => router.push(redirectTo), 1000)
              return
            }
          }
        }
        
        // Fallback: check existing session
        console.log('Checking existing session')
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage('Failed to get session')
          setTimeout(() => router.push('/signin?error=auth_callback_failed'), 2000)
          return
        }

        if (data.session) {
          console.log('Existing session found')
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // Successful authentication - check for redirect parameter
          const redirectTo = searchParams.get('redirect') || '/upload'
          console.log('Redirecting to:', redirectTo)
          
          setTimeout(() => router.push(redirectTo), 1000)
        } else {
          console.log('No session found')
          setStatus('error')
          setMessage('No session found')
          setTimeout(() => router.push('/signin'), 2000)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('Unexpected error occurred')
        setTimeout(() => router.push('/signin?error=unexpected_error'), 2000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Completing authentication...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-8 h-8 bg-green-500 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 text-green-600">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-8 h-8 bg-red-500 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="mt-4 text-red-600">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}
