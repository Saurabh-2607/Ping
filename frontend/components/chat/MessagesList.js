'use client';

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function MessagesList({ messages, sessionData, otherUsersTyping, scrollTrigger = 0 }) {
  const messagesEndRef = useRef(null);
  const shouldScroll = useRef(true);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (shouldScroll.current && messages.length > 0) {
      scrollToBottom();
      shouldScroll.current = false;
    }
  }, [messages.length]);

  // Scroll when parent requests (e.g. after sending a message)
  useEffect(() => {
    if (scrollTrigger > 0) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollTrigger]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-5 bg-gray-50/50 dark:bg-black/50" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8">
          <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center mb-4 sm:mb-5 md:mb-6 bg-indigo-50 dark:bg-indigo-900/30">
            <svg className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">No messages yet</h3>
          <p className="text-sm sm:text-base text-gray-500 max-w-sm dark:text-gray-400">
            Be the first to break the silence! Start the conversation by typing a message below.
          </p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const showAvatar = !prevMessage || prevMessage.user.email !== message.user.email;
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.user.email === sessionData.email}
                showAvatar={showAvatar}
              />
            );
          })}
        </>
      )}

      {otherUsersTyping.length > 0 && (
        <div className="ml-2 sm:ml-4">
          <TypingIndicator users={otherUsersTyping} />
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
