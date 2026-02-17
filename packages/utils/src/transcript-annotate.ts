/** Pre-processes raw transcript JSON + speaker map into annotated text for full-context chat. */

import { TranscriptJson } from './splitters.js';
import { Speakers } from './types.js';

export interface AnnotatedTranscript {
  /** Full annotated transcript text with timestamps and speaker names. */
  text: string;
  /** Rough token estimate (chars / 4). */
  tokenEstimate: number;
  /** Lookup index for post-processing citation validation. */
  paragraphs: ParagraphEntry[];
}

export interface ParagraphEntry {
  index: number;
  startTime: number;
  endTime: number;
  speaker: string;
  text: string;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Annotate a raw transcript with speaker names and timestamps.
 * Produces a clean text format like:
 *   [00:05:23 → 00:05:45] Elon Musk: The future of AI is incredibly exciting...
 */
export function annotateTranscript(
  rawTranscript: TranscriptJson,
  speakers: Speakers,
): AnnotatedTranscript {
  const rawParagraphs = rawTranscript.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.paragraphs;
  if (!rawParagraphs || rawParagraphs.length === 0) {
    return { text: '', tokenEstimate: 0, paragraphs: [] };
  }

  const paragraphEntries: ParagraphEntry[] = [];
  const lines: string[] = [];

  for (let i = 0; i < rawParagraphs.length; i++) {
    const para = rawParagraphs[i];
    const speakerKey = String(para.speaker ?? i);
    const speakerName = speakers[speakerKey] || `Speaker ${(para.speaker ?? i) + 1}`;
    const startTime = para.start ?? para.sentences[0]?.start ?? 0;
    const endTime = para.end ?? para.sentences[para.sentences.length - 1]?.end ?? startTime;
    const text = para.sentences.map((s) => s.text).join(' ');

    paragraphEntries.push({
      index: i,
      startTime,
      endTime,
      speaker: speakerName,
      text,
    });

    lines.push(`[${formatTime(startTime)} → ${formatTime(endTime)}] ${speakerName}: ${text}`);
  }

  const fullText = lines.join('\n');
  return {
    text: fullText,
    tokenEstimate: Math.ceil(fullText.length / 4),
    paragraphs: paragraphEntries,
  };
}
