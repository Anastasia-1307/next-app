import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/cookie-utils';

export async function GET(request: NextRequest) {
  try {
    // Get token from server-side cookies
    const token = await getAuthToken();
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Return token to client (for client-side usage)
    return NextResponse.json({ 
      token: token,
      exists: true 
    });

  } catch (error) {
    console.error('Error getting auth token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
