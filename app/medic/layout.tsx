import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function MedicLayout({ children }: { children: React.ReactNode }) {
  console.log('🔒 MEDIC LAYOUT: Starting protection check...');
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    console.log('🔒 MEDIC LAYOUT: Token found:', !!token);

    if (!token) {
      console.log('🔒 MEDIC LAYOUT: No token - redirecting to login');
      redirect("/login");
    }

    console.log('🔒 MEDIC LAYOUT: Fetching user info...');
    const res = await fetch("http://localhost:4000/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    console.log('🔒 MEDIC LAYOUT: Response status:', res.status);

    if (!res.ok) {
      console.log('🔒 MEDIC LAYOUT: Invalid response - redirecting to login');
      redirect("/login");
    }

    const userData = await res.json();
    console.log('🔒 MEDIC LAYOUT: User data:', userData);

    if (userData.role !== "medic") {
      console.log('🔒 MEDIC LAYOUT: Wrong role - redirecting to unauthorized');
      redirect("/unauthorized");
    }

    console.log('🔒 MEDIC LAYOUT: Access granted - rendering children');
    return <>{children}</>;
  } catch (err) {
    console.error("🔒 MEDIC LAYOUT: Error:", err);
    console.log('🔒 MEDIC LAYOUT: Error - redirecting to login');
    redirect("/login");
  }
}
