'use client';

import { useTheme } from '../ThemeProvider';

export default function TypingIndicator({ users }) {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0ms' }}></div>
        <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '150ms' }}></div>
        <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {users.length === 1
          ? `${users[0].name} is typing...`
          : `${users.map((u) => u.name).join(', ')} are typing...`}
      </span>
    </div>
  );
}
