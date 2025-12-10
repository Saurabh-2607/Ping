'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom } from '@/lib/api';
import Button from './ui/Button';

export default function Sidebar({
  sessionData,
  roomId,
  availableRooms,
  isSidebarOpen,
  onLogout,
}) {
  const router = useRouter();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    const roomNameToUse = newRoomName.trim() || `room-${Math.random().toString(36).slice(2, 8)}`;
    setIsCreatingRoom(false);
    setNewRoomName('');
    
    createRoom(roomNameToUse, roomNameToUse).then((result) => {
      if (result.success) {
        router.push(`/room/${result.data.roomId}`);
      } else {
        console.error('Failed to create room:', result.message);
        setError(result.message || 'Failed to create room');
      }
    }).catch((err) => {
      console.error('Error creating room:', err);
      setError('Error creating room: ' + err.message);
    });
  };

  return (
    <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} shrink-0 transition-all duration-300 overflow-hidden bg-white dark:bg-black flex flex-col border-r border-gray-200 dark:border-white/15`}>
      {/* User Info Section */}
      <div className="shrink-0 p-5 border-b border-gray-200 dark:border-white/15">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-base">
            {sessionData?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">{sessionData?.name || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sessionData?.email || ''}</p>
          </div>
        </div>
        <Button
          onClick={onLogout}
          variant="danger"
          size="sm"
          className="w-full text-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Button>
        <div className='flex justify-between mt-5 items-center'>
          <h2 className="font-bold text-base text-gray-900 dark:text-white">Available Rooms</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">[{availableRooms.length} rooms]</span>
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
        {!Array.isArray(availableRooms) || availableRooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No rooms available</p>
          </div>
        ) : (
          availableRooms.map((room) => {
            const currentRoomId = room.id || room.roomId;
            const isActive = currentRoomId === roomId;
            return (
              <div
                key={currentRoomId}
                onClick={() => {
                  if (currentRoomId !== roomId) {
                    router.push(`/room/${currentRoomId}`);
                  }
                }}
                className={`w-full px-5 py-2.5 text-sm transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-gray-300'
                }`}
              >
                <p className="font-semibold text-sm truncate">{currentRoomId}</p>
                {isActive && (
                  <span className="text-lg text-emerald-600 dark:text-emerald-400">✓</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Room Section - Now at Bottom */}
      {!isCreatingRoom ? (
        <div className="shrink-0 px-4 py-3 border-t border-gray-200 dark:border-white/15">
          <Button
            onClick={() => setIsCreatingRoom(true)}
            variant="accent"
            size="md"
            className="w-full text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Room
          </Button>
        </div>
      ) : (
        <div className="shrink-0 px-4 py-3 space-y-2 border-t border-gray-200 dark:border-white/15">
          <input
            type="text"
            placeholder="Room name (optional)"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="w-full px-3 py-2 border bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200 dark:bg-black dark:border-white/15 dark:text-white dark:placeholder-gray-500 dark:focus:ring-white/20 dark:focus:border-white text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateRoom();
              }
            }}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleCreateRoom}
              variant="accent"
              size="sm"
              className="flex-1"
            >
              Create
            </Button>
            <Button
              onClick={() => {
                setIsCreatingRoom(false);
                setNewRoomName('');
              }}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
