'use client';

export default function ChatHeader({
  roomId,
  roomMessageCount,
  maxMessages,
  onToggleSidebar,
}) {
  const totalSlots = Math.max(1, maxMessages || 50);
  const strokeWidth = 3;
  const gapWidth = 2;
  const slotStep = strokeWidth + gapWidth; // 5px per bar slot
  const svgWidth = totalSlots * slotStep - gapWidth; // Exact total vector width

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
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-[10px] sm:text-xs font-bold font-mono text-gray-700 dark:text-gray-300 tracking-tight">
          <span className="hidden sm:inline">Message Count : </span>{roomMessageCount}/{maxMessages}
        </span>
        
        {/* Progress Bar - Vector SVG canvas for 100% mathematically uniform bar width & distance */}
        <div className="hidden sm:block shrink-0">
          <svg
            viewBox={`0 0 ${svgWidth} 16`}
            className="h-3.5 sm:h-4 w-auto shrink-0 block"
            style={{ width: `${svgWidth * 0.9}px` }}
          >
            {Array.from({ length: totalSlots }, (_, i) => {
              const isFilled = i < roomMessageCount;
              let fillClass = 'fill-gray-300 dark:fill-white/30';

              if (isFilled) {
                if (roomMessageCount >= maxMessages * 0.9) {
                  fillClass = 'fill-red-500';
                } else if (roomMessageCount >= maxMessages * 0.7) {
                  fillClass = 'fill-yellow-500';
                } else {
                  fillClass = 'fill-purple-500';
                }
              }

              return (
                <rect
                  key={i}
                  x={i * slotStep}
                  y={0}
                  width={strokeWidth}
                  height={16}
                  rx={0.5}
                  className={`${fillClass} transition-colors duration-200`}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
