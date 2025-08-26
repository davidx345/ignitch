import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl === 'https://placeholder.supabase.co' || 
      supabaseKey === 'placeholder_key') {
    console.log('Middleware: Supabase not configured, skipping auth')
    return response
  }

  // Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on the response
          response.cookies.set({
            name,
            value,
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
            httpOnly: false,
            maxAge: 60 * 60 * 24 * 7, // 7 days
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie from the response
          response.cookies.set({
            name,
            value: '',
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
            httpOnly: false,
            maxAge: 0,
          })
        },
      },
    }
  )

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Debug logging
  console.log('Middleware:', {
    path: request.nextUrl.pathname,
    hasSession: !!session,
    userId: session?.user?.id,
    userEmail: session?.user?.email
  })

  // Define route patterns
  const protectedRoutes = ['/upload', '/dashboard', '/settings']
  const authRoutes = ['/signin', '/signup']
  
  // Skip middleware for auth callback routes, API routes, and static files
  if (request.nextUrl.pathname.startsWith('/auth/') || 
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/favicon.ico')) {
    console.log('Middleware: Skipping for path:', request.nextUrl.pathname)
    return response
  }
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  console.log('Middleware: Route analysis:', {
    isProtectedRoute,
    isAuthRoute,
    path: request.nextUrl.pathname
  })

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session) {
    console.log('Middleware: Redirecting to signin - no session for protected route')
    const redirectUrl = new URL('/signin', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth routes
  if (isAuthRoute && session) {
    console.log('Middleware: Redirecting to upload - authenticated user on auth route')
    return NextResponse.redirect(new URL('/upload', request.url))
  }

  console.log('Middleware: Allowing request to continue')
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
