import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

export default async function MedicLayout({ children }: { children: React.ReactNode }) {
  console.log('🔒 MEDIC LAYOUT: EXECUTING!!!');
  
  try {
    // Use the new auth system with refresh token support
    const userData = await requireRole("medic");
    
    console.log('🔒 MEDIC LAYOUT: Medic authenticated:', userData.email);
    console.log('🔒 MEDIC LAYOUT: Access granted - rendering children');
    
    return <>{children}</>;
  } catch (err) {
    console.error("🔒 MEDIC LAYOUT: Error:", err);
    console.log('🔒 MEDIC LAYOUT: Error - redirecting to login');
    redirect("/login");
  }
}
