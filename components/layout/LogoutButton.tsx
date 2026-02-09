"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 LOGOUT BUTTON - Starting logout process');
      
      // Apelăm API-ul de logout pentru a șterge cookie-ul server-side
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('🔍 LOGOUT BUTTON - Logout API failed:', response.status);
        throw new Error('Logout failed');
      }

      const result = await response.json();
      console.log('🔍 LOGOUT BUTTON - Logout API response:', result);
      
      // Ștergem și datele din sessionStorage
      sessionStorage.removeItem("pkce_verifier");
      sessionStorage.removeItem("pkce_challenge");
      
      console.log('🔍 LOGOUT BUTTON - Redirecting to login');
      
      // Redirect la login
      router.replace("/login");
      
    } catch (error) {
      console.error('🔍 LOGOUT BUTTON - Error:', error);
      // În caz de eroare, încercăm să redirectăm oricum la login
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="danger" 
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
