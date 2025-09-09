import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] Incoming request:', request.url);
  console.log('[MIDDLEWARE] Pathname:', request.nextUrl.pathname);

  // Skip middleware for auth routes, API routes, and static files
  if (request.nextUrl.pathname.startsWith('/auth/') || 
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname === '/favicon.ico' ||
      request.nextUrl.pathname === '/signin' ||
      request.nextUrl.pathname === '/signup') {
    console.log('[MIDDLEWARE] Skipping middleware for:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  
  try {
    // Try to get session from cookies first
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[MIDDLEWARE] Session error:', error);
    }
    
    console.log('[MIDDLEWARE] Session found:', !!session);
    console.log('[MIDDLEWARE] Session user:', session?.user?.email);

    // Only redirect unauthenticated users from protected routes
    const protectedRoutes = ['/dashboard', '/settings'];
    const isProtectedRoute = protectedRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );
    
    console.log('[MIDDLEWARE] Is protected route:', isProtectedRoute);
    
    // For now, allow all requests to pass through since session detection is working in the client
    // We'll rely on client-side auth checks instead of middleware
    if (isProtectedRoute && !session) {
      console.log('[MIDDLEWARE] No session found, but allowing request to continue (client-side auth will handle)');
      // Don't redirect - let the client handle authentication
    }
    
    console.log('[MIDDLEWARE] Allowing request to continue');
    return response;
  } catch (error) {
    console.error('[MIDDLEWARE] Error checking session:', error);
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth|signin|signup).*)',
  ],
}
