import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PacientLayout({ children }: { children: React.ReactNode }) {
  console.log('🔒 PACIENT LAYOUT: Starting protection check...');
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    console.log('🔒 PACIENT LAYOUT: Token found:', !!token);

    // Dacă nu există token → redirect la login
    if (!token) {
      console.log('🔒 PACIENT LAYOUT: No token - redirecting to login');
      redirect("/login");
    }

    // Fetch server-side pentru user info
    console.log('🔒 PACIENT LAYOUT: Fetching user info...');
    const res = await fetch("http://localhost:4000/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    console.log('🔒 PACIENT LAYOUT: Response status:', res.status);

    // Dacă token-ul e invalid → redirect la login
    if (!res.ok) {
      console.log('🔒 PACIENT LAYOUT: Invalid response - redirecting to login');
      redirect("/login");
    }

    const userData = await res.json();
    console.log('🔒 PACIENT LAYOUT: User data:', userData);

    // Verifică rolul
    if (userData.role !== "pacient") {
      console.log('🔒 PACIENT LAYOUT: Wrong role - redirecting to unauthorized');
      redirect("/unauthorized");
    }

    console.log('🔒 PACIENT LAYOUT: Access granted - rendering children');
    // Totul e OK → afișează copii
    return <>{children}</>;
  } catch (err) {
    console.error("🔒 PACIENT LAYOUT: Error:", err);
    // În caz de eroare neașteptată, redirect la login
    console.log('🔒 PACIENT LAYOUT: Error - redirecting to login');
    redirect("/login");
  }
}