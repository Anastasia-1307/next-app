import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log("🔍 SIMPLE MIDDLEWARE - Request for:", request.nextUrl.pathname);
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log("🔍 SIMPLE MIDDLEWARE - Blocking /admin route");
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*']
};
