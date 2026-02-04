import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Server component - runs before any client code
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔒 ADMIN LAYOUT: EXECUTING!!!');
  
  // IMMEDIATE auth check - no async delays
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  console.log('🔒 ADMIN LAYOUT: Token found:', !!token);

  if (!token) {
    console.log('🔒 ADMIN LAYOUT: No token - redirecting to login');
    redirect("/login");
  }

  // Fast auth check
  try {
    console.log('🔒 ADMIN LAYOUT: Fetching user info...');
    const res = await fetch("http://localhost:4000/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      console.log('🔒 ADMIN LAYOUT: Invalid response - redirecting to login');
      redirect("/login");
    }

    const userData = await res.json();
    console.log('🔒 ADMIN LAYOUT: User data:', userData);
    
    if (userData.role !== "admin") {
      console.log('🔒 ADMIN LAYOUT: Wrong role - redirecting to unauthorized');
      redirect("/unauthorized");
    }
  } catch (error) {
    console.log('🔒 ADMIN LAYOUT: Error - redirecting to login');
    redirect("/login");
  }

  console.log('🔒 ADMIN LAYOUT: Access granted - rendering children');
  // Only render if auth passes
  return <>{children}</>;
}
