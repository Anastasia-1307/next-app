import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/layout/LogoutButton";
import PacientDashboard from "@/components/pacient/PacientDashboard";

export default async function PacientPage() {
  // Get user info directly from auth server
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const res = await fetch("http://localhost:4000/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      redirect("/login");
    }

    const user = await res.json();
    
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
  } catch (error) {
    redirect("/login");
  }
}