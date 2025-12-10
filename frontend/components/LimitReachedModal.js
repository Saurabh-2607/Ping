'use client';

import { useState } from 'react';
import Button from './ui/Button';

export default function LimitReachedModal({ messageCount, maxMessages }) {
  const [isOpen, setIsOpen] = useState(true);

  const handleUpgrade = () => {
    alert('Payment integration coming soon! 🚀');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <div className="max-w-sm w-full overflow-hidden bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-white/15 shadow-xl">
        {/* Header */}
        <div className="bg-linear-to-r from-green-600 to-emerald-600 px-5 py-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 mb-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Limit Reached!</h2>
          <p className="text-green-100 text-sm">{messageCount}/{maxMessages} messages</p>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {/* Benefits */}
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Upgrade to unlock:</p>
          <ul className="space-y-1.5 mb-4">
            {['Unlimited messaging', 'Priority support', 'Advanced features'].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleUpgrade}
              variant="primary"
              className="flex-1"
            >
              Upgrade
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="secondary"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
