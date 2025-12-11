'use client';

export default function ChatHeader({
  roomId,
  roomMessageCount,
  maxMessages,
  onToggleSidebar,
}) {
  return (
    <div className="shrink-0 border-b border-gray-200 dark:border-white/15 flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-white dark:bg-black">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">{roomId}</h2>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] sm:text-xs font-bold font-mono text-gray-700 dark:text-gray-300">
          <span className="hidden sm:inline">Message Count : </span>{roomMessageCount}/{maxMessages}
        </span>
        {/* Progress Bar - Segmented style - hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-px">
          {Array.from({ length: Math.max(1, maxMessages) }, (_, i) => (
            <div
              key={i}
              className={`w-0.5 h-3 sm:h-4 transition-all duration-300 ${
                i < roomMessageCount
                  ? roomMessageCount >= maxMessages * 0.9
                    ? 'bg-red-500'
                    : roomMessageCount >= maxMessages * 0.7
                    ? 'bg-yellow-500'
                    : 'bg-purple-500'
                  : 'bg-gray-300 dark:bg-white/30'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
