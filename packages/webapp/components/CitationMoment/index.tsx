'use client';

import { PlayCircleIcon } from '@heroicons/react/24/outline';
import { useAudioPlayer } from '@/components/AudioPlayer';
import { timeString } from '@/lib/time';
import { useRouter } from 'next/navigation';

interface CitationMomentProps {
  /** Timestamp in seconds */
  time: number;
  /** Transcript excerpt text */
  text?: string;
  /** Episode link path (e.g., /podcast/foo/episode/bar) */
  episodeLink?: string;
  /** Whether we're on the same episode page */
  isCurrentEpisode?: boolean;
}

export function CitationMoment({ time, text, episodeLink, isCurrentEpisode = true }: CitationMomentProps) {
  const audioPlayer = useAudioPlayer();
  const router = useRouter();

  const handlePlay = () => {
    if (isCurrentEpisode && audioPlayer) {
      audioPlayer.seek(time);
      audioPlayer.play();
    } else if (episodeLink) {
      router.push(`${episodeLink}?seek=${time}`);
    }
  };

  return (
    <div className="my-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
      {text && (
        <p className="text-muted-foreground mb-2 text-xs italic line-clamp-3">
          &ldquo;{text}&rdquo;
        </p>
      )}
      <button
        onClick={handlePlay}
        className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-500"
      >
        <PlayCircleIcon className="size-4" />
        Listen at {timeString(time)}
      </button>
    </div>
  );
}
