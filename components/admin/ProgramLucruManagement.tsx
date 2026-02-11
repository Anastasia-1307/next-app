'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-interceptor';

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
  user_id: string;
  medic_info_id: number;
  ora_inceput: string;
  ora_sfarsit: string;
  activ: boolean;
}

export default function ProgramLucruManagement() {
  const [programLucru, setProgramLucru] = useState<ProgramLucru[]>([]);
  const [medici, setMedici] = useState<User[]>([]);
  const [medicInfoMap, setMedicInfoMap] = useState<Map<string, number>>(new Map()); // user_id -> medic_info_id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramLucru | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Forțăm re-randarea
  const [uiCount, setUiCount] = useState(0); // State dedicat pentru UI
  const [formData, setFormData] = useState<ProgramLucruFormData>({
    user_id: '', // Gol la început
    medic_info_id: 0, // Va fi setat din mapare
    ora_inceput: '',
    ora_sfarsit: '',
    activ: true
  });

  // Monitor programLucru state changes
  useEffect(() => {
    console.log("🔄 Frontend: programLucru state changed:", programLucru.length, programLucru);
  console.log("🔄 Frontend: medici state changed:", medici.length, medici);
  }, [programLucru]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
    try {
      // Fetch program lucru, medici users, and medic info
      const [programRes, mediciRes, medicInfoRes] = await Promise.all([
        api.get('/api/admin/program-lucru'),
        api.get('/api/admin/users'),
        api.get('/api/admin/medic-info')
      ]);

      if (!programRes.ok) {
        console.error("PROGRAM API ERROR:", programRes.status, programRes.statusText);
        const errorText = await programRes.text();
        console.error("PROGRAM API ERROR BODY:", errorText);
      }
      
      if (!mediciRes.ok) {
        console.error("MEDICI API ERROR:", mediciRes.status, mediciRes.statusText);
        const errorText = await mediciRes.text();
        console.error("MEDICI API ERROR BODY:", errorText);
      }

      if (!medicInfoRes.ok) {
        console.error("MEDIC INFO API ERROR:", medicInfoRes.status, medicInfoRes.statusText);
        const errorText = await medicInfoRes.text();
        console.error("MEDIC INFO API ERROR BODY:", errorText);
      }
      
      if (!programRes.ok || !mediciRes.ok || !medicInfoRes.ok) {
        throw new Error(`API requests failed: ${programRes.status}, ${mediciRes.status}, ${medicInfoRes.status}`);
      }

      const [programData, mediciData, medicInfoData] = await Promise.all([
        programRes.json(),
        mediciRes.json(),
        medicInfoRes.json()
      ]);

      console.log("📊 Program data:", programData);
      console.log("� Program data keys:", Object.keys(programData));
      console.log("📊 Program data.programLucru:", programData.programLucru);
      console.log("📊 Program data.programLucru type:", typeof programData.programLucru);
      console.log("📊 Program data.programLucru isArray:", Array.isArray(programData.programLucru));
      console.log("📊 Program data.programLucru length:", programData.programLucru?.length || 'undefined');
      console.log("📊 Program data.programLucru[0]:", programData.programLucru?.[0]);
      console.log("� Medici data:", mediciData);
      console.log("🏥 Medic info data:", medicInfoData);

console.log("REFRESH DATA:", programData);
console.log("PROGRAM LUCRU STRUCTURE:", programData.programLucru?.[0]); // Verificăm primul element
        setProgramLucru(Array.isArray(programData.programLucru) ? programData.programLucru : []);
        
        const allUsers = mediciData.users || [];
        const medici = allUsers.filter((user: any) => user.role === 'medic');
        console.log("ALL MEDICI:", medici);
        setMedici(medici);

        // Create mapping between user_id and medic_info_id
        let medicInfoList = [];
        
        // Check if medicInfoData is an array directly
        if (Array.isArray(medicInfoData)) {
          medicInfoList = medicInfoData;
          console.log("🔍 Medic info is direct array:", medicInfoList);
        } else if (medicInfoData.medicInfo && Array.isArray(medicInfoData.medicInfo)) {
          medicInfoList = medicInfoData.medicInfo;
          console.log("🔍 Medic info in medicInfo property:", medicInfoList);
        } else {
          console.warn("⚠️ No medic info found! Checking alternative keys...");
          // Try alternative keys
          const alternativeKeys = ['medicInfos', 'data', 'results', 'items'];
          for (const key of alternativeKeys) {
            if (medicInfoData[key] && Array.isArray(medicInfoData[key])) {
              console.log(`🔍 Found medic info in alternative key: ${key}`);
              medicInfoList = medicInfoData[key];
              break;
            }
          }
        }
        
        const newMedicInfoMap = new Map<string, number>();
        
        console.log("👥 Available medici (users):", medici.map((m: any) => ({ id: m.id, email: m.email, name: m.name })));
        console.log("🏥 Available medic info:", medicInfoList.map((m: any) => ({ id: m.id, email: m.email, nume: m.nume, prenume: m.prenume })));
        
        medicInfoList.forEach((medicInfo: any) => {
          // Debug: afișăm detalii despre medicInfo
          console.log(`🔍 Processing medicInfo:`, {
            id: medicInfo.id,
            nume: medicInfo.nume,
            prenume: medicInfo.prenume,
            email: medicInfo.email,
            fullName: `${medicInfo.nume} ${medicInfo.prenume}`
          });
          
          // Debug: afișăm detalii despre toți medici disponibili
          console.log(`👥 Available medici for matching:`, medici.map((m: any) => ({
            id: m.id,
            email: m.email,
            name: m.name,
            username: m.username
          })));
          
          // Find the corresponding user by name/username matching
          const correspondingUser = medici.find((user: any) => {
            const userName = user.name || user.username;
            const medicFullName = medicInfo.nume + ' ' + medicInfo.prenume;
            const medicReversedName = medicInfo.prenume + ' ' + medicInfo.nume;
            
            console.log(`🔍 Comparing: "${userName}" with "${medicFullName}" and "${medicReversedName}"`);
            
            return userName === medicFullName ||
                   userName === medicReversedName ||
                   userName?.trim() === medicFullName?.trim() ||
                   userName?.trim() === medicReversedName?.trim() ||
                   userName?.includes(medicInfo.nume) && userName?.includes(medicInfo.prenume) ||
                   userName?.includes(medicInfo.prenume) && userName?.includes(medicInfo.nume);
          });
          
          if (correspondingUser) {
            newMedicInfoMap.set(correspondingUser.id, medicInfo.id);
            console.log(`🔗 Mapped user ${correspondingUser.id} (${correspondingUser.email}) -> medic_info_id ${medicInfo.id}`);
          } else {
            console.warn(`⚠️ No match found for medic_info: ${medicInfo.nume} ${medicInfo.prenume}`);
            console.warn(`⚠️ Tried to match with:`, medici.map((m: any) => ({ id: m.id, name: m.name || m.username, email: m.email })));
          }
        });
        
        setMedicInfoMap(newMedicInfoMap);
        console.log("🗺️ Medic info map:", newMedicInfoMap);
        
        // Filter medici to only show those with valid medic_info mapping
        const availableMedici = medici.filter((medic: any) => newMedicInfoMap.has(medic.id));
        console.log("🔍 Available medici with mapping:", availableMedici);
        console.log("🔍 Medici without mapping:", medici.filter((medic: any) => !newMedicInfoMap.has(medic.id)));
        
        // Update medici state to only include available medici
        setMedici(availableMedici);
        
        if (medici.length === 0) {
          console.warn("⚠️ No medici found in users endpoint. You need to add medici first.");
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setProgramLucru([]);
        setMedici([]);
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
      
      // Get medic_info_id from the mapping
      const medicInfoId = medicInfoMap.get(formData.user_id);
      console.log("🔍 DEBUG: Selected user_id:", formData.user_id);
      console.log("🔍 DEBUG: Available medicInfoMap:", Array.from(medicInfoMap.entries()));
      console.log("🔍 DEBUG: Found medicInfoId:", medicInfoId);
      
      if (!medicInfoId) {
        console.error("🔍 ERROR: No medic_info_id found for user:", formData.user_id);
        throw new Error('Medicul selectat nu are un medic_info_id valid. Asigură-te că medicul are înregistrare în Medic Info.');
      }
      
      // Convert time from HH:MM format to ISO string for today's date
      const convertTimeToISO = (timeString: string) => {
        const today = new Date();
        const [hours, minutes] = timeString.split(':');
        
        // Create date for today at UTC to avoid timezone issues
        const utcDate = new Date(Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          parseInt(hours),
          parseInt(minutes),
          0,
          0
        ));
        
        return utcDate.toISOString();
      };
      
      const requestPayload = {
        user_id: formData.user_id,
        medic_info_id: medicInfoId,
        ora_inceput: convertTimeToISO(formData.ora_inceput),
        ora_sfarsit: convertTimeToISO(formData.ora_sfarsit),
        activ: formData.activ
      };
      
      console.log("🔍 Frontend: Submitting form - isEdit:", isEdit);
      console.log("🔍 Frontend: Selected program ID:", selectedProgram?.id);
      console.log("🔍 Frontend: Request URL:", url);
      console.log("🔍 Frontend: Request method:", method);
      console.log("🔍 Frontend: User ID:", formData.user_id);
      console.log("🔍 Frontend: Mapped medic_info_id:", medicInfoId);
      console.log("🔍 Frontend: Ora inceput (raw):", formData.ora_inceput);
      console.log("🔍 Frontend: Ora sfarsit (raw):", formData.ora_sfarsit);
      console.log("🔍 Frontend: Ora inceput (converted):", convertTimeToISO(formData.ora_inceput));
      console.log("🔍 Frontend: Ora sfarsit (converted):", convertTimeToISO(formData.ora_sfarsit));
      console.log("🔍 Frontend: Full payload:", JSON.stringify(requestPayload, null, 2));
      
      const response = await (isEdit 
        ? api.put(url, requestPayload)
        : api.post(url, requestPayload)
      );

      console.log("🔍 Frontend: POST request body:", JSON.stringify(requestPayload));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔍 Frontend: Error response body:", errorText);
        throw new Error(`Failed to ${isEdit ? 'update' : 'create'} program lucru: ${response.status} - ${errorText}`);
      }

      console.log("🔍 Frontend:", isEdit ? "UPDATE" : "CREATE", "request successful");

      // Refresh data
      console.log("🔄 Frontend: Refreshing data after", isEdit ? "update" : "create/delete");
      const programRes = await api.get('/api/admin/program-lucru');
      
      if (programRes.ok) {
        const programData = await programRes.json();
        console.log("🔄 Frontend: Refreshed data after", isEdit ? "update" : "create/delete", ":", programData);
        console.log("🔄 Frontend: Expected length after", isEdit ? "update" : "delete", ":", programLucru.length - (isEdit ? 0 : 1));
        console.log("🔄 Frontend: Actual length after", isEdit ? "update" : "delete", ":", programData.programLucru?.length || 0);
        
      const newProgramLucru = Array.isArray(programData)
  ? programData
  : Array.isArray(programData.programLucru)
    ? programData.programLucru
    : [];

setProgramLucru([...newProgramLucru]); 

        console.log("🔄 Frontend: After setProgramLucru, new length should be:", newProgramLucru.length);
      } else {
        console.error("🔄 Frontend: Failed to refresh data:", programRes.status);
      }

      // Reset form and close modal
      setFormData({
        user_id: '', // Gol la reset
        medic_info_id: 0, // Va fi setat din mapare
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
    
    // Find user_id from medic_info_id using reverse mapping
    let userId = '';
    for (const [key, value] of medicInfoMap.entries()) {
      if (value === program.medic_info_id) {
        userId = key;
        break;
      }
    }
    
    setFormData({
      user_id: userId, // Găsim user_id corespunzător
      medic_info_id: program.medic_info_id,
      ora_inceput: formatTimeForInput(program.ora_inceput),
      ora_sfarsit: formatTimeForInput(program.ora_sfarsit),
      activ: program.activ
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ești sigur că vrei să ștergi acest program de lucru?')) {
      return;
    }

    try {
      console.log("🗑️ Frontend: Deleting program lucru ID:", id);
      console.log("🗑️ Frontend: DELETE URL:", `/api/admin/program-lucru/${id}`);
      
      const response = await api.delete(`/api/admin/program-lucru/${id}`);

      console.log("🗑️ Frontend: DELETE response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🗑️ Frontend: DELETE error body:", errorText);
        throw new Error(`Failed to delete program lucru: ${response.status} - ${errorText}`);
      }

      // Refresh data
      console.log("🔄 Frontend: Refreshing data after create/update");
      const programRes = await api.get('/api/admin/program-lucru');
      
      if (programRes.ok) {
        const programData = await programRes.json();
        console.log("🔄 Frontend: Refreshed data:", programData);
        console.log("🔄 Frontend: Expected length after delete:", programLucru.length - 1);
        console.log("🔄 Frontend: programLucru state changed:", programLucru.length, programLucru);
      setProgramLucru(Array.isArray(programData.programLucru) ? programData.programLucru : []);
      setRefreshKey(prev => {
        const newKey = prev + 1;
        console.log("🔄 Frontend: refreshKey updating from", prev, "to", newKey);
        return newKey;
      }); // Forțăm re-randarea
      setUiCount(programData.programLucru?.length || 0); // Actualizăm UI-ul direct
    }} catch (error) {
      console.error('Error deleting program lucru:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const formatTimeForDisplay = (isoString: string) => {
    try {
      const date = new Date(isoString);
      // Use UTC hours to avoid timezone issues
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      const result = `${hours}:${minutes}`;
      return result;
    } catch (error) {
      console.error('Error formatting time:', isoString, error);
      return isoString;
    }
  };

  const formatTimeForInput = (isoString: string) => {
    try {
      const date = new Date(isoString);
      // Use UTC hours to avoid timezone issues
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      const result = `${hours}:${minutes}`;
      return result;
    } catch (error) {
      console.error('Error formatting time for input:', isoString, error);
      return isoString;
    }
  };

  const getMedicName = (medicInfoId: number) => {
    // Temporar: returnăm un text generic până creăm mapping corect
    return `Medic ID: ${medicInfoId}`;
    // Când vom avea mapping corect:
    // const medic = medici.find(m => m.medic_info_id === medicInfoId);
    // return medic ? `${medic.username} (${medic.email})` : `Medic ID: ${medicInfoId}`;
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
        <h3 className="text-lg font-semibold mb-4">Program Lucru </h3>
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
            {programLucru.map((program) => {
            return (
              <tr key={program.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{program.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getMedicName(program.medic_info_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTimeForDisplay(program.ora_inceput)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTimeForDisplay(program.ora_sfarsit)}
                </td>
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
            );
          })}
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
                  value={formData.user_id}
                  onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selectează un medic</option>
                  {medici.map((medic) => (
                    <option key={medic.id} value={medic.id}>
                      {medic.username} ({medic.email})
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
                  value={formData.user_id}
                  onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selectează un medic</option>
                  {medici.map((medic) => (
                    <option key={medic.id} value={medic.id}>
                      {medic.username} ({medic.email})
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
