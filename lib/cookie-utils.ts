import { cookies } from 'next/headers';

/**
 * Utility function to reliably get the auth token from cookies
 * This handles the case where cookies might be stored with numeric indices
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    
    console.log('🔍 getAuthToken - Starting token extraction...');
    
    // Try direct access first
    let token = cookieStore.get('auth_token')?.value;
    
    if (token) {
      console.log('🔍 getAuthToken - Found auth_token via direct access:', token.substring(0, 50) + '...');
      return token;
    }
    
    // If direct access fails, try to find it in all cookies
    console.log('🔍 getAuthToken - Direct access failed, checking all cookies...');
    const allCookies = cookieStore.getAll();
    console.log('🔍 getAuthToken - Total cookies found:', allCookies.length);
    console.log('🔍 getAuthToken - All cookie names:', allCookies.map(c => c.name));
    
    // Search for auth_token in all cookies
    const authCookie = allCookies.find(cookie => cookie.name === 'auth_token');
    if (authCookie) {
      token = authCookie.value;
      console.log('🔍 getAuthToken - Found auth_token in all cookies:', token.substring(0, 50) + '...');
      return token;
    }
    
    // If still not found, try case-insensitive search
    console.log('🔍 getAuthToken - Trying case-insensitive search...');
    const caseInsensitiveMatch = allCookies.find(cookie => 
      cookie.name.toLowerCase() === 'auth_token'
    );
    if (caseInsensitiveMatch) {
      token = caseInsensitiveMatch.value;
      console.log('🔍 getAuthToken - Found auth_token via case-insensitive search:', token.substring(0, 50) + '...');
      return token;
    }
    
    console.log('🔍 getAuthToken - auth_token not found in any cookies');
    console.log('🔍 getAuthToken - Available cookies:', allCookies.map(c => ({ name: c.name, value: c.value?.substring(0, 20) + '...' })));
    
    return null;
  } catch (error) {
    console.error('🔍 getAuthToken - Error getting auth token:', error);
    return null;
  }
}
