'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatScreen from '@/components/ChatScreen';
import { validateSession } from '@/lib/api';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room') || 'default';

  const [sessionData, setSessionData] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const session = localStorage.getItem('chatSession');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          const result = await validateSession(parsed.sessionId);
          if (result.success) {
            setSessionData(parsed);
            setChecking(false);
            return;
          }
          localStorage.removeItem('chatSession');
        } catch (err) {
          console.error('Session validation failed:', err);
          localStorage.removeItem('chatSession');
        }
      }
      router.replace('/login');
    };
    check();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('chatSession');
    setSessionData(null);
    router.replace('/login');
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          <p className="mt-4 text-lg text-gray-700">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ChatScreen sessionData={sessionData} onLogout={handleLogout} roomId={roomId} />
    </main>
  );
}
