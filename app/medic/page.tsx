"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/layout/LogoutButton";

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function MedicPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // Form state
  const [newAppointment, setNewAppointment] = useState({
    patient_id: "",
    date: "",
    time: "",
    notes: ""
  });

  useEffect(() => {
    const initializeData = async () => {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch user info and check role
      fetch('http://localhost:4000/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) throw new Error('Unauthorized');
        return response.json();
      })
      .then(async userData => {
        if (userData.role !== 'medic') {
          router.push('/admin');
          return;
        }
        setUser(userData);
        
        // First, sync OAuth user to resource server
        console.log("🔍 Medic Page - Syncing OAuth user...");
        const syncResponse = await fetch('http://localhost:5000/api/admin/sync-oauth-user', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          console.log("✅ Medic Page - OAuth user synced:", syncData);
        } else {
          const syncError = await syncResponse.text();
          console.log("❌ Medic Page - OAuth user sync failed:", syncError);
          console.log("❌ Medic Page - Sync status:", syncResponse.status);
        }
        
        // Fetch appointments and patients
        Promise.all([
          fetchAppointments(token),
          fetchPatients(token)
        ]);
      })
      .catch(err => {
        console.error('Auth error:', err);
        router.push('/login');
      })
      .finally(() => setLoading(false));
    };

    initializeData();
  }, [router]);

  const fetchAppointments = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/medic/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Nu s-au putut încărca programările');
    }
  };

  const fetchPatients = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/medic/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const createAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/medic/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAppointment)
      });

      if (!response.ok) throw new Error('Failed to create appointment');
      
      const createdAppointment = await response.json();
      setAppointments([...appointments, createdAppointment]);
      
      // Reset form
      setNewAppointment({ patient_id: "", date: "", time: "", notes: "" });
      setShowCreateForm(false);
      
      // Refresh appointments
      fetchAppointments(token);
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Nu s-a putut crea programarea');
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/medic/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to cancel appointment');
      
      setAppointments(appointments.filter(apt => apt.id !== appointmentId));
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Nu s-a putut anula programarea');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Se încarcă...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-red-600">Nu sunteți autorizat</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Medic</h1>
          <p className="text-gray-600 mt-1">Bun venit, Dr. {user?.name}!</p>
        </div>
        <LogoutButton />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Programări astăzi</h3>
          <p className="text-2xl font-bold text-blue-600">
            {appointments.filter(apt => {
              const today = new Date().toISOString().split('T')[0];
              return apt.date === today;
            }).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Programări totale</h3>
          <p className="text-2xl font-bold text-green-600">{appointments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Pacienți activi</h3>
          <p className="text-2xl font-bold text-purple-600">{patients.length}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? 'Anulează' : 'Adaugă programare'}
        </button>
      </div>

      {/* Create Appointment Form */}
      {showCreateForm && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Programare nouă</h2>
          <form onSubmit={createAppointment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pacient
              </label>
              <select
                value={newAppointment.patient_id}
                onChange={(e) => setNewAppointment({...newAppointment, patient_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selectați un pacient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ora
                </label>
                <input
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (opțional)
              </label>
              <textarea
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Note despre programare..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Salvează programarea
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Anulează
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Programările mele</h2>
        </div>
        
        {appointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Nu aveți programări programate
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status === 'scheduled' ? 'Programat' :
                         appointment.status === 'completed' ? 'Finalizat' : 'Anulat'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Pacient</span>
                        <p className="font-medium">{appointment.patient_name}</p>
                        <p className="text-sm text-gray-600">{appointment.patient_email}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Data și ora</span>
                        <p className="font-medium">{new Date(appointment.date).toLocaleDateString('ro-RO')}</p>
                        <p className="text-sm text-gray-600">{appointment.time}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Note</span>
                        <p className="text-sm">{appointment.notes || 'Fără note'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {appointment.status === 'scheduled' && (
                    <div className="ml-4">
                      <button
                        onClick={() => cancelAppointment(appointment.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Anulează
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
