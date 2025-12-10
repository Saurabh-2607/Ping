'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from '../ThemeToggle';
import Button from './Button';
import Container from './Container';

export default function Navbar() {
  const pathname = usePathname();
  const showGetStarted = pathname === '/';

  return (
    <header className="w-full bg-white/80 dark:bg-gray-900/80" style={{backdropFilter: 'blur(6px)'}}>
      <Container className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="relative h-8 w-8">
                <Image
                  src="/ping-logo.svg"
                  fill
                  className="object-contain"
                  alt="Ping Logo"
                  priority
                />
              </div>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white">Ping</span>
            </div>
          </Link>
          
          {/* Nav Links */}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {showGetStarted && (
            <Link href="/login">
              <Button className="hidden sm:block">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}
