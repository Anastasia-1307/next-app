'use client';

import { useState, useEffect } from 'react';

interface MedicInfo {
  id: number;
  nume: string;
  prenume: string;
  experienta: number;
  specialitate_id: number;
  created_at: string;
  updated_at: string;
  username?: string;
  specialitati?: {
    id: number;
    nume: string;
    descriere?: string;
  };
}

interface MedicInfoFormData {
  nume: string;
  prenume: string;
  experienta: number;
  specialitate_id: number;
}

export default function MedicInfoManagement({ initialMedici }: { initialMedici?: MedicInfo[] }) {
  const [medici, setMedici] = useState<MedicInfo[]>(initialMedici || []);
  const [specialitati, setSpecialitati] = useState<{id: number, nume: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedic, setSelectedMedic] = useState<MedicInfo | null>(null);
  const [formData, setFormData] = useState<MedicInfoFormData>({
    nume: '',
    prenume: '',
    experienta: 0,
    specialitate_id: 0,
  });

  // Fetch data only if no initial data provided
  useEffect(() => {
    if (!initialMedici || initialMedici.length === 0) {
      fetchMedici();
    }
  }, [initialMedici]);
  useEffect(() => {
  fetchSpecialitati();
}, []);

  const fetchMedici = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/medic-info');
      const data = await response.json();
      
      console.log('🔍 MEDICI DATA RECEIVED:', data);
      console.log('🔍 RESPONSE STATUS:', response.status);
      console.log('🔍 IS ARRAY:', Array.isArray(data));
      console.log('🔍 MEDICI STATE AFTER SET:', medici.length);
      
      if (response.ok) {
        setMedici(Array.isArray(data) ? data : []);
      } else {
        setError(data.error || 'Failed to fetch medici info');
      }
    } catch (error) {
      console.error('Error fetching medici info:', error);
      setError('Failed to fetch medici info');
    } finally {
      setLoading(false);
      console.log('🔍 MEDICI FINAL STATE:', medici.length);
    }
  };

  const fetchSpecialitati = async () => {
    try {
      const response = await fetch('/api/admin/specialitati');
      const data = await response.json();
      
      console.log('🔍 SPECIALITATI DATA RECEIVED:', data);
      console.log('🔍 RESPONSE STATUS:', response.status);
      console.log('🔍 IS ARRAY:', Array.isArray(data));
      
      if (response.ok) {
        // Ensure we always set an array, even if API returns wrong format
        setSpecialitati(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching specialități:', error);
      setSpecialitati([]); // Ensure empty array on error
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/medic-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setFormData({ nume: '', prenume: '', experienta: 0, specialitate_id: 0 });
        fetchMedici();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create medic info');
      }
    } catch (error) {
      console.error('Error creating medic info:', error);
      setError('Failed to create medic info');
    }
  };

  const handleUpdate = async () => {
    if (!selectedMedic) return;
    
    try {
      const response = await fetch(`/api/admin/medic-info/${selectedMedic.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setSelectedMedic(null);
        setFormData({ nume: '', prenume: '', experienta: 0, specialitate_id: 0 });
        fetchMedici();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update medic info');
      }
    } catch (error) {
      console.error('Error updating medic info:', error);
      setError('Failed to update medic info');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medic info?')) return;
    
    try {
      const response = await fetch(`/api/admin/medic-info/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMedici();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete medic info');
      }
    } catch (error) {
      console.error('Error deleting medic info:', error);
      setError('Failed to delete medic info');
    }
  };

  const openEditModal = (medic: MedicInfo) => {
    setSelectedMedic(medic);
    setFormData({
      nume: medic.nume,
      prenume: medic.prenume,
      experienta: medic.experienta,
      specialitate_id: medic.specialitate_id
    });
    setIsEditModalOpen(true);
  };

 return (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Medici</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Adaugă Medic
        </button>
      </div>



      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          <strong>Eroare:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Se încarcă datele...</div>
        </div>
      ) : medici.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No medici info found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prenume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialitate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experiență</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {medici.map((medic) => (
                <tr key={medic.id}>
                  <td className="px-6 py-4 text-sm">{medic.id}</td>
                  <td className="px-6 py-4 text-sm">{medic.nume}</td>
                  <td className="px-6 py-4 text-sm">{medic.prenume}</td>
                  <td className="px-6 py-4 text-sm">
                    {medic.specialitati?.nume || `ID: ${medic.specialitate_id}`}
                  </td>
                  <td className="px-6 py-4 text-sm">{medic.experienta} ani</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(medic.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => openEditModal(medic)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editează
                    </button>
                    <button
                      onClick={() => handleDelete(medic.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Șterge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* Create Modal */}
    {isCreateModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Adaugă Medic</h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nume"
              value={formData.nume}
              onChange={(e) => setFormData({ ...formData, nume: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
            />

            <input
              type="text"
              placeholder="Prenume"
              value={formData.prenume}
              onChange={(e) => setFormData({ ...formData, prenume: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
            />

            <select
              value={formData.specialitate_id}
              onChange={(e) =>
                setFormData({ ...formData, specialitate_id: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="0">Selectează specialitate</option>
              {specialitati.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.nume}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Experiență"
              value={formData.experienta}
              onChange={(e) =>
                setFormData({ ...formData, experienta: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="bg-gray-300 px-4 py-2 rounded-md"
            >
              Anulează
            </button>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Creează
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Modal */}
    {isEditModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Edit Medic</h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nume"
              value={formData.nume}
              onChange={(e) => setFormData({ ...formData, nume: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
            />

            <input
              type="text"
              placeholder="Prenume"
              value={formData.prenume}
              onChange={(e) => setFormData({ ...formData, prenume: e.target.value })}
              className="w-full px-4 py-2 border rounded-md"
            />

            <select
              value={formData.specialitate_id}
              onChange={(e) =>
                setFormData({ ...formData, specialitate_id: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="0">Selectează specialitate</option>
              {specialitati.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.nume}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Experiență"
              value={formData.experienta}
              onChange={(e) =>
                setFormData({ ...formData, experienta: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="bg-gray-300 px-4 py-2 rounded-md"
            >
              Anulează
            </button>
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
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