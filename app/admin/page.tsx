'use client';

import { useEffect, useState } from 'react';
import LogoutButton from "@/components/layout/LogoutButton";

// TypeScript interfaces matching the real database schema
interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface UserLog {
  id: string;
  user_id: string | null;
  action: string;
  resource: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: any;
  created_at: string;
}

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

interface MedicInfo {
  id: number;
  nume: string;
  prenume: string;
  experienta: number;
  specialitate_id: number;
  created_at: string;
  updated_at: string;
  specialitati?: {
    id: number;
    nume: string;
    descriere: string;
  };
}

interface Specialitate {
  id: number;
  nume: string;
  descriere: string;
  created_at: string;
  updated_at: string;
}

interface ProgramLucru {
  id: number;
  medic_info_id: number;
  ora_inceput: string;
  ora_sfarsit: string;
  activ: boolean;
  created_at: string;
  updated_at: string;
}

interface Programare {
  id: number;
  user_id: string;
  serviciu: string;
  data_programare: string;
  created_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [oauthUsers, setOAuthUsers] = useState<OAuthUser[]>([]);
  const [medicInfo, setMedicInfo] = useState<MedicInfo[]>([]);
  const [programLucru, setProgramLucru] = useState<ProgramLucru[]>([]);
  const [specialitati, setSpecialitati] = useState<Specialitate[]>([]);
  const [programari, setProgramari] = useState<Programare[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Get token on mount
  useEffect(() => {
    const getToken = () => {
      if (typeof window !== 'undefined') {
        const cookieToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];
        setToken(cookieToken || null);
      }
    };
    getToken();
  }, []);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        const [usersRes, logsRes, medicRes, programRes, specialitatiRes, programariRes] = await Promise.all([
          fetch('http://localhost:4000/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:4000/admin/user-logs', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:4000/admin/medic-info', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:4000/admin/program-lucru', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:4000/admin/specialitati', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:4000/admin/programari', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        // Check responses
        const responses = [usersRes, logsRes, medicRes, programRes, specialitatiRes, programariRes];
        const failedResponses = responses.filter(res => !res.ok);
        
        if (failedResponses.length > 0) {
          throw new Error(`API requests failed: ${failedResponses.map(r => r.status).join(', ')}`);
        }

        // Get all data
        const [usersData, logsData, medicData, programData, specialitatiData, programariData] = await Promise.all([
          usersRes.json(),
          logsRes.json(),
          medicRes.json(),
          programRes.json(),
          specialitatiRes.json(),
          programariRes.json()
        ]);

        // Extract OAuth users from the same users endpoint
        const allUsers = usersData.users || [];
        const oauthUsers = allUsers.filter((user: any) => user.userType === 'oauth');
        const classicUsers = allUsers.filter((user: any) => user.userType === 'classic');

        // Set data with proper type checking
        setUsers(classicUsers);
        setUserLogs(Array.isArray(logsData.logs) ? logsData.logs : []);
        setOAuthUsers(oauthUsers);
        setMedicInfo(Array.isArray(medicData) ? medicData : []);
        setProgramLucru(Array.isArray(programData) ? programData : []);
        setSpecialitati(Array.isArray(specialitatiData) ? specialitatiData : []);
        setProgramari(Array.isArray(programariData.programari) ? programariData.programari : []);
        
        console.log('🔍 ADMIN PAGE: Data fetching completed successfully');
      } catch (error) {
        console.error('🔍 ADMIN PAGE: Failed to fetch admin data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        
        // Set empty arrays on error to prevent crashes
        setUsers([]);
        setUserLogs([]);
        setOAuthUsers([]);
        setMedicInfo([]);
        setProgramLucru([]);
        setSpecialitati([]);
        setProgramari([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Se încarcă datele...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Eroare:</strong> {error}
        </div>
      );
    }

    switch (activeTab) {
      case "users":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Utilizatori ({users.length})</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(user.created_at).toLocaleString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "logs":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Log-uri Utilizatori ({userLogs.length})</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiune</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resursă</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.user_id || 'Anonymous'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.resource || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.ip_address || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(log.created_at).toLocaleString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "oauth":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Utilizatori OAuth ({oauthUsers.length})</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {oauthUsers.map((oauth) => (
                    <tr key={oauth.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{oauth.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{oauth.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{oauth.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{oauth.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(oauth.created_at).toLocaleString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "medic":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Informații Medici ({medicInfo.length})</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prenume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experiență</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialitate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicInfo.map((medic) => (
                    <tr key={medic.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.nume}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.prenume}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.experienta} ani</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.specialitati?.nume || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(medic.created_at).toLocaleString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "program":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Program Lucru ({programLucru.length})</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medic ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ora Început</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ora Sfârșit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {programLucru.map((program) => (
                    <tr key={program.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{program.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{program.medic_info_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{program.ora_inceput}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{program.ora_sfarsit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          program.activ ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {program.activ ? 'Activ' : 'Inactiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(program.created_at).toLocaleString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "specialitati":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Specialități ({specialitati.length})</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descriere</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {specialitati.map((specialitate) => (
                    <tr key={specialitate.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{specialitate.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{specialitate.nume}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{specialitate.descriere || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(specialitate.created_at).toLocaleString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "programari":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Programări ({programari.length})</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviciu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {programari.map((programare) => (
                    <tr key={programare.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{programare.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{programare.user_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{programare.serviciu}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(programare.data_programare).toLocaleString('ro-RO')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Programat
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: "users", label: "Utilizatori", count: users.length },
                { id: "logs", label: "Log-uri", count: userLogs.length },
                { id: "oauth", label: "OAuth", count: oauthUsers.length },
                { id: "medic", label: "Medici", count: medicInfo.length },
                { id: "program", label: "Program Lucru", count: programLucru.length },
                { id: "specialitati", label: "Specialități", count: specialitati.length },
                { id: "programari", label: "Programări", count: programari.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}