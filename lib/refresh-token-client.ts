const REFRESH_TOKEN_COOKIE = 'refresh_token';

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

// Client-side functions
export function getRefreshToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === REFRESH_TOKEN_COOKIE) {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}

export function getAccessToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_token') {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}

export async function refreshAccessToken(): Promise<TokenResponse | null> {
  const refreshToken = getRefreshToken();
  
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
      return null;
    }

    const data: TokenResponse = await response.json();
    console.log('🔄 Access token refreshed successfully');

    return data;
  } catch (error) {
    console.error('🔄 Error refreshing access token:', error);
    return null;
  }
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  
  try {
    // Apelează API-ul Next.js care șterge cookie-urile corect
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('🔄 Logout API failed:', response.status, response.statusText);
    } else {
      console.log('🔄 Logout API successful');
    }
  } catch (error) {
    console.error('🔄 Error during logout:', error);
  }
  
  // Ștergem și cookie-urile client-side ca backup
  if (typeof document !== 'undefined') {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = '_next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = '_next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
  
  // Ștergem și datele din sessionStorage
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem("pkce_verifier");
    sessionStorage.removeItem("pkce_challenge");
    
    // Forțăm redirect pentru a curăța orice stare rămasă
    window.location.href = '/login';
  }
}
