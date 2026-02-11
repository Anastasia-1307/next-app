import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

export default async function PacientLayout({ children }: { children: React.ReactNode }) {
  console.log('🔒 PACIENT LAYOUT: Starting protection check...');
  
  try {
    // Use the new auth system with refresh token support
    const userData = await requireRole("pacient");
    
    console.log('🔒 PACIENT LAYOUT: Patient authenticated:', userData.email);
    console.log('🔒 PACIENT LAYOUT: Access granted - rendering children');
    
    return <>{children}</>;
  } catch (err) {
    console.error("🔒 PACIENT LAYOUT: Error:", err);
    console.log('🔒 PACIENT LAYOUT: Error - redirecting to login');
    redirect("/login");
  }
}