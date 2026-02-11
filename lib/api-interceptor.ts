import { refreshAccessToken, getAccessToken } from './refresh-token-client';

interface FetchOptions extends RequestInit {
  _retryCount?: number;
}

const MAX_RETRIES = 1;

export async function authenticatedFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const retryCount = options._retryCount || 0;
  
  // Adaugă credentials dacă nu sunt specificate
  if (!options.credentials) {
    options.credentials = 'include';
  }

  // Adaugă Authorization header dacă nu există și avem token
  if (!options.headers) {
    options.headers = new Headers();
  } else if (!(options.headers instanceof Headers)) {
    options.headers = new Headers(options.headers);
  }

  const headers = options.headers as Headers;
  
  // Adaugă token-ul doar dacă nu există deja Authorization header
  if (!headers.has('Authorization')) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  console.log(`🔍 Fetch attempt ${retryCount + 1}:`, url, options.method || 'GET');

  try {
    const response = await fetch(url, options);

    // Dacă răspunsul este OK, returnează-l direct
    if (response.ok) {
      return response;
    }

    // Dacă este 401 Unauthorized și nu am mai încercat refresh
    if (response.status === 401 && retryCount < MAX_RETRIES) {
      console.log('🔄 Received 401, attempting token refresh');

      const tokenData = await refreshAccessToken();
      
      if (!tokenData) {
        console.log('🔄 Token refresh failed, redirecting to login');
        // Redirect la login dacă refresh a eșuat
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Authentication failed');
      }

      console.log('🔄 Token refreshed, retrying request');
      
      // Actualizează Authorization header cu noul token
      const newHeaders = new Headers(options.headers);
      newHeaders.set('Authorization', `Bearer ${tokenData.token}`);

      // Reîncearcă request-ul cu noul token
      return authenticatedFetch(url, {
        ...options,
        headers: newHeaders,
        _retryCount: retryCount + 1,
      });
    }

    // Pentru alte erori, returnează răspunsul original
    return response;
  } catch (error) {
    console.error('🔍 Fetch error:', error);
    
    // Dacă este eroare de rețea și am mai încercat refresh
    if (retryCount >= MAX_RETRIES) {
      console.log('🔄 Max retries reached, checking authentication');
      
      // Verifică dacă este eroare de autentificare
      const tokenData = await refreshAccessToken();
      if (!tokenData) {
        console.log('🔄 Authentication check failed, redirecting to login');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    throw error;
  }
}

// Wrapper pentru fetch cu auto-refresh
export const api = {
  get: (url: string, options?: Omit<FetchOptions, 'method'>) => 
    authenticatedFetch(url, { ...options, method: 'GET' }),
    
  post: (url: string, data?: any, options?: Omit<FetchOptions, 'method' | 'body'>) => 
    authenticatedFetch(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    }),
    
  put: (url: string, data?: any, options?: Omit<FetchOptions, 'method' | 'body'>) => 
    authenticatedFetch(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    }),
    
  delete: (url: string, options?: Omit<FetchOptions, 'method'>) => 
    authenticatedFetch(url, { ...options, method: 'DELETE' }),
};
