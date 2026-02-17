import { Podcast, Episode } from './types.js';
import OpenAI from 'openai';

const SUGGEST_QUERIES_PROMPT = `The following is a transcript of a conversation between
  multiple individuals. Your task is to suggest queries that could be used to search for
  interesting segments of the conversation. For example, a query might be "What did the
  Beatles say about their music?" or "What did the guest say about the economy?". Your job
  is only to suggest interesting or insightful queries about the provided content, not to
  provide answers. DO NOT suggest queries for portions of the conversation that are not
  about the main topic of the conversation. In particular, do not suggest queries related
  to advertising that may appear in the middle of the transcript. Your response should be a
  JSON array of strings, where each string is a query. For example, your response might be:
  ["What did the Beatles say about their music?", "What did the guest say about the economy?"]
  ONLY return a JSON formatted array response. DO NOT return any other information or context.
  DO NOT prefix your response with backquotes.`;

// Rough estimate.
const tokenLen = (text: string) => text.length / 4;

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

export async function SuggestQueries({
  text,
  podcast,
  episode,
  maxTokenLen = 100000,
}: {
  text: string;
  podcast?: Podcast;
  episode?: Episode;
  maxTokenLen?: number;
}): Promise<string[]> {
  const client = getOpenRouterClient();
  const systemMessage = makePrompt(SUGGEST_QUERIES_PROMPT, podcast, episode);

  if (tokenLen(text) > maxTokenLen) {
    text = text.substring(0, maxTokenLen * 4);
  }

  const response = await client.chat.completions.create({
    model: 'anthropic/claude-3.5-haiku',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: text },
    ],
  });

  const result = response.choices[0]?.message?.content || '[]';
  const parsed = JSON.parse(result);
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected JSON array as response, got: ${result}`);
  }
  return parsed as string[];
}
