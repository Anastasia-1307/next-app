import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/layout/LogoutButton";
import { requireAuth } from "@/lib/auth";

// Server component - runs before any client code
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔒 ADMIN LAYOUT: Checking access...');
  
  try {
    // Use the new auth system with refresh token support
    const { user, token } = await requireAuth();
    
    console.log('🔒 ADMIN LAYOUT: User authenticated:', user.email, 'Role:', user.role);
    
    // Verify admin role
    if (user.role !== "admin") {
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

    console.log('🔒 ADMIN LAYOUT: Admin access granted - rendering protected content');
    
    // DOAR DACĂ E ADMIN - render protected admin layout
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Conținutul paginii */}
            {children}
          </div>
        </main>
      </div>
    );

  } catch (error) {
    console.log('🔒 ADMIN LAYOUT: Authentication failed - BLOCKING ACCESS', error);
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
}
