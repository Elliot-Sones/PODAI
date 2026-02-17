'use client';

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { EpisodeWithPodcast } from 'podverse-utils';
import { EditSpeakersDialog } from '../EditSpeakersDialog';
import { useAudioPlayer } from '@/components/AudioPlayer';
import { PlayCircleIcon } from '@heroicons/react/24/outline';
import { PoweredBy } from '@/components/PoweredBy';

type TranscriptSentenceView = {
  text: string;
  start: number;
  end: number;
  speaker: number;
};

type SpeakerTurnView = {
  speaker: number;
  start: number;
  end: number;
  sentences: TranscriptSentenceView[];
};

const MAX_SAME_SPEAKER_GAP_SEC = 8;

function buildSpeakerTurns(paragraphs: any[]): SpeakerTurnView[] {
  const sentenceRows: TranscriptSentenceView[] = [];

  for (const paragraph of paragraphs || []) {
    const paragraphSpeakerRaw = paragraph?.speaker ?? 0;
    const paragraphSpeaker = Number.isFinite(Number(paragraphSpeakerRaw)) ? Number(paragraphSpeakerRaw) : 0;
    const paragraphSentences = Array.isArray(paragraph?.sentences) ? paragraph.sentences : [];
    for (const sentence of paragraphSentences) {
      const text = typeof sentence?.text === 'string' ? sentence.text.trim() : '';
      if (!text) {
        continue;
      }
      const startRaw = Number(sentence?.start ?? paragraph?.start ?? 0);
      const start = Number.isFinite(startRaw) ? startRaw : 0;
      const endRaw = Number(sentence?.end ?? paragraph?.end ?? start);
      const end = Number.isFinite(endRaw) ? Math.max(endRaw, start) : start;
      const sentenceSpeakerRaw = sentence?.speaker ?? paragraphSpeaker;
      const speaker = Number.isFinite(Number(sentenceSpeakerRaw)) ? Number(sentenceSpeakerRaw) : paragraphSpeaker;
      sentenceRows.push({ text, start, end, speaker });
    }
  }

  if (sentenceRows.length === 0) {
    return [];
  }

  const turns: SpeakerTurnView[] = [];
  for (const sentence of sentenceRows) {
    const prev = turns[turns.length - 1];
    const sameSpeaker = prev && prev.speaker === sentence.speaker;
    const gap = prev ? sentence.start - prev.end : 0;
    if (!prev || !sameSpeaker || gap > MAX_SAME_SPEAKER_GAP_SEC) {
      turns.push({
        speaker: sentence.speaker,
        start: sentence.start,
        end: sentence.end,
        sentences: [sentence],
      });
      continue;
    }
    prev.sentences.push(sentence);
    prev.end = Math.max(prev.end, sentence.end);
  }

  return turns;
}

/** Top level transcript component. Includes the AudioPlayer. */
export function EpisodeTranscript({ episode, embed }: { episode: EpisodeWithPodcast; embed?: boolean }) {
  const [transcript, setTranscript] = useState(null);

  useEffect(() => {
    if (episode.rawTranscriptUrl === null) {
      return;
    }

    fetch(episode.rawTranscriptUrl, { cache: 'no-store' })
      .then((res) => res.json())
      .then((result) => {
        setTranscript(result);
      });
  }, [episode]);

  if (episode.rawTranscriptUrl === null || transcript === null) {
    return embed ? null : (
      <div className="mt-8 flex h-[600px] w-full flex-col gap-2 lg:w-3/5">
        <div>
          <h1>Transcript</h1>
        </div>
        <div className="size-full overflow-y-auto border p-4 text-xs"></div>
      </div>
    );
  }

  return embed ? (
    <div className="mt-4 flex flex-col gap-2">
      <PoweredBy />
      <TranscriptView transcript={transcript} episode={episode} embed />
    </div>
  ) : (
    <div className="mt-8 flex h-[600px] w-full flex-col gap-2 lg:w-3/5">
      <div>
        <h1>Transcript</h1>
      </div>
      <TranscriptView transcript={transcript} episode={episode} />
    </div>
  );
}

/** Show view of transcript when available. */
function TranscriptView({
  transcript,
  episode,
  embed,
}: {
  transcript: any;
  episode: EpisodeWithPodcast;
  embed?: boolean;
}) {
  const paragraphs = transcript.results?.channels[0].alternatives[0].paragraphs.paragraphs as any[];
  const turns = useMemo(() => buildSpeakerTurns(paragraphs), [paragraphs]);
  const itemRefs = useRef(turns.map(() => React.createRef<HTMLDivElement>()));
  const playAnimationRef = useRef<number | undefined>(undefined);
  const player = useAudioPlayer();
  const { audioRef } = player || {};
  const [curTime, setCurTime] = useState(0);

  const doUpdate = useCallback(() => {
    if (audioRef && audioRef.current) {
      setCurTime(audioRef.current.currentTime);
      playAnimationRef.current = requestAnimationFrame(doUpdate);
    }
  }, [audioRef]);

  useEffect(() => {
    const scrollToTime = (time: number) => {
      const index = turns.findIndex((turn) => time >= turn.start && time <= turn.end);
      if (index === -1 || itemRefs.current[index] === undefined) {
        return;
      }
      itemRefs.current[index].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    scrollToTime(curTime);
  }, [curTime, turns, doUpdate]);

  useEffect(() => {
    playAnimationRef.current = requestAnimationFrame(doUpdate);
  }, [doUpdate]);

  const views = turns.map((turn: SpeakerTurnView, index: number) => {
    const isCurrent = (turn.start <= curTime && turn.end >= curTime) || false;
    return (
      <ParagraphView
        highlight={isCurrent}
        curTime={curTime}
        selfRef={itemRefs.current[index]}
        turn={turn}
        episode={episode}
        key={index}
        embed={embed}
      />
    );
  });

  return (
    <div className="w-full overflow-y-auto border p-4 text-xs">
      <div className="flex flex-col gap-4">{views}</div>
    </div>
  );
}

/** Show a single paragraph. */
function ParagraphView({
  turn,
  episode,
  selfRef,
  highlight,
  curTime,
  embed,
}: {
  turn: SpeakerTurnView;
  episode: EpisodeWithPodcast;
  selfRef: React.Ref<HTMLDivElement>;
  highlight: boolean;
  curTime: number;
  embed?: boolean;
}) {
  const speakerColors = [
    'text-gray-300',
    'text-sky-300',
    'text-rose-200',
    'text-indigo-200',
    'text-lime-200',
    'text-yellow-200',
    'text-indigo-200',
    'text-amber-200',
    'text-pink-200',
    'text-emerald-200',
    'text-purple-200',
  ];

  const start = turn.start;
  const startHours = Math.floor(start / 3600);
  const startMinutes = Math.floor((start % 3600) / 60);
  const startSeconds = Math.floor(start % 60);
  const startString = `${startHours}:${startMinutes.toString().padStart(2, '0')}:${startSeconds
    .toString()
    .padStart(2, '0')}`;

  const sentences = turn.sentences;
  const speakerKey = String(turn.speaker);
  const speaker = (episode.speakers && episode.speakers[speakerKey]) ?? `Speaker ${speakerKey}`;
  const speakerColor = speakerColors[turn.speaker % speakerColors.length];

  return (
    <div className={`group flex flex-row items-start gap-2 border-b pb-2 ${highlight && 'bg-secondary'}`} ref={selfRef}>
      <div className="flex w-1/5 flex-col gap-2 overflow-hidden text-wrap pt-1 text-xs">
        <div className="text-primary">{speaker}</div>
        <div className="text-muted-foreground">{startString}</div>
        {!embed && (
          <div className="hidden text-xs group-hover:block">
            <EditSpeakersDialog episode={episode} speaker={speakerKey} />
          </div>
        )}
      </div>
      <ParagraphText sentences={sentences} speakerColor={speakerColor} curTime={curTime} highlight={highlight} embed={embed} />
    </div>
  );
}

export function ParagraphText({
  sentences,
  speakerColor,
  curTime,
  highlight,
  embed,
}: {
  sentences: any;
  speakerColor: string;
  curTime: number;
  highlight: boolean;
  embed?: boolean;
}) {
  const audioPlayer = useAudioPlayer();
  if (!embed && !audioPlayer) {
    return null;
  }
  const { play, seek } = audioPlayer || {};

  const doSeek = (time: number) => {
    if (!embed && seek && play) {
      seek(time);
      play();
    }
  };

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex flex-wrap gap-1">
        {sentences.map((sentence: any, index: number) => {
          const isActive = highlight && curTime >= sentence.start && curTime <= sentence.end;
          return (
            <span
              key={index}
              onClick={() => doSeek(sentence.start)}
              className={`cursor-pointer rounded px-1.5 py-0.5 text-sm transition-colors ${speakerColor} ${
                isActive
                  ? 'bg-primary/20 ring-primary/40 ring-1'
                  : 'hover:bg-secondary/80'
              }`}
            >
              {sentence.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
