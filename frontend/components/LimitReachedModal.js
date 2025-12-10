'use client';

import { useTheme } from './ThemeProvider';
import Button from './ui/Button';

export default function LimitReachedModal({ messageCount, maxMessages }) {
  const { theme } = useTheme();

  const handleUpgrade = () => {
    alert('Payment integration coming soon! 🚀');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`shadow-2xl max-w-md w-full overflow-hidden ${
        theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white'
      }`}>
        {/* Header with gradient */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-8 text-center">
          <div className="inline-block p-3 bg-white bg-opacity-20 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Room Limit Reached!</h2>
          <p className="text-indigo-100">This room has hit the {maxMessages}-message limit</p>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {/* Message stats */}
          <div className={`p-4 mb-6 ${
            theme === 'dark' ? 'bg-white/10' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Total messages:</span>
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{messageCount}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Room Limit:</span>
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{maxMessages}</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Upgrade to unlock:</h3>
            <ul className="space-y-2">
              <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Unlimited messaging</span>
              </li>
              <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Priority support</span>
              </li>
              <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Advanced features</span>
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <Button
            onClick={handleUpgrade}
            className={`w-full py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold mb-3 transform hover:-translate-y-0.5 ${
              theme === 'dark' ? 'hover:shadow-lg hover:shadow-indigo-900/30' : 'hover:shadow-lg hover:shadow-indigo-200'
            }`}
          >
            Upgrade Now
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="ghost"
            className={`w-full py-3 ${
              theme === 'dark' ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}
