import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/layout/LogoutButton";

// Server component - runs before any client code
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔒 ADMIN LAYOUT: Checking access...');
  
  // IMMEDIATE auth check - no async delays
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  console.log('🔒 ADMIN LAYOUT: Token found:', !!token);

  if (!token) {
    console.log('🔒 ADMIN LAYOUT: No token - redirecting to login');
    redirect("/login");
  }

  // Fast auth check - use container name in Docker
  let userData: any = null;
  try {
    console.log('🔒 ADMIN LAYOUT: Verifying admin access...');
    const res = await fetch("http://localhost:4000/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      console.log('🔒 ADMIN LAYOUT: Invalid response - redirecting to login');
      redirect("/login");
    }

    userData = await res.json();
    console.log('🔒 ADMIN LAYOUT: User data:', userData);
    
    if (userData.role !== "admin") {
      console.log('🔒 ADMIN LAYOUT: Wrong role - redirecting to unauthorized');
      redirect("/unauthorized");
    }
  } catch (error) {
    console.log('🔒 ADMIN LAYOUT: Error - redirecting to login');
    redirect("/login");
  }

  console.log('🔒 ADMIN LAYOUT: Access granted - rendering protected content');
  
  // Render protected admin layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header protejat */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">🛡️ Admin Panel</h1>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                ADMIN
              </span>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {userData.email}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                🏠 Home
              </a>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb de navigare */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-3" aria-label="Admin Navigation">
            <a
              href="/admin"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              📊 Dashboard
            </a>
            <a
              href="/admin/users"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              👥 Utilizatori
            </a>
            <a
              href="/admin/logs"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              📋 Log-uri
            </a>
            <a
              href="/admin/settings"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              ⚙️ Setări
            </a>
          </nav>
        </div>
      </div>

      {/* Banner de securitate */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Zonă Securizată - Acces Administrator</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Sunteți autentificat ca <strong>{userData.email}</strong> cu rol de <strong>Administrator</strong>.</p>
              <p className="mt-1">Toate acțiunile sunt monitorizate și înregistrate în sistem.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conținut protejat */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Debug info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800">🔒 Debug Information</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>✅ Token valid și prezent</p>
              <p>✅ Rol verificat: {userData.role}</p>
              <p>✅ Acces administrator confirmat</p>
            </div>
          </div>

          {/* Conținutul paginii */}
          {children}
        </div>
      </main>

      {/* Footer protejat */}
      <div className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <p className="text-center text-sm text-gray-500">
              🛡️ © 2024 Admin Panel - Acces restricționat. Doar administratorii au acces la această zonă.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
