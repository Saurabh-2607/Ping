'use client';

import { useTheme } from '../ThemeProvider';

export default function LoadingScreen({ theme: propTheme, message = 'Connecting to chat...' }) {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 dark:bg-black dark:text-white transition-colors duration-300">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-950 opacity-40"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-base font-medium text-gray-600 dark:text-gray-300 tracking-wide animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
