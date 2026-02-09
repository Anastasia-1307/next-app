import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/layout/LogoutButton";
import { getAuthToken } from "@/lib/cookie-utils";

// Server component - runs before any client code
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔒 ADMIN LAYOUT: Checking access...');
  
  // Use utility function to get auth token
  const token = await getAuthToken();

  console.log('🔒 ADMIN LAYOUT: Token found:', !!token);

  if (!token) {
    console.log('🔒 ADMIN LAYOUT: No token - showing error page');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acces Neautorizat</h1>
          <p className="text-gray-600 mb-4">Nu ai permisiunea de a accesa această pagină.</p>
          <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Mergi la Login
          </a>
        </div>
      </div>
    );
  }

  // Simple JWT verification without external API call
  try {
    const { verifyToken } = await import("@/lib/jwt");
    const payload = await verifyToken(token);
    
    console.log('🔒 ADMIN LAYOUT: JWT payload:', payload);
    
    if (!payload || payload.role !== "admin") {
      console.log('🔒 ADMIN LAYOUT: Wrong role - BLOCKING ACCESS');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acces Neautorizat</h1>
            <p className="text-gray-600 mb-4">Nu ai permisiunea de a accesa această pagină.</p>
            <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Mergi la Login
            </a>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.log('🔒 ADMIN LAYOUT: JWT verification failed - BLOCKING ACCESS', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Eroare de Autentificare</h1>
          <p className="text-gray-600 mb-4">A apărut o eroare la verificarea accesului.</p>
          <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Mergi la Login
          </a>
        </div>
      </div>
    );
  }

  console.log('🔒 ADMIN LAYOUT: Access granted - rendering protected content');
  
  // DOAR DACĂ E ADMIN - render protected admin layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header protejat */}
     

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Conținutul paginii */}
          {children}
        </div>
      </main>

      {/* Footer protejat */}
      <div className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <p className="text-center text-sm text-gray-500">
              🛡️ 2024 Admin Panel - Acces restricționat. Doar administratorii au acces la această zonă.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
