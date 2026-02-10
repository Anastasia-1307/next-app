import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/cookie-utils';

// GET - Fetch all program lucru
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Next.js API: Program Lucru GET request received");
    
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
    const response = await fetch('http://localhost:4000/admin/program-lucru', {
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
      throw new Error(`Failed to fetch program lucru: ${response.status}`);
    }

    const data = await response.json();
    console.log("🔍 Next.js API: Successfully fetched program lucru data:", data);
    console.log("🔍 Next.js API: ProgramLucru array:", data.programLucru);
    console.log("🔍 Next.js API: ProgramLucru array length:", data.programLucru?.length || 0);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('🔍 Next.js API: API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new program lucru
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Next.js API: Program Lucru POST request received");
    
    // Get token
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      const cookieToken = request.cookies.get('auth_token')?.value;
      token = cookieToken;
    }
    
    console.log("🔍 Next.js API: POST - Token found:", !!token);
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log("🔍 Next.js API: Creating program lucru with data:", body);
    
    console.log("🔍 Next.js API: About to send request to auth-server...");
    
    console.log("🔍 Next.js API: Fetch URL:", 'http://localhost:4000/admin/program-lucru');
    console.log("🔍 Next.js API: Method: POST");
    console.log("🔍 Next.js API: Headers:", {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
    console.log("🔍 Next.js API: Body:", JSON.stringify(body));
    
    try {
      // Create program lucru in auth-server
      const response = await fetch('http://localhost:4000/admin/program-lucru', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      console.log("🔍 Next.js API: Request sent to auth-server, waiting for response...");
      console.log("🔍 Next.js API: Auth-server response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔍 Next.js API: Auth-server error response:", errorText);
        throw new Error(`Failed to create program lucru: ${response.status}`);
      }

      const data = await response.json();
      console.log("🔍 Next.js API: Auth-server response data:", data);
      
      // Check if response contains error
      if (data.error) {
        console.error("🔍 Next.js API: Auth-server returned error:", data.error);
        return NextResponse.json(
          { error: data.error },
          { status: 400 }
        );
      }
      
      console.log("🔍 Next.js API: Successfully created program lucru");
      
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("🔍 Next.js API: Fetch error:", fetchError);
      console.error("🔍 Next.js API: Fetch error details:", fetchError instanceof Error ? fetchError.message : 'Unknown error');
      
      return NextResponse.json(
        { error: 'Failed to connect to auth-server' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("🔍 Next.js API: Error creating program lucru:", error);
    
    return NextResponse.json(
      { error: 'Failed to create program lucru' },
      { status: 500 }
    );
  }
}

// PUT - Update program lucru
export async function PUT(request: NextRequest) {
  try {
    console.log("🔍 Next.js API: Program Lucru PUT request received");
    
    // Get token
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
    
    const body = await request.json();
    const id = request.url.split('/').pop();
    
    console.log("🔍 Next.js API: Updating program lucru ID:", id, "with data:", body);
    
    // Update program lucru in auth-server
    const response = await fetch(`http://localhost:4000/admin/program-lucru/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔍 Next.js API: Auth-server error response:", errorText);
      throw new Error(`Failed to update program lucru: ${response.status}`);
    }

    const data = await response.json();
    console.log("🔍 Next.js API: Successfully updated program lucru");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("🔍 Next.js API: Error updating program lucru:", error);
    
    return NextResponse.json(
      { error: 'Failed to update program lucru' },
      { status: 500 }
    );
  }
}

// DELETE - Delete program lucru
export async function DELETE(request: NextRequest) {
  try {
    console.log("🔍 Next.js API: Program Lucru DELETE request received");
    
    // Get token
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
    
    const id = request.url.split('/').pop();
    console.log("🔍 Next.js API: Deleting program lucru ID:", id);
    
    // Delete program lucru in auth-server
    const response = await fetch(`http://localhost:4000/admin/program-lucru/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔍 Next.js API: Auth-server error response:", errorText);
      throw new Error(`Failed to delete program lucru: ${response.status}`);
    }

    console.log("🔍 Next.js API: Successfully deleted program lucru");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔍 Next.js API: Error deleting program lucru:", error);
    
    return NextResponse.json(
      { error: 'Failed to delete program lucru' },
      { status: 500 }
    );
  }
}
