'use client';

import { useState } from 'react';
import { processEpisodePublic, processPodcastPublic } from '@/lib/actions';
import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

export function ProcessEpisodeButton({
  episodeId,
  currentStatus,
}: {
  episodeId: number;
  currentStatus: string;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'started'>('idle');

  if (currentStatus === 'ready') return null;
  if (currentStatus === 'processing' || state === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-600/20 px-3 py-1.5 text-xs font-medium text-amber-400">
        <ArrowPathIcon className="size-3.5 animate-spin" />
        Processing...
      </span>
    );
  }
  if (state === 'started') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-green-600/20 px-3 py-1.5 text-xs font-medium text-green-400">
        Processing started
      </span>
    );
  }

  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setState('loading');
        try {
          await processEpisodePublic(episodeId);
          setState('started');
        } catch (err) {
          console.error('Process error:', err);
          setState('idle');
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-500"
    >
      <PlayIcon className="size-3.5" />
      Process
    </button>
  );
}

export function ProcessAllButton({ podcastId }: { podcastId: number }) {
  const [state, setState] = useState<'idle' | 'loading' | 'started'>('idle');

  if (state === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-600/20 px-3 py-1.5 text-sm font-medium text-amber-400">
        <ArrowPathIcon className="size-4 animate-spin" />
        Starting...
      </span>
    );
  }
  if (state === 'started') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-green-600/20 px-3 py-1.5 text-sm font-medium text-green-400">
        Processing started for all episodes
      </span>
    );
  }

  return (
    <button
      onClick={async () => {
        setState('loading');
        try {
          await processPodcastPublic(podcastId);
          setState('started');
        } catch (err) {
          console.error('Process all error:', err);
          setState('idle');
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-amber-600 px-3 py-1.5 text-sm font-medium text-amber-500 transition-colors hover:bg-amber-600 hover:text-white"
    >
      <PlayIcon className="size-4" />
      Process All Episodes
    </button>
  );
}
