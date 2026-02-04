import { requireRole } from "@/lib/auth";
import LogoutButton from "@/components/layout/LogoutButton";
import PacientDashboard from "@/components/pacient/PacientDashboard";

export default async function PacientPage() {
  const user = await requireRole("pacient");
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Pacient</h1>
        <LogoutButton />
      </div>
      
      <p className="mb-6 text-gray-600">Bun venit, {user.name}!</p>
      
      <PacientDashboard user={user} />
    </div>
  );
}