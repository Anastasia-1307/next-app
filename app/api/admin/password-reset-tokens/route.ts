import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/cookie-utils';

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Next.js API: Password reset tokens request received");
    
    // Try to get token from Authorization header first
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('🔍 Next.js API: Authorization header token:', token?.substring(0, 50) + '...');
    
    // If no Authorization header, try to get from cookies
    if (!token) {
      console.log('🔍 Next.js API: No Authorization header, checking cookies...');
      const cookieToken = request.cookies.get('auth_token')?.value;
      console.log('🔍 Next.js API: Cookie token:', cookieToken?.substring(0, 50) + '...');
      token = cookieToken;
    }
    
    console.log('🔍 Next.js API: Final token:', token?.substring(0, 50) + '...');
    console.log('🔍 Next.js API: Token source:', request.headers.get('authorization') ? 'Authorization header' : 'Cookies');
    
    if (!token) {
      console.log('🔍 Next.js API: No token found, returning 401');
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }
    
    // Fetch password reset tokens from auth-server with proper auth
    const response = await fetch('http://localhost:4000/admin/password-reset-tokens', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    console.log("🔍 Next.js API: Auth-server response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔍 Next.js API: Auth-server error response:", errorText);
      throw new Error(`Failed to fetch password reset tokens: ${response.status}`);
    }

    const data = await response.json();
    console.log("🔍 Next.js API: Successfully fetched data:", !!data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("🔍 Next.js API: Error fetching password reset tokens:", error);
    console.error("🔍 Next.js API: Error details:", error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { error: 'Failed to fetch password reset tokens' },
      { status: 500 }
    );
  }
}
