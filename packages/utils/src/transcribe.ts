/** This module performs audio->text transcription using AssemblyAI. */

export interface TranscriptionResult {
  /** Full transcript text */
  text: string;
  /** Transcript segments with timing and speaker info */
  utterances: Array<{
    text: string;
    start: number;
    end: number;
    speaker: string;
  }>;
  /** Raw AssemblyAI response for storage */
  raw: Record<string, unknown>;
}

/** Transcribe the given audio file using AssemblyAI Universal-2 (synchronous polling).
 * Returns the full transcription result with text, utterances, and raw response.
 */
export async function Transcribe(audioUrl: string): Promise<TranscriptionResult> {
  console.log(`Transcribe audio from ${audioUrl}`);
  const apiKey = process.env.ASSEMBLYAI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Missing ASSEMBLYAI_API_KEY environment variable.');
  }

  // Submit transcription request
  const submitRes = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      speaker_labels: true,
      punctuate: true,
      format_text: true,
    }),
  });

  if (!submitRes.ok) {
    const errorBody = await submitRes.text();
    throw new Error(`AssemblyAI submit error (${submitRes.status}): ${errorBody}`);
  }

  const submitData = await submitRes.json();
  const transcriptId: string = submitData.id;
  console.log(`AssemblyAI transcript submitted: ${transcriptId}`);

  // Poll for completion
  const result = await pollForCompletion(apiKey, transcriptId);
  return result;
}

/** Transcribe the given audio file using AssemblyAI Universal-2 (synchronous polling).
 * This replaces the old Deepgram async callback approach. No callback URL is needed.
 */
export async function TranscribeAsync(audioUrl: string, _callbackUrl?: string, language?: string): Promise<TranscriptionResult> {
  console.log(`Starting audio transcription from ${audioUrl}`);
  const apiKey = process.env.ASSEMBLYAI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Missing ASSEMBLYAI_API_KEY environment variable.');
  }

  // Submit transcription request
  const body: Record<string, unknown> = {
    audio_url: audioUrl,
    speech_models: ['universal-2'],
    speaker_labels: true,
    punctuate: true,
    format_text: true,
  };
  if (language) {
    body.language_code = language;
  }

  const submitRes = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!submitRes.ok) {
    const errorBody = await submitRes.text();
    throw new Error(`AssemblyAI submit error (${submitRes.status}): ${errorBody}`);
  }

  const submitData = await submitRes.json();
  const transcriptId: string = submitData.id;
  console.log(`AssemblyAI transcript submitted: ${transcriptId}`);

  // Poll for completion
  const result = await pollForCompletion(apiKey, transcriptId);
  return result;
}

/** Poll AssemblyAI for transcription completion. */
async function pollForCompletion(apiKey: string, transcriptId: string): Promise<TranscriptionResult> {
  const pollingUrl = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;
  const maxAttempts = 360; // 30 minutes at 5-second intervals
  const pollInterval = 5000; // 5 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(pollingUrl, {
      headers: { authorization: apiKey },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`AssemblyAI poll error (${res.status}): ${errorBody}`);
    }

    const data = await res.json();

    if (data.status === 'completed') {
      console.log(`AssemblyAI transcription completed: ${transcriptId}`);
      return {
        text: data.text || '',
        utterances: (data.utterances || []).map((u: { text: string; start: number; end: number; speaker: string }) => ({
          text: u.text,
          start: u.start / 1000, // Convert ms to seconds
          end: u.end / 1000,
          speaker: u.speaker,
        })),
        raw: data,
      };
    }

    if (data.status === 'error') {
      throw new Error(`AssemblyAI transcription failed: ${data.error}`);
    }

    // Still processing, wait and try again
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(`AssemblyAI transcription timed out after ${maxAttempts * pollInterval / 1000} seconds`);
}
