'use client';

import { useState } from 'react';
import { requestOTP, verifyOTP } from '@/lib/api';
import { useTheme } from '@/components/ThemeProvider';
import Button from '@/components/ui/Button';

export default function AuthScreen({ onAuthSuccess }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
          onAuthSuccess(result.session);
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="rounded-lg bg-white dark:bg-black dark:border dark:border-gray-800 p-8 shadow-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold mb-2 tracking-tight text-gray-900 dark:text-white">
              Welcome to <span className="text-indigo-600">Ping</span>
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400">Sign in to join the conversation</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 border ${
              theme === 'dark' ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
            }`}>
              <p className={theme === 'dark' ? 'text-red-400 text-sm' : 'text-red-800 text-sm'}>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className={`mb-6 p-4 border ${
              theme === 'dark' ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'
            }`}>
              <p className={theme === 'dark' ? 'text-green-400 text-sm' : 'text-green-800 text-sm'}>{success}</p>
            </div>
          )}

          {!showOTPInput ? (
            /* Email & Name Form */
            <form onSubmit={handleRequestOTP} className="space-y-5">
              <div>
                <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-black border-gray-700 text-white placeholder-gray-400 focus:bg-black'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'
                  }`}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="name" className={`block text-sm font-semibold mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-black border-gray-700 text-white placeholder-gray-400 focus:bg-black'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'
                  }`}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                variant="accent"
                className={`w-full py-3.5 flex items-center justify-center gap-2 ${
                  theme === 'dark' ? 'hover:shadow-lg hover:shadow-indigo-900/30' : 'hover:shadow-lg hover:shadow-indigo-200'
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
                <label htmlFor="otp" className={`block text-sm font-semibold mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Enter OTP
                </label>
                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Check your email for the 6-digit OTP</p>
                <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  If you don't see the email, please check your spam/junk folder or request a new OTP.
                </p>
                <input
                  id="otp"
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className={`w-full px-4 py-3 border text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 font-mono ${
                    theme === 'dark'
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
                className={`w-full py-3.5 flex items-center justify-center gap-2 ${
                  theme === 'dark' ? 'hover:shadow-lg hover:shadow-indigo-900/30' : 'hover:shadow-lg hover:shadow-indigo-200'
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
                className={`w-full py-2 ${
                  theme === 'dark' ? 'text-indigo-400 hover:bg-indigo-900/30' : 'text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                ← Back to Email
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
