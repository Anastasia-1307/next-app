import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 LOGOUT API - Processing logout request');
    
    // Ștergem cookie-ul auth_token
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    
    console.log('🔍 LOGOUT API - Cookie deleted successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Logout successful' 
    });
    
  } catch (error) {
    console.error('🔍 LOGOUT API - Error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
