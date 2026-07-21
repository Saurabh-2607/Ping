'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Image from 'next/image';
import LandingIllustration from '@/components/landing/LandingIllustration';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div className="h-full w-full flex flex-col overflow-auto transition-colors duration-300 bg-white text-gray-900 dark:bg-black dark:text-white">
      <Container className="flex flex-col sm:flex-row flex-1 items-center sm:items-stretch overflow-hidden py-4 sm:py-6 gap-6 sm:gap-8">
        
        {/* Left Section - Perfectly Fitted Hero Content */}
        <div className="w-full sm:w-1/2 lg:w-5/12 px-2 sm:px-4 md:px-6 flex flex-col justify-between items-center sm:items-start relative shrink-0 sm:shrink sm:overflow-hidden min-h-[420px] sm:min-h-0">
          
          {/* Main Hero Text Content */}
          <main className="w-full max-w-lg my-auto pt-4 sm:pt-0 flex flex-col justify-center text-center sm:text-left">
            <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.15] mb-4 sm:mb-6 tracking-tight text-gray-900 dark:text-white">
              Stay Connected with{' '}
              <span className="inline-flex items-center gap-1.5 align-baseline">
                <Image
                  src="/ping-logo.svg"
                  width={36}
                  height={36}
                  className="object-contain inline-block align-middle w-7 h-7 sm:w-9 sm:h-9"
                  alt="Ping Logo"
                  priority
                />
                Ping
              </span>
              , anywhere, anytime.
            </h1>

            <p className="text-base sm:text-lg mb-6 sm:mb-8 max-w-md leading-relaxed text-gray-600 dark:text-gray-400 mx-auto sm:mx-0 font-normal">
              Connect instantly with friends and strangers. Share your thoughts, jokes, and memes in real-time chat rooms.
            </p>

            <div className="flex flex-col items-center sm:items-start gap-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="px-8 py-3.5 text-base font-bold shadow-sm hover:shadow-md transition-all"
              >
                Start Chatting
              </Button>
            </div>
          </main>

          {/* Footer - Portfolio Link to srbh.site */}
          <footer id="footer" className="w-full pt-4 pb-2 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 flex flex-wrap items-center justify-center sm:justify-start gap-1">
            <span>© {new Date().getFullYear()} by Ping.</span>
            <span>Made by</span>
            <a
              href="https://srbh.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 underline underline-offset-2 font-bold transition-colors"
            >
              srbh.site
            </a>
          </footer>
        </div>

        {/* Right Section - Illustration Part (Untouched) */}
        <div className="flex shrink-0 sm:shrink w-full sm:w-1/2 lg:w-7/12 relative flex-col items-center justify-center dark:bg-black sm:overflow-hidden py-2 sm:py-0">  
          <LandingIllustration />
        </div>
      </Container>
    </div>
  );
}
