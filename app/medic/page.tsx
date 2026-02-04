import LogoutButton from "@/components/layout/LogoutButton";

export default function MedicPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Medic</h1>
        <LogoutButton />
      </div>
      
      <p className="mb-6 text-gray-600">Bun venit, Medic!</p>
      
      {/* Medic dashboard content will be added here */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Panou Medic</h2>
        <p className="text-gray-600">Conținutul dashboard-ului medic va fi adăugat aici.</p>
      </div>
    </div>
  );
}
