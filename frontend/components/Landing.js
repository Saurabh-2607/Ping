'use client';

import { useRouter } from 'next/navigation';

const randomRoom = () => `room-${Math.random().toString(36).slice(2, 8)}`;

export default function Landing({ onGetStarted }) {
  const router = useRouter();

  const handleCreateRoom = () => {
    const room = randomRoom();
    router.push(`/room/${room}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              Real-time, URL-based rooms
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Chat smarter with email OTP and live rooms
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Spin up a room from any URL, invite teammates, and stay in sync with instant messaging, typing indicators, and smart message limits.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-200 transition"
              >
                Get Started
              </button>
              <button
                onClick={handleCreateRoom}
                className="px-6 py-3 bg-white border border-indigo-300 hover:border-indigo-500 text-indigo-700 font-semibold rounded-lg shadow-sm transition"
              >
                Create New Room
              </button>
              <a
                href="#features"
                className="px-6 py-3 border border-gray-300 hover:border-indigo-400 text-gray-800 font-semibold rounded-lg transition"
              >
                See Features
              </a>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                OTP auth with Resend
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                Live rooms with Socket.IO
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
                50-message progress tracking
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-600">Live Demo</p>
                <h3 className="text-xl font-bold">Join a room in seconds</h3>
              </div>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 bg-indigo-500 rounded-full" />
                Create rooms by URL: `/room/project-alpha`.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 bg-indigo-500 rounded-full" />
                Email-based OTP login keeps things secure.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 bg-indigo-500 rounded-full" />
                Real-time updates, typing indicators, and presence.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 bg-indigo-500 rounded-full" />
                50-message limit with clear progress bar and modal.
              </li>
            </ul>
            <button
              onClick={onGetStarted}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
            >
              Get Started Now
            </button>
            <button
              onClick={handleCreateRoom}
              className="w-full py-3 border border-indigo-200 hover:border-indigo-400 text-indigo-700 font-semibold rounded-lg transition"
            >
              Create a Room (Random URL)
            </button>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Secure OTP Login',
              desc: 'Email-based authentication backed by Redis + Resend.',
            },
            {
              title: 'Real-time Rooms',
              desc: 'Socket.IO messaging, presence, and typing indicators.',
            },
            {
              title: 'Progress & Limits',
              desc: '50-message cap with visual progress and upgrade prompt.',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-2">
              <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
}
const randomRoom = () => `room-${Math.random().toString(36).slice(2, 8)}`;
import { useRouter } from 'next/navigation';
  );
}
