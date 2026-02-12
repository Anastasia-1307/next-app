"use client";

import { useState, useEffect } from "react";
import LogoutButton from '@/components/layout/LogoutButton';
import { getClientAuthToken } from '@/lib/client-cookie-utils';

interface Programare {
  id: string;
  data_programare: string;
  ora_programare: string;
  status: 'programat' | 'confirmat' | 'anulat';
  detalii?: string;
}

interface Pacient {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

interface MedicInfo {
  id: string;
  user_id: string;
  username: string;
  experienta: number;
  telefon?: string;
}

export default function MedicPage() {
  const [programari, setProgramari] = useState<Programare[]>([]);
  const [pacienti, setPacienti] = useState<Pacient[]>([]);
  const [medicInfo, setMedicInfo] = useState<MedicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("programari");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProgramare, setSelectedProgramare] = useState<Programare | null>(null);

  // Fetch data from API
  useEffect(() => {
    console.log('🔍 MEDIC PAGE: useEffect started');
    const fetchData = async () => {
      try {
        console.log('🔍 MEDIC PAGE: Starting token extraction...');
        
        // Get token from API endpoint (since cookies are httpOnly)
        const tokenRes = await fetch('/api/auth/token');
        
        if (!tokenRes.ok) {
          console.log('🔍 MEDIC PAGE: Failed to get token from API');
          return;
        }
        
        const tokenData = await tokenRes.json();
        const token = tokenData.token;
        
        console.log('🔍 MEDIC PAGE: Token extracted:', token ? 'YES' : 'NO');
        if (!token) {
          console.log('🔍 MEDIC PAGE: No token found, returning');
          return;
        }

        console.log('🔍 MEDIC PAGE: Fetching medic info...');
        // Fetch medic info from AUTH-SERVER (not resource-server)
        const medicRes = await fetch('http://localhost:4000/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('🔍 MEDIC PAGE: Medic info response status:', medicRes.status);
        if (!medicRes.ok) {
          console.error('Failed to fetch medic info:', medicRes.status, medicRes.statusText);
          return;
        }

        const medicData = await medicRes.json();
        setMedicInfo(medicData);

        // Fetch programari
        console.log('🔍 MEDIC PAGE: Fetching programari...');
        const programariRes = await fetch('http://localhost:5000/api/medic/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!programariRes.ok) {
          console.error('Failed to fetch programari:', programariRes.status, programariRes.statusText);
          return;
        }

        const programariData = await programariRes.json();
        console.log('🔍 Programari data from backend:', programariData);
        const programariArray = Array.isArray(programariData) ? programariData : programariData.appointments || [];
        console.log('🔍 Programari array:', programariArray);
        setProgramari(programariArray.map((p: any) => ({
          ...p,
          status: p.status as 'programat' | 'confirmat' | 'anulat'
        })));

      } catch (error) {
        console.error('Failed to fetch medic data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data only once on mount
    fetchData();
  }, []);

  const handleCreateProgramare = async (formData: any) => {
    try {
      // Get token from API endpoint
      const tokenRes = await fetch('/api/auth/token');
      if (!tokenRes.ok) {
        alert('Eroare la obținerea token-ului');
        return;
      }
      const tokenData = await tokenRes.json();
      const token = tokenData.token;

      const response = await fetch('http://localhost:5000/api/medic/appointments', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newProgramare = await response.json();
        setProgramari([...programari, newProgramare]);
        setShowCreateForm(false);
      } else {
        alert('Eroare la crearea programării');
      }
    } catch (error) {
      console.error('Failed to create programare:', error);
      alert('Eroare la crearea programării');
    }
  };

  const handleUpdateStatus = async (programareId: string, status: Programare['status']) => {
    try {
      // Get token from API endpoint
      const tokenRes = await fetch('/api/auth/token');
      if (!tokenRes.ok) {
        alert('Eroare la obținerea token-ului');
        return;
      }
      const tokenData = await tokenRes.json();
      const token = tokenData.token;

      await fetch(`http://localhost:5000/api/medic/appointments/${programareId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      setProgramari(programari.map(p => 
        p.id === programareId ? { ...p, status } : p
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Eroare la actualizarea statusului');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Medic</h1>
        <LogoutButton />
      </div>
      
      <p className="mb-6 text-gray-600">Bun venit!</p>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'programari', label: 'Programări', count: programari.length },
            { id: 'pacienti', label: 'Pacienți', count: pacienti.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Programări Tab */}
          {activeTab === 'programari' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Programări Medicale</h3>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Adaugă Programare
                  </button>
                </div>
              </div>
              
              {/* Create Form Modal */}
              {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Adaugă Programare Nouă</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const target = e.target as typeof e.target & {
                        pacient_nume: { value: string };
                        data_programare: { value: string };
                        ora_programare: { value: string };
                        detalii: { value: string };
                      };
                      const formData = {
                        pacient_nume: target.pacient_nume?.value || '',
                        date: target.data_programare?.value || '',
                        time: target.ora_programare?.value || '',
                        notes: target.detalii?.value || ''
                      };
                      console.log('🔍 Form data:', formData);
                      handleCreateProgramare(formData);
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Pacient Nume</label>
                          <input 
                            type="text" 
                            name="pacient_nume" 
                            required 
                            className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="Introduceți numele pacientului..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Data Programare</label>
                          <input 
                            type="date" 
                            name="data_programare" 
                            required 
                            className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ora Programare</label>
                          <input 
                            type="time" 
                            name="ora_programare" 
                            required 
                            className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          />
                        </div>
                    
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Detalii</label>
                          <textarea 
                            name="detalii" 
                            rows={4}
                            className="mt-1 block w-full px-4 py-3 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="Introduceți detalii suplimentare..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 mt-4">
                        <button
                          type="button"
                          onClick={() => setShowCreateForm(false)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                          Anulează
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          Creează
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Programări List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ora</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalii</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {programari.map((programare) => (
                      <tr key={programare.id || `programare-${Math.random()}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{programare.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{programare.data_programare}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{programare.ora_programare}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            programare.status === 'programat' ? 'bg-yellow-100 text-yellow-800' :
                            programare.status === 'confirmat' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {programare.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {programare.detalii || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={programare.status}
                            onChange={(e) => handleUpdateStatus(programare.id, e.target.value as Programare['status'])}
                            className="text-sm border-gray-300 rounded"
                          >
                            <option value="programat">Programat</option>
                            <option value="confirmat">Confirmat</option>
                            <option value="anulat">Anulat</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pacienți Tab */}
          {activeTab === 'pacienti' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Pacienți Asignați</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nume</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creat</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pacienti.map((pacient) => (
                      <tr key={pacient.id || `pacient-${Math.random()}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pacient.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pacient.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pacient.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(pacient.created_at).toLocaleDateString('ro-RO')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
