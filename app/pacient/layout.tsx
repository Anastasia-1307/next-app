import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/cookie-utils";

export default async function PacientLayout({ children }: { children: React.ReactNode }) {
  console.log('🔒 PACIENT LAYOUT: Starting protection check...');
  
  try {
    const token = await getAuthToken();
    
    console.log('🔒 PACIENT LAYOUT: Token found:', !!token);

    if (!token) {
      console.log('🔒 PACIENT LAYOUT: No token - redirecting to login');
      redirect("/login");
    }

    console.log('🔒 PACIENT LAYOUT: Fetching user info...');
    const res = await fetch("http://localhost:4000/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.log('🔒 PACIENT LAYOUT: Invalid response - redirecting to login');
      redirect("/login");
    }

    const userData = await res.json();
    console.log('🔒 PACIENT LAYOUT: User data:', userData);

    if (userData.role !== "pacient") {
      console.log('🔒 PACIENT LAYOUT: Wrong role - redirecting to unauthorized');
      redirect("/unauthorized");
    }

    console.log('🔒 PACIENT LAYOUT: Access granted - rendering children');
    return <>{children}</>;
  } catch (err) {
    console.error("🔒 PACIENT LAYOUT: Error:", err);
    console.log('🔒 PACIENT LAYOUT: Error - redirecting to login');
    redirect("/login");
  }
}