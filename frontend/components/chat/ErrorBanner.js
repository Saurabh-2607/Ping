'use client';

export default function ErrorBanner({ error }) {
  if (!error || error === 'Disconnected from server') return null;
  return (
    <div className="shrink-0 border-b px-4 py-3 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800">
      <p className="text-yellow-800 text-sm dark:text-yellow-400">{error}</p>
    </div>
  );
}
