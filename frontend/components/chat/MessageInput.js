'use client';

import Button from '../ui/Button';

export default function MessageInput({
  messageInput,
  onChange,
  onSend,
  disabled,
  isLimitReached,
}) {
  return (
    <form onSubmit={onSend} className="flex gap-2 sm:gap-3 items-stretch">
      <div className="flex-1 relative min-w-0 h-full">
        <input
          type="text"
          value={messageInput}
          onChange={onChange}
          placeholder="Type your message..."
          className="w-full h-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200 pr-10 sm:pr-12 bg-white border-gray-300 text-gray-900 dark:bg-black dark:border-white/15 dark:text-white dark:placeholder-gray-400 dark:focus:ring-white/20 dark:focus:border-white"
          disabled={disabled}
        />
        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <Button
        type="submit"
        disabled={disabled || !messageInput.trim() || isLimitReached}
        variant="accent"
        className="px-3 sm:px-4 py-2 sm:py-3 h-full"
      >
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Send</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
      </Button>
    </form>
  );
}
