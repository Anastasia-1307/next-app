import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/cookie-utils';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API ADMIN USERS - GET request received');
    console.log('🔍 API ADMIN USERS - Request URL:', request.url);
    console.log('🔍 API ADMIN USERS - Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Try to get token from Authorization header first
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('🔍 API ADMIN USERS - Authorization header token:', token?.substring(0, 50) + '...');
    
    // If no Authorization header, try to get from cookies
    if (!token) {
      console.log('🔍 API ADMIN USERS - No Authorization header, checking cookies...');
      const cookieToken = request.cookies.get('auth_token')?.value;
      console.log('🔍 API ADMIN USERS - Cookie token:', cookieToken?.substring(0, 50) + '...');
      token = cookieToken;
    }
    
    console.log('🔍 API ADMIN USERS - Final token:', token?.substring(0, 50) + '...');
    console.log('🔍 API ADMIN USERS - Token source:', request.headers.get('authorization') ? 'Authorization header' : 'Cookies');
    
    if (!token) {
      console.log('🔍 API ADMIN USERS - No token found, returning 401');
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    console.log('🔍 API ADMIN USERS - Making request to resource server...');
    console.log('🔍 API ADMIN USERS - Token being sent:', token.substring(0, 50) + '...');
    
    // Forward request to auth server with Authorization header
    const response = await fetch('http://localhost:4000/admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('🔍 API ADMIN USERS - Resource server response status:', response.status);
    console.log('🔍 API ADMIN USERS - Resource server response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('🔍 API ADMIN USERS - Raw response text:', responseText);
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('🔍 API ADMIN USERS - Parsed JSON data:', data);
    } catch (e) {
      console.log('🔍 API ADMIN USERS - Failed to parse as JSON:', e);
      console.error('Resource server returned non-JSON response:', responseText);
      return NextResponse.json(
        { error: 'Resource server error', details: responseText },
        { status: response.status }
      );
    }
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no Authorization header, try to get from cookies
    if (!token) {
      token = request.cookies.get('auth_token')?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Forward request to auth server with Authorization header
    const response = await fetch('http://localhost:4000/admin/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
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
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Try to get token from Authorization header first
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no Authorization header, try to get from cookies
    if (!token) {
      token = request.cookies.get('auth_token')?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Forward request to resource server with Authorization header
    const response = await fetch(`http://localhost:5000/api/admin/users/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
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
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Try to get token from Authorization header first
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no Authorization header, try to get from cookies
    if (!token) {
      token = request.cookies.get('auth_token')?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Forward request to resource server with Authorization header
    const response = await fetch(`http://localhost:5000/api/admin/users/${params.id}`, {
      method: 'DELETE',
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
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
