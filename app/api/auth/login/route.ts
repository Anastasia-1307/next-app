import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Server Login - Authenticating user:', email);
    
    // Authenticate with auth server
    const authResponse = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('❌ Server Login - Authentication failed:', errorText);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();
    console.log('✅ Server Login - Authentication successful');

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    console.log('✅ Server Login - Cookie set successfully');

    return NextResponse.json({
      success: true,
      userData: {
        email: authData.user.email,
        name: authData.user.name,
        role: authData.user.role,
      }
    });

  } catch (error) {
    console.error('❌ Server Login - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
