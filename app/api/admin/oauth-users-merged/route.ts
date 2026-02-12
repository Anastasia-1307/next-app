import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
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

    // Forward request to resource server - use same endpoint as regular users
    const response = await fetch('http://localhost:5000/api/admin/oauth-users-merged', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('🔍 OAuth Users Merged API Response:', data);
    
    // Extract OAuth users from the combined users response
    const allUsers = data.users || [];
    const oauthUsers = allUsers.filter((user: any) => 
      user.password_hash === 'oauth_placeholder' || 
      user.userType === 'oauth' ||
      (user.email && user.email.includes('oauth'))
    );
    
    return NextResponse.json({ users: oauthUsers }, { status: response.status });

  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
