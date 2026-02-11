import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 LOGOUT API - Processing logout request');
    
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    
    // Revocă refresh token în auth server dacă există
    if (refreshToken) {
      try {
        await fetch('http://localhost:4000/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
        console.log('🔍 LOGOUT API - Refresh token revoked successfully');
      } catch (error) {
        console.error('🔍 LOGOUT API - Error revoking refresh token:', error);
      }
    }
    
    // Ștergem cookie-urile cu expirare în trecut pentru a le șterge efectiv
    cookieStore.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Șterge imediat
      path: '/',
    });
    
    cookieStore.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Șterge imediat
      path: '/',
    });
    
    // Ștergem și cookie-urile Next.js
    cookieStore.delete('_next-auth.csrf-token');
    cookieStore.delete('_next-auth.session-token');
    cookieStore.delete('__Secure-next-auth.session-token');
    
    console.log('🔍 LOGOUT API - All cookies deleted successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Logout successful' 
    });
    
  } catch (error) {
    console.error('🔍 LOGOUT API - Error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
