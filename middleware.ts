import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthToken } from '@/lib/cookie-utils';

console.log("🔍 MIDDLEWARE FILE LOADED - This should appear on startup");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log("🔍 Middleware EXECUTING - Request for:", pathname);

  // Verificăm dacă ruta este protejată
  const protectedRoutes = ['/admin', '/medic', '/pacient'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    console.log(`🔍 Middleware - PROTECTED ROUTE DETECTED: ${pathname}`);
    
    // Use utility function to get auth token
    const token = await getAuthToken();
    console.log("🔍 Middleware - Token exists:", !!token);
    console.log("🔍 Middleware - Raw token value:", token?.substring(0, 50) + "...");
    
    if (!token) {
      console.log("🔍 Middleware - NO TOKEN - Redirecting to login");
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      // Verificăm token-ul la auth server
      console.log("🔍 Middleware - Verifying token...");
      const verifyResponse = await fetch('http://localhost:4000/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token }),
        signal: AbortSignal.timeout(5000),
      });

      console.log("🔍 Middleware - Verify response status:", verifyResponse.status);

      if (!verifyResponse.ok) {
        console.log("🔍 Middleware - INVALID TOKEN - Redirecting to login");
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
      }

      const response = await verifyResponse.json();
      console.log("🔍 Middleware - Verify response:", response);

      // Verificăm rolul utilizatorului în funcție de ruta
      const userData = response.status === 200 ? response.body : null;
      
      if (!userData) {
        console.log("🔍 Middleware - NO USER DATA - Redirecting to login");
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Verificăm permisiunile pe bază de rol
      if (pathname.startsWith('/admin') && userData.role !== 'admin') {
        console.log("🔍 Middleware - NOT ADMIN - Redirecting to home");
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      if (pathname.startsWith('/medic') && userData.role !== 'medic') {
        console.log("🔍 Middleware - NOT MEDIC - Redirecting to home");
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      if (pathname.startsWith('/pacient') && userData.role !== 'pacient') {
        console.log("🔍 Middleware - NOT PACIENT - Redirecting to home");
        return NextResponse.redirect(new URL('/', request.url));
      }

      console.log(`🔍 Middleware - ${userData.role.toUpperCase()} ACCESS GRANTED`);
      
    } catch (error) {
      console.error('🔍 Middleware error:', error);
      console.log("🔍 Middleware - ERROR - Redirecting to login");
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Continuăm cu request-ul normal
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/medic', '/medic/:path*', '/pacient', '/pacient/:path*']
};
