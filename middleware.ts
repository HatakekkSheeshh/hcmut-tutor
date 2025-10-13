import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!token && !request.nextUrl.pathname.startsWith('/api/auth/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/student') || 
      request.nextUrl.pathname.startsWith('/tutor') ||
      request.nextUrl.pathname.startsWith('/management')) {
    if (!token) {
      return NextResponse.redirect(new URL('/common', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/student/:path*', '/tutor/:path*', '/management/:path*']
};
