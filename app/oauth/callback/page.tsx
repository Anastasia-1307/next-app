"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const code = searchParams.get("code");
    const codeVerifier = localStorage.getItem("pkce_verifier");
    
    console.log("🔍 OAuth Callback - Code from URL:", code);
    console.log("🔍 OAuth Callback - CodeVerifier from localStorage:", codeVerifier);
    console.log("🔍 OAuth Callback - All localStorage items:", {
      pkce_verifier: localStorage.getItem("pkce_verifier"),
      pkce_challenge: localStorage.getItem("pkce_challenge")
    });
    
    if (!code || !codeVerifier) {
      console.error("❌ Missing code or verifier", { code: !!code, codeVerifier: !!codeVerifier });
      router.push("/login?error=missing_code_or_verifier");
      return;
    }

    const authorize = async () => {
      try {
        console.log("🔍 OAuth Callback - Code:", code);
        console.log("🔍 OAuth Callback - CodeVerifier exists:", !!codeVerifier);
        
        const { access_token } = await api.exchangeCodeForToken(code, codeVerifier);
        
        console.log("🔍 OAuth Callback - Access token received:", access_token.substring(0, 20) + "...");
        
        // Set auth cookie
        document.cookie = `auth_token=${access_token}; path=/; samesite=strict; max-age=3600`;
        
        // Get user info and redirect based on role
        console.log("🔍 OAuth Callback - Getting user info...");
        const user = await api.getUserInfo(access_token);
        
        console.log("🔍 OAuth Callback - User info received:", user);
        
        // Save token to cookie (already saved above)
        console.log("🔍 OAuth Callback - Token already saved to cookie");
        
        sessionStorage.removeItem("pkce_verifier");
        
        // Redirect based on role
        switch (user.role) {
          case "admin":
            router.push("/admin");
            break;
          case "medic":
            router.push("/medic");
            break;
          default:
            router.push("/pacient");
        }
      } catch (error) {
        console.error("❌ OAuth callback error:", error);
        router.push("/login?error=auth_failed");
      }
    };

    authorize();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-200 dark:bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Se procesează autentificarea...</p>
      </div>
    </div>
  );
}
