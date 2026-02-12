'use client';

import { useState, useEffect } from 'react';
import { resourceApi } from '@/lib/api';

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
    descriere?: string;
  };
}

interface Specialitate {
  id: number;
  nume: string;
  descriere?: string;
  created_at: string;
  updated_at: string;
}

interface MedicFormData {
  nume: string;
  prenume: string;
  experienta: number;
  specialitate_id: number;
}

export default function MediciManagement({ initialMedici, initialSpecialitati }: { 
  initialMedici?: MedicInfo[];
  initialSpecialitati?: Specialitate[];
}) {
  const [medici, setMedici] = useState<MedicInfo[]>(initialMedici || []);
  const [specialitati, setSpecialitati] = useState<Specialitate[]>(initialSpecialitati || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedic, setSelectedMedic] = useState<MedicInfo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState<MedicFormData>({
    nume: '',
    prenume: '',
    experienta: 0,
    specialitate_id: 0
  });

  // Fetch data only if no initial data provided
  useEffect(() => {
    if (!initialMedici || initialMedici.length === 0 || !initialSpecialitati || initialSpecialitati.length === 0) {
      const fetchData = async () => {
        try {
          // Fetch medici and specialitati using Next.js API routes
          // The API routes handle authentication automatically via httpOnly cookies
          const [mediciRes, specialitatiRes] = await Promise.all([
            fetch('/api/admin/medic-info', {
              headers: {
                'Content-Type': 'application/json'
              }
            }),
            fetch('/api/admin/specialitati', {
              headers: {
                'Content-Type': 'application/json'
              }
            })
          ]);

          if (!mediciRes.ok) {
            console.error("MEDICI API ERROR:", mediciRes.status, mediciRes.statusText);
            const errorText = await mediciRes.text();
            console.error("MEDICI API ERROR BODY:", errorText);
          }
          
          if (!specialitatiRes.ok) {
            console.error("SPECIALITATI API ERROR:", specialitatiRes.status, specialitatiRes.statusText);
            const errorText = await specialitatiRes.text();
            console.error("SPECIALITATI API ERROR BODY:", errorText);
          }
        
          if (!mediciRes.ok || !specialitatiRes.ok) {
            throw new Error(`API requests failed: ${mediciRes.status}, ${specialitatiRes.status}`);
          }

          const [mediciData, specialitatiData] = await Promise.all([
            mediciRes.json(),
            specialitatiRes.json()
          ]);

          console.log("📊 Medici data:", mediciData);
          console.log("📊 Specialitati data:", specialitatiData);
          
          setMedici(Array.isArray(mediciData) ? mediciData : []);
          setSpecialitati(Array.isArray(specialitatiData) ? specialitatiData : []);
          
        } catch (error) {
          console.error('Error fetching data:', error);
          setError(error instanceof Error ? error.message : 'Unknown error occurred');
          setMedici([]);
          setSpecialitati([]);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [initialMedici, initialSpecialitati]);

  const handleSubmit = async (e: React.FormEvent, isEdit: boolean = false) => {
    e.preventDefault();
    
    try {
      const url = isEdit 
        ? `/api/admin/medic-info/${selectedMedic?.id}`
        : '/api/admin/medic-info';
      
      const method = isEdit ? 'PUT' : 'POST';
      
      const requestPayload = {
        nume: formData.nume,
        prenume: formData.prenume,
        experienta: formData.experienta,
        specialitate_id: formData.specialitate_id
      };
      
      console.log("🔍 Frontend: Submitting medic form - isEdit:", isEdit);
      console.log("🔍 Frontend: Form data:", requestPayload);
      
      const response = await fetch(`/api/admin/medic-info${isEdit ? `/${selectedMedic?.id}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔍 Frontend: Error response body:", errorText);
        throw new Error(`Failed to ${isEdit ? 'update' : 'create'} medic: ${response.status} - ${errorText}`);
      }

      console.log("🔍 Frontend:", isEdit ? "UPDATE" : "CREATE", "request successful");

      // Refresh data
      const mediciRes = await fetch('/api/admin/medic-info', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (mediciRes.ok) {
        const mediciData = await mediciRes.json();
        setMedici(Array.isArray(mediciData) ? mediciData : []);
      }

      // Reset form and close modal
      setFormData({
        nume: '',
        prenume: '',
        experienta: 0,
        specialitate_id: 0
      });
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedMedic(null);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const handleEdit = (medic: MedicInfo) => {
    setSelectedMedic(medic);
    setFormData({
      nume: medic.nume,
      prenume: medic.prenume,
      experienta: medic.experienta,
      specialitate_id: medic.specialitate_id
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ești sigur că vrei să ștergi acest medic?')) {
      return;
    }

    try {
      console.log("🗑️ Frontend: Deleting medic ID:", id);
      
      const response = await fetch(`/api/admin/medic-info/${id}`, {
        method: 'DELETE'
      });

      console.log("🗑️ Frontend: DELETE response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🗑️ Frontend: DELETE error body:", errorText);
        throw new Error(`Failed to delete medic: ${response.status} - ${errorText}`);
      }

      // Refresh data
      const mediciRes = await fetch('/api/admin/medic-info', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (mediciRes.ok) {
        const mediciData = await mediciRes.json();
        setMedici(Array.isArray(mediciData) ? mediciData : []);
      }
      
    } catch (error) {
      console.error('Error deleting medic:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const getSpecialitateName = (specialitateId: number) => {
    const specialitate = specialitati.find(s => s.id === specialitateId);
    return specialitate ? specialitate.nume : `Specialitate ${specialitateId}`;
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
    <div className="space-y-4" key={refreshKey}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold mb-4">Management Medici</h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Adaugă Medic
        </button>
      </div>

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medici.map((medic) => (
              <tr key={medic.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.nume}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.prenume}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.experienta} ani</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getSpecialitateName(medic.specialitate_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(medic.created_at).toLocaleString('ro-RO')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(medic)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Editare
                  </button>
                  <button
                    onClick={() => handleDelete(medic.id)}
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Adaugă Medic</h3>
            <form onSubmit={(e) => handleSubmit(e, false)}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nume
                </label>
                <input
                  type="text"
                  value={formData.nume}
                  onChange={(e) => setFormData({...formData, nume: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Prenume
                </label>
                <input
                  type="text"
                  value={formData.prenume}
                  onChange={(e) => setFormData({...formData, prenume: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Experiență (ani)
                </label>
                <input
                  type="number"
                  value={formData.experienta}
                  onChange={(e) => setFormData({...formData, experienta: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Specialitate
                </label>
                <select
                  value={formData.specialitate_id}
                  onChange={(e) => setFormData({...formData, specialitate_id: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selectează o specialitate</option>
                  {specialitati.map((specialitate) => (
                    <option key={specialitate.id} value={specialitate.id}>
                      {specialitate.nume}
                    </option>
                  ))}
                </select>
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
      {isEditModalOpen && selectedMedic && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Editare Medic</h3>
            <form onSubmit={(e) => handleSubmit(e, true)}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nume
                </label>
                <input
                  type="text"
                  value={formData.nume}
                  onChange={(e) => setFormData({...formData, nume: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Prenume
                </label>
                <input
                  type="text"
                  value={formData.prenume}
                  onChange={(e) => setFormData({...formData, prenume: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Experiență (ani)
                </label>
                <input
                  type="number"
                  value={formData.experienta}
                  onChange={(e) => setFormData({...formData, experienta: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Specialitate
                </label>
                <select
                  value={formData.specialitate_id}
                  onChange={(e) => setFormData({...formData, specialitate_id: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selectează o specialitate</option>
                  {specialitati.map((specialitate) => (
                    <option key={specialitate.id} value={specialitate.id}>
                      {specialitate.nume}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedMedic(null);
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
