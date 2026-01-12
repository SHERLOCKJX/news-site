import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Geo-blocking Logic
  // Check common headers used by hosting providers (Vercel, Cloudflare, etc.) to identify country
  const country = request.geo?.country || 
                  request.headers.get('x-vercel-ip-country') || 
                  request.headers.get('cf-ipcountry');

  if (country === 'CN') {
    return new NextResponse('Access Denied', { status: 403 });
  }

  // 2. Protect /admin routes
  if (path.startsWith('/admin')) {
    const authSession = request.cookies.get('auth_session');

    if (!authSession || authSession.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all routes to check geo-blocking, but can exclude static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
