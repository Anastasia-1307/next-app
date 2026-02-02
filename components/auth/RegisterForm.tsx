"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { generatePKCEPair } from "@/lib/pkce";
import { validateRegistrationForm } from "@/lib/validation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = validateRegistrationForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Classic registration
  const handleClassicRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await api.register(formData);
      document.cookie = `auth_token=${response.token}; path=/; samesite=strict; max-age=3600`;
      
      // Redirect direct pe bază de rol
      const roleRoute = `/${response.user.role}`;
      router.push(roleRoute);
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError("A apărut o eroare. Încearcă din nou.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth registration
  const handleOAuthRegister = async () => {
    try {
      const { verifier, challenge } = await generatePKCEPair();
      sessionStorage.setItem("pkce_verifier", verifier);
      sessionStorage.setItem("pkce_challenge", challenge);
      
      const authUrl = api.initiateOAuthFlow("register", challenge);
      window.location.href = authUrl;
    } catch (error) {
      setServerError("A apărut o eroare la inițierea OAuth.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* More visible background card */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 space-y-8 shadow-xl border border-white/20">
          {/* Header with gradient text */}
          <div className="text-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 dark:from-amber-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent">
              Înregistrare
            </h2>
    
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Creează-ți cont pentru a începe
            </p>
          </div>
          
          {serverError && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {serverError}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleClassicRegister} autoComplete="off">
            <div className="space-y-4">
              <Input
                label="Nume"
                name="name"
                type="text"
                autoComplete="off"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                className="bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm"
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                className="bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm"
                required
              />

              <Input
                label="Parolă"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                error={errors.password}
                showPasswordToggle
                className="bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm"
                required
              />

              <Input
                label="Confirmare Parolă"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                error={errors.confirmPassword}
                showPasswordToggle
                className="bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Creează Cont
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 font-medium">sau</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-xl hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 backdrop-blur-sm"
            onClick={handleOAuthRegister}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Înregistrare cu OAuth
            </div>
          </Button>

          <div className="text-center pt-4 pb-6">
            <p className="text-gray-700 dark:text-gray-300">
              Ai deja cont?{" "}
              <a 
                href="/login" 
                className="font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hover:from-amber-500 hover:to-orange-500 transition-all duration-200"
              >
                Autentifică-te
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
