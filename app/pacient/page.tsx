"use strict";
"use client";



import { useState, useEffect, useRef } from "react";

import LogoutButton from "@/components/layout/LogoutButton";

import PacientDashboard from "@/components/pacient/PacientDashboard";



interface Programare {

  id: string;

  pacient_id: string;

  medic_id: string;

  data_programare: string;

  ora_programare: string;

  status: 'programat' | 'confirmat' | 'anulat';

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



export default function PacientPage() {

  const [programari, setProgramari] = useState<Programare[]>([]);
  const [medici, setMedici] = useState<MedicInfo[]>([]);
  const [specialitati, setSpecialitati] = useState<Specialitate[]>([]);
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

        // Verificăm dacă programariData este un array sau conține array-ul programari
        const programariArray = Array.isArray(programariData) ? programariData : programariData?.programari || [];
        
        if (Array.isArray(programariArray)) {
          setProgramari(programariArray.map((p: any) => ({

            ...p,

            status: p.status as 'programat' | 'confirmat' | 'anulat'

          })));
        } else {
          console.error("❌ Programari data is not an array:", programariData);
          setProgramari([]);
        }



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



      } catch (error) {

        console.error('Failed to fetch pacient data:', error);

      } finally {

        setLoading(false);

      }

    };



    fetchData();


  }, []);


 


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



  const handleUpdateStatus = async (programareId: string, status: string) => {

    try {

      await fetch(`/api/pacient/programari/${programareId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });


      setProgramari(programari.map(p => p.id === programareId ? { ...p, status: status as 'programat' | 'confirmat' | 'anulat' } : p ));

    } catch (error) {

      console.error('Failed to update status:', error);

      alert('Eroare la actualizarea statusului');

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

            { id: 'specialitati', label: 'Specialități', count: specialitati.length }

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

                        specialitate: { value: string };

                        detalii: { value: string };

                      };

                      const formData = {

                        medic_id: target.medic_id.value,

                        data_programare: target.data_programare.value,

                        ora_programare: target.ora_programare.value,

                        specialitate: target.specialitate.value,

                        detalii: target.detalii.value

                      };

                      handleCreateProgramare(formData);

                    }}>

                      <div className="space-y-4">

                        <div>

                          <label className="block text-sm font-medium text-gray-700">Medic</label>

                          <select name="medic_id" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">

                            <option value="">Selectează medic</option>

                            {medici.map((medic) => (

                              <option key={medic.id} value={medic.id}>

                                {medic.specialitate} - {medic.experienta} ani

                              </option>

                            ))}

                          </select>

                        </div>

                        <div>

                          <label className="block text-sm font-medium text-gray-700">Data Programare</label>

                          <input type="date" name="data_programare" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />

                        </div>

                        <div>

                          <label className="block text-sm font-medium text-gray-700">Ora Programare</label>

                          <input type="time" name="ora_programare" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />

                        </div>

                        <div>

                          <label className="block text-sm font-medium text-gray-700">Specialitate</label>

                          <select name="specialitate" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">

                            <option value="">Selectează specialitate</option>

                            {specialitati.map((spec) => (

                              <option key={spec.id} value={spec.id}>

                                {spec.nume}

                              </option>

                            ))}

                          </select>

                        </div>

                        <div>

                          <label className="block text-sm font-medium text-gray-700">Detalii</label>

                          <textarea name="detalii" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />

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

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medic</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ora</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialitate</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>

                    </tr>

                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">

                    {programari.map((programare) => (

                      <tr key={programare.id}>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{programare.id}</td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                          {medici.find(m => m.id === programare.medic_id)?.specialitate} - {medici.find(m => m.id === programare.medic_id)?.experienta} ani

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

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                          {specialitati.find(s => s.id === programare.specialitate)?.nume || '-'}

                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">

                          <select

                            value={programare.status}

                            onChange={(e) => handleUpdateStatus(programare.id, e.target.value)}

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

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nume</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prenume</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialitate</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experiență</th>


                    </tr>

                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">

                    {medici.map((medic) => (

                      <tr key={medic.id}>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medic.id}</td>

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

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>

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

        </>

      )}

    </div>

  );

}