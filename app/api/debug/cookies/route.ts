import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthToken } from '@/lib/cookie-utils';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG COOKIES - Starting debug...');
    
    // Get all cookies the old way
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Try our utility function
    const token = await getAuthToken();
    
    // Get request headers
    const headers = Object.fromEntries(request.headers.entries());
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      totalCookies: allCookies.length,
      cookieNames: allCookies.map(c => c.name),
      cookieDetails: allCookies.map(c => ({
        name: c.name,
        value: c.value ? c.value.substring(0, 50) + '...' : 'null',
        length: c.value?.length || 0
      })),
      tokenFound: !!token,
      tokenPreview: token ? token.substring(0, 50) + '...' : null,
      requestHeaders: {
        cookie: headers.cookie,
        authorization: headers.authorization,
        userAgent: headers['user-agent'],
        referer: headers.referer
      }
    };
    
    console.log('🔍 DEBUG COOKIES - Debug info:', debugInfo);
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('🔍 DEBUG COOKIES - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
