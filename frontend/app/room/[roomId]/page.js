'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatScreen from '@/components/ChatScreen';
import { validateSession } from '@/lib/api';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId || 'default';
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const session = localStorage.getItem('chatSession');
      if (session) {
        try {
          const parsedSession = JSON.parse(session);
          const result = await validateSession(parsedSession.sessionId);
          if (result.success) {
            setSessionData(parsedSession);
          } else {
            localStorage.removeItem('chatSession');
            router.replace('/login');
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          localStorage.removeItem('chatSession');
          router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
      setIsLoading(false);
    };

    checkSession();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('chatSession');
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      {sessionData ? (
        <ChatScreen sessionData={sessionData} onLogout={handleLogout} roomId={roomId} />
      ) : null}
    </main>
  );
}
