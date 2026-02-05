"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
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

    // Exchange code for token
    const exchangeCodeForToken = async () => {
      try {
        const response = await fetch("http://localhost:4000/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            client_id: "nextjs_client",
            grant_type: "authorization_code",
          }),
        });

        if (!response.ok) {
          throw new Error("Token exchange failed");
        }

        const data = await response.json();
        
        // Set auth token cookie
        document.cookie = `auth_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
        
        // Get user info to determine role-based redirect
        const userResponse = await fetch("http://localhost:4000/me", {
          headers: {
            "Authorization": `Bearer ${data.access_token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          
          setStatus("success");
          setTimeout(() => {
            // Redirect based on user role
            switch (userData.role) {
              case "admin":
                router.push("/admin");
                break;
              case "medic":
                router.push("/medic");
                break;
              case "pacient":
                router.push("/pacient");
                break;
              default:
                router.push("/login");
                break;
            }
          }, 1000);
        } else {
          throw new Error("Failed to get user info");
        }
      } catch (error) {
        console.error("Token exchange error:", error);
        setStatus("error");
        setTimeout(() => {
          router.push("/login?error=token_exchange_failed");
        }, 2000);
      }
    };

    exchangeCodeForToken();
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
