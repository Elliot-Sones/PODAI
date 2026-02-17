import { Podcast, Episode } from './types.js';
import OpenAI from 'openai';

const TRANSCRIPT_SUMMARY = `Provide a one or two sentence summary of the
  following podcast transcript. Only use the information
  provided in the text; DO NOT use any information you know about the world.
  Include the title of the podcast, the name of the episode, and the
  names of the speakers, if known.`;

const TEXT_SUMMARY = `Provide a one or two sentence summary of the
  following text. Only use the information provided in the text; DO NOT
  use any information you know about the world. Include the title of the
  podcast, the name of the episode, and the names of the speakers, if known.`;

const PODCAST_SUMMARY = `Provide a one-paragraph summary of the
  following text, which describes a single podcast episode. Start out with
  "This episode..." or "The topic of this episode is...".
  If the title of the podcast, the name of the episode, or the names of
  the speakers are mentioned, include them in your summary. Only use the
  information provided in the text; DO NOT use any information you know
  about the world.`;

function makePrompt(text: string, podcast?: Podcast, episode?: Episode) {
  return (
    text +
    '\n' +
    (podcast?.title ? `The name of the podcast is: ${podcast.title}\n` : '') +
    (episode?.title ? `The title of the episode is: ${episode.title}\n` : '') +
    (episode?.description ? `The provided description of the episode is: ${episode.description}\n` : '')
  );
}

function getOpenRouterClient() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY environment variable.');
  }
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });
}

export async function Summarize({
  text,
  podcast,
  episode,
  maxTokenLen = 100000,
  debug,
}: {
  text: string;
  podcast?: Podcast;
  episode?: Episode;
  maxTokenLen?: number;
  debug?: boolean;
}): Promise<string> {
  const client = getOpenRouterClient();
  console.log(`Summarizing ${text.length} chars...\n`);

  let systemMessage = makePrompt(TRANSCRIPT_SUMMARY, podcast, episode);

  // Reduce the transcript to a shorter summary.
  while (tokenLen(text) > maxTokenLen) {
    if (debug) {
      console.log(`Tokens ${tokenLen(text)} > ${maxTokenLen}\n`);
    }
    const chunks = chunkText(text, maxTokenLen);
    if (debug) {
      console.log(`Generated ${chunks.length} chunks\n`);
    }
    const transcriptSummaries = await Promise.all(
      chunks.map(async (chunk) => Summary({ client, text: chunk, systemMessage }))
    );
    const summarizedTranscript = rechunk(transcriptSummaries, maxTokenLen);
    text = summarizedTranscript.join('\n');
    if (debug) {
      console.log('New text is: ', text);
    }
    systemMessage = makePrompt(TEXT_SUMMARY, podcast, episode);
  }
  // Generate the final podcast summary.
  if (debug) {
    console.log(`Size is ${tokenLen(text)} - Generating final summary.`);
  }
  systemMessage = makePrompt(PODCAST_SUMMARY, podcast, episode);
  const result = await Summary({ client, text, systemMessage });

  console.log(`Summarized ${text.length} chars to ${result.length} chars.`);
  return result;
}

// Rough estimate.
const tokenLen = (text: string) => text.length / 4;

function chunkText(text: string, maxTokenLen: number): string[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const chunks = [];
  let chunk = '';
  for (const line of lines) {
    if (tokenLen(chunk + line) > maxTokenLen) {
      chunks.push(chunk);
      chunk = '';
    }
    chunk += line + '\n';
  }
  chunks.push(chunk);
  return chunks;
}

function rechunk(chunks: string[], maxTokenLen: number): string[] {
  const fullText = chunks.join('\n');
  return chunkText(fullText, maxTokenLen);
}

async function Summary({
  client,
  text,
  systemMessage,
}: {
  client: OpenAI;
  text: string;
  systemMessage: string;
}): Promise<string> {
  const response = await client.chat.completions.create({
    model: 'anthropic/claude-3.5-haiku',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: text },
    ],
  });
  return response.choices[0]?.message?.content || '';
}
