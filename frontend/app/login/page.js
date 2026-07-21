'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { requestOTP, verifyOTP, validateSession } from '@/lib/api';
import { useTheme } from '@/components/ThemeProvider';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import LoadingScreen from '@/components/chat/LoadingScreen';
import LoginIllustration from '@/components/login/LoginIllustration';

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const check = async () => {
      const session = localStorage.getItem('chatSession');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          const result = await validateSession(parsed.sessionId);
          if (result.success) {
            router.replace('/room/default');
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
    router.replace('/room/default');
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !name) {
      setError('Please enter both email and name');
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestOTP(email, name);
      if (result.success) {
        setSuccess("OTP sent successfully! Check your inbox — if you don't see it, check your spam/junk folder.");
        setShowOTPInput(true);
      } else {
        setError(result.message || 'Failed to request OTP');
      }
    } catch (err) {
      setError('An error occurred: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOTP(email, name, otp);
      if (result.success) {
        setSuccess('Authentication successful!');
        setTimeout(() => {
          handleAuthSuccess(result.session);
        }, 500);
      } else {
        setError(result.message || 'Failed to verify OTP');
      }
    } catch (err) {
      setError('An error occurred: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setShowOTPInput(false);
    setOtp('');
    setError('');
    setSuccess('');
  };

  if (checking) {
    return <LoadingScreen message="Checking session..." />;
  }

  return (
    <div className="relative h-full w-full flex overflow-hidden transition-colors duration-300 bg-white text-gray-900 dark:bg-black dark:text-white isolate">
      
      {/* TailwindCSS & Cloudflare Style Hero Grid Pattern with Radial Mask & Glow */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {/* Crisp Linear Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Ambient Top Glow Spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      </div>

      <Container className="relative z-10 flex flex-1 overflow-hidden items-stretch">
        
        {/* Left Section - Dedicated Login Authentication Illustration */}
        <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center dark:bg-black overflow-hidden py-4">
          <LoginIllustration />
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden">
          {/* Main Content */}
          <main className="w-full max-w-md mx-auto my-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-extrabold mb-2 tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                Welcome to{' '}
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <Image
                    src="/ping-logo.svg"
                    width={32}
                    height={32}
                    className="object-contain inline-block align-middle"
                    alt="Ping Logo"
                    priority
                  />
                  Ping
                </span>
              </h1>
              <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400">Sign in to join the conversation</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`mb-6 p-4 border ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                }`}>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className={`mb-6 p-4 border ${theme === 'dark' ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'
                }`}>
                <p className={theme === 'dark' ? 'text-green-400 text-sm' : 'text-green-800 text-sm'}>{success}</p>
              </div>
            )}

            {!showOTPInput ? (
              /* Email & Name Form */
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200 ${theme === 'dark'
                        ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:ring-white/20 focus:border-white'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="name" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200 ${theme === 'dark'
                        ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:ring-white/20 focus:border-white'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="accent"
                  className={`w-full py-3.5 flex items-center justify-center gap-2 ${theme === 'dark' ? 'hover:shadow-lg hover:shadow-indigo-900/30' : 'hover:shadow-lg hover:shadow-indigo-200'
                    }`}
                >
                  {isLoading && (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Send OTP
                </Button>

                <p className={`text-center text-sm mt-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  We&apos;ll send a one-time password to your email address for secure authentication.
                </p>
              </form>
            ) : (
              /* OTP Form */
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label htmlFor="otp" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Enter OTP
                  </label>
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Check your email for the 6-digit OTP</p>
                  <input
                    id="otp"
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className={`w-full mono-font px-4 py-3 border text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 font-mono ${theme === 'dark'
                        ? 'bg-black border-gray-700 text-indigo-400 placeholder-gray-500 focus:bg-black'
                        : 'bg-gray-50 border-gray-200 text-indigo-600 focus:bg-white'
                      }`}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="accent"
                  className={`w-full py-3.5 flex items-center justify-center gap-2 ${theme === 'dark' ? 'hover:shadow-lg hover:shadow-indigo-900/30' : 'hover:shadow-lg hover:shadow-indigo-200'
                    }`}
                >
                  {isLoading && (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Verify OTP
                </Button>

                <Button
                  type="button"
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                  variant="ghost"
                  className={`w-full py-2 ${theme === 'dark' ? 'text-indigo-400 hover:bg-indigo-900/30' : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                >
                  ← Back to Email
                </Button>
              </form>
            )}
          </main>

          {/* Footer with Portfolio Link */}
          <footer id="footer" className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mt-auto pt-8 flex flex-wrap items-center gap-1">
            <span>© {new Date().getFullYear()} by Ping.</span>
            <span>Made by</span>
            <a
              href="https://srbh.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold transition-colors"
            >
              srbh.site
            </a>
          </footer>
        </div>
      </Container>
    </div>
  );
}
