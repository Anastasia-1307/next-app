import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protejăm doar rutele de admin
  if (pathname.startsWith('/admin')) {
    // Verificăm dacă există token în cookies
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // Redirecționăm către login dacă nu există token
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verificăm validitatea tokenului și rolul de admin
      const verifyResponse = await fetch('http://localhost:4000/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });

      if (!verifyResponse.ok) {
        // Token invalid, redirecționăm către login
        const loginUrl = new URL('/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('auth_token');
        return response;
      }

      const userData = await verifyResponse.json();

      // Verificăm dacă utilizatorul are rol de admin
      if (userData.role !== 'admin') {
        // Nu este admin, redirecționăm către home
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
      }

    } catch (error) {
      console.error('Middleware error:', error);
      // Eroare la verificare, redirecționăm către login
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Continuăm cu request-ul normal
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
