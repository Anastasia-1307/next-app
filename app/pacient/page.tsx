"use strict";
"use client";



import { useState, useEffect, useRef } from "react";

import LogoutButton from "@/components/layout/LogoutButton";

import PacientDashboard from "@/components/pacient/PacientDashboard";



interface Programare {

  id: string;

  user_id?: string | null; // Opțional - poate fi null pentru programări create de medic

  medic_id: string;

  data_programare: string;

  ora_programare: string;

  status: 'programat' | 'confirmat' | 'anulat';

  serviciu?: string;

  medic_name?: string;

  specialitate?: string;

  detalii?: string;

}



interface MedicInfo {

  id: string;

  user_id?: string;

  specialitate: string;

  experienta: number;

  nume: string;

  prenume: string;



  specialitate_id?: number;

  created_at?: string;

  updated_at?: string;

}



interface Specialitate {

  id: string;

  nume: string;

  descriere?: string;

}



interface ProgramLucru {

  id: string;

  medic_info_id: string;

  medic_nume?: string;

  ora_inceput: string;

  ora_sfarsit: string;

  activ: boolean;

  created_at: string;

  zi?: string;

  data?: string;

}



export default function PacientPage() {

  const [programari, setProgramari] = useState<Programare[]>([]);
  const [medici, setMedici] = useState<MedicInfo[]>([]);
  const [specialitati, setSpecialitati] = useState<Specialitate[]>([]);
  const [programLucru, setProgramLucru] = useState<ProgramLucru[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("programari");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProgramare, setSelectedProgramare] = useState<Programare | null>(null);
  const hasFetched = useRef(false);

  // Fetch data from API
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {

      try {

        console.log("🔍 Fetching data from resource server...");

        // Fetch programari - use Next.js API proxy
        const programariRes = await fetch('/api/pacient/programari', {
          method: 'GET'
        });

        const programariData = await programariRes.json();

        console.log("🔍 Programari data:", programariData);
        console.log("🔍 Programari data type:", typeof programariData);
        console.log("🔍 Programari data is array:", Array.isArray(programariData));

        // Verificăm dacă programariData este un array sau conține array-ul programari
        let programariArray = [];
        
        if (Array.isArray(programariData)) {
          programariArray = programariData;
        } else if (programariData?.programari && Array.isArray(programariData.programari)) {
          programariArray = programariData.programari;
        } else if (programariData?.data && Array.isArray(programariData.data)) {
          programariArray = programariData.data;
        } else {
          console.error("❌ Programari data is not an array and doesn't contain expected fields:", programariData);
          // Încercăm să găsim orice array în obiect
          const findArray = (obj: any): any[] | null => {
            for (const key in obj) {
              if (Array.isArray(obj[key])) {
                return obj[key];
              }
              if (typeof obj[key] === 'object' && obj[key] !== null) {
                const found = findArray(obj[key]);
                if (found) return found;
              }
            }
            return null;
          };
          programariArray = findArray(programariData) || [];
        }
        
        console.log("🔍 Final programari array:", programariArray);
        console.log("🔍 Final programari array length:", programariArray.length);
        
        setProgramari(programariArray);



        // Fetch medici - use Next.js API proxy
        const mediciRes = await fetch('/api/pacient/medici', {
          method: 'GET'
        });

        if (mediciRes.ok) {
          const mediciData = await mediciRes.json();
          setMedici(Array.isArray(mediciData) ? mediciData : []);
        } else {
          console.error("❌ Failed to fetch medici:", mediciRes.status, mediciRes.statusText);
          setMedici([]);
        }


        // Fetch specialitati - use Next.js API proxy
        const specialitatiRes = await fetch('/api/pacient/specialitati', {
          method: 'GET'
        });

        if (specialitatiRes.ok) {
          const specialitatiData = await specialitatiRes.json();
          setSpecialitati(Array.isArray(specialitatiData) ? specialitatiData : []);
        } else {
          console.error("❌ Failed to fetch specialitati:", specialitatiRes.status, specialitatiRes.statusText);
          setSpecialitati([]);
        }

        // Fetch program lucru - use pacient-specific endpoint
        try {
          const programLucruRes = await fetch('/api/pacient/program-lucru', {
            method: 'GET'
          });

          if (programLucruRes.ok) {
            const programLucruData = await programLucruRes.json();
            console.log("🔍 Program lucru data:", programLucruData);
            
            // Aplicăm aceeași logică robustă de extragere array
            let programLucruArray = [];
            
            if (Array.isArray(programLucruData)) {
              programLucruArray = programLucruData;
            } else if (programLucruData?.programLucru && Array.isArray(programLucruData.programLucru)) {
              programLucruArray = programLucruData.programLucru;
            } else if (programLucruData?.data && Array.isArray(programLucruData.data)) {
              programLucruArray = programLucruData.data;
            } else {
              console.error("❌ Program lucru data is not an array:", programLucruData);
              const findArray = (obj: any): any[] | null => {
                for (const key in obj) {
                  if (Array.isArray(obj[key])) {
                    return obj[key];
                  }
                  if (typeof obj[key] === 'object' && obj[key] !== null) {
                    const found = findArray(obj[key]);
                    if (found) return found;
                  }
                }
                return null;
              };
              programLucruArray = findArray(programLucruData) || [];
            }
            
            setProgramLucru(programLucruArray);
            console.log("🔍 Program lucru loaded:", programLucruArray.length, "items");
            
            // Debug: Log first few items to see the exact format
            if (programLucruArray.length > 0) {
              console.log("🔍 Sample program lucru item:", programLucruArray[0]);
              console.log("🔍 ora_inceput format:", programLucruArray[0].ora_inceput, typeof programLucruArray[0].ora_inceput);
              console.log("🔍 ora_sfarsit format:", programLucruArray[0].ora_sfarsit, typeof programLucruArray[0].ora_sfarsit);
            }
          } else {
            console.error("❌ Failed to fetch program lucru:", programLucruRes.status, programLucruRes.statusText);
            setProgramLucru([]);
          }
        } catch (error) {
          console.error("❌ Error fetching program lucru:", error);
          setProgramLucru([]);
        }


      } catch (error) {

        console.error('Failed to fetch pacient data:', error);

      } finally {

        setLoading(false);

      }

    };



    fetchData();


  }, []);

  const refreshProgramari = async () => {
    try {
      console.log("🔄 Refreshing programari...");
      const programariRes = await fetch('/api/pacient/programari', {
        method: 'GET'
      });
      
      if (programariRes.ok) {
        const programariData = await programariRes.json();
        console.log("🔄 Refresh programari data:", programariData);
        console.log("🔄 Refresh programari data type:", typeof programariData);
        console.log("🔄 Refresh programari data is array:", Array.isArray(programariData));

        // Aceeași logică robustă ca la fetch inițial
        let programariArray = [];
        
        if (Array.isArray(programariData)) {
          programariArray = programariData;
        } else if (programariData?.programari && Array.isArray(programariData.programari)) {
          programariArray = programariData.programari;
        } else if (programariData?.data && Array.isArray(programariData.data)) {
          programariArray = programariData.data;
        } else {
          console.error("❌ Refresh programari data is not an array:", programariData);
          const findArray = (obj: any): any[] | null => {
            for (const key in obj) {
              if (Array.isArray(obj[key])) {
                return obj[key];
              }
              if (typeof obj[key] === 'object' && obj[key] !== null) {
                const found = findArray(obj[key]);
                if (found) return found;
              }
            }
            return null;
          };
          programariArray = findArray(programariData) || [];
        }
        
        setProgramari(programariArray);
        console.log("🔄 Programari refreshed:", programariArray.length);
      }
    } catch (error) {
      console.error('Failed to refresh programari:', error);
    }
  };

  const handleUpdateStatus = async (programareId: string, status: string) => {
    try {
      await fetch(`/api/pacient/programari/${programareId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      // Refresh automat după update
      await refreshProgramari();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Eroare la actualizarea statusului');
    }
  };

  const handleDeleteProgramare = async (programareId: string) => {
    try {
      await fetch(`/api/pacient/programari/${programareId}`, {
        method: 'DELETE'
      });

      // Refresh automat după delete
      await refreshProgramari();
      console.log('Programare ștearsă cu succes');
    } catch (error) {
      console.error('Eroare la ștergerea programării:', error);
    }
  };

  const getMedicName = (medicId: string): string => {
    const medic = medici.find(m => m.id === medicId);
    if (medic) {
      return `${medic.nume} ${medic.prenume}`;
    }
    return `Medic negăsit (ID: ${medicId})`;
  };

  const formatTimeForDisplay = (time: string): string => {
    if (!time) return '-';
    
    try {
      // If it's already in HH:MM format, return as is
      if (/^\d{1,2}:\d{2}$/.test(time)) {
        return time;
      }
      
      // If it's in HH:MM:SS format, return first 5 characters
      if (/^\d{1,2}:\d{2}:\d{2}$/.test(time)) {
        return time.substring(0, 5);
      }
      
      // If it's a full datetime string, extract time and format
      if (time.includes('T') || time.includes(' ')) {
        const dateObj = new Date(time);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleTimeString('ro-RO', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        }
      }
      
      // Try to extract time from any string using regex
      const timeMatch = time.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
      if (timeMatch) {
        const hours = timeMatch[1].padStart(2, '0');
        const minutes = timeMatch[2];
        return `${hours}:${minutes}`;
      }
      
      // If all else fails, return original string
      return time;
    } catch (error) {
      console.warn('Error formatting time:', time, error);
      return time;
    }
  };

  const getProgramLucruDisplay = (program: ProgramLucru) => {
    // Dacă avem medic_nume (acum conține numele complet)
    if (program.medic_nume) {
      return program.medic_nume;
    }
    // Altfel încercăm să găsim medicul după ID
    const medicName = getMedicName(program.medic_info_id);
    // Dacă nu găsim medicul, afișăm un mesaj mai prietenos
    if (medicName.includes('negăsit')) {
      return `Program #${program.id}`;
    }
    return medicName;
  };

  const handleCancelProgramare = async (programareId: string) => {
    try {
      await fetch(`/api/pacient/programari/${programareId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'anulat' })
      });

      // Refresh automat după cancel
      await refreshProgramari();
      setProgramari(programari.map(p => 
        p.id === programareId ? { ...p, status: 'anulat' } : p
      ));
      console.log('Programare anulată cu succes');
    } catch (error) {
      console.error('Eroare la anularea programării:', error);
    }
  };

  const handleCreateProgramare = async (formData: any) => {
    try {
      const response = await fetch('/api/pacient/programari', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Refresh automat după create
        await refreshProgramari();
        setShowCreateForm(false);
      } else {
        alert('Eroare la crearea programării');
      }
    } catch (error) {
      console.error('Failed to create programare:', error);
      alert('Eroare la crearea programării');
    }
  };



  return (

    <div className="p-6 max-w-7xl mx-auto">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">Dashboard Pacient</h1>

        <LogoutButton />

      </div>

      

      <p className="mb-6 text-gray-600">Bun venit, Pacient!</p>

      

      {/* Tabs */}

      <div className="border-b border-gray-200 mb-6">

        <nav className="-mb-px flex space-x-8">

          {[

            { id: 'programari', label: 'Programările Mele', count: programari.length },
            { id: 'medici', label: 'Medici Disponibili', count: medici.length },
            { id: 'specialitati', label: 'Specialități', count: specialitati.length },
            { id: 'program-lucru', label: 'Program de Lucru', count: programLucru.length }

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

                  <h3 className="text-lg font-medium text-gray-900">Programările Mele</h3>

                  <button

                    onClick={() => setShowCreateForm(true)}

                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"

                  >

                    Creează Programare Nouă

                  </button>

                </div>

              </div>

              

              {/* Create Form Modal */}

              {showCreateForm && (

                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

                  <div className="bg-white rounded-lg p-6 w-full max-w-md">

                    <h3 className="text-lg font-medium text-gray-900 mb-4">Creează Programare Nouă</h3>

                    <form onSubmit={(e) => {

                      e.preventDefault();

                      const target = e.target as typeof e.target & {

                        medic_id: { value: string };

                        data_programare: { value: string };

                        ora_programare: { value: string };


                        detalii: { value: string };

                      };

                      const formData = {

                        medic_id: target.medic_id.value,

                        data_programare: target.data_programare.value,

                        ora_programare: target.ora_programare.value,

        

                        detalii: target.detalii.value

                      };

                      handleCreateProgramare(formData);

                    }}>

                      <div className="space-y-6">

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-2">Medic</label>

                          <select name="medic_id" required className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">

                            <option value="">Selectează medic</option>

                            {medici.map((medic) => (

                              <option key={medic.id} value={medic.id}>

                                {medic.nume} {medic.prenume}

                              </option>

                            ))}

                          </select>

                        </div>

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-2">Data Programare</label>

                          <input type="date" name="data_programare" required className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />

                        </div>

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-2">Ora Programare</label>

                          <input type="time" name="ora_programare" required className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />

                        </div>

                        

                        <div>

                          <label className="block text-sm font-medium text-gray-700 mb-2">Detalii</label>

                          <textarea name="detalii" rows={4} className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />

                        </div>

                      </div>

                      <div className="flex justify-end space-x-3 mt-6">

                        <button

                          type="button"

                          onClick={() => setShowCreateForm(false)}

                          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-400 transition-colors"

                        >

                          Anulează

                        </button>

                        <button

                          type="submit"

                          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"

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

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medic</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ora</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>

                    </tr>

                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">

                    {programari.map((programare, index) => (
                      <tr key={programare.id || `programare-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{programare.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(() => {
                            // Parse serviciu format: "Nume Medic - Specialitate - Ora" SAU "Nume Pacient - Specialitate - Ora"
                            const serviciuParts = (programare.serviciu || '').split(' - ');
                            
                            // Dacă există user_id, e pacient → afișează numele pacientului
                            // Dacă nu există user_id, e programare creată de medic → afișează numele medicului
                            if (programare.user_id) {
                              return serviciuParts[2] || 'N/A'; // Numele pacientului (al 3-lea element)
                            } else {
                              return serviciuParts[0] || 'N/A'; // Numele medicului (primul element)
                            }
                          })()}
                        </td>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={programare.status}
                            onChange={(e) => handleUpdateStatus(programare.id, e.target.value)}
                            className="text-sm border-gray-300 rounded px-2 py-1"
                          >
                            <option value="programat">Programat</option>
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



          {/* Medici Tab */}

          {activeTab === 'medici' && (

            <div className="bg-white rounded-lg shadow overflow-hidden">

              <div className="px-6 py-4 border-b border-gray-200">

                <h3 className="text-lg font-medium text-gray-900">Medici Disponibili</h3>

              </div>

              <div className="overflow-x-auto">

                <table className="min-w-full divide-y divide-gray-200">

                  <thead className="bg-gray-50">

                    <tr>


                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nume/prenume</th>



                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialitate</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experiență</th>


                    </tr>

                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">

                    {medici.map((medic) => (

                      <tr key={medic.id}>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.nume} {medic.prenume}</td>
                        

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.specialitate}</td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.experienta} ani</td>

                     

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}



          {/* Specialități Tab */}

          {activeTab === 'specialitati' && (

            <div className="bg-white rounded-lg shadow overflow-hidden">

              <div className="px-6 py-4 border-b border-gray-200">

                <h3 className="text-lg font-medium text-gray-900">Specialități Medicale</h3>

              </div>

              <div className="overflow-x-auto">

                <table className="min-w-full divide-y divide-gray-200">

                  <thead className="bg-gray-50">

                    <tr>

                  

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nume</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descriere</th>

                    </tr>

                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">

                    {specialitati.map((specialitate) => (

                      <tr key={specialitate.id}>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{specialitate.nume}</td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{specialitate.descriere || '-'}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}

          {activeTab === 'program-lucru' && (
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
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {programLucru.map((program) => (
        <tr key={program.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{program.id}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {getProgramLucruDisplay(program)}
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
        </tr>
      ))}
    </tbody>
  </table>
</div>

          )}

        </>

      )}

    </div>

  );

}