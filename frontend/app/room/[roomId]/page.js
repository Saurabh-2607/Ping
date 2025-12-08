'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AuthScreen from '@/components/AuthScreen';
import ChatScreen from '@/components/ChatScreen';
import { validateSession } from '@/lib/api';

export default function RoomPage() {
  const params = useParams();
  const roomId = params?.roomId || 'default';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('chatSession');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          localStorage.removeItem('chatSession');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const handleAuthSuccess = (session) => {
    localStorage.setItem('chatSession', JSON.stringify(session));
    setSessionData(session);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('chatSession');
    setSessionData(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {isAuthenticated && sessionData ? (
        <ChatScreen sessionData={sessionData} onLogout={handleLogout} roomId={roomId} />
      ) : (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      )}
    </main>
  );
}
