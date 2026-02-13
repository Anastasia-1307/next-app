import { NextRequest, NextResponse } from 'next/server';

// PUT - Update program lucru
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params;
    
    console.log("🔍 Next.js API: Updating program lucru ID:", id, "with data:", body);
    
    // Update program lucru in resource server
    const response = await fetch(`http://localhost:5000/api/admin/program-lucru/${id}`, {
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
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    
    const { id } = await params;
    console.log("🔍 Next.js API: Deleting program lucru ID:", id);
    
    // Delete program lucru in resource server
    const response = await fetch(`http://localhost:5000/api/admin/program-lucru/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    console.log("🔍 Next.js API: Auth-server DELETE response status:", response.status);
    console.log("🔍 Next.js API: Auth-server DELETE response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔍 Next.js API: Auth-server error response:", errorText);
      throw new Error(`Failed to delete program lucru: ${response.status}`);
    }

    const responseText = await response.text();
    console.log("🔍 Next.js API: Auth-server DELETE response body:", responseText);

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
