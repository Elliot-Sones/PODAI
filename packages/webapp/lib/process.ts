/* This module has functions for processing individual episodes. */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  GetEpisode,
  Upload,
  UploadLargeFile,
  UpdateEpisode,
  GetSpeakerMap,
  UpdateSpeakerMap,
  GetPodcastByID,
  GetSuggestions,
  AddSuggestion,
  DeleteSuggestions,
  TranscribeAsync,
  Summarize,
  SuggestQueries,
  SpeakerID,
  EmbedTranscript,
  Episode,
  EpisodeStatus,
  Podcast,
  TranscriptSegment,
  TranscriptionResult,
  fetchYouTubeTranscript,
  convertToDeepgramFormat,
  getTranscriptText,
  GetEpisodeTranscriptFromFeed,
} from 'podverse-utils';
import { Readable } from 'stream';

async function updateStatus({
  supabase,
  episode,
  message,
  completedAt,
}: {
  supabase: SupabaseClient;
  episode: Episode;
  message?: string;
  completedAt?: string;
}) {
  episode.status = {
    ...(episode.status as EpisodeStatus),
    message,
    completedAt,
  };
  await UpdateEpisode(supabase, episode);
}

type TranscriptSentence = {
  text: string;
  start: number;
  end: number;
};

function cleanTranscriptText(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCueTimeToSeconds(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) {
    return null;
  }
  const parts = normalized.split(':').map((part) => part.trim());
  if (parts.length !== 2 && parts.length !== 3) {
    return null;
  }

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    seconds = parseFloat(parts[2]);
  } else {
    minutes = parseInt(parts[0], 10);
    seconds = parseFloat(parts[1]);
  }

  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return null;
  }
  return hours * 3600 + minutes * 60 + seconds;
}

function parseCueBasedTranscript(input: string): TranscriptSentence[] {
  const lines = input.replace(/\uFEFF/g, '').replace(/\r/g, '').split('\n');
  const segments: TranscriptSentence[] = [];
  let i = 0;

  while (i < lines.length) {
    let line = lines[i].trim();
    if (!line || line.startsWith('WEBVTT') || line.startsWith('NOTE') || line.startsWith('STYLE') || line.startsWith('REGION')) {
      i += 1;
      continue;
    }

    if (/^\d+$/.test(line) && i + 1 < lines.length && lines[i + 1].includes('-->')) {
      i += 1;
      line = lines[i].trim();
    }

    if (!line.includes('-->')) {
      i += 1;
      continue;
    }

    const [rawStart, rawEnd] = line.split('-->');
    const startToken = rawStart.trim().split(/\s+/)[0] || '';
    const endToken = rawEnd.trim().split(/\s+/)[0] || '';
    const start = parseCueTimeToSeconds(startToken);
    const end = parseCueTimeToSeconds(endToken);
    i += 1;

    const textLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '') {
      textLines.push(lines[i].trim());
      i += 1;
    }

    const text = cleanTranscriptText(textLines.join(' '));
    if (text && start !== null && end !== null && end >= start) {
      segments.push({ text, start, end });
    }
  }

  return segments;
}

function toTranscriptSegments(sentences: TranscriptSentence[]): TranscriptSegment[] {
  return sentences.map((sentence) => ({
    text: sentence.text,
    startTime: sentence.start,
    endTime: sentence.end,
  }));
}

function parseDeepgramLikeTranscript(data: unknown): TranscriptSegment[] {
  const paragraphs = (data as any)?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.paragraphs;
  if (!Array.isArray(paragraphs)) {
    return [];
  }
  const segments: TranscriptSegment[] = [];
  for (const paragraph of paragraphs) {
    const sentences = paragraph?.sentences;
    if (!Array.isArray(sentences)) {
      continue;
    }
    for (const sentence of sentences) {
      const text = typeof sentence?.text === 'string' ? cleanTranscriptText(sentence.text) : '';
      const start = Number(sentence?.start);
      const end = Number(sentence?.end);
      if (!text || !Number.isFinite(start) || !Number.isFinite(end) || end < start) {
        continue;
      }
      segments.push({
        text,
        startTime: start,
        endTime: end,
      });
    }
  }
  return segments;
}

function parseSegmentArray(data: unknown): TranscriptSegment[] {
  if (!Array.isArray(data)) {
    return [];
  }
  const segments: TranscriptSegment[] = [];
  for (const row of data) {
    const text = cleanTranscriptText(
      typeof (row as any)?.text === 'string'
        ? (row as any).text
        : typeof (row as any)?.transcript === 'string'
          ? (row as any).transcript
          : ''
    );
    const start = Number((row as any)?.start ?? (row as any)?.startTime ?? 0);
    const duration = Number((row as any)?.duration ?? 0);
    const end = Number((row as any)?.end ?? (row as any)?.endTime ?? start + Math.max(duration, 0));
    if (!text || !Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      continue;
    }
    segments.push({
      text,
      startTime: start,
      endTime: end,
    });
  }
  return segments;
}

function approximateSegmentsFromText(text: string): TranscriptSegment[] {
  const normalized = cleanTranscriptText(text);
  if (!normalized) {
    return [];
  }
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  if (sentences.length === 0) {
    return [];
  }

  let t = 0;
  const segments: TranscriptSegment[] = [];
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter((word) => word.length > 0).length;
    const duration = Math.max(1.5, words / 2.5);
    const start = t;
    const end = t + duration;
    segments.push({ text: sentence, startTime: start, endTime: end });
    t = end;
  }
  return segments;
}

function extractTranscriptFromJson(data: unknown): string {
  const deepgramParagraph = (data as any)?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript;
  if (typeof deepgramParagraph === 'string') {
    return cleanTranscriptText(deepgramParagraph);
  }
  const deepgramTranscript = (data as any)?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
  if (typeof deepgramTranscript === 'string') {
    return cleanTranscriptText(deepgramTranscript);
  }
  const fromSegments = parseSegmentArray((data as any)?.segments);
  if (fromSegments.length > 0) {
    return getTranscriptText(fromSegments);
  }
  const fromArray = parseSegmentArray(data);
  if (fromArray.length > 0) {
    return getTranscriptText(fromArray);
  }
  return '';
}

function parseExternalTranscriptPayload(payload: string, contentType: string | null): { text: string; segments: TranscriptSegment[] } {
  const trimmed = payload.trim();
  if (!trimmed) {
    return { text: '', segments: [] };
  }

  const looksLikeJson = (contentType || '').includes('json') || trimmed.startsWith('{') || trimmed.startsWith('[');
  if (looksLikeJson) {
    try {
      const data = JSON.parse(trimmed);
      const deepgramSegments = parseDeepgramLikeTranscript(data);
      if (deepgramSegments.length > 0) {
        return { text: getTranscriptText(deepgramSegments), segments: deepgramSegments };
      }
      const explicitSegments = parseSegmentArray((data as any)?.segments);
      if (explicitSegments.length > 0) {
        return { text: getTranscriptText(explicitSegments), segments: explicitSegments };
      }
      const arraySegments = parseSegmentArray(data);
      if (arraySegments.length > 0) {
        return { text: getTranscriptText(arraySegments), segments: arraySegments };
      }
      const text = extractTranscriptFromJson(data);
      if (text) {
        return { text, segments: approximateSegmentsFromText(text) };
      }
    } catch {
      // Ignore JSON parse errors and fall through to cue/plain-text parsing.
    }
  }

  const cueSegments = toTranscriptSegments(parseCueBasedTranscript(trimmed));
  if (cueSegments.length > 0) {
    return {
      text: getTranscriptText(cueSegments),
      segments: cueSegments,
    };
  }

  const text = cleanTranscriptText(trimmed);
  return {
    text,
    segments: approximateSegmentsFromText(text),
  };
}

type TranscriptQualityResult = {
  ok: boolean;
  reason: string;
};

function countWords(text: string): number {
  if (!text) {
    return 0;
  }
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

function evaluateTranscriptQuality({
  text,
  segments,
  episode,
}: {
  text: string;
  segments: TranscriptSegment[];
  episode: Episode;
}): TranscriptQualityResult {
  const normalized = cleanTranscriptText(text);
  const charCount = normalized.length;
  const wordCount = countWords(normalized);

  // Base sanity checks to reject obviously incomplete transcripts.
  if (charCount < 600 || wordCount < 120) {
    return {
      ok: false,
      reason: `too short (chars=${charCount}, words=${wordCount})`,
    };
  }

  // Reject highly repetitive content, which is often a broken transcript payload.
  if (wordCount >= 200) {
    const words = normalized
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const uniqueRatio = new Set(words).size / Math.max(words.length, 1);
    if (uniqueRatio < 0.12) {
      return {
        ok: false,
        reason: `low lexical diversity (unique_ratio=${uniqueRatio.toFixed(3)})`,
      };
    }
  }

  const durationSec = Number(episode.duration);
  if (Number.isFinite(durationSec) && durationSec >= 8 * 60) {
    // Use a conservative floor so short-but-valid transcripts pass, while clearly
    // truncated transcripts fail and fall back to AssemblyAI.
    const minWordsForDuration = Math.max(120, Math.floor(durationSec * 0.22));
    if (wordCount < minWordsForDuration) {
      return {
        ok: false,
        reason: `word count below duration floor (words=${wordCount}, min=${minWordsForDuration}, duration=${durationSec}s)`,
      };
    }

    if (segments.length > 0) {
      const maxEnd = Math.max(...segments.map((segment) => Number(segment.endTime || 0)));
      const coverage = maxEnd / Math.max(durationSec, 1);
      if (coverage < 0.2) {
        return {
          ok: false,
          reason: `timeline coverage too low (coverage=${coverage.toFixed(3)}, max_end=${maxEnd}s, duration=${durationSec}s)`,
        };
      }
    }
  }

  return { ok: true, reason: 'ok' };
}

/** Try to transcribe an episode using Podcasting 2.0 transcript URL in RSS.
 * Returns a result string if successful, or null if no RSS transcript is available.
 */
export async function TranscribeRSSEpisode({
  supabase,
  episode,
  podcast,
  force,
}: {
  supabase: SupabaseClient;
  episode: Episode;
  podcast: Podcast;
  force: boolean;
}): Promise<string | null> {
  if (episode.transcriptUrl !== null && episode.rawTranscriptUrl !== null && !force) {
    return `Episode ${episode.id} already transcribed.`;
  }
  if (!podcast.rssUrl) {
    return null;
  }

  updateStatus({ supabase, episode, message: 'Checking RSS transcript' });
  const transcriptSourceUrl = await GetEpisodeTranscriptFromFeed(podcast.rssUrl, episode);
  if (!transcriptSourceUrl) {
    return null;
  }

  console.log(`Found RSS transcript for episode ${episode.id}: ${transcriptSourceUrl}`);
  const res = await fetch(transcriptSourceUrl, {
    redirect: 'follow',
    headers: { 'User-Agent': 'Podverse' },
  });
  if (!res.ok) {
    throw new Error(`Error fetching RSS transcript: ${res.status} ${res.statusText}`);
  }

  const payload = await res.text();
  const { text, segments } = parseExternalTranscriptPayload(payload, res.headers.get('content-type'));
  if (!text) {
    return null;
  }

  const normalizedSegments = segments.length > 0 ? segments : approximateSegmentsFromText(text);
  const quality = evaluateTranscriptQuality({ text, segments: normalizedSegments, episode });
  if (!quality.ok) {
    console.warn(`RSS transcript rejected for episode ${episode.id}: ${quality.reason}`);
    return null;
  }
  const deepgramFormat = convertToDeepgramFormat(normalizedSegments);

  const rawTranscriptUrl = await Upload(
    supabase,
    JSON.stringify(deepgramFormat, null, 2),
    'transcripts',
    `${episode.podcast}/${episode.id}/transcript.json`,
  );

  const transcriptUrl = await Upload(
    supabase,
    text,
    'transcripts',
    `${episode.podcast}/${episode.id}/transcript.txt`,
  );

  episode.transcriptUrl = transcriptUrl;
  episode.rawTranscriptUrl = rawTranscriptUrl;
  await UpdateEpisode(supabase, episode);
  console.log(`RSS transcript for episode ${episode.id}: ${text.length} bytes`);
  return `RSS transcript for episode ${episode.id} (${text.length} bytes)`;
}

/** Try to transcribe an episode using YouTube transcript.
 * Returns a result string if successful, or null if no YouTube transcript is available.
 */
export async function TranscribeYouTubeEpisode({
  supabase,
  episode,
  force,
}: {
  supabase: SupabaseClient;
  episode: Episode;
  force: boolean;
}): Promise<string | null> {
  if (episode.transcriptUrl !== null && episode.rawTranscriptUrl !== null && !force) {
    return `Episode ${episode.id} already transcribed.`;
  }

  // Try to find a YouTube URL from the episode URL or originalAudioUrl
  const episodeUrl = episode.url || '';
  const isYouTubeUrl =
    episodeUrl.includes('youtube.com') || episodeUrl.includes('youtu.be');

  if (!isYouTubeUrl) {
    return null;
  }

  console.log(`Trying YouTube transcript for episode ${episode.id}: ${episodeUrl}`);
  updateStatus({ supabase, episode, message: 'Fetching YouTube transcript' });

  const segments = await fetchYouTubeTranscript(episodeUrl);
  if (!segments || segments.length === 0) {
    return null;
  }

  // Convert to Deepgram format for compatibility with the rest of the pipeline
  const deepgramFormat = convertToDeepgramFormat(segments);
  const transcriptText = getTranscriptText(segments);
  const quality = evaluateTranscriptQuality({ text: transcriptText, segments, episode });
  if (!quality.ok) {
    console.warn(`YouTube transcript rejected for episode ${episode.id}: ${quality.reason}`);
    return null;
  }

  // Upload raw transcript JSON
  const rawTranscriptUrl = await Upload(
    supabase,
    JSON.stringify(deepgramFormat, null, 2),
    'transcripts',
    `${episode.podcast}/${episode.id}/transcript.json`,
  );

  // Upload plain text transcript
  const transcriptUrl = await Upload(
    supabase,
    transcriptText,
    'transcripts',
    `${episode.podcast}/${episode.id}/transcript.txt`,
  );

  // Update episode
  episode.transcriptUrl = transcriptUrl;
  episode.rawTranscriptUrl = rawTranscriptUrl;
  await UpdateEpisode(supabase, episode);

  console.log(`YouTube transcript for episode ${episode.id}: ${transcriptText.length} bytes`);
  return `YouTube transcript for episode ${episode.id} (${transcriptText.length} bytes)`;
}

/** Transcribe the given episode using AssemblyAI. */
export async function TranscribeEpisode({
  supabase,
  supabaseToken,
  episode,
  podcast,
  force,
}: {
  supabase: SupabaseClient;
  supabaseToken: string | null;
  episode: Episode;
  podcast: Podcast;
  force: boolean;
}): Promise<string> {
  console.log(`Transcribing episode ${episode.id}`);
  updateStatus({ supabase, episode, message: 'Transcribing' });
  if (episode.transcriptUrl !== null && episode.rawTranscriptUrl !== null && !force) {
    return `Episode ${episode.id} already transcribed.`;
  }
  if (episode.originalAudioUrl === null) {
    return `Episode ${episode.id} has no audio.`;
  }

  // Try to upload audio to Supabase storage for caching. If the file is too
  // large (413), fall back to using the original audio URL directly — AssemblyAI
  // can fetch from any public URL.
  let audioUrl: string | null = null;
  try {
    const res = await fetch(episode.originalAudioUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Podverse' },
    });
    console.log(
      `Fetched audio for episode ${episode.id}: ${res.status} ${res.statusText} - size is ${res.headers.get(
        'content-length'
      )} bytes.`
    );
    if (!res.ok) {
      throw new Error(`Error fetching audio: ${res.status} ${res.statusText}`);
    }
    const body = res.body;
    if (!body) {
      throw new Error('No body in response');
    }
    const file = Readable.fromWeb(body as any);
    audioUrl = await UploadLargeFile(
      supabase,
      supabaseToken,
      file,
      res.headers.get('content-type') || 'audio/mp3',
      'audio',
      `${episode.podcast}/${episode.id}/audio.mp3`
    );
    console.log(`Saved audio for ${episode.id} to: ${audioUrl}`);
  } catch (uploadErr: any) {
    console.warn(
      `Audio upload to Supabase failed for episode ${episode.id}: ${uploadErr.message}. Using original URL instead.`
    );
    audioUrl = episode.originalAudioUrl;
  }

  episode.audioUrl = audioUrl;
  await UpdateEpisode(supabase, episode);

  console.log(`Transcribing episode ${episode.id} from podcast ${podcast.title} via AssemblyAI`);
  const result = await TranscribeAsync(audioUrl);
  console.log(`AssemblyAI transcription complete for episode ${episode.id}: ${result.text.length} bytes`);

  // Convert AssemblyAI utterances to pipeline-compatible format
  const segments: TranscriptSegment[] = result.utterances.map((u) => ({
    text: u.text,
    startTime: u.start,
    endTime: u.end,
    speaker: u.speaker,
  }));
  const deepgramFormat = convertToDeepgramFormat(
    segments.length > 0 ? segments : approximateSegmentsFromText(result.text)
  );

  const rawTranscriptUrl = await Upload(
    supabase,
    JSON.stringify(deepgramFormat, null, 2),
    'transcripts',
    `${episode.podcast}/${episode.id}/transcript.json`
  );

  const transcriptUrl = await Upload(
    supabase,
    result.text,
    'transcripts',
    `${episode.podcast}/${episode.id}/transcript.txt`
  );

  episode.transcriptUrl = transcriptUrl;
  episode.rawTranscriptUrl = rawTranscriptUrl;
  await UpdateEpisode(supabase, episode);
  console.log(`Done transcribing episode ${episode.id} - ${result.text.length} bytes.`);
  return `Transcribed episode ${episode.id} (${result.text.length} bytes)`;
}

/** Summarize the given episode. */
export async function SummarizeEpisode({
  supabase,
  episode,
  force,
}: {
  supabase: SupabaseClient;
  episode: Episode;
  force: boolean;
}): Promise<string> {
  console.log(`Summarizing episode ${episode.id}`);
  updateStatus({ supabase, episode, message: 'Summarizing' });
  const podcast = await GetPodcastByID(supabase, episode.podcast.toString());
  if (episode.summaryUrl !== null && !force) {
    return `Episode ${episode.id} already summarized.`;
  }
  if (episode.transcriptUrl === null) {
    return `Episode ${episode.id} has no transcript.`;
  }
  const res = await fetch(episode.transcriptUrl);
  const text = await res.text();
  const summary = await Summarize({ text, episode, podcast });
  const filename = `${episode.podcast}/${episode.id}/summary.txt`;
  console.log(`Uploading summary for episode ${episode.id} to ${filename}`);
  const summaryUrl = await Upload(supabase, summary, 'summaries', filename);

  // Update Episode.
  episode.summaryUrl = summaryUrl;
  await UpdateEpisode(supabase, episode);
  console.log(`Done summarizing episode ${episode.id} - ${summary.length} bytes.`);
  return `Summarized episode ${episode.id} (${summary.length} bytes): ${summaryUrl}`;
}

/** Perform speaker identification on the given episode. */
export async function SpeakerIDEpisode({
  supabase,
  episode,
  force,
}: {
  supabase: SupabaseClient;
  episode: Episode;
  force: boolean;
}): Promise<string> {
  console.log(`Speaker ID for episode ${episode.id}`);
  updateStatus({ supabase, episode, message: 'Determining speaker IDs' });
  const podcast = await GetPodcastByID(supabase, episode.podcast.toString());
  if (episode.transcriptUrl === null) {
    return `Episode ${episode.id} has no transcript.`;
  }

  // Check for existing speaker map.
  const speakerMap = await GetSpeakerMap(supabase, episode.id);
  if (Object.keys(speakerMap).length > 0 && !force) {
    return `Episode ${episode.id} already has speaker map.`;
  }
  const res = await fetch(episode.transcriptUrl);
  const text = await res.text();
  const speakers = await SpeakerID({ text, episode, podcast });

  // Update SpeakerMap.
  for (const [speakerId, name] of Object.entries(speakers)) {
    console.log(`Updating speaker map for episode ${episode.id}: speaker=${speakerId}, name=${name}`);
    await UpdateSpeakerMap(supabase, episode.id, speakerId, name, force);
  }
  console.log(`Done speaker ID for episode ${episode.id}`);
  return `SpeakerID on episode ${episode.id} done`;
}

/** Perform query suggestion for the given episode. */
export async function SuggestEpisode({
  supabase,
  episode,
  force,
}: {
  supabase: SupabaseClient;
  episode: Episode;
  force: boolean;
}): Promise<string> {
  console.log(`Suggesting queries for episode ${episode.id}`);
  updateStatus({ supabase, episode, message: 'Generating suggested queries' });
  const podcast = await GetPodcastByID(supabase, episode.podcast.toString());
  if (episode.transcriptUrl === null) {
    return `Episode ${episode.id} has no transcript.`;
  }

  // Check for existing suggestions.
  let suggestions = await GetSuggestions(supabase, episode.id);
  if (Object.keys(suggestions).length > 0) {
    if (!force) {
      return `Episode ${episode.id} already has suggestions.`;
    } else {
      console.log(`Deleting existing suggestions for episode ${episode.id}`);
      await DeleteSuggestions(supabase, episode.id);
    }
  }
  const res = await fetch(episode.transcriptUrl);
  const text = await res.text();
  suggestions = await SuggestQueries({ text, episode, podcast });

  // Update Suggestions.
  for (const suggestion of suggestions) {
    console.log(`Adding suggestion for episode ${episode.id}: ${suggestion}`);
    await AddSuggestion({supabase, episodeId: episode.id, suggestion});
  }
  console.log(`Generated ${suggestions.length} suggested queries for episode ${episode.id}`);
  return `Suggested queries for episode ${episode.id} done`;
}

/** Embed the given episode. */
export async function EmbedEpisode({
  supabase,
  episode,
  force,
}: {
  supabase: SupabaseClient;
  episode: Episode;
  force: boolean;
}): Promise<string> {
  console.log(`Embed for episode ${episode.id}`);
  updateStatus({ supabase, episode, message: 'Generating embeddings' });
  if (episode.rawTranscriptUrl === null) {
    return `Episode ${episode.id} has no JSON transcript.`;
  }
  // Check for existing embeddings.
  const { data: existing, error } = await supabase.from('Documents').select('*').eq('episode', episode.id);
  if (error) {
    console.error('error', error);
    throw error;
  }
  if (existing && existing.length > 0) {
    if (!force) {
      return `Episode ${episode.id} already embedded.`;
    } else {
      console.log(`Deleting existing embeddings for episode ${episode.id}`);
      const { error } = await supabase.from('Documents').delete().eq('episode', episode.id);
      if (error) {
        console.error('error', error);
        throw error;
      }
    }
  }
  const docId = await EmbedTranscript(supabase, episode.rawTranscriptUrl, episode.id);
  console.log(`Done embedding episode ${episode.id} - page ${docId}`);
  return `Embed on episode ${episode.id} done - document ID ${docId}`;
}
