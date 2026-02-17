/** Chat API endpoint.
 *  - Single-episode: Gemini Flash with full annotated transcript (speaker names + timestamps).
 *  - Podcast-wide or fallback: Claude Haiku via OpenRouter with RAG vector search.
 */

import OpenAI from 'openai';
import { VectorSearch, GetEpisodeWithPodcast, annotateTranscript, TranscriptJson, Speakers } from 'podverse-utils';
import { getSupabaseClient } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

function getOpenRouterClient() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY environment variable.');
  }
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });
}

// ---------------------------------------------------------------------------
// Path A: Single-episode full-transcript chat (Gemini Flash)
// ---------------------------------------------------------------------------

function buildGeminiSystemPrompt(
  podcastTitle: string,
  episodeTitle: string,
  annotatedTranscript: string,
): string {
  return `You are a podcast assistant for "${podcastTitle}". Answer questions about the episode "${episodeTitle}" using ONLY the transcript provided below.

HOW TO ANSWER:
- Be conversational and concise by default (about 3-6 sentences).
- If the user asks for depth, provide a fuller answer with clear structure.
- When referencing something from the transcript, ALWAYS include a citation link using this exact format:
  [Listen at MM:SS](/?seek=SECONDS)
  where SECONDS is the start time number from the transcript timestamp.
- When quoting or paraphrasing a specific person, bold their name: **Speaker Name**
- You may cite multiple moments. Cite every relevant moment you reference.
- If the transcript doesn't cover the topic, say so honestly.

EXAMPLES OF GOOD RESPONSES:

User: "What did they say about AI safety?"
Response: "**Elon Musk** talked about the need for AI regulation, saying the biggest risk is that we move too fast without guardrails [Listen at 12:45](/?seek=765). **Lex Fridman** pushed back on this, arguing that regulation could stifle innovation [Listen at 14:02](/?seek=842)."

User: "Give me a summary of the episode"
Response: "This episode covers three main topics: the future of autonomous vehicles [Listen at 3:20](/?seek=200), the debate around open-source AI models [Listen at 25:10](/?seek=1510), and a personal story about **Elon**'s early days at SpaceX [Listen at 45:30](/?seek=2730)."

User: "When did they talk about Bitcoin?"
Response: "They didn't discuss Bitcoin in this episode."

TRANSCRIPT:
${annotatedTranscript}`;
}

async function handleSingleEpisodeChat(
  client: OpenAI,
  supabase: SupabaseClient,
  episodeId: number,
  messages: Array<{ role: string; content: string }>,
): Promise<Response | null> {
  try {
    const episode = await GetEpisodeWithPodcast(supabase, episodeId);
    if (!episode.rawTranscriptUrl) return null;

    // Fetch raw transcript JSON
    const res = await fetch(episode.rawTranscriptUrl);
    if (!res.ok) return null;
    const rawTranscript: TranscriptJson = await res.json();

    // Annotate with speaker names + timestamps
    const speakers: Speakers = episode.speakers || {};
    const annotation = annotateTranscript(rawTranscript, speakers);
    if (!annotation.text) return null;

    // If transcript is extremely large (>100k tokens est), fall back to RAG
    if (annotation.tokenEstimate > 100000) return null;

    const systemPrompt = buildGeminiSystemPrompt(
      episode.podcast.title ?? 'Unknown Podcast',
      episode.title ?? 'Unknown Episode',
      annotation.text,
    );

    // Build messages
    const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ];
    chatMessages.push(...cleanMessages(messages));

    const stream = await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      max_tokens: 2048,
      messages: chatMessages,
      stream: true,
    });

    return streamToResponse(stream);
  } catch (error) {
    console.error('Gemini full-transcript chat failed, falling back to RAG:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Path B: Podcast-wide / fallback RAG chat (Claude Haiku)
// ---------------------------------------------------------------------------

const EPISODE_SYSTEM_PROMPT = `You are an AI assistant that answers questions about a podcast episode. Speak casually and avoid formal speech.
Use the provided context to answer the user's question.
Keep answers concise by default (about 3-6 sentences), but provide more detail if the user explicitly asks for it.
Do not invent details that are not supported by context.

If you use context information to reply to the user, you should include a Markdown link
with the audio start time. For example, with AUDIO START TIME: 123.45, your reply should include:

[Listen](/?seek=123.45)

You may respond in Markdown format.`;

const PODCAST_SYSTEM_PROMPT = `You are an AI assistant that answers questions about a podcast. Speak casually and avoid formal speech.
Use the provided context to answer the user's question.
Keep answers concise by default (about 3-6 sentences), but provide more detail if the user explicitly asks for it.
Do not invent details that are not supported by context.

If you use context information to reply to the user, you should include a Markdown link
that contains a link to the podcast episode that corresponds to the context provided.

Given context with:
AUDIO START TIME: 123.45
EPISODE LINK: /podcast/amazing-podcast/episode/all-about-bears
EPISODE TITLE: How come bears eat no food?

Your reply should include:
"According to the episode [How come bears eat no food?](/podcast/amazing-podcast/episode/all-about-bears?seek=123.45),
bears are very good at foraging for food in the wild."

Link URLs must ALWAYS be of the form "/podcast/<podcast-name>/episode/<episode-name>".
NEVER include a hostname in the link URL. You are encouraged to reference multiple EPISODE LINKS in your reply.
You may respond in Markdown format.`;

type Chunk = {
  content: string;
  chunkId?: string;
  documentId?: string;
  similarity?: number;
  meta?: {
    startTime: number;
    endTime: number;
  };
};

async function buildContext(chunks: Chunk[], supabase: SupabaseClient): Promise<string> {
  const parts: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    let message = `Context entry ${i + 1}:\n`;
    message += `BEGINNING OF TEXT:\n"${chunk.content}"\nEND OF TEXT.\n`;
    if (chunk.meta) {
      message += `AUDIO START TIME: ${chunk.meta.startTime}\n`;
      if (chunk.meta.endTime) {
        message += `AUDIO END TIME: ${chunk.meta.endTime}\n`;
      }
    }
    if (chunk.documentId) {
      try {
        const { data, error } = await supabase.from('Documents').select('id, episode').eq('id', chunk.documentId);
        if (!error && data && data.length > 0) {
          const episodeId = data![0].episode as string;
          const episode = await GetEpisodeWithPodcast(supabase, parseInt(episodeId));
          const episodeLink = `/podcast/${episode.podcast.slug}/episode/${episode.slug}`;
          message += `EPISODE LINK: ${episodeLink}\n`;
          message += `EPISODE TITLE: ${episode.title}\n`;
        }
      } catch {
        // Ignore lookup errors.
      }
    }
    parts.push(message);
  }
  return parts.join('\n---\n');
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function cleanMessages(messages: Array<{ role: string; content: string }>): Array<{ role: 'user' | 'assistant'; content: string }> {
  const filtered = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const cleaned: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const msg of filtered) {
    if (cleaned.length === 0) {
      if (msg.role === 'user') cleaned.push(msg);
    } else {
      const lastRole = cleaned[cleaned.length - 1].role;
      if (msg.role !== lastRole) {
        cleaned.push(msg);
      } else {
        cleaned[cleaned.length - 1].content += '\n' + msg.content;
      }
    }
  }

  if (cleaned.length === 0) {
    cleaned.push({ role: 'user', content: 'Hello' });
  }
  return cleaned;
}

function streamToResponse(stream: AsyncIterable<OpenAI.ChatCompletionChunk>): Response {
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(encoder.encode(delta));
          }
        }
        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

function noContextResponse(scope: 'episode' | 'podcast'): Response {
  const message =
    scope === 'episode'
      ? "I could not find relevant transcript passages for that in this episode yet. Try rephrasing with specific keywords or ask about another moment."
      : "I could not find relevant transcript passages for that yet. Try rephrasing with specific keywords, or ask about a specific episode or topic.";

  return new Response(message, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const { messages, episodeId, podcastId } = await req.json();

  const client = getOpenRouterClient();
  const supabase = await getSupabaseClient();

  // Path A: Single-episode with full transcript via Gemini
  if (episodeId !== undefined) {
    const eid = parseInt(episodeId);
    const geminiResponse = await handleSingleEpisodeChat(client, supabase, eid, messages);
    if (geminiResponse) return geminiResponse;
    // Fall through to Path B (RAG) if Gemini path fails
  }

  // Path B: RAG with Claude Haiku (podcast-wide or fallback)
  const userMessages = messages.filter((m: { role: string }) => m.role === 'user');
  const latestUserMessage = userMessages[userMessages.length - 1]?.content || '';

  let contextText = '';
  let chunkCount = 0;
  try {
    const pid = podcastId !== undefined ? parseInt(podcastId) : undefined;
    const eid = episodeId !== undefined ? parseInt(episodeId) : undefined;
    const chunks = await VectorSearch({ supabase, input: latestUserMessage, podcastId: pid, episodeId: eid });
    if (chunks.length > 0) {
      chunkCount = chunks.length;
      contextText = await buildContext(chunks as unknown as Chunk[], supabase);
    }
  } catch (error) {
    console.error('Vector search failed:', error);
  }

  if (latestUserMessage && chunkCount === 0) {
    return noContextResponse(episodeId !== undefined ? 'episode' : 'podcast');
  }

  const basePrompt = episodeId !== undefined ? EPISODE_SYSTEM_PROMPT : PODCAST_SYSTEM_PROMPT;
  let systemPrompt = basePrompt;
  if (contextText) {
    systemPrompt += `\n\nHere is relevant context from the podcast to help you answer:\n\n${contextText}`;
  }

  const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...cleanMessages(messages),
  ];

  const stream = await client.chat.completions.create({
    model: 'anthropic/claude-3.5-haiku',
    max_tokens: 1024,
    messages: chatMessages,
    stream: true,
  });

  return streamToResponse(stream);
}
