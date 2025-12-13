'use client';

import { useEffect, useState, useRef } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useTheme } from '../ThemeProvider';
import Button from '../ui/Button';

const TENOR_API_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY || 'LIVDSRZULELA';
const TENOR_LIMIT = 24;

export default function MediaPicker({ onStickerSelect, onEmojiSelect, onClose }) {
    const { theme } = useTheme();
    const modalRef = useRef(null);
    const [activeTab, setActiveTab] = useState('stickers'); // 'stickers' | 'emojis'

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Sticker state
    const [stickers, setStickers] = useState([]);
    const [isLoadingStickers, setIsLoadingStickers] = useState(false);
    const [stickerError, setStickerError] = useState('');

    // Debounce search query
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Warning for default API key
    useEffect(() => {
        if (activeTab === 'stickers' && TENOR_API_KEY === 'LIVDSRZULELA') {
            console.warn('Using default Tenor API Key. Please set NEXT_PUBLIC_TENOR_API_KEY.');
        }
    }, [activeTab]);

    // Fetch stickers
    useEffect(() => {
        if (activeTab !== 'stickers') return;

        const controller = new AbortController();
        const fetchStickers = async () => {
            setIsLoadingStickers(true);
            setStickerError('');

            const baseParams = new URLSearchParams({
                key: TENOR_API_KEY,
                client_key: 'chat-app',
                limit: String(TENOR_LIMIT),
                media_filter: 'gif,tinygif',
                locale: 'en_US',
                country: 'US',
                contentfilter: 'low',
                ar_range: 'all',
            });

            const params = new URLSearchParams(baseParams);
            if (debouncedQuery) {
                params.set('q', debouncedQuery);
            } else {
                params.set('q', 'stickers');
            }
            params.set('searchfilter', 'sticker');
            const endpoint = `https://tenor.googleapis.com/v2/search?${params.toString()}`;

            try {
                let response = await fetch(endpoint, { signal: controller.signal });

                // Fallbacks
                if (!response.ok) {
                    const noStickerParams = new URLSearchParams(endpoint.split('?')[1]);
                    noStickerParams.delete('searchfilter');
                    const urlNoSticker = `${endpoint.split('?')[0]}?${noStickerParams.toString()}`;
                    response = await fetch(urlNoSticker, { signal: controller.signal });
                }
                if (!response.ok) {
                    const params = new URLSearchParams({
                        key: TENOR_API_KEY,
                        client_key: 'chat-app',
                        limit: String(TENOR_LIMIT),
                        media_filter: 'gif,tinygif',
                        locale: 'en_US',
                        country: 'US',
                        contentfilter: 'low',
                        ar_range: 'all',
                        q: 'stickers',
                    });
                    response = await fetch(`https://tenor.googleapis.com/v2/search?${params.toString()}`, { signal: controller.signal });
                }
                if (!response.ok) {
                    throw new Error('Failed to load stickers');
                }

                const data = await response.json();
                const parsed = (data.results || [])
                    .map((item) => {
                        const url = item?.media_formats?.tinygif?.url || item?.media_formats?.gif?.url;
                        return url ? { id: item.id, url } : null;
                    })
                    .filter(Boolean);

                setStickers(parsed);
            } catch (err) {
                if (err.name === 'AbortError') return;
                setStickerError('Unable to load stickers.');
            } finally {
                setIsLoadingStickers(false);
            }
        };

        fetchStickers();
        return () => controller.abort();
    }, [debouncedQuery, activeTab]);

    const handleStickerClick = (sticker) => {
        onStickerSelect(sticker);
        try {
            if (sticker.id) {
                const qs = new URLSearchParams({
                    id: String(sticker.id),
                    key: TENOR_API_KEY,
                    client_key: 'chat-app',
                    q: debouncedQuery || 'sticker',
                }).toString();
                fetch(`https://tenor.googleapis.com/v2/registershare?${qs}`).catch(() => { });
            }
        } catch { }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchQuery('');
    };

    return (
        <div ref={modalRef} className="absolute bottom-full right-0 mb-2 z-50 w-full sm:w-96 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="w-full border bg-white dark:bg-black border-gray-200 dark:border-white/15 shadow-2xl overflow-hidden ring-1 ring-black/5 flex flex-col h-[400px]">
                {/* Header Tabs & Search */}
                <div className="flex items-center gap-2 p-2 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                    <div className="flex bg-gray-200 dark:bg-white/10 p-1 gap-1 shrink-0">
                        <button
                            onClick={() => handleTabChange('stickers')}
                            className={`px-3 py-1 text-xs font-medium transition-all ${activeTab === 'stickers'
                                ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            GIFs
                        </button>
                        <button
                            onClick={() => handleTabChange('emojis')}
                            className={`px-3 py-1 text-xs font-medium transition-all ${activeTab === 'emojis'
                                ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Emojis
                        </button>
                    </div>

                    {activeTab === 'stickers' ? (
                        <div className="flex-1 relative min-w-0">
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search GIFs..."
                                className="w-full pl-7 pr-2 py-2 text-xs bg-gray-200/50 dark:bg-white/10 border-none focus:outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500"
                                autoFocus
                            />
                            <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    ) : (
                        <div className="flex-1" />
                    )}

                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={onClose}
                        className="h-7 w-7 shrink-0 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                        aria-label="Close"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>

                {/* Stickers Content */}
                {activeTab === 'stickers' && (
                    <>
                        {stickerError && (
                            <p className="px-3 py-2 text-xs text-red-500 text-center bg-red-50 dark:bg-red-900/20 dark:text-red-400">{stickerError}</p>
                        )}

                        <div className="p-2 flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/20">
                            {isLoadingStickers && stickers.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent animate-spin mb-2" />
                                    <span className="text-xs">Loading...</span>
                                </div>
                            )}

                            {!isLoadingStickers && stickers.length === 0 && !stickerError && (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    <p className="text-xs">No stickers found</p>
                                </div>
                            )}

                            {stickers.length > 0 && (
                                <div className="columns-3 gap-1.5 px-px">
                                    {stickers.map((sticker) => (
                                        <button
                                            key={sticker.id}
                                            type="button"
                                            onClick={() => handleStickerClick(sticker)}
                                            className="relative w-full group overflow-hidden bg-gray-100 dark:bg-white/5 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30 break-inside-avoid mb-1.5"
                                        >
                                            <img
                                                src={sticker.url}
                                                alt="Sticker"
                                                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-3 py-1.5 bg-gray-50 dark:bg-black/40 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <span className="text-[10px] text-gray-400">Powered by Tenor</span>
                        </div>
                    </>
                )}

                {/* Emojis Content */}
                {activeTab === 'emojis' && (
                    <div className="w-full flex-1 min-h-0 emoji-picker-wrapper">
                        <style jsx global>{`
                    .emoji-picker-wrapper .epr-search-container {
                        display: none !important;
                    }
                    .emoji-picker-wrapper .EmojiPickerReact {
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .emoji-picker-wrapper {
                        --epr-picker-border-radius: 0px;
                        --epr-shadow: none;
                        --epr-bg-color: transparent;
                    }
                `}</style>
                        <EmojiPicker
                            onEmojiClick={(e) => onEmojiSelect(e.emoji)}
                            theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                            width="100%"
                            height="100%"
                            searchDisabled={true}
                            skinTonesDisabled={true}
                            previewConfig={{ showPreview: false }}
                            lazyLoadEmojis={true}
                            searchValue={searchQuery}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
