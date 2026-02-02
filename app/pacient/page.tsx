import { requireRole } from "@/lib/auth";
import LogoutButton from "@/components/layout/LogoutButton";

export default async function PacientPage() {
  const user = await requireRole("pacient");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Pacient</h1>
      <p className="mb-6">Bun venit, {user?.name}!</p>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Informații personale</h2>
        <div className="space-y-2">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Rol:</strong> {user?.role}</p>
        </div>
      </div>

      <div className="mt-8">
        <LogoutButton />
      </div>
    </div>
  );
}