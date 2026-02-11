"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/refresh-token-client";
import Button from "@/components/ui/Button";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 LOGOUT BUTTON - Starting logout process');
      
      // Use the improved logout function that handles everything
      await logout();
      
      console.log('🔍 LOGOUT BUTTON - Logout completed');
      
    } catch (error) {
      console.error('🔍 LOGOUT BUTTON - Error:', error);
      // În caz de eroare, încercăm să redirectăm oricum la login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
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
