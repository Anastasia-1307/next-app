import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/cookie-utils';

export async function GET(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no Authorization header, try to get from cookies
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

    // Forward request to resource server
    const response = await fetch('http://localhost:5000/api/admin/specialitati', {
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
      const cookieToken = request.cookies.get('auth_token')?.value;
      token = cookieToken;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Forward request to resource server
    const response = await fetch('http://localhost:5000/api/admin/specialitati', {
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

export async function PUT(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no Authorization header, try to get from cookies
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

    const body = await request.json();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    // Forward request to resource server
    const response = await fetch(`http://localhost:5000/api/admin/specialitati/${id}`, {
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

export async function DELETE(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no Authorization header, try to get from cookies
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

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    // Forward request to resource server
    const response = await fetch(`http://localhost:5000/api/admin/specialitati/${id}`, {
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
