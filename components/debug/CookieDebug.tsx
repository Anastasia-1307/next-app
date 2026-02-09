'use client';

import { useState, useEffect } from 'react';

export default function CookieDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCookies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/cookies');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Debug error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDebugInfo({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const testAdminAPI = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testing admin API...');
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      console.log('🔍 Admin API response status:', response.status);
      console.log('🔍 Admin API response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('🔍 Admin API response data:', data);
      
      setDebugInfo({
        ...data,
        apiTest: {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          data: data
        }
      });
    } catch (error) {
      console.error('Admin API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDebugInfo({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg m-4">
      <h3 className="text-lg font-semibold mb-2">Cookie Debug Tool</h3>
      
      <div className="flex gap-2">
        <button
          onClick={testCookies}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Cookies'}
        </button>
        
        <button
          onClick={testAdminAPI}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Admin API'}
        </button>
      </div>

      {debugInfo && (
        <div className="mt-4 p-4 bg-white border rounded">
          <h4 className="font-semibold mb-2">Debug Results:</h4>
          <div className="text-sm space-y-2">
            <div><strong>Total Cookies:</strong> {debugInfo.totalCookies}</div>
            <div><strong>Token Found:</strong> {debugInfo.tokenFound ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Cookie Names:</strong> {debugInfo.cookieNames?.join(', ') || 'None'}</div>
            
            {debugInfo.requestHeaders?.cookie && (
              <div><strong>Browser Cookie Header:</strong> {debugInfo.requestHeaders.cookie}</div>
            )}
            
            {debugInfo.tokenPreview && (
              <div><strong>Token Preview:</strong> {debugInfo.tokenPreview}</div>
            )}
            
            <details className="mt-2">
              <summary className="cursor-pointer font-semibold">Full Debug Info</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
