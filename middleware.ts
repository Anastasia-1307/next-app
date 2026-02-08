import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

console.log("🔍 MIDDLEWARE FILE LOADED - This should appear on startup");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log("🔍 Middleware EXECUTING - Request for:", pathname);

  // Protejăm doar ruta /admin
  if (pathname.startsWith('/admin')) {
    console.log("🔍 Middleware - PROTECTED ROUTE DETECTED: /admin");
    
    // Verificăm dacă există token în cookies
    const token = request.cookies.get('auth_token')?.value;
    console.log("🔍 Middleware - Token exists:", !!token);
    
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

      // Verificăm dacă utilizatorul este admin
      const userData = response.status === 200 ? response.body : null;
      
      if (!userData || userData.role !== 'admin') {
        console.log("🔍 Middleware - NOT ADMIN - Redirecting to home");
        return NextResponse.redirect(new URL('/', request.url));
      }

      console.log("🔍 Middleware - ADMIN ACCESS GRANTED");
      
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
  matcher: ['/admin', '/admin/:path*']
};
