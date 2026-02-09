"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("OAuth error:", error);
        setStatus("error");
        setTimeout(() => {
          router.push("/login?error=oauth_failed");
        }, 2000);
        return;
      }

      if (!code) {
        setStatus("error");
        setTimeout(() => {
          router.push("/login?error=no_code");
        }, 2000);
        return;
      }

      try {
        // Get PKCE verifier from sessionStorage
        const codeVerifier = sessionStorage.getItem("pkce_verifier");
        
        if (!codeVerifier) {
          console.error("No PKCE verifier found in sessionStorage");
          setStatus("error");
          setTimeout(() => {
            router.push("/login?error=no_verifier");
          }, 2000);
          return;
        }

        // Call server action to handle token exchange and set secure cookie
        const response = await fetch("/api/auth/oauth-callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("OAuth callback failed:", errorData);
          console.error("Response status:", response.status);
          console.error("Response headers:", response.headers);
          throw new Error("OAuth callback failed");
        }

        const responseData = await response.json();
        console.log("🔍 OAuth callback - Full response:", responseData);
        const { userData } = responseData;
        console.log("🔍 OAuth callback - User data received:", userData);
        console.log("🔍 OAuth callback - User role:", userData.role);
        
        setStatus("success");
        setTimeout(() => {
          // Redirect based on user role
          console.log("🔍 Redirecting based on role:", userData.role);
          switch (userData.role) {
            case "admin":
              console.log("🔍 Redirecting to /admin");
              router.push("/admin");
              break;
            case "medic":
              console.log("🔍 Redirecting to /medic");
              router.push("/medic");
              break;
            case "pacient":
              console.log("🔍 Redirecting to /pacient");
              router.push("/pacient");
              break;
            default:
              console.log("🔍 Unknown role, redirecting to /login");
              router.push("/login");
              break;
          }
        }, 1000);
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setTimeout(() => {
          router.push("/login?error=oauth_callback_failed");
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {status === "loading" && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Se procesează autentificarea...</h2>
            <p className="text-gray-600 mt-2">Așteaptă redirecționarea...</p>
          </div>
        )}
        
        {status === "success" && (
          <div>
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-gray-900">Autentificare reușită!</h2>
            <p className="text-gray-600 mt-2">Vei fi redirecționat la dashboard-ul tău...</p>
          </div>
        )}
        
        {status === "error" && (
          <div>
            <div className="text-red-600 text-6xl mb-4">✗</div>
            <h2 className="text-xl font-semibold text-gray-900">Autentificare eșuată!</h2>
            <p className="text-gray-600 mt-2">Vei fi redirecționat la pagina de login...</p>
          </div>
        )}
      </div>
    </div>
  );
}
