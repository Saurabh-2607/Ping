'use client';

import { useTheme } from '../ThemeProvider';

export default function MessageBubble({ message, isCurrentUser, showAvatar = true }) {
  const { theme } = useTheme();

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={`flex items-start gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {/* Profile Avatar - Left side for receiver */}
      {!isCurrentUser && (
        showAvatar ? (
          <div
            className={`w-8 h-8 shrink-0 flex items-center justify-center text-xs font-bold rounded-md ${
              theme === 'dark'
                ? 'bg-white text-black'
                : 'bg-gray-300 text-gray-700'
            }`}
          >
            {message.user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        ) : (
          <div className="w-8 shrink-0"></div>
        )
      )}
      
      {/* Message Bubble */}
      <div
        className={`max-w-[75%] sm:max-w-md px-3 py-1 ${
          isCurrentUser
            ? 'bg-blue-500 text-white'
            : theme === 'dark'
              ? 'bg-white/10 text-white border border-white/5'
              : 'bg-gray-200 text-gray-900'
        }`}
      >
        {!isCurrentUser && showAvatar && (
          <p className={`text-xs font-semibold mb-px ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {message.user.name}
          </p>
        )}
        <p className="wrap-break-word text-base">{message.text}</p>
        <p
          className={`text-xs mt-px ${
            isCurrentUser 
              ? 'text-blue-100' 
              : theme === 'dark' 
                ? 'text-gray-400' 
                : 'text-gray-500'
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>

      {/* Profile Avatar - Right side for sender */}
      {isCurrentUser && (
        showAvatar ? (
          <div className="w-8 h-8 shrink-0 flex items-center justify-center text-xs font-bold rounded-md bg-blue-600 text-white">
            {message.user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        ) : (
          <div className="w-8 shrink-0"></div>
        )
      )}
    </div>
  );
}
