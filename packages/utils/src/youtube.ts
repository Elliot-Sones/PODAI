/** YouTube transcript fetching utility.
 * Fetches auto-generated transcripts from YouTube videos and converts
 * them into the Podverse transcript format for processing.
 */

interface YouTubeTranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

export interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string;
}

/** Fetch a YouTube transcript for the given video URL or ID.
 * Returns segments with text, startTime, and endTime in seconds.
 */
export async function fetchYouTubeTranscript(videoUrlOrId: string): Promise<TranscriptSegment[]> {
  const videoId = extractVideoId(videoUrlOrId);
  if (!videoId) {
    throw new Error(`Could not extract video ID from: ${videoUrlOrId}`);
  }

  // Fetch the YouTube watch page to get transcript data
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(watchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch YouTube page: ${res.status}`);
  }

  const html = await res.text();

  // Extract the innertube API key and caption track URL from the page
  const captionTrackUrl = extractCaptionTrackUrl(html);
  if (!captionTrackUrl) {
    throw new Error(`No captions available for video ${videoId}`);
  }

  // Try JSON3 format first, then fall back to XML
  try {
    const transcriptRes = await fetch(captionTrackUrl + '&fmt=json3');
    if (transcriptRes.ok) {
      const json = await transcriptRes.json();
      const segments = parseTranscriptJson3(json);
      if (segments.length > 0) return segments;
    }
  } catch {
    // JSON3 format failed, try XML
  }

  // Fall back to XML format
  const xmlRes = await fetch(captionTrackUrl);
  if (!xmlRes.ok) {
    throw new Error(`Failed to fetch transcript: ${xmlRes.status}`);
  }
  const xmlText = await xmlRes.text();
  return parseTranscriptXml(xmlText);
}

/** Extract video ID from various YouTube URL formats. */
function extractVideoId(urlOrId: string): string | null {
  // Already a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }

  try {
    const url = new URL(urlOrId);
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1);
    }
    if (url.hostname.includes('youtube.com')) {
      return url.searchParams.get('v');
    }
  } catch {
    // Not a URL
  }
  return null;
}

/** Extract the caption track URL from the YouTube watch page HTML. */
function extractCaptionTrackUrl(html: string): string | null {
  // Look for captionTracks in the player response — use bracket matching for robust extraction
  const startMarker = '"captionTracks":';
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) return null;

  const arrayStart = html.indexOf('[', startIdx);
  if (arrayStart === -1) return null;

  // Find the matching closing bracket
  let depth = 0;
  let arrayEnd = -1;
  for (let i = arrayStart; i < html.length && i < arrayStart + 5000; i++) {
    if (html[i] === '[') depth++;
    else if (html[i] === ']') {
      depth--;
      if (depth === 0) {
        arrayEnd = i + 1;
        break;
      }
    }
  }
  if (arrayEnd === -1) return null;

  try {
    const tracks = JSON.parse(html.slice(arrayStart, arrayEnd));
    // Prefer English, then auto-generated English, then first available
    const englishTrack =
      tracks.find((t: { languageCode: string; kind?: string }) => t.languageCode === 'en' && !t.kind) ||
      tracks.find((t: { languageCode: string }) => t.languageCode === 'en') ||
      tracks[0];

    if (englishTrack?.baseUrl) {
      return englishTrack.baseUrl;
    }
  } catch (e) {
    console.error('Failed to parse captionTracks JSON:', e);
  }
  return null;
}

/** Parse JSON3 format transcript. */
function parseTranscriptJson3(json: { events?: Array<{ tStartMs: number; dDurationMs: number; segs?: Array<{ utf8: string }> }> }): TranscriptSegment[] {
  if (!json.events) return [];

  return json.events
    .filter((event) => event.segs && event.segs.length > 0)
    .map((event) => ({
      text: (event.segs || []).map((seg) => seg.utf8).join('').trim(),
      startTime: (event.tStartMs || 0) / 1000,
      endTime: ((event.tStartMs || 0) + (event.dDurationMs || 0)) / 1000,
    }))
    .filter((seg) => seg.text.length > 0);
}

/** Parse XML format transcript (fallback). */
function parseTranscriptXml(xml: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const regex = /<text start="([^"]+)" dur="([^"]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let match;

  while ((match = regex.exec(xml)) !== null) {
    const startTime = parseFloat(match[1]);
    const duration = parseFloat(match[2]);
    const text = decodeXmlEntities(match[3]).trim();

    if (text) {
      segments.push({
        text,
        startTime,
        endTime: startTime + duration,
      });
    }
  }

  return segments;
}

/** Decode XML entities. */
function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n/g, ' ');
}

/** Convert YouTube transcript segments to a Deepgram-like transcript format.
 * This produces a format compatible with the existing Podverse pipeline.
 */
export function convertToDeepgramFormat(segments: TranscriptSegment[]): object {
  const hasSpeakerData = segments.some((s) => s.speaker !== undefined);

  // Map speaker labels (e.g. "A", "B" from AssemblyAI or "0", "1") to numeric indices
  const speakerMap = new Map<string, number>();
  const speakerIndex = (label: string | undefined): number => {
    if (label === undefined) return 0;
    const num = parseInt(label, 10);
    if (!isNaN(num)) return num;
    if (!speakerMap.has(label)) {
      speakerMap.set(label, speakerMap.size);
    }
    return speakerMap.get(label)!;
  };

  // Group segments into paragraphs
  const paragraphs: Array<{
    transcript: string;
    speaker: number;
    sentences: Array<{ text: string; start: number; end: number }>;
  }> = [];

  if (hasSpeakerData) {
    // Group consecutive segments by speaker turns
    let currentGroup: TranscriptSegment[] = [];
    let currentSpeaker: string | undefined = undefined;

    for (const seg of segments) {
      if (seg.speaker !== currentSpeaker && currentGroup.length > 0) {
        paragraphs.push({
          transcript: currentGroup.map((s) => s.text).join(' '),
          speaker: speakerIndex(currentSpeaker),
          sentences: currentGroup.map((s) => ({
            text: s.text,
            start: s.startTime,
            end: s.endTime,
          })),
        });
        currentGroup = [];
      }
      currentSpeaker = seg.speaker;
      currentGroup.push(seg);
    }
    if (currentGroup.length > 0) {
      paragraphs.push({
        transcript: currentGroup.map((s) => s.text).join(' '),
        speaker: speakerIndex(currentSpeaker),
        sentences: currentGroup.map((s) => ({
          text: s.text,
          start: s.startTime,
          end: s.endTime,
        })),
      });
    }
  } else {
    // No speaker data — fall back to grouping every ~10 segments
    const paragraphSize = 10;
    for (let i = 0; i < segments.length; i += paragraphSize) {
      const group = segments.slice(i, i + paragraphSize);
      paragraphs.push({
        transcript: group.map((s) => s.text).join(' '),
        speaker: 0,
        sentences: group.map((s) => ({
          text: s.text,
          start: s.startTime,
          end: s.endTime,
        })),
      });
    }
  }

  const fullTranscript = segments.map((s) => s.text).join(' ');

  return {
    results: {
      channels: [
        {
          alternatives: [
            {
              transcript: fullTranscript,
              paragraphs: {
                transcript: fullTranscript,
                paragraphs: paragraphs.map((p) => ({
                  sentences: p.sentences,
                  speaker: p.speaker,
                  start: p.sentences[0]?.start || 0,
                  end: p.sentences[p.sentences.length - 1]?.end || 0,
                })),
              },
              words: segments.map((s) => ({
                word: s.text,
                start: s.startTime,
                end: s.endTime,
                speaker: speakerIndex(s.speaker),
                punctuated_word: s.text,
              })),
            },
          ],
        },
      ],
    },
    metadata: {
      request_id: `youtube-${Date.now()}`,
      created: new Date().toISOString(),
      models: ['youtube-transcript'],
    },
  };
}

/** Get the full transcript text from segments. */
export function getTranscriptText(segments: TranscriptSegment[]): string {
  return segments.map((s) => s.text).join(' ');
}
