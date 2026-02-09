import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/cookie-utils";

export default async function MedicLayout({ children }: { children: React.ReactNode }) {
  console.log('🔒 MEDIC LAYOUT: EXECUTING!!!');
  
  try {
    const token = await getAuthToken();
    
    console.log('🔒 MEDIC LAYOUT: Token found:', !!token);

    if (!token) {
      console.log('🔒 MEDIC LAYOUT: No token - redirecting to login');
      redirect("/login");
    }

    console.log('🔒 MEDIC LAYOUT: Fetching user info...');
    const res = await fetch("http://localhost:4000/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    });

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
