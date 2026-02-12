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

    // Forward request to resource server with Authorization header
    const response = await fetch('http://localhost:5000/api/admin/user-logs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error('Resource server returned non-JSON response:', errorText);
      return NextResponse.json(
        { error: 'Resource server error', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Extract logs from auth server response structure
    return NextResponse.json({ logs: data.logs }, { status: response.status });

  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
