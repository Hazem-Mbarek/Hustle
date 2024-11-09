import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register'];

export function middleware(request: NextRequest) {
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route
  );

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for auth token
  const authToken = request.cookies.get('auth_token');

  // If no token found, redirect to login
  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes should be protected
export const config = {
  matcher: [
    '/job/:path*',
    '/profile/:path*',
    '/api/job/:path*',
    '/api/user/:path*',
  ]
}; 