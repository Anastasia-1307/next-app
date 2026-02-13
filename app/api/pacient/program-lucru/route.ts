import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/cookie-utils';

// GET - Fetch program lucru for pacient (read-only)
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Pacient API: Program Lucru GET request received");

    // Forward request to resource server public endpoint (no auth required)
    const response = await fetch('http://localhost:5000/api/public/program-lucru', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔍 Pacient API: Resource server error response:", errorText);
      return NextResponse.json(
        { error: 'Failed to fetch program lucru', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("🔍 Pacient API: Successfully fetched program lucru data:", data);
    
    // Server-ul returnează direct array-ul, nu obiect cu programLucru
    const programLucruArray = Array.isArray(data) ? data : data.programLucru || [];
    console.log("🔍 Pacient API: ProgramLucru array:", programLucruArray);
    console.log("🔍 Pacient API: ProgramLucru array length:", programLucruArray.length);
    
    return NextResponse.json(programLucruArray);

  } catch (error) {
    console.error('🔍 Pacient API: API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
