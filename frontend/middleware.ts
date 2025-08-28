  import { NextResponse, type NextRequest } from 'next/server';
  import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

  export async function middleware(request: NextRequest) {
    // DEBUG: Log incoming request URL and cookies
    console.log('[MIDDLEWARE] Incoming request:', request.url);
    console.log('[MIDDLEWARE] Cookies:', request.cookies);

    const response = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res: response });
    const { data: { session } } = await supabase.auth.getSession();
    // DEBUG: Log session object
    console.log('[MIDDLEWARE] Supabase session:', session);

    // Only redirect unauthenticated users from protected routes
    const protectedRoutes = ['/upload', '/dashboard', '/settings'];
    const isProtectedRoute = protectedRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );
    if (isProtectedRoute && !session) {
      console.warn('[MIDDLEWARE] No session found for protected route, redirecting to /signin');
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    return response;
  }

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
