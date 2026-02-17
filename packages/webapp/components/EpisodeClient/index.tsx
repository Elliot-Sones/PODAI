'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { EpisodeWithPodcast } from 'podverse-utils';
import { AudioPlayer, AudioPlayerProvider, useAudioPlayer } from '@/components/AudioPlayer';
import { EpisodeTranscript } from '@/components/EpisodeTranscript';
import { EpisodeChat } from '@/components/EpisodeChat';
import { ChatContextProvider } from '../ChatContext';

function AutoSeek() {
  const searchParams = useSearchParams();
  const audioPlayer = useAudioPlayer();
  const seekParam = searchParams.get('seek');

  useEffect(() => {
    if (seekParam && audioPlayer) {
      const time = parseFloat(seekParam);
      if (!isNaN(time)) {
        // Delay to let the audio player initialize
        const timer = setTimeout(() => {
          audioPlayer.seek(time);
          audioPlayer.play();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [seekParam, audioPlayer]);

  return null;
}

/**
 * This is the client side of the EpisodeDetail page.
 * It includes the audio player, which allows us to pass context to allow
 * the audio player, transcript, and chat window to stay in sync.
 */
export function EpisodeClient({ episode, chatAvailable }: { episode: EpisodeWithPodcast; chatAvailable: boolean }) {
  return (
    <>
      <AudioPlayerProvider>
        <AutoSeek />
        <AudioPlayer episode={episode} />
        <div className="flex flex-row gap-4">
          <EpisodeTranscript episode={episode} />
          <ChatContextProvider episode={episode}>
            <EpisodeChat chatAvailable={chatAvailable} />
          </ChatContextProvider>
        </div>
      </AudioPlayerProvider>
    </>
  );
}
