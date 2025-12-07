'use client';

export default function LimitReachedModal({ messageCount, maxMessages }) {
  const handleUpgrade = () => {
    alert('Payment integration coming soon! 🚀');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-center">
          <div className="inline-block p-3 bg-white bg-opacity-20 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Free Tier Completed!</h2>
          <p className="text-indigo-100">You've reached your 50-message personal limit</p>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {/* Message stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Messages sent:</span>
              <span className="text-2xl font-bold text-indigo-600">{messageCount}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-gray-700 font-medium">Limit:</span>
              <span className="text-2xl font-bold text-gray-900">{maxMessages}</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Upgrade to unlock:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Unlimited messaging</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Advanced features</span>
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <button
            onClick={handleUpgrade}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition duration-200 mb-3"
          >
            Upgrade Now
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition duration-200"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
