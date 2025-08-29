import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] Incoming request:', request.url);

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
    // Refresh session to ensure it's up to date
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[MIDDLEWARE] Session error:', error);
    }
    
    console.log('[MIDDLEWARE] Session found:', !!session);

    // Only redirect unauthenticated users from protected routes
    const protectedRoutes = ['/upload', '/dashboard', '/settings'];
    const isProtectedRoute = protectedRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );
    
    if (isProtectedRoute && !session) {
      console.warn('[MIDDLEWARE] No session found for protected route, redirecting to /signin');
      const redirectUrl = new URL('/signin', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
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
