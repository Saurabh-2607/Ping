'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Custom Inline SVG Icons
const PingIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 252 249" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M55.5 3.03761C59.62 1.92761 64.12 0.827614 65.5 0.597614C66.87 0.367614 93.65 0.117614 125 0.0276138C171.66 -0.0923862 183.45 0.147614 190 1.36761C194.4 2.18761 201.15 4.13761 205 5.71761C208.85 7.28761 213.8 9.70761 216 11.0876C218.2 12.4676 222.7 15.8376 226 18.5676C229.3 21.2976 234.33 26.6576 237.17 30.4676C240.02 34.2876 243.72 40.3376 245.39 43.9076C247.06 47.4776 249.24 53.3376 250.22 56.9076C251.79 62.6476 252 68.0576 251.97 103.408C251.94 138.018 251.7 144.348 250.19 150.408C249.23 154.258 246.35 161.678 243.78 166.908C239.8 175.018 237.72 177.808 229.56 185.948C222.17 193.318 218.18 196.428 212 199.598C207.6 201.858 200.85 204.658 197 205.828C193.15 206.998 187.3 208.188 184 208.478C180.7 208.768 175.75 209.178 173 209.388C170.25 209.598 157.2 209.788 120 209.848L113 215.868C109.15 219.178 99.53 227.188 91.62 233.648C83.71 240.118 76.06 246.198 74.62 247.148C73.18 248.108 70.31 248.898 68.25 248.898C65.54 248.908 63.67 248.138 61.52 246.158C59.43 244.238 58.4 242.208 58.09 239.408C57.84 237.208 57.62 229.108 57.55 207.408L53.27 206.048C50.92 205.298 46.07 203.208 42.5 201.408C38.93 199.608 33.11 195.948 29.58 193.268C26.04 190.598 20.74 185.708 17.78 182.408C14.83 179.108 10.44 172.578 8.04 167.908C5.64 163.238 2.85 156.488 1.84 152.908C0.19 147.078 0 142.158 0 104.908C0 68.4776 0.21 62.6176 1.76 56.9076C2.72 53.3376 5.29 46.8076 7.46 42.4076C9.63 38.0076 13.65 31.7076 16.4 28.4076C19.15 25.1076 24.01 20.2576 27.2 17.6376C30.39 15.0176 36.37 11.1176 40.5 8.95761C44.62 6.80761 51.37 4.14761 55.5 3.03761Z" fill="currentColor"/>
  </svg>
);

const ShieldCheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const LockIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const MailIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const WifiIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
  </svg>
);

const SignalIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="16" width="3.5" height="5" rx="0.5" />
    <rect x="7.5" y="12" width="3.5" height="9" rx="0.5" />
    <rect x="13" y="8" width="3.5" height="13" rx="0.5" />
    <rect x="18.5" y="4" width="3.5" height="17" rx="0.5" />
  </svg>
);

const BatteryIcon = () => (
  <svg className="w-4 h-2.5" fill="none" viewBox="0 0 24 14" stroke="currentColor" strokeWidth={2}>
    <rect x="1" y="1" width="18" height="12" rx="3" />
    <rect x="3" y="3" width="11" height="8" rx="1.5" fill="currentColor" />
    <path d="M21 4v6" strokeLinecap="round" />
  </svg>
);

const OTP_DIGITS = ['8', '4', '9', '2', '0', '1'];

export default function LoginIllustration() {
  const [typedDigits, setTypedDigits] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timers = [];

    const runAuthSequence = () => {
      if (!isMounted) return;
      setTypedDigits([]);
      setShowNotification(false);
      setIsVerified(false);

      // 1. Incoming Security OTP Ping Notification (~800ms)
      timers.push(setTimeout(() => {
        if (isMounted) setShowNotification(true);
      }, 800));

      // 2. Start typing OTP code digits one by one into the device screen slots
      OTP_DIGITS.forEach((digit, index) => {
        timers.push(setTimeout(() => {
          if (isMounted) {
            setTypedDigits((prev) => [...prev, digit]);
          }
        }, 2200 + index * 350));
      });

      // 3. Trigger Green Verification Checkmark (~4800ms)
      timers.push(setTimeout(() => {
        if (isMounted) setIsVerified(true);
      }, 4800));

      // 4. Reset & Loop (~8800ms)
      timers.push(setTimeout(() => {
        if (isMounted) runAuthSequence();
      }, 8800));
    };

    runAuthSequence();

    return () => {
      isMounted = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative w-full max-w-[300px] xs:max-w-[340px] sm:max-w-[400px] mx-auto py-2 sm:py-4 flex items-center justify-center select-none min-h-[460px] sm:min-h-[500px] overflow-hidden">
      
      {/* Background Signal Pulse Rings */}
      {[0, 2].map((delay, index) => (
        <motion.div
          key={index}
          className="absolute top-[20%] left-1/2 -translate-x-1/2 rounded-full border border-neutral-300/50 dark:border-zinc-700/40 pointer-events-none"
          initial={{ width: 90, height: 90, opacity: 0.7 }}
          animate={{
            width: [100, 290],
            height: [100, 290],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 4,
            delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* SMARTPHONE AUTHENTICATION MOCKUP FRAME */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="relative w-[240px] xs:w-[260px] sm:w-[280px] h-[460px] xs:h-[480px] sm:h-[510px] rounded-[36px] sm:rounded-[40px] p-2 sm:p-2.5 bg-neutral-200 dark:bg-zinc-900 border-[5px] sm:border-[6px] border-neutral-300/90 dark:border-zinc-800 flex flex-col overflow-hidden transition-colors duration-300 z-10"
      >
        {/* PHONE DISPLAY SCREEN */}
        <div className="relative w-full h-full rounded-[26px] sm:rounded-[30px] overflow-hidden isolate transform-gpu bg-white dark:bg-zinc-950 text-neutral-900 dark:text-zinc-100 flex flex-col transition-colors duration-300 border border-neutral-200/80 dark:border-zinc-800">
          
          {/* Dynamic Status Bar */}
          <div className="pt-2 px-3 sm:px-4 pb-1.5 flex items-center justify-between text-[10px] font-semibold text-neutral-700 dark:text-zinc-400 shrink-0 select-none z-30 bg-neutral-100/90 dark:bg-zinc-950/80 transition-colors duration-300">
            <span className="w-9 text-left font-bold tracking-tight">9:41</span>
            <div className="w-16 sm:w-20 h-3.5 sm:h-4 bg-neutral-900 dark:bg-black rounded-full flex items-center justify-between px-2 shrink-0 ring-1 ring-black/10 dark:ring-white/10">
              <div className="w-2 h-2 rounded-full bg-zinc-950 ring-1 ring-zinc-800 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-500/80" />
              </div>
              <div className="w-5 sm:w-6 h-1 rounded-full bg-zinc-700 dark:bg-zinc-800" />
            </div>
            <div className="flex items-center justify-end gap-1.5 w-9">
              <SignalIcon />
              <WifiIcon />
              <BatteryIcon />
            </div>
          </div>

          {/* App Security Header */}
          <div className="px-3.5 py-2.5 border-b border-neutral-200 dark:border-zinc-800 bg-neutral-100 dark:bg-zinc-900/90 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <PingIcon className="w-4.5 h-4.5 text-neutral-900 dark:text-zinc-100" />
              <span className="text-xs font-bold tracking-tight text-neutral-900 dark:text-zinc-100">Ping Security</span>
            </div>
            <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
          </div>

          {/* Authentication Screen Body */}
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center relative bg-white dark:bg-zinc-950">
            
            {/* Lock Badge Icon */}
            <motion.div
              animate={{
                scale: isVerified ? [1, 1.15, 1] : 1,
              }}
              transition={{ duration: 0.4 }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300 ${
                isVerified
                  ? 'bg-emerald-500 text-white'
                  : 'bg-neutral-100 dark:bg-zinc-900 text-neutral-800 dark:text-zinc-200 border border-neutral-200 dark:border-zinc-800'
              }`}
            >
              {isVerified ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <LockIcon className="w-5 h-5" />
              )}
            </motion.div>

            <h3 className="text-xs font-extrabold text-neutral-900 dark:text-zinc-100 mb-1">
              {isVerified ? 'Access Granted' : 'One-Time Verification'}
            </h3>
            <p className="text-[10px] text-neutral-500 dark:text-zinc-400 mb-4 max-w-[180px]">
              {isVerified ? 'Welcome back! Redirecting to chat room...' : 'Enter the 6-digit code sent to your email.'}
            </p>

            {/* OTP 6-Digit Slot Grid */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {Array.from({ length: 6 }).map((_, i) => {
                const char = typedDigits[i];
                const isActive = typedDigits.length === i;

                return (
                  <motion.div
                    key={i}
                    animate={{
                      scale: char ? [0.85, 1.05, 1] : isActive ? [1, 1.06, 1] : 1,
                    }}
                    transition={{ duration: 0.25 }}
                    className={`w-7 h-9 rounded-lg border font-mono text-sm font-bold flex items-center justify-center transition-colors duration-200 ${
                      isVerified
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : char
                        ? 'border-neutral-900 dark:border-zinc-100 bg-neutral-100 dark:bg-zinc-900 text-neutral-900 dark:text-zinc-100'
                        : isActive
                        ? 'border-emerald-500 bg-white dark:bg-zinc-950 text-neutral-900 dark:text-zinc-100 ring-1 ring-emerald-500/50'
                        : 'border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/50 text-neutral-400 dark:text-zinc-600'
                    }`}
                  >
                    {char || ''}
                  </motion.div>
                );
              })}
            </div>

            {/* Verification Status Pill */}
            <AnimatePresence mode="wait">
              {isVerified ? (
                <motion.div
                  key="verified"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/20"
                >
                  <CheckCircleIcon className="w-3 h-3" />
                  <span>100% Encrypted & Authenticated</span>
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[9.5px] text-neutral-400 dark:text-zinc-500 flex items-center gap-1"
                >
                  <MailIcon className="w-3 h-3" />
                  <span>Waiting for secure code...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated OTP Push Notification Banner */}
            <AnimatePresence>
              {showNotification && !isVerified && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="absolute top-2 left-2 right-2 p-2 rounded-xl bg-neutral-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-900 text-left border border-neutral-800 dark:border-zinc-200 z-20 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-neutral-300 dark:text-zinc-700">
                      <PingIcon className="w-3 h-3" />
                      <span>Ping Security</span>
                    </div>
                    <span className="text-[8px] text-neutral-400 dark:text-zinc-500">now</span>
                  </div>
                  <p className="text-[9.5px] font-medium leading-tight">
                    Your OTP is <span className="font-mono font-bold underline">849201</span>. Do not share.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="py-2 border-t border-neutral-200 dark:border-zinc-800 bg-neutral-100 dark:bg-zinc-900/90 shrink-0">
            <div className="w-16 sm:w-20 h-1 rounded-full bg-neutral-300 dark:bg-zinc-700 mx-auto" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
