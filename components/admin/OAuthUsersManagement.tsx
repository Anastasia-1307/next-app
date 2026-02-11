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
  userType: 'oauth';
}

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
  userType?: 'classic' | 'oauth';
}

interface UserFormData {
  email: string;
  username: string;
  password?: string;
  role: string;
}

export default function OAuthUsersManagement() {
  const [oauthUsers, setOAuthUsers] = useState<OAuthUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OAuthUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    username: '',
    role: 'pacient',
    password: ''
  });

  // Get current user info
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/admin/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('🔍 DEBUG OAuth: Raw API response:', userData);
          setCurrentUser({
            id: userData.sub, // API-ul returnează 'sub' în loc de 'id'
            email: userData.email,
            username: userData.name,
            role: userData.role,
            created_at: '', // Nu avem aceste date din API-ul /me
            updated_at: ''  // Nu avem aceste date din API-ul /me
          });
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Check if user is admin and trying to edit/delete themselves
  const isCurrentUserAdmin = currentUser?.role === 'admin';
  const canEditUser = (user: OAuthUser) => {
    // Protejează utilizatorii cu același email (nu neapărat același ID)
    const isSameEmail = isCurrentUserAdmin && user.email === currentUser?.email;
    const result = !isCurrentUserAdmin || !isSameEmail;
   
    return result;
  };

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

  const handleEdit = (user: OAuthUser) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      username: user.username,
      role: user.role,
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest utilizator OAuth?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/oauth-users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchOAuthUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Error deleting user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = isEditModalOpen && selectedUser 
        ? `/api/admin/oauth-users/${selectedUser.id}`
        : '/api/admin/oauth-users';
      
      const method = isEditModalOpen && selectedUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchOAuthUsers();
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setFormData({
          email: '',
          username: '',
          role: 'pacient',
          password: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save user');
      }
    } catch (err) {
      setError('Error saving user');
    }
  };

  return (
    <>
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Gestionarea userilor Oauth </h3>
        
        </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      {canEditUser(user) && (
                        <>
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Editare
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Ștergere
                          </button>
                        </>
                      )}
                      {!canEditUser(user) && (
                        <span className="text-gray-400 text-sm">Protejat</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {oauthUsers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nu au fost găsiți utilizatori OAuth</p>
        </div>
      )}
    </div>

    {(isCreateModalOpen || isEditModalOpen) && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isEditModalOpen ? 'Editare Utilizator OAuth' : 'Adăugare Utilizator OAuth'}
            </h3>
          </div>
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="pacient">Pacient</option>
                <option value="medic">Medic</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {!isEditModalOpen && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Parolă
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                  setFormData({
                    email: '',
                    username: '',
                    role: 'pacient',
                    password: ''
                  });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Se procesează...' : (isEditModalOpen ? 'Salvează' : 'Adaugă')}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
