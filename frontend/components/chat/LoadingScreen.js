'use client';

import Container from '../ui/Container';

export default function LoadingScreen({ theme }) {
  return (
    <Container fullHeight className={`flex items-center justify-center ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className={`mt-4 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Connecting to chat...</p>
      </div>
    </Container>
  );
}
