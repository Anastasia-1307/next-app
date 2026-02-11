import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/cookie-utils';

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Next.js API: Admin ME request received");
    
    // Get token from cookies or Authorization header
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      const cookieToken = request.cookies.get('auth_token')?.value;
      token = cookieToken;
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Forward request to auth-server
    const response = await fetch('http://localhost:4000/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔍 Next.js API: Auth-server error response:", errorText);
      throw new Error(`Failed to get admin info: ${response.status}`);
    }

    const data = await response.json();
    console.log("🔍 Next.js API: Successfully fetched admin info:", data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('🔍 Next.js API: API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
