import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  // DEBUG: Log incoming request URL
  console.log('[MIDDLEWARE] Incoming request:', request.url);

  // Skip middleware for auth routes, API routes, and static files
  if (request.nextUrl.pathname.startsWith('/auth/') || 
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname === '/favicon.ico') {
    console.log('[MIDDLEWARE] Skipping middleware for:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  // Create response and Supabase client
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[MIDDLEWARE] Session found:', !!session);

    // Only redirect unauthenticated users from protected routes
    const protectedRoutes = ['/upload', '/dashboard', '/settings'];
    const isProtectedRoute = protectedRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );
    
    if (isProtectedRoute && !session) {
      console.warn('[MIDDLEWARE] No session found for protected route, redirecting to /signin');
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    console.log('[MIDDLEWARE] Allowing request to continue');
    return response;
  } catch (error) {
    console.error('[MIDDLEWARE] Error checking session:', error);
    // On error, allow the request to continue
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}
