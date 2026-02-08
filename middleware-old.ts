import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

console.log("🔍 Middleware file loaded - this should appear on startup");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("🔍 Middleware EXECUTING - Request received for pathname:", pathname);
  console.log("🔍 Middleware - Request method:", request.method);
  console.log("🔍 Middleware - Request URL:", request.url);

  // Protejăm rutele de admin, medic și pacient
  const protectedRoutes = ['/admin', '/medic', '/pacient'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  console.log("🔍 Middleware - Is protected route:", isProtectedRoute);
  console.log("🔍 Middleware - Protected routes:", protectedRoutes);

  if (!isProtectedRoute) {
    // Nu este rută protejată, continuăm normal
    console.log("🔍 Middleware - Not protected, continuing normally");
    return NextResponse.next();
  }

  // Verificăm dacă există token în cookies
  const token = request.cookies.get('auth_token')?.value;
  console.log("🔍 Middleware - Token exists:", !!token);
  console.log("🔍 Middleware - All cookies:", request.cookies.getAll());

  if (!token) {
    // Redirecționăm către login dacă nu există token
    console.log("🔍 Middleware - No token, redirecting to login");
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verificăm validitatea tokenului
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
      // Token invalid, redirecționăm către login
      console.log("🔍 Middleware - Invalid token, redirecting to login");
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_token');
      return response;
    }

    const response = await verifyResponse.json();
    console.log("🔍 Middleware - Verify response:", response);

    // Verificăm dacă utilizatorul are acces la ruta respectivă
    const userData = response.status === 200 ? response.body : null;
    
    if (!userData) {
      console.log("🔍 Middleware - No user data in response");
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith('/admin') && userData.role !== 'admin') {
      // Nu este admin, redirecționăm către home
      console.log("🔍 Middleware - User not admin, redirecting to home");
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }

    if (pathname.startsWith('/medic') && userData.role !== 'medic') {
      // Nu este medic, redirecționăm către home
      console.log("🔍 Middleware - User not medic, redirecting to home");
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }

    if (pathname.startsWith('/pacient') && userData.role !== 'pacient') {
      // Nu este pacient, redirecționăm către home
      console.log("🔍 Middleware - User not pacient, redirecting to home");
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }

    console.log("🔍 Middleware - Access granted, continuing normally");

  } catch (error) {
    console.error('🔍 Middleware error:', error);
    // Eroare la verificare, redirecționăm către login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }

  // Continuăm cu request-ul normal
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/medic/:path*', '/pacient/:path*']
};
