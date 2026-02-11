import { NextRequest, NextResponse } from 'next/server';

import { cookies } from 'next/headers';



export async function POST(request: NextRequest) {

  try {

    const { code, code_verifier } = await request.json();



    if (!code || !code_verifier) {

      return NextResponse.json(

        { error: 'Missing required parameters' },

        { status: 400 }

      );

    }



    console.log('🔍 Server OAuth Callback - Exchanging code for token...');

    

    // Exchange code for token with auth server

    const tokenResponse = await fetch('http://localhost:4000/token', {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

      },

      body: JSON.stringify({

        code,

        client_id: 'nextjs_client',

        grant_type: 'authorization_code',

        code_verifier,

      }),

    });



    if (!tokenResponse.ok) {

      const errorText = await tokenResponse.text();

      console.error('❌ Server OAuth Callback - Token exchange failed:', errorText);

      return NextResponse.json(

        { error: 'Token exchange failed' },

        { status: 400 }

      );

    }



    const tokenData = await tokenResponse.json();

    console.log('✅ Server OAuth Callback - Token received');



    // Get user info

    console.log('🔍 Server OAuth Callback - Getting user info...');

    const userResponse = await fetch('http://localhost:4000/me', {

      headers: {

        'Authorization': `Bearer ${tokenData.access_token}`

      }

    });



    if (!userResponse.ok) {

      const errorText = await userResponse.text();

      console.error('❌ Server OAuth Callback - Failed to get user info:', errorText);

      return NextResponse.json(

        { error: 'Failed to get user info' },

        { status: 400 }

      );

    }



    const userData = await userResponse.json();

    console.log('✅ Server OAuth Callback - User data received:', userData);



    // Set secure HTTP-only cookies

    const cookieStore = await cookies();

    // Access token cookie

    cookieStore.set('auth_token', tokenData.access_token, {

      httpOnly: true,

      secure: false, // Disabled for development

      sameSite: 'lax',

      maxAge: 3600, // 1 hour

      path: '/',

    });

    // Refresh token cookie (dacă există)

    if (tokenData.refresh_token) {

      cookieStore.set('refresh_token', tokenData.refresh_token, {

        httpOnly: true,

        secure: false, // Disabled for development

        sameSite: 'lax',

        maxAge: 30 * 24 * 60 * 60, // 30 zile

        path: '/',

      });

      console.log('✅ Server OAuth Callback - Refresh token cookie set successfully');

    }

    console.log('✅ Server OAuth Callback - Access token cookie set successfully');

    console.log('🔍 Cookie details:', {

      name: 'auth_token',

      value: tokenData.access_token.substring(0, 20) + '...',

      httpOnly: true,

      secure: false,

      sameSite: 'lax',

      maxAge: 3600,

      path: '/'

    });



    return NextResponse.json({

      success: true,

      userData: {

        email: userData.email,

        name: userData.name,

        role: userData.role,

      }

    });



  } catch (error) {

    console.error('❌ Server OAuth Callback - Error:', error);

    return NextResponse.json(

      { error: 'Internal server error' },

      { status: 500 }

    );

  }

}

