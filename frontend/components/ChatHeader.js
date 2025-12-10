'use client';

export default function ChatHeader({
  roomId,
  roomMessageCount,
  maxMessages,
  isSidebarOpen,
  onToggleSidebar,
}) {
  return (
    <div className="shrink-0 border-b border-gray-200 dark:border-white/15 flex items-center justify-between px-6 py-3 bg-white dark:bg-black">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{roomId}</h2>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs font-bold font-mono text-gray-700 dark:text-gray-300">
          Message Count : {roomMessageCount}/{maxMessages}
        </span>
        {/* Progress Bar - Segmented style */}
        <div className="flex items-center gap-px">
          {Array.from({ length: maxMessages }, (_, i) => (
            <div
              key={i}
              className={`w-0.5 h-4 transition-all duration-300 ${
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
