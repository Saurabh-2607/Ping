'use client';

export default function ActiveUsersBar({ activeUsers }) {
  if (!activeUsers || activeUsers.length === 0) return null;

  return (
    <div className="shrink-0 border-t px-2 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto transition-colors duration-300 bg-gray-50 border-gray-200 dark:bg-black/50 dark:border-white/15">
      <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap text-gray-500 dark:text-gray-400">Active:</span>
      <div className="flex items-center gap-1 sm:gap-1.5">
        {activeUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 border rounded bg-white border-gray-200 dark:bg-black dark:border-white/15"
          >
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[8px] sm:text-[10px] font-medium text-gray-600 dark:text-gray-300">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
