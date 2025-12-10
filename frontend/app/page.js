'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Image from 'next/image';

const randomRoom = () => `room-${Math.random().toString(36).slice(2, 8)}`;

export default function Home() {
  const router = useRouter();

  const handleCreateRoom = () => {
    const room = randomRoom();
    router.push(`/room/${room}`);
  };

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div className="h-full w-full flex flex-col overflow-auto transition-colors duration-300 bg-white text-gray-900 dark:bg-black dark:text-white">
      <Container className="flex flex-col sm:flex-row flex-1 items-center sm:items-stretch overflow-hidden">
        {/* Left Section */}
        <div className="w-full sm:w-1/2 px-4 sm:px-6 md:pr-8 md:pl-0 flex flex-col items-center sm:items-start relative shrink-0 sm:shrink sm:overflow-hidden">
          {/* Main Content */}
          <main className="max-w-xl pt-8 sm:pt-0 sm:flex-1 flex flex-col justify-center text-center sm:text-left">
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold leading-[1.1] mb-4 tracking-tight text-gray-900 dark:text-white">
              Stay Connected with <span className="inline-flex items-center gap-1"><Image
                src="/ping-logo.svg"
                width={24}
                height={24}
                className="object-contain"
                alt="Ping Logo"
                priority
              /> Ping</span>, anywhere, anytime.
            </h1>

            <p className="text-base sm:text-base md:text-lg mb-6 sm:mb-8 max-w-md leading-relaxed text-gray-500 dark:text-gray-400 mx-auto sm:mx-0">
              Connect instantly with friends and strangers. Share your thoughts, jokes, and memes in real-time chat rooms.
            </p>

            <div className="flex flex-col items-center sm:items-start gap-6 sm:gap-8">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className=""
              >
                Start Chatting
              </Button>

              {/* Arrow pointing to button */}
              <div className="hidden text-red-400 transform -rotate-12">
                <svg width="60" height="20" viewBox="0 0 60 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M58 10H2M2 10L10 2M2 10L10 18" />
                </svg>
              </div>
            </div>
          </main>

          {/* Footer - hidden on mobile, shown on sm+ */}
          <footer id="footer" className="hidden sm:block text-xs sm:text-sm pb-4 font-semibold text-gray-800 dark:text-white">
            © {new Date().getFullYear()} by Ping. All Rights Reserved
          </footer>
        </div>

        {/* Right Section */}
        <div className="flex shrink-0 sm:shrink w-full sm:w-1/2 relative flex-col items-center sm:items-end justify-center sm:justify-start dark:bg-black sm:overflow-hidden">  
          <Image
          src="/landing.png"
          alt='Landing Image'
          width={1080}
          height={1080}
          className='max-h-[60vh] max-w-[90vw] sm:max-h-screen sm:max-w-full w-auto object-contain'
          />
        </div>
      </Container>
    </div>
  );
}
