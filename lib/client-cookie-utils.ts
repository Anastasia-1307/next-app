/**
 * Client-side utility function to get auth token from cookies
 * This works in Client Components
 */
export function getClientAuthToken(): string | null {
  try {
    if (typeof document === 'undefined') {
      return null;
    }
    
    console.log('🔍 getClientAuthToken - Starting token extraction...');
    
    // Try direct access first
    const cookies = document.cookie.split('; ');
    let token = cookies
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    if (token) {
      console.log('🔍 getClientAuthToken - Found auth_token:', token.substring(0, 50) + '...');
      return token;
    }
    
    console.log('🔍 getClientAuthToken - auth_token not found');
    console.log('🔍 getClientAuthToken - Available cookies:', cookies.map(c => c.split('=')[0]));
    
    return null;
  } catch (error) {
    console.error('🔍 getClientAuthToken - Error getting auth token:', error);
    return null;
  }
}
