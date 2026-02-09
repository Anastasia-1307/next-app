'use client';

import { useState, useEffect } from 'react';

interface OAuthUser {
  id: string;
  email: string;
  username: string;
  role: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export default function OAuthUsersManagement() {
  const [oauthUsers, setOAuthUsers] = useState<OAuthUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOAuthUsers();
  }, []);

 const fetchOAuthUsers = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/admin/oauth-users', {
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to fetch OAuth users');
    }

    // 🔒 GARANTEAZĂ ARRAY
    const users: OAuthUser[] =
      Array.isArray(data)
        ? data
        : Array.isArray(data.users)
          ? data.users
          : Array.isArray(data.oauthUsers)
            ? data.oauthUsers
            : [];

    setOAuthUsers(users);
  } catch (err) {
    console.error('Error fetching OAuth users:', err);
    setOAuthUsers([]);
    setError(err instanceof Error ? err.message : 'Failed to fetch OAuth users');
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">OAuth Users Management</h3>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {oauthUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'medic' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {oauthUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No OAuth users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
