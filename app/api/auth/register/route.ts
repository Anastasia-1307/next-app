import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Server Register - Creating user:', email);
    
    // Register with auth server
    const authResponse = await fetch('http://localhost:4000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('❌ Server Register - Registration failed:', errorText);
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();
    console.log('✅ Server Register - Registration successful');

    // Set secure HTTP-only cookies
    const cookieStore = await cookies();
    
    // Access token cookie
    cookieStore.set('auth_token', authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    // Refresh token cookie (dacă există)
    if (authData.refreshToken) {
      cookieStore.set('refresh_token', authData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 zile
        path: '/',
      });
    }

    console.log('✅ Server Register - Cookies set successfully');

    return NextResponse.json({
      success: true,
      userData: {
        email: authData.user.email,
        name: authData.user.username,
        role: authData.user.role,
      }
    });

  } catch (error) {
    console.error('❌ Server Register - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
