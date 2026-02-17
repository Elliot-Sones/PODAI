import { Podcast, Episode } from './types.js';
import OpenAI from 'openai';

const SPEAKERID_PROMPT = `The following is a transcript of a conversation between multiple
  individuals, identified as "Speaker 0", "Speaker 1", and so forth. Please identify the
  speakers in the conversation, based on the contents of the transcript. Your response should
  be a JSON object, with the keys representing the original speaker identifications
  (e.g., "Speaker 0", "Speaker 1") and the values representing the identified speaker names
  (e.g., "John Smith", "Jane Doe"). For example, your response might be:

  { "Speaker 0": "John Smith", "Speaker 1": "Jane Doe" }

  ONLY return a JSON formatted response. DO NOT return any other information or context.
  DO NOT use backquotes in your reply.`;

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

export async function SpeakerID({
  text,
  podcast,
  episode,
  maxTokenLen = 100000,
}: {
  text: string;
  podcast?: Podcast;
  episode?: Episode;
  maxTokenLen?: number;
}): Promise<Record<string, string>> {
  const client = getOpenRouterClient();
  const systemMessage = makePrompt(SPEAKERID_PROMPT, podcast, episode);

  if (tokenLen(text) > maxTokenLen) {
    text = text.substring(0, maxTokenLen * 4);
  }

  let parsed = null;
  let tries = 0;
  const MAX_TRIES = 3;
  while (tries < MAX_TRIES) {
    tries += 1;
    const response = await client.chat.completions.create({
      model: 'anthropic/claude-3.5-haiku',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: text },
      ],
    });
    const result = response.choices[0]?.message?.content || '{}';
    console.log(`[Attempt ${tries}/${MAX_TRIES}] SpeakerID result: ${result}`);
    try {
      // Try direct parse first, then extract JSON object from response text
      let jsonStr = result.trim();
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      parsed = JSON.parse(jsonStr);
      if (typeof parsed !== 'object') {
        throw new Error(`Expected JSON object as response, got: ${result}`);
      }
      break;
    } catch (e) {
      console.error(`[Attempt ${tries}/${MAX_TRIES}] Failed to parse SpeakerID result: ${e}`);
    }
  }
  if (tries >= MAX_TRIES) {
    throw new Error(`Failed to get a valid response from the LLM after ${MAX_TRIES} attempts.`);
  }

  const updated: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, string>)) {
    const newKey = key.replace('Speaker ', '');
    updated[newKey] = value;
  }
  return updated;
}
