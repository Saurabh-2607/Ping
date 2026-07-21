'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatScreen from '@/components/ChatScreen';
import LoadingScreen from '@/components/chat/LoadingScreen';
import { validateSession } from '@/lib/api';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId || 'victor';
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
    return <LoadingScreen message="Loading room..." />;
  }

  return (
    <main className="h-full overflow-hidden bg-white text-gray-900 dark:bg-black dark:text-white">
      {sessionData ? (
        <ChatScreen sessionData={sessionData} onLogout={handleLogout} roomId={roomId} />
      ) : null}
    </main>
  );
}
