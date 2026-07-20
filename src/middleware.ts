import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, AUTH_COOKIE_NAME } from '@/lib/auth';

// Public routes that don't require authentication
const publicPaths = [
  '/login',
  '/api/login',
  // Public frontend pages
  '/',
  '/about',
  '/contact',
  '/services',
  '/case-studies',
];

// API routes that should be protected
const protectedApiPrefix = '/api/';
// API routes that are public (read-only for frontend)
const publicApiPaths = [
  '/api/login',
  '/api/banners',
  '/api/services',
  '/api/casestudies',
  '/api/members',
  '/api/testimonials',
  '/api/categories',
  '/api/menus',
  '/api/stats',
  '/api/posts',
  '/api/products',
  '/api/type',
];

function isPublicApiGET(req: NextRequest, pathname: string): boolean {
  // Allow GET requests to public API paths for frontend
  if (req.method === 'GET' && publicApiPaths.some(p => pathname.startsWith(p))) {
    return true;
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Allow public pages
  if (publicPaths.some(p => pathname === p || (p !== '/' && pathname.startsWith(p + '/')))) {
    return NextResponse.next();
  }

  // Allow public GET API calls (frontend needs to read data)
  if (isPublicApiGET(req, pathname)) {
    return NextResponse.next();
  }

  // Check if route needs protection (admin pages + API mutations)
  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedApi = pathname.startsWith(protectedApiPrefix) && req.method !== 'GET';
  const isUploadApi = pathname.startsWith('/api/upload');

  if (isAdminRoute || isProtectedApi || isUploadApi) {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      if (isAdminRoute) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.json(
        { success: false, message: 'Chưa đăng nhập' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      if (isAdminRoute) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        // Clear invalid cookie
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete(AUTH_COOKIE_NAME);
        return response;
      }
      return NextResponse.json(
        { success: false, message: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      );
    }

    // Attach user info to headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-email', payload.email);
    response.headers.set('x-user-name', payload.name);
    response.headers.set('x-user-role', payload.role);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match admin pages and API routes
    '/admin/:path*',
    '/api/:path*',
  ],
};
