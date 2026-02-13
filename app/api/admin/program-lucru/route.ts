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

    // Forward request to resource server
    const response = await fetch('http://localhost:5000/api/admin/program-lucru', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔍 Next.js API: Resource server error response:", errorText);
      throw new Error(`Failed to fetch program lucru: ${response.status}`);
    }

    const data = await response.json();
    console.log("🔍 Next.js API: Successfully fetched program lucru data:", data);
    
    // Server-ul returnează direct array-ul, nu obiect cu programLucru
    const programLucruArray = Array.isArray(data) ? data : data.programLucru || [];
    console.log("🔍 Next.js API: ProgramLucru array:", programLucruArray);
    console.log("🔍 Next.js API: ProgramLucru array length:", programLucruArray.length);
    
    return NextResponse.json(programLucruArray);

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
    
    console.log("🔍 Next.js API: About to send request to resource server...");
    
    console.log("🔍 Next.js API: Fetch URL:", 'http://localhost:5000/api/admin/program-lucru');
    console.log("🔍 Next.js API: Method: POST");
    console.log("🔍 Next.js API: Headers:", {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
    console.log("🔍 Next.js API: Body:", JSON.stringify(body));
    
    try {
      // Create program lucru in resource server
      const response = await fetch('http://localhost:5000/api/admin/program-lucru', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      console.log("🔍 Next.js API: Request sent to resource server, waiting for response...");
      console.log("🔍 Next.js API: Resource server response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔍 Next.js API: Resource server error response:", errorText);
        throw new Error(`Failed to create program lucru: ${response.status}`);
      }

      const data = await response.json();
      console.log("🔍 Next.js API: Resource server response data:", data);
      
      // Check if response contains error
      if (data.error) {
        console.error("🔍 Next.js API: Resource server returned error:", data.error);
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
        { error: 'Failed to connect to resource server' },
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
