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
        
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage('Authentication failed')
          setTimeout(() => router.push('/signin?error=auth_failed'), 2000)
          return
        }

        if (data.session) {
          console.log('Session found, user authenticated')
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          // Wait a moment to ensure session is properly set
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Get redirect URL or default to upload
          const redirectTo = searchParams?.get('redirect') || '/upload'
          console.log('Redirecting to:', redirectTo)
          
          // Use router.replace to avoid adding to history
          router.replace(redirectTo)
        } else {
          console.log('No session found after callback')
          setStatus('error')
          setMessage('No session established')
          setTimeout(() => router.push('/signin'), 2000)
        }
      } catch (error) {
        console.error('Unexpected auth callback error:', error)
        setStatus('error')
        setMessage('Unexpected error occurred')
        setTimeout(() => router.push('/signin'), 2000)
      }
    }

    // Small delay to ensure URL parameters are ready
    const timer = setTimeout(handleAuthCallback, 100)
    return () => clearTimeout(timer)
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
