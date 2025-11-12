import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/', 
    '/login-user', 
    '/login-tenant', 
    '/register-user', 
    '/register-tenant', 
    '/verify-email', 
    '/reset-password',
    '/confirm-reset-password',
    '/properties',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/api',
    '/_next',
    '/favicon.ico',
    '/uploads'
  ];
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get the session token from cookies
  const sessionToken = request.cookies.get('next-auth.session-token') || 
                       request.cookies.get('__Secure-next-auth.session-token');

  // Protected routes
  const userRoutes = ['/profile', '/transactions'];
  const tenantRoutes = ['/tenant'];
  
  const isUserRoute = userRoutes.some(route => pathname.startsWith(route));
  const isTenantRoute = tenantRoutes.some(route => pathname.startsWith(route));

  // If no session and trying to access protected route
  if (!sessionToken && (isUserRoute || isTenantRoute)) {
    const loginUrl = isTenantRoute ? '/login-tenant' : '/login-user';
    const url = new URL(loginUrl, request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If has session, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};