'use client';

import { api } from '@/lib/api-interceptor';
import { useEffect, useState } from 'react';
import LogoutButton from "@/components/layout/LogoutButton";
import UserManagement from "@/components/admin/UserManagement";
import OAuthUsersManagement from "@/components/admin/OAuthUsersManagement";
import UserLogsManagement from "@/components/admin/UserLogsManagement";
import SpecialitatiManagement from "@/components/admin/SpecialitatiManagement";
import ProgramLucruManagement from "@/components/admin/ProgramLucruManagement";
import MedicInfoManagement from "@/components/admin/MedicInfoManagement";
import PasswordResetTokensManagement from "@/components/admin/PasswordResetTokensManagement";

// TypeScript interfaces matching the real database schema
interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
  userType?: 'classic' | 'oauth';
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

interface PasswordResetToken {
  id: string;
  email: string;
  expires_at: string;
  created_at: string;
  used: boolean;
  user_type: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [oauthUsers, setOAuthUsers] = useState<OAuthUser[]>([]);
  const [programLucru, setProgramLucru] = useState<ProgramLucru[]>([]);
  const [specialitati, setSpecialitati] = useState<Specialitate[]>([]);
  const [programari, setProgramari] = useState<Programare[]>([]);
  const [passwordResetTokens, setPasswordResetTokens] = useState<PasswordResetToken[]>([]);
  const [medicInfo, setMedicInfo] = useState<MedicInfo[]>([]);
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

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the same method as UserManagement - fetch with api interceptor
        const [usersRes, logsRes, oauthUsersRes, medicRes, programRes, specialitatiRes, programariRes, resetTokensRes] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/user-logs'),
          api.get('/api/admin/oauth-users'),
          api.get('/api/admin/medic-info'), // Changed from '/api/admin/medicinfo' to '/api/admin/medic-info'
          api.get('/api/admin/program-lucru'),
          api.get('/api/admin/specialitati'),
          api.get('/api/admin/programari'),
          api.get('/api/admin/password-reset-tokens')
        ]);

        // Check responses
        const responses = [usersRes, logsRes, oauthUsersRes, medicRes, programRes, specialitatiRes, programariRes, resetTokensRes];
        const failedResponses = responses.filter(res => !res.ok);
        
        if (failedResponses.length > 0) {
          throw new Error(`API requests failed: ${failedResponses.map(r => r.status).join(', ')}`);
        }

        // Get all data
        const [usersData, logsData, oauthUsersData, medicData, programData, specialitatiData, programariData, resetTokensData] = await Promise.all([
          usersRes.json(),
          logsRes.json(),
          oauthUsersRes.json(),
          medicRes.json(),
          programRes.json(),
          specialitatiRes.json(),
          programariRes.json(),
          resetTokensRes.json()
        ]);

        // Extract OAuth users from the OAuth users API response
        const allUsers = usersData.users || [];
        const oauthUsersDataList = oauthUsersData.users || [];
        const classicUsers = allUsers.filter((user: any) => user.userType === 'classic');
        
        setUsers(classicUsers);
        setUserLogs(Array.isArray(logsData.logs) ? logsData.logs : []);
        setOAuthUsers(oauthUsersDataList);
        setMedicInfo(Array.isArray(medicData) ? medicData : []);
        setProgramLucru(Array.isArray(programData) ? programData : []);
        setSpecialitati(Array.isArray(specialitatiData) ? specialitatiData : []);
        setProgramari(Array.isArray(programariData.programari) ? programariData.programari : []);
        setPasswordResetTokens(Array.isArray(resetTokensData.tokens) ? resetTokensData.tokens : []);
        
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
        setPasswordResetTokens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Remove token dependency

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
        return <UserManagement users={users} />;

      case "logs":
        return <UserLogsManagement />;

      case "oauth":
        return <OAuthUsersManagement />;

      case "medic":
        return <MedicInfoManagement />;

      case "program":
        return <ProgramLucruManagement />;

      case "specialitati":
        return <SpecialitatiManagement />;

      case "programari":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Programări </h3>
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

      case "reset-tokens":
        return <PasswordResetTokensManagement />;

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
{ id: "reset-tokens", label: "Token-uri Resetare", count: passwordResetTokens.length },
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
{tab.label} 
</button>
))}
</nav>
</div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    
  );
}