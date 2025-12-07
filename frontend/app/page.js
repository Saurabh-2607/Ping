'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthScreen from '@/components/AuthScreen';
import ChatScreen from '@/components/ChatScreen';
import Landing from '@/components/Landing';
import { validateSession } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const roomId = 'default';

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
            setShowLanding(false);
          } else {
            localStorage.removeItem('chatSession');
            setIsAuthenticated(false);
            setShowLanding(true);
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          localStorage.removeItem('chatSession');
          setIsAuthenticated(false);
          setShowLanding(true);
        }
      } else {
        setShowLanding(true);
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const handleAuthSuccess = (session) => {
    localStorage.setItem('chatSession', JSON.stringify(session));
    setSessionData(session);
    setIsAuthenticated(true);
    setShowLanding(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('chatSession');
    setSessionData(null);
    setIsAuthenticated(false);
    setShowLanding(true);
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
      ) : showLanding ? (
        <Landing onGetStarted={() => setShowLanding(false)} />
      ) : (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      )}
    </main>
  );
}
