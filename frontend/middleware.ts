import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  // Create Supabase client for middleware
  const response = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient({ req: request, res: response })
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
