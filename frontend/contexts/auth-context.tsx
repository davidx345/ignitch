'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: { fullName?: string }) => Promise<{ data?: any; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ data?: any; error: AuthError | null }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ data?: any; error: AuthError | null }>
  signInWithGitHub: () => Promise<{ data?: any; error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only initialize auth if Supabase is configured
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metadata?: { fullName?: string }) => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Supabase not configured' } as AuthError }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata ? { full_name: metadata.fullName } : {}
      }
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Supabase not configured' } as AuthError }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) return
    await supabase.auth.signOut()
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Supabase not configured' } as AuthError }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  const signInWithGitHub = async () => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: 'Supabase not configured' } as AuthError }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
