/** Legacy Deepgram callback endpoint - no longer used.
 * Transcription now uses AssemblyAI with synchronous polling.
 * This stub remains to gracefully handle any stale callbacks.
 */
export async function POST() {
  return Response.json({ message: 'Transcription callback endpoint deprecated.' });
}
