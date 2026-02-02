"use client";

import { requireRole } from "@/lib/auth";
import LogoutButton from "@/components/layout/LogoutButton";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
  patient?: any;
  doctor?: any;
}

interface Stats {
  users: number;
  patients: number;
  doctors: number;
  appointments: number;
  medicalRecords: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    patients: 0,
    doctors: 0,
    appointments: 0,
    medicalRecords: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get token from cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];

        console.log("🔍 Admin Page - Token exists:", !!token);
        console.log("🔍 Admin Page - Token length:", token?.length);
        console.log("🔍 Admin Page - Token preview:", token?.substring(0, 50) + "...");

        if (!token) {
          console.log("❌ Admin Page - No token found, redirecting to login");
          router.push('/login');
          return;
        }

        // First, sync OAuth user to resource server
        console.log("🔍 Admin Page - Syncing OAuth user...");
        const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL}/api/admin/sync-oauth-user`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          console.log("✅ Admin Page - OAuth user synced:", syncData);
        } else {
          const syncError = await syncResponse.text();
          console.log("❌ Admin Page - OAuth user sync failed:", syncError);
          console.log("❌ Admin Page - Sync status:", syncResponse.status);
        }

        const usersUrl = `${process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL}/api/admin/users`;
        const statsUrl = `${process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL}/api/admin/stats`;
        
        console.log("🔍 Admin Page - Fetching data from:", {
          users: usersUrl,
          stats: statsUrl
        });
        console.log("🔍 Admin Page - Env var:", process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL);

        console.log("🔍 Admin Page - Starting fetch for users...");
        console.log("🔍 Admin Page - Fetch URL:", usersUrl);
        console.log("🔍 Admin Page - Fetch headers:", {
          'Authorization': `Bearer ${token?.substring(0, 20)}...`,
          'Content-Type': 'application/json'
        });
        
        const usersResponse = await fetch(usersUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("🔍 Admin Page - Users fetch completed");
        console.log("🔍 Admin Page - Starting fetch for stats...");
        console.log("🔍 Admin Page - Stats URL:", statsUrl);
        
        const statsResponse = await fetch(statsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("🔍 Admin Page - Stats fetch completed");

        console.log("🔍 Admin Page - Response status:", {
          users: usersResponse.status,
          stats: statsResponse.status
        });

        console.log("🔍 Admin Page - Getting response text...");
        const usersText = await usersResponse.text();
        const statsText = await statsResponse.text();
        
        console.log("🔍 Admin Page - Raw responses:", {
          users: usersText,
          stats: statsText
        });

        const usersData = JSON.parse(usersText);
        const statsData = JSON.parse(statsText);

        console.log("🔍 Admin Page - Data received:", { usersData, statsData });
        console.log("🔍 Admin Page - Users array:", usersData.users);
        console.log("🔍 Admin Page - Users length:", usersData.users?.length);
        console.log("🔍 Admin Page - Stats object:", statsData.stats);

        setUsers(usersData.users || []);
        setStats(statsData.stats || stats);
      } catch (err) {
        console.error('❌ Admin Page - Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshData = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      const [usersResponse, statsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL}/api/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (usersResponse.ok && statsResponse.ok) {
        const usersData = await usersResponse.json();
        const statsData = await statsResponse.json();
        setUsers(usersData.users || []);
        setStats(statsData.stats || stats);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest utilizator?')) return;
    
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      const response = await fetch(`${process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await refreshData();
        alert('Utilizator șters cu succes!');
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (err) {
      alert('Eroare la ștergerea utilizatorului');
      console.error(err);
    }
  };

  const handleEditRole = async (userId: string, newRole: string) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      const response = await fetch(`${process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        await refreshData();
        setEditingUser(null);
        alert('Rol actualizat cu succes!');
      } else {
        throw new Error('Failed to update role');
      }
    } catch (err) {
      alert('Eroare la actualizarea rolului');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Se încarcă...</div>
        <style jsx>{`
          .loading {
            text-align: center;
            padding: 40px;
            font-size: 18px;
            color: #6b7280;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error">
          <h3>Eroare</h3>
          <p>{error}</p>
        </div>
        <style jsx>{`
          .error {
            text-align: center;
            padding: 40px;
            color: #dc2626;
          }
          .error h3 {
            margin-bottom: 10px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="header">
        <h1>Admin Dashboard</h1>
        <p>Bun venit, Admin!</p>
        <LogoutButton />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Utilizatori Total</h3>
          <span className="stat-number">{stats.users}</span>
        </div>
        <div className="stat-card">
          <h3>Pacienți</h3>
          <span className="stat-number">{stats.patients}</span>
        </div>
        <div className="stat-card">
          <h3>Medici</h3>
          <span className="stat-number">{stats.doctors}</span>
        </div>
        <div className="stat-card">
          <h3>Programări</h3>
          <span className="stat-number">{stats.appointments}</span>
        </div>
      </div>

      <div className="users-section">
        <div className="section-header">
          <h2>Gestionare Utilizatori</h2>
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Username</th>
                <th>Rol</th>
                <th>Data Creare</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id.substring(0, 8)}...</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('ro-RO')}</td>
                  <td>
                    <div className="action-buttons">
                      {editingUser === user.id ? (
                        <select 
                          value={user.role} 
                          onChange={(e) => handleEditRole(user.id, e.target.value)}
                          onBlur={() => setEditingUser(null)}
                          className="role-select"
                        >
                          <option value="admin">Admin</option>
                          <option value="medic">Medic</option>
                          <option value="pacient">Pacient</option>
                        </select>
                      ) : (
                        <button 
                          className="btn-edit" 
                          onClick={() => setEditingUser(user.id)}
                        >
                          Editare
                        </button>
                      )}
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Ștergere
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="no-users">
            <p>Nu există utilizatori în sistem.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          color: #6b7280;
          font-size: 14px;
          text-transform: uppercase;
        }

        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #1f2937;
        }

        .users-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .section-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .users-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        th {
          background: #f9fafb;
          font-weight: 600;
          color: #6b7280;
          font-size: 14px;
        }

        .role-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .role-admin {
          background: #fef3c7;
          color: #92400e;
        }

        .role-medic {
          background: #dbeafe;
          color: #1e40af;
        }

        .role-pacient {
          background: #d1fae5;
          color: #065f46;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-edit {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .btn-edit:hover {
          background: #e5e7eb;
        }

        .btn-delete {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .btn-delete:hover {
          background: #fee2e2;
        }

        .no-users {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .role-select {
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
