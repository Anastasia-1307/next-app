'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ResetToken {
  email: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export default function DebugEmailsPage() {
  const [tokens, setTokens] = useState<ResetToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would normally fetch from a database
    // For now, we'll show instructions
    setLoading(false);
  }, []);

  const createResetLink = (token: string) => {
    return `http://localhost:3000/reset-password?token=${token}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📧 Debug Emailuri - Password Reset Tokens
            </h1>
            <p className="text-gray-600">
              Această pagină afișează token-urile de resetare a parolei pentru dezvoltare.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              📋 Cum să folosești:
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Trimite un email de resetare de la <Link href="/forgot-password" className="text-blue-600 hover:underline">Forgot Password</Link></li>
              <li>Copiază token-ul din consola serverului de auth</li>
              <li>Construiește link-ul manual: <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:3000/reset-password?token=TOKEN_UL_AICI</code></li>
              <li>Deschide link-ul în browser pentru a reseta parola</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              🔍 Unde găsești token-ul:
            </h2>
            <p className="text-yellow-700">
              Token-ul este afișat în consola serverului de auth după trimiterea emailului. Caută linia:
            </p>
            <div className="bg-gray-900 text-green-400 p-3 rounded mt-2 font-mono text-sm">
              🔍 Reset token created successfully: abc123def456... (token-ul complet apare aici)
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Flux complet de test:
            </h2>
            <div className="space-y-2 text-green-700">
              <p>1. Mergi la <Link href="/forgot-password" className="text-green-600 hover:underline">/forgot-password</Link></p>
              <p>2. Introdu orice email (ex: test@example.com)</p>
              <p>3. Click pe "Trimite Email de Resetare"</p>
              <p>4. Copiază token-ul din consola serverului auth</p>
              <p>5. Deschide <code className="bg-green-100 px-2 py-1 rounded">http://localhost:3000/reset-password?token=TOKEN_COPIAT</code></p>
              <p>6. Setează parola nouă</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/forgot-password"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              ← Înapoi la Forgot Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
