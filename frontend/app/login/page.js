'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthScreen from '@/components/AuthScreen';
import { validateSession } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const session = localStorage.getItem('chatSession');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          const result = await validateSession(parsed.sessionId);
          if (result.success) {
            router.replace('/chat');
            return;
          }
          localStorage.removeItem('chatSession');
        } catch (err) {
          console.error('Session validation failed:', err);
          localStorage.removeItem('chatSession');
        }
      }
      setChecking(false);
    };
    check();
  }, [router]);

  const handleAuthSuccess = (session) => {
    localStorage.setItem('chatSession', JSON.stringify(session));
    router.replace('/chat');
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          <p className="mt-4 text-lg text-gray-700">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AuthScreen onAuthSuccess={handleAuthSuccess} />
    </main>
  );
}
