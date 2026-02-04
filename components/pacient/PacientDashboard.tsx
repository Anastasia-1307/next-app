"use client";
import { useState, useEffect } from "react";

interface Doctor {
  id: string;
  email: string;
  username: string;
}

interface Appointment {
  id: number;
  serviciu: string;
  data_programare: string;
  created_at: string;
}

interface PacientDashboardProps {
  user: any;
}

export default function PacientDashboard({ user }: PacientDashboardProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    serviciu: "",
    data_programare: "",
    notes: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Funcție pentru a obține token din cookie
  const getAuthTokenFromCookie = (): string | null => {
    if (typeof document === 'undefined') {
      return null;
    }
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        return decodeURIComponent(value);
      }
    }
    
    return null;
  };

  useEffect(() => {
    const initializeData = async () => {
      const token = getAuthTokenFromCookie();

      if (!token) {
        setError("Nu s-a găsit token-ul de autentificare");
        setLoading(false);
        return;
      }

      // Fetch doctors and appointments
      await Promise.all([
        fetchDoctors(token),
        fetchAppointments(token)
      ]);
      
      setLoading(false);
    };

    initializeData();
  }, []);

  const fetchDoctors = async (token: string) => {
    try {
      const response = await fetch("/api/patient/doctors", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const doctorsData = await response.json();
      setDoctors(doctorsData.doctors || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Eroare la încărcarea medicilor");
    }
  };

  const fetchAppointments = async (token: string) => {
    try {
      const response = await fetch("/api/patient/appointments", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const appointmentsData = await response.json();
      setAppointments(appointmentsData.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Eroare la încărcarea programărilor");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/patient/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthTokenFromCookie()}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Programare creată cu succes!");
        setFormData({ serviciu: "", data_programare: "", notes: "" });
        setShowForm(false);
        
        // Refresh appointments
        const appointmentsResponse = await fetch("/api/patient/appointments", {
          headers: {
            Authorization: `Bearer ${getAuthTokenFromCookie()}`
          }
        });
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData.appointments || []);
      } else {
        setError(data.error || "Eroare la crearea programării");
      }
    } catch (error) {
      setError("Eroare de rețea");
    }
  };

  const handleDelete = async (appointmentId: number) => {
    if (!confirm("Ești sigur că vrei să ștergi această programare?")) return;

    try {
      const response = await fetch(`/api/patient/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthTokenFromCookie()}`
        }
      });

      if (response.ok) {
        setSuccess("Programare ștearsă cu succes!");
        setAppointments(appointments.filter(apt => apt.id !== appointmentId));
      } else {
        const data = await response.json();
        setError(data.error || "Eroare la ștergerea programării");
      }
    } catch (error) {
      setError("Eroare de rețea");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Se încarcă...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Programările mele */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Programările mele</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                {showForm ? "Anulează" : "Programează-te"}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Programare nouă</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serviciu
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serviciu}
                    onChange={(e) => setFormData({...formData, serviciu: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Consultație generală"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data și ora
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.data_programare}
                    onChange={(e) => setFormData({...formData, data_programare: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (opțional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Note suplimentare..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Creează programarea
                </button>
              </form>
            )}

            {appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nu ai programări încă.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-lg">{appointment.serviciu}</h4>
                        <p className="text-gray-600">
                          {new Date(appointment.data_programare).toLocaleString("ro-RO")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        Șterge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informații personale și medici */}
        <div className="space-y-6">
          {/* Informații personale */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Informații personale</h2>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Rol:</strong> {user?.role}</p>
            </div>
          </div>

          {/* Medici disponibili */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Medici disponibili</h2>
            {doctors.length === 0 ? (
              <p className="text-gray-500">Nu sunt medici disponibili momentan.</p>
            ) : (
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="border border-gray-200 p-3 rounded-lg">
                    <h4 className="font-medium">Dr. {doctor.username}</h4>
                    <p className="text-sm text-gray-600">{doctor.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
