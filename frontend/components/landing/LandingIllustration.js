'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Custom Inline SVG Icons (Using the exact Ping logo vector)
const PingIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 252 249" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M55.5 3.03761C59.62 1.92761 64.12 0.827614 65.5 0.597614C66.87 0.367614 93.65 0.117614 125 0.0276138C171.66 -0.0923862 183.45 0.147614 190 1.36761C194.4 2.18761 201.15 4.13761 205 5.71761C208.85 7.28761 213.8 9.70761 216 11.0876C218.2 12.4676 222.7 15.8376 226 18.5676C229.3 21.2976 234.33 26.6576 237.17 30.4676C240.02 34.2876 243.72 40.3376 245.39 43.9076C247.06 47.4776 249.24 53.3376 250.22 56.9076C251.79 62.6476 252 68.0576 251.97 103.408C251.94 138.018 251.7 144.348 250.19 150.408C249.23 154.258 246.35 161.678 243.78 166.908C239.8 175.018 237.72 177.808 229.56 185.948C222.17 193.318 218.18 196.428 212 199.598C207.6 201.858 200.85 204.658 197 205.828C193.15 206.998 187.3 208.188 184 208.478C180.7 208.768 175.75 209.178 173 209.388C170.25 209.598 157.2 209.788 120 209.848L113 215.868C109.15 219.178 99.53 227.188 91.62 233.648C83.71 240.118 76.06 246.198 74.62 247.148C73.18 248.108 70.31 248.898 68.25 248.898C65.54 248.908 63.67 248.138 61.52 246.158C59.43 244.238 58.4 242.208 58.09 239.408C57.84 237.208 57.62 229.108 57.55 207.408L53.27 206.048C50.92 205.298 46.07 203.208 42.5 201.408C38.93 199.608 33.11 195.948 29.58 193.268C26.04 190.598 20.74 185.708 17.78 182.408C14.83 179.108 10.44 172.578 8.04 167.908C5.64 163.238 2.85 156.488 1.84 152.908C0.19 147.078 0 142.158 0 104.908C0 68.4776 0.21 62.6176 1.76 56.9076C2.72 53.3376 5.29 46.8076 7.46 42.4076C9.63 38.0076 13.65 31.7076 16.4 28.4076C19.15 25.1076 24.01 20.2576 27.2 17.6376C30.39 15.0176 36.37 11.1176 40.5 8.95761C44.62 6.80761 51.37 4.14761 55.5 3.03761Z" fill="currentColor"/>
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

const SendIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const PaperclipIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const SearchIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MoreDotsIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

const HashIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

// Sample live message flow matching Ping's real UI structure
const SAMPLE_MESSAGES = [
  {
    id: 1,
    user: { name: 'Alex', initial: 'A' },
    text: 'Hey everyone! 👋 Welcome to Ping!',
    isCurrentUser: false,
    timestamp: '10:41 AM',
    reactions: [],
  },
  {
    id: 2,
    user: { name: 'You', initial: 'Y' },
    text: 'Yo! Real-time speed is unreal 🚀⚡',
    isCurrentUser: true,
    timestamp: '10:41 AM',
    reactions: ['🔥 4', '❤️ 2'],
  },
  {
    id: 3,
    user: { name: 'Sarah', initial: 'S' },
    text: 'Joined #general room! Let’s chat 💬',
    isCurrentUser: false,
    timestamp: '10:42 AM',
    reactions: [],
  },
];

export default function LandingIllustration() {
  const [activeDevice, setActiveDevice] = useState('mobile'); // 'mobile' | 'laptop'
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [showTyping, setShowTyping] = useState(false);
  const [cycle, setCycle] = useState(0);

  // Manage device toggling and sequential message animation
  useEffect(() => {
    let isMounted = true;
    let t1, t2, t3, tSwitch;

    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 640;
    if (isSmallScreen && activeDevice !== 'mobile') {
      setActiveDevice('mobile');
    }

    const runAnimationCycle = () => {
      if (!isMounted) return;
      setVisibleMessages([]);
      setShowTyping(false);

      // Message 1: Triggers ONLY after device entry (~950ms)
      t1 = setTimeout(() => {
        if (!isMounted) return;
        setVisibleMessages([SAMPLE_MESSAGES[0]]);
        setShowTyping(true);
      }, 950);

      // Message 2
      t2 = setTimeout(() => {
        if (!isMounted) return;
        setShowTyping(false);
        setVisibleMessages([SAMPLE_MESSAGES[0], SAMPLE_MESSAGES[1]]);

        setTimeout(() => {
          if (isMounted) setShowTyping(true);
        }, 700);
      }, 2900);

      // Message 3
      t3 = setTimeout(() => {
        if (!isMounted) return;
        setShowTyping(false);
        setVisibleMessages([SAMPLE_MESSAGES[0], SAMPLE_MESSAGES[1], SAMPLE_MESSAGES[2]]);
      }, 5300);

      // Device Switch Timer (~9.2 seconds)
      tSwitch = setTimeout(() => {
        if (!isMounted) return;
        const mobileView = typeof window !== 'undefined' && window.innerWidth < 640;
        if (mobileView) {
          // Stay on mobile animation for small screens
          setActiveDevice('mobile');
          setCycle((c) => c + 1);
        } else {
          setActiveDevice((prev) => (prev === 'mobile' ? 'laptop' : 'mobile'));
          setCycle((c) => c + 1);
        }
      }, 9200);
    };

    runAnimationCycle();

    return () => {
      isMounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tSwitch);
    };
  }, [cycle]);

  return (
    <div className="relative w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[460px] md:max-w-[500px] mx-auto py-2 sm:py-4 flex items-center justify-center select-none min-h-[460px] xs:min-h-[490px] sm:min-h-[540px] overflow-hidden">
      
      {/* Motion.dev Pulsing Signal Rings */}
      {[0, 1.8].map((delay, index) => (
        <motion.div
          key={index}
          className="absolute top-[12%] left-1/2 -translate-x-1/2 rounded-full border border-neutral-300/50 dark:border-zinc-700/40 pointer-events-none"
          initial={{ width: 80, height: 80, opacity: 0.7 }}
          animate={{
            width: [90, 280],
            height: [90, 280],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 3.8,
            delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* ==================== DRAMATIC 3D SLIDE-IN & SLIDE-OUT DEVICE VIEW CONTAINERS ==================== */}
      <AnimatePresence mode="wait">
        {activeDevice === 'mobile' ? (
          /* ==================== 1. SMARTPHONE VIEW ==================== */
          <motion.div
            key="mobile-view"
            initial={{ opacity: 0, x: -320, rotateY: -35, rotateZ: -8, scale: 0.82 }}
            animate={{ opacity: 1, x: 0, rotateY: 0, rotateZ: 0, scale: 1 }}
            exit={{ opacity: 0, x: -320, rotateY: -35, rotateZ: -8, scale: 0.82 }}
            transition={{ type: "spring", stiffness: 180, damping: 22, mass: 0.9 }}
            className="relative w-full flex items-center justify-center z-10 [perspective:1200px] transform-gpu"
          >
            <div className="relative w-[245px] xs:w-[265px] sm:w-[290px] h-[470px] xs:h-[500px] sm:h-[530px] rounded-[38px] sm:rounded-[42px] p-2 sm:p-2.5 bg-neutral-200 dark:bg-zinc-900 border-[5px] sm:border-[6px] border-neutral-300/90 dark:border-zinc-800 flex flex-col overflow-hidden transition-colors duration-300">
              
              {/* PHONE DISPLAY SCREEN */}
              <div className="relative w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden isolate transform-gpu bg-white dark:bg-zinc-950 text-neutral-900 dark:text-zinc-100 flex flex-col transition-colors duration-300 border border-neutral-200/80 dark:border-zinc-800">
                
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

                {/* Mobile Header */}
                <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 border-b border-neutral-200 dark:border-zinc-800 bg-neutral-100 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-between shrink-0 z-10 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <PingIcon className="w-4.5 h-4.5 text-neutral-900 dark:text-zinc-100" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold tracking-tight text-neutral-900 dark:text-zinc-100">#general</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-zinc-400">
                    <SearchIcon />
                    <MoreDotsIcon />
                  </div>
                </div>

                {/* Mobile Chat Stream */}
                <div className="flex-1 min-h-0 p-2.5 sm:p-3 flex flex-col justify-end space-y-2 sm:space-y-2.5 overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-300">
                  <AnimatePresence mode="sync">
                    {visibleMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`flex items-start gap-2 ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!msg.isCurrentUser && (
                          <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 shrink-0 rounded-md bg-neutral-200 dark:bg-zinc-800 text-neutral-800 dark:text-zinc-200 font-bold text-[10px] flex items-center justify-center">
                            {msg.user.initial}
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] px-2.5 py-1.5 rounded-xl text-xs relative transition-colors duration-300 ${
                            msg.isCurrentUser
                              ? 'bg-neutral-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-xs'
                              : 'bg-neutral-100 text-neutral-900 border border-neutral-200/90 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 rounded-tl-xs'
                          }`}
                        >
                          {!msg.isCurrentUser && (
                            <p className="text-[9.5px] font-semibold text-neutral-600 dark:text-zinc-400 mb-0.5">
                              {msg.user.name}
                            </p>
                          )}
                          <p className="leading-snug text-[11.5px] sm:text-xs">{msg.text}</p>
                          <span className={`text-[8.5px] block text-right mt-0.5 ${msg.isCurrentUser ? 'text-neutral-300 dark:text-zinc-500' : 'text-neutral-500 dark:text-zinc-400'}`}>
                            {msg.timestamp}
                          </span>
                          {msg.reactions && msg.reactions.length > 0 && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-2 right-1 flex items-center gap-1 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 px-1.5 py-0.5 rounded-full text-[8.5px] text-neutral-700 dark:text-zinc-300">
                              {msg.reactions.join(' ')}
                            </motion.div>
                          )}
                        </div>
                        {msg.isCurrentUser && (
                          <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 shrink-0 rounded-md bg-neutral-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-[10px] flex items-center justify-center">
                            {msg.user.initial}
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {showTyping && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 justify-start">
                        <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 shrink-0 rounded-md bg-neutral-200 dark:bg-zinc-800 text-neutral-800 dark:text-zinc-200 font-bold text-[10px] flex items-center justify-center">
                          S
                        </div>
                        <div className="px-2.5 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-1">
                          {[0, 1, 2].map((dotIndex) => (
                            <motion.span
                              key={dotIndex}
                              className="w-1.5 h-1.5 rounded-full bg-neutral-500 dark:bg-zinc-400"
                              animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: dotIndex * 0.15 }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Bottom Input Bar */}
                <div className="px-2 sm:px-2.5 pt-2 pb-1.5 border-t border-neutral-200 dark:border-zinc-800 bg-neutral-100 dark:bg-zinc-900/90 backdrop-blur-md flex flex-col gap-1.5 shrink-0 z-10 rounded-b-[26px] sm:rounded-b-[28px] transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-zinc-200 transition-colors p-1">
                      <PaperclipIcon />
                    </button>
                    <div className="flex-1 bg-white dark:bg-zinc-950 border border-neutral-300 dark:border-zinc-800 rounded-full px-3 py-1 text-[11px] sm:text-xs text-neutral-400 dark:text-zinc-500">
                      Type a ping...
                    </div>
                    <button className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-neutral-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-neutral-800 dark:hover:bg-zinc-200 flex items-center justify-center">
                      <SendIcon />
                    </button>
                  </div>
                  <div className="w-16 sm:w-20 h-1 rounded-full bg-neutral-300 dark:bg-zinc-700/80 mx-auto mt-0.5" />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ==================== 2. LAPTOP DESKTOP VIEW ==================== */
          <motion.div
            key="laptop-view"
            initial={{ opacity: 0, x: 320, rotateY: 35, rotateZ: 8, scale: 0.82 }}
            animate={{ opacity: 1, x: 0, rotateY: 0, rotateZ: 0, scale: 1 }}
            exit={{ opacity: 0, x: 320, rotateY: 35, rotateZ: 8, scale: 0.82 }}
            transition={{ type: "spring", stiffness: 180, damping: 22, mass: 0.9 }}
            className="relative w-full flex flex-col items-center justify-center z-10 [perspective:1200px] transform-gpu"
          >
            {/* LAPTOP DISPLAY MONITOR (3D Lid Unfolding) */}
            <motion.div
              initial={{ rotateX: -85, opacity: 0, scale: 0.88 }}
              animate={{ rotateX: 0, opacity: 1, scale: 1 }}
              exit={{ rotateX: -85, opacity: 0, scale: 0.88 }}
              transition={{ type: "spring", stiffness: 140, damping: 18, mass: 1, delay: 0.1 }}
              style={{ transformOrigin: "bottom center" }}
              className="relative w-[280px] xs:w-[320px] sm:w-[410px] md:w-[450px] h-[200px] xs:h-[230px] sm:h-[280px] md:h-[300px] rounded-t-2xl p-2 sm:p-2.5 bg-neutral-200 dark:bg-zinc-900 border-[4px] sm:border-[5px] border-neutral-300 dark:border-zinc-800 flex flex-col overflow-hidden transition-colors duration-300 transform-gpu z-10"
            >
              {/* Laptop Screen Lens Camera Dot */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black/60 dark:bg-white/20 z-30" />

              {/* LAPTOP SCREEN CONTENT */}
              <div className="relative w-full h-full rounded-t-xl overflow-hidden isolate transform-gpu bg-white dark:bg-zinc-950 text-neutral-900 dark:text-zinc-100 flex transition-colors duration-300 border border-neutral-200/80 dark:border-zinc-800">
                
                {/* 1. Left Sidebar Navigation */}
                <div className="w-24 sm:w-32 bg-neutral-100/90 dark:bg-zinc-900/90 border-r border-neutral-200 dark:border-zinc-800 p-2 flex flex-col justify-between shrink-0 transition-colors duration-300">
                  <div>
                    {/* Ping Logo & Brand */}
                    <div className="flex items-center gap-1.5 mb-3 px-1">
                      <PingIcon className="w-4 h-4 text-neutral-900 dark:text-zinc-100" />
                      <span className="text-xs font-bold tracking-tight text-neutral-900 dark:text-zinc-100 hidden sm:inline">Ping</span>
                    </div>

                    {/* Room Channels List */}
                    <p className="text-[9px] font-semibold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider mb-1 px-1">Rooms</p>
                    <div className="space-y-0.5">
                      <div className="px-1.5 py-1 rounded-md bg-neutral-200/80 dark:bg-zinc-800 text-[10px] font-semibold text-neutral-900 dark:text-zinc-100 flex items-center gap-1">
                        <HashIcon className="w-3 h-3 text-emerald-500" />
                        <span className="truncate">general</span>
                      </div>
                      <div className="px-1.5 py-1 rounded-md text-[10px] font-medium text-neutral-500 dark:text-zinc-400 hover:bg-neutral-200/40 dark:hover:bg-zinc-800/50 flex items-center gap-1">
                        <HashIcon className="w-3 h-3" />
                        <span className="truncate">random</span>
                      </div>
                      <div className="px-1.5 py-1 rounded-md text-[10px] font-medium text-neutral-500 dark:text-zinc-400 hover:bg-neutral-200/40 dark:hover:bg-zinc-800/50 flex items-center gap-1">
                        <HashIcon className="w-3 h-3" />
                        <span className="truncate">memes</span>
                      </div>
                    </div>
                  </div>

                  {/* Active User Badge */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-200 dark:border-zinc-800">
                    <div className="w-4 h-4 rounded-md bg-neutral-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[8px] font-bold flex items-center justify-center">
                      Y
                    </div>
                    <span className="text-[9px] font-medium text-neutral-700 dark:text-zinc-300 truncate hidden sm:inline">You (Online)</span>
                  </div>
                </div>

                {/* 2. Main Desktop Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 transition-colors duration-300">
                  
                  {/* Desktop Chat Header */}
                  <div className="px-3 py-2 border-b border-neutral-200 dark:border-zinc-800 bg-neutral-100/60 dark:bg-zinc-900/60 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5">
                      <HashIcon className="w-3.5 h-3.5 text-neutral-500 dark:text-zinc-400" />
                      <span className="text-xs font-bold text-neutral-900 dark:text-zinc-100">general</span>
                      <span className="text-[9px] text-neutral-400 dark:text-zinc-500 ml-1">Real-time room</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-zinc-400">
                      <SearchIcon />
                    </div>
                  </div>

                  {/* Desktop Chat Messages Container */}
                  <div className="flex-1 min-h-0 p-2.5 sm:p-3 flex flex-col justify-end space-y-2 overflow-hidden bg-white dark:bg-zinc-950">
                    <AnimatePresence mode="sync">
                      {visibleMessages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className={`flex items-start gap-1.5 ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {!msg.isCurrentUser && (
                            <div className="w-5 h-5 shrink-0 rounded-md bg-neutral-200 dark:bg-zinc-800 text-neutral-800 dark:text-zinc-200 font-bold text-[9px] flex items-center justify-center">
                              {msg.user.initial}
                            </div>
                          )}
                          <div
                            className={`max-w-[75%] px-2.5 py-1.5 rounded-xl text-xs relative ${
                              msg.isCurrentUser
                                ? 'bg-neutral-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-xs'
                                : 'bg-neutral-100 text-neutral-900 border border-neutral-200/90 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 rounded-tl-xs'
                            }`}
                          >
                            {!msg.isCurrentUser && (
                              <p className="text-[9px] font-semibold text-neutral-600 dark:text-zinc-400 mb-0.5">
                                {msg.user.name}
                              </p>
                            )}
                            <p className="leading-snug text-[11px] sm:text-xs">{msg.text}</p>
                            <span className={`text-[8px] block text-right mt-0.5 ${msg.isCurrentUser ? 'text-neutral-300 dark:text-zinc-500' : 'text-neutral-500 dark:text-zinc-400'}`}>
                              {msg.timestamp}
                            </span>
                            {msg.reactions && msg.reactions.length > 0 && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-2 right-1 flex items-center gap-1 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 px-1.5 py-0.5 rounded-full text-[8px] text-neutral-700 dark:text-zinc-300">
                                {msg.reactions.join(' ')}
                              </motion.div>
                            )}
                          </div>
                          {msg.isCurrentUser && (
                            <div className="w-5 h-5 shrink-0 rounded-md bg-neutral-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-[8px] flex items-center justify-center">
                              {msg.user.initial}
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {showTyping && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 justify-start">
                          <div className="w-5 h-5 shrink-0 rounded-md bg-neutral-200 dark:bg-zinc-800 text-neutral-800 dark:text-zinc-200 font-bold text-[9px] flex items-center justify-center">
                            S
                          </div>
                          <div className="px-2 py-1 rounded-xl bg-neutral-100 border border-neutral-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-1">
                            {[0, 1, 2].map((dotIndex) => (
                              <motion.span
                                key={dotIndex}
                                className="w-1.5 h-1.5 rounded-full bg-neutral-500 dark:bg-zinc-400"
                                animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: dotIndex * 0.15 }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Desktop Input Bar */}
                  <div className="p-2 border-t border-neutral-200 dark:border-zinc-800 bg-neutral-100/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center gap-1.5 shrink-0">
                    <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-zinc-200 transition-colors p-1">
                      <PaperclipIcon />
                    </button>
                    <div className="flex-1 bg-white dark:bg-zinc-950 border border-neutral-300 dark:border-zinc-800 rounded-full px-2.5 py-1 text-[11px] text-neutral-400 dark:text-zinc-500">
                      Type a ping...
                    </div>
                    <button className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-neutral-800 dark:hover:bg-zinc-200 flex items-center justify-center">
                      <SendIcon />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* LAPTOP KEYBOARD BASE */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative w-[320px] xs:w-[370px] sm:w-[470px] md:w-[510px] h-3 sm:h-3.5 bg-neutral-300 dark:bg-zinc-800 rounded-b-[10px] sm:rounded-b-[12px] border-t border-neutral-400/80 dark:border-zinc-700/80 flex items-start justify-center z-20 transition-colors duration-300"
            >
              {/* Single Thumb Opening Notch */}
              <div className="w-12 sm:w-16 h-1 rounded-b-md bg-neutral-400/90 dark:bg-zinc-700/90" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
