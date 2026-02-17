// Client-side token access via API route (for httpOnly cookies)

export async function getClientTokenFromAPI(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.log('🔍 getClientTokenFromAPI - Failed to get token:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('🔍 getClientTokenFromAPI - Token received:', data.token?.substring(0, 50) + '...');
    return data.token;
    
  } catch (error) {
    console.error('🔍 getClientTokenFromAPI - Error:', error);
    return null;
  }
}
