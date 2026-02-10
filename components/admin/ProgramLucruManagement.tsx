'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
  userType?: 'classic' | 'oauth';
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

interface ProgramLucruFormData {
  medic_info_id: string;
  ora_inceput: string;
  ora_sfarsit: string;
  activ: boolean;
}

export default function ProgramLucruManagement() {
  const [programLucru, setProgramLucru] = useState<ProgramLucru[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramLucru | null>(null);
  const [formData, setFormData] = useState<ProgramLucruFormData>({
    medic_info_id: '',
    ora_inceput: '',
    ora_sfarsit: '',
    activ: true
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both program lucru and users
        const [programRes, usersRes] = await Promise.all([
          fetch('/api/admin/program-lucru', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          }),
          fetch('/api/admin/users', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          })
        ]);

        if (!programRes.ok || !usersRes.ok) {
          throw new Error(`API requests failed: ${programRes.status}, ${usersRes.status}`);
        }

        const [programData, usersData] = await Promise.all([
          programRes.json(),
          usersRes.json()
        ]);

        setProgramLucru(Array.isArray(programData.programLucru) ? programData.programLucru : []);
        
        // Filter users to get only medici (assuming role 'medic')
        const allUsers = usersData.users || [];
        const medici = allUsers.filter((user: any) => user.role === 'medic');
        setUsers(medici);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setProgramLucru([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent, isEdit: boolean = false) => {
    e.preventDefault();
    
    try {
      const url = isEdit 
        ? `/api/admin/program-lucru/${selectedProgram?.id}`
        : '/api/admin/program-lucru';
      
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          medic_info_id: parseInt(formData.medic_info_id)
        }),
      });

      console.log("🔍 Frontend: POST request body:", JSON.stringify({
        ...formData,
        medic_info_id: parseInt(formData.medic_info_id)
      }));

      if (!response.ok) {
        throw new Error(`Failed to ${isEdit ? 'update' : 'create'} program lucru: ${response.status}`);
      }

      // Refresh data
      const programRes = await fetch('/api/admin/program-lucru', {
        credentials: 'include'
      });
      
      if (programRes.ok) {
        const programData = await programRes.json();
        setProgramLucru(Array.isArray(programData.programLucru) ? programData.programLucru : []);
      }

      // Reset form and close modal
      setFormData({
        medic_info_id: '',
        ora_inceput: '',
        ora_sfarsit: '',
        activ: true
      });
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedProgram(null);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const handleEdit = (program: ProgramLucru) => {
    setSelectedProgram(program);
    setFormData({
      medic_info_id: program.medic_info_id.toString(),
      ora_inceput: program.ora_inceput,
      ora_sfarsit: program.ora_sfarsit,
      activ: program.activ
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ești sigur că vrei să ștergi acest program de lucru?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/program-lucru/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete program lucru: ${response.status}`);
      }

      // Refresh data
      const programRes = await fetch('/api/admin/program-lucru', {
        credentials: 'include'
      });
      
      if (programRes.ok) {
        const programData = await programRes.json();
        setProgramLucru(Array.isArray(programData.programLucru) ? programData.programLucru : []);
      }
      
    } catch (error) {
      console.error('Error deleting program lucru:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const getMedicName = (medicId: number) => {
    const medic = users.find(user => user.id === medicId.toString());
    return medic ? `${medic.username} (${medic.email})` : `Medic ID: ${medicId}`;
  };

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold mb-4">Program Lucru ({programLucru.length})</h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Adaugă Program
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ora Început</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ora Sfârșit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {programLucru.map((program) => (
              <tr key={program.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{program.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getMedicName(program.medic_info_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{program.ora_inceput}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{program.ora_sfarsit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    program.activ ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {program.activ ? 'Activ' : 'Inactiv'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(program.created_at).toLocaleString('ro-RO')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(program)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Editare
                  </button>
                  <button
                    onClick={() => handleDelete(program.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Ștergere
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Adaugă Program Lucru</h3>
            <form onSubmit={(e) => handleSubmit(e, false)}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Medic
                </label>
                <select
                  value={formData.medic_info_id}
                  onChange={(e) => setFormData({...formData, medic_info_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selectează un medic</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Ora Început
                </label>
                <input
                  type="time"
                  value={formData.ora_inceput}
                  onChange={(e) => setFormData({...formData, ora_inceput: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Ora Sfârșit
                </label>
                <input
                  type="time"
                  value={formData.ora_sfarsit}
                  onChange={(e) => setFormData({...formData, ora_sfarsit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.activ}
                    onChange={(e) => setFormData({...formData, activ: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-gray-700 text-sm font-bold">Activ</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Adaugă
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedProgram && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Editare Program Lucru</h3>
            <form onSubmit={(e) => handleSubmit(e, true)}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Medic
                </label>
                <select
                  value={formData.medic_info_id}
                  onChange={(e) => setFormData({...formData, medic_info_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selectează un medic</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Ora Început
                </label>
                <input
                  type="time"
                  value={formData.ora_inceput}
                  onChange={(e) => setFormData({...formData, ora_inceput: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Ora Sfârșit
                </label>
                <input
                  type="time"
                  value={formData.ora_sfarsit}
                  onChange={(e) => setFormData({...formData, ora_sfarsit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.activ}
                    onChange={(e) => setFormData({...formData, activ: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-gray-700 text-sm font-bold">Activ</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedProgram(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
