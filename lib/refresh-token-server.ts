import { cookies } from 'next/headers';

const REFRESH_TOKEN_COOKIE = 'refresh_token';
const ACCESS_TOKEN_COOKIE = 'auth_token';

export interface TokenResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

// Server-side functions
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

export async function setRefreshToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60, // 30 zile
    path: '/',
  });
}

export async function clearRefreshToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function refreshAccessToken(): Promise<TokenResponse | null> {
  const refreshToken = await getRefreshToken();
  
  if (!refreshToken) {
    console.log('🔄 No refresh token found');
    return null;
  }

  try {
    console.log('🔄 Attempting to refresh access token');
    
    const response = await fetch('http://localhost:4000/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('🔄 Refresh token failed:', response.status, response.statusText);
      await clearRefreshToken();
      return null;
    }

    const data: TokenResponse = await response.json();
    console.log('🔄 Access token refreshed successfully');

    // Actualizează refresh token (rotație)
    await setRefreshToken(data.refreshToken);

    return data;
  } catch (error) {
    console.error('🔄 Error refreshing access token:', error);
    await clearRefreshToken();
    return null;
  }
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  
  if (refreshToken) {
    try {
      await fetch('http://localhost:4000/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });
    } catch (error) {
      console.error('🔄 Error during logout:', error);
    }
  }
  
  await clearRefreshToken();
}
