'use client';

export default function ProgressBar({ messageCount, maxMessages, label = 'Message Progress' }) {
  const percentage = (messageCount / maxMessages) * 100;
  const getColorClass = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-bold text-gray-700 font-mono">
          {messageCount}/{maxMessages}
        </p>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${getColorClass()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      {percentage >= 90 && (
        <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Approaching limit
        </p>
      )}
    </div>
  );
}
