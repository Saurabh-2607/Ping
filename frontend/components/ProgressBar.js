'use client';

export default function ProgressBar({ messageCount, maxMessages, label = 'Message Progress' }) {
  const percentage = (messageCount / maxMessages) * 100;
  const getColorClass = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-sm font-semibold text-gray-900">
            {messageCount} / {maxMessages}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getColorClass()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        {percentage >= 90 && (
          <p className="text-xs text-red-600 mt-2 font-semibold">
            ⚠️ Approaching message limit! Upgrade to continue.
          </p>
        )}
      </div>
    </div>
  );
}
