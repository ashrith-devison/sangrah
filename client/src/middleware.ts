import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route patterns
const authRoutes = ['/login', '/signup', '/forgotpassword', '/changepassword'];
const userProtectedRoutes = ['/user'];
const adminProtectedRoutes = ['/admin'];
const publicRoutes = ['/', '/about', '/contact'];

// Helper function to verify JWT token
async function verifyToken(token: string): Promise<{ valid: boolean; role?: string; userId?: string }> {
  try {
    // In a real application, you would verify the JWT with your secret
    // For now, we'll do basic validation
    if (!token || token === 'null' || token === 'undefined') {
      return { valid: false };
    }

    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false };
    }

    // Decode payload (in production, verify signature too)
    try {
      const payload = JSON.parse(atob(parts[1]));
      
      console.log('🔍 JWT Payload decoded:', payload);
      
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        console.log('⏰ Token expired');
        return { valid: false };
      }

      const role = payload.role || payload.user_role || 'user';
      console.log('👤 Role from JWT:', role);

      return {
        valid: true,
        role: role,
        userId: payload.userId || payload.id || payload.user_id
      };
    } catch (error) {
      console.error('❌ JWT payload decode error:', error);
      return { valid: false };
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  console.log(`🔍 Middleware checking route: ${pathname}`);
  console.log(`🎟️ Token found: ${token ? 'Yes' : 'No'}`);

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Verify token if present
  const { valid: isValidToken, role } = token ? await verifyToken(token) : { valid: false };
  
  console.log(`🔐 Token valid: ${isValidToken}`);
  console.log(`👤 User role: ${role || 'None'}`);
  console.log(`🎟️ Raw token (first 20 chars): ${token ? token.substring(0, 20) + '...' : 'None'}`);

  // Handle auth routes (login, signup, etc.)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    console.log(`🔐 Checking auth route: ${pathname}`);
    
    // If user is already authenticated, redirect to appropriate dashboard
    if (isValidToken) {
      console.log(`✅ User already authenticated, redirecting from ${pathname}`);
      const redirectUrl = role === 'admin' ? '/admin/dashboard' : '/user/home';
      console.log(`🔄 Role-based redirect: ${role} -> ${redirectUrl}`);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    
    console.log(`🔓 Allowing access to auth route: ${pathname}`);
    // Allow access to auth routes for unauthenticated users
    return NextResponse.next();
  }

  // Handle admin protected routes
  if (adminProtectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isValidToken) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (role !== 'admin') {
      // Redirect non-admin users to their dashboard
      return NextResponse.redirect(new URL('/user/home', request.url));
    }
    
    return NextResponse.next();
  }

  // Handle user protected routes
  if (userProtectedRoutes.some(route => pathname.startsWith(route))) {
    console.log(`🔒 Checking user protected route: ${pathname}`);
    
    if (!isValidToken) {
      console.log(`❌ No valid token, redirecting to login`);
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log(`✅ Access granted to user route: ${pathname}`);
    return NextResponse.next();
  }

  // Handle public routes and root
  if (pathname === '/') {
    // Redirect authenticated users to their appropriate dashboard
    if (isValidToken) {
      console.log(`🏠 Root redirect - User role: ${role}`);
      const redirectUrl = role === 'admin' ? '/admin/dashboard' : '/user/home';
      console.log(`🔄 Root redirect: ${role} -> ${redirectUrl}`);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    // Allow access to landing page for unauthenticated users
    return NextResponse.next();
  }

  // Allow access to other public routes
  return NextResponse.next();
}

// Configure which routes should run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};