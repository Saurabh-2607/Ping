'use client';

export default function MessageBubble({ message, isCurrentUser }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
          isCurrentUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        {!isCurrentUser && (
          <p className={`text-xs font-semibold ${isCurrentUser ? 'text-indigo-100' : 'text-gray-700'} mb-1`}>
            {message.user.name}
          </p>
        )}
        <p className="break-words">{message.text}</p>
        <p
          className={`text-xs mt-2 ${
            isCurrentUser ? 'text-indigo-100' : 'text-gray-600'
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
