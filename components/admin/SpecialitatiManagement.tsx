'use client';

import { useState, useEffect } from 'react';

interface Specialitate {
  id: number;
  nume: string;
  descriere?: string;
  created_at: string;
  updated_at: string;
}

interface SpecialitateFormData {
  nume: string;
  descriere?: string;
}

export default function SpecialitatiManagement() {
  const [specialitati, setSpecialitati] = useState<Specialitate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSpecialitate, setSelectedSpecialitate] = useState<Specialitate | null>(null);
  const [formData, setFormData] = useState<SpecialitateFormData>({
    nume: '',
    descriere: ''
  });

  useEffect(() => {
    fetchSpecialitati();
  }, []);

  const fetchSpecialitati = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/specialitati');
      const data = await response.json();
      
      if (response.ok) {
        setSpecialitati(data);
      } else {
        setError(data.error || 'Failed to fetch specialități');
      }
    } catch (error) {
      console.error('Error fetching specialități:', error);
      setError('Failed to fetch specialități');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/specialitati', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setFormData({ nume: '', descriere: '' });
        fetchSpecialitati();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create specialitate');
      }
    } catch (error) {
      console.error('Error creating specialitate:', error);
      setError('Failed to create specialitate');
    }
  };

  const handleUpdate = async () => {
    if (!selectedSpecialitate) return;
    
    try {
      const response = await fetch(`/api/admin/specialitati/${selectedSpecialitate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setSelectedSpecialitate(null);
        setFormData({ nume: '', descriere: '' });
        fetchSpecialitati();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update specialitate');
      }
    } catch (error) {
      console.error('Error updating specialitate:', error);
      setError('Failed to update specialitate');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ești sigur că vrei să ștergi această specialitate?')) return;
    
    try {
      const response = await fetch(`/api/admin/specialitati/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSpecialitati();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete specialitate');
      }
    } catch (error) {
      console.error('Error deleting specialitate:', error);
      setError('Failed to delete specialitate');
    }
  };

  const openEditModal = (specialitate: Specialitate) => {
    setSelectedSpecialitate(specialitate);
    setFormData({
      nume: specialitate.nume,
      descriere: specialitate.descriere || ''
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Gestionarea specilităților</h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Adaugă specialitate
          </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descriere</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creat la</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {specialitati.map((specialitate) => (
                <tr key={specialitate.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{specialitate.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{specialitate.nume}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {specialitate.descriere ? (
                      <span title={specialitate.descriere}>
                        {specialitate.descriere.length > 50 
                          ? `${specialitate.descriere.substring(0, 50)}...`
                          : specialitate.descriere
                        }
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(specialitate.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(specialitate)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editează
                    </button>
                    <button
                      onClick={() => handleDelete(specialitate.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Șterge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {specialitati.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nu există specialități</p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Adaugă specialitate</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nume</label>
                <input
                  type="text"
                  value={formData.nume}
                  onChange={(e) => setFormData({ ...formData, nume: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descriere</label>
                <textarea
                  value={formData.descriere}
                  onChange={(e) => setFormData({ ...formData, descriere: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Anulează
              </button>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Adaugă
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Editează Specialitate</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nume</label>
                <input
                  type="text"
                  value={formData.nume}
                  onChange={(e) => setFormData({ ...formData, nume: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descriere</label>
                <textarea
                  value={formData.descriere}
                  onChange={(e) => setFormData({ ...formData, descriere: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Anulează
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Actualizează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
