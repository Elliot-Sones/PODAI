import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { TextSplitter, TextSplit } from './splitters.js';

/** Given a URL pointing to a plain text file, embed it for vector search. Return the Document ID. */
export async function EmbedText(
  supabase: SupabaseClient,
  url: string,
  episodeId?: number,
  meta?: object,
): Promise<number> {
  console.log(`Embedding text from ${url}`);
  const res = await fetch(url);
  const text = await res.text();
  const checksum = createHash('sha256').update(text).digest('base64');
  const splitter = new TextSplitter({ splitLongSentences: true });
  const chunks = splitter.splitText(text);
  return await EmbedChunks(supabase, chunks, url, checksum, episodeId, meta);
}

/** Given a URL pointing to a transcript JSON file, embed it for vector search. Return the Document ID. */
export async function EmbedTranscript(
  supabase: SupabaseClient,
  url: string,
  episodeId?: number,
  meta?: object,
): Promise<number> {
  console.log(`Embedding transcript from ${url} for episode ${episodeId}`);
  const res = await fetch(url);
  const text = await res.text();
  const transcript = JSON.parse(text);
  const checksum = createHash('sha256').update(text).digest('base64');
  const splitter = new TextSplitter({ splitLongSentences: true });
  const chunks = splitter.splitTranscript(transcript);
  return await EmbedChunks(supabase, chunks, url, checksum, episodeId, meta);
}

function getEmbeddingClient() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY environment variable.');
  }
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });
}

/** Given the provided text, return an embedding vector using OpenRouter. */
export async function CreateEmbedding(input: string): Promise<number[]> {
  const client = getEmbeddingClient();
  const embeddingResponse = await client.embeddings.create({
    model: 'baai/bge-base-en-v1.5',
    input,
  });
  return embeddingResponse.data[0].embedding;
}

/** Batch-embed multiple inputs. Sends batches of 50 at a time. */
export async function CreateEmbeddingBatch(inputs: string[]): Promise<number[][]> {
  if (inputs.length === 0) return [];
  const client = getEmbeddingClient();
  const BATCH_SIZE = 50;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
    const batch = inputs.slice(i, i + BATCH_SIZE);
    const response = await client.embeddings.create({
      model: 'baai/bge-base-en-v1.5',
      input: batch,
    });
    // OpenRouter returns embeddings in the same order as input
    const sorted = response.data.sort((a, b) => a.index - b.index);
    allEmbeddings.push(...sorted.map((d) => d.embedding));
  }

  return allEmbeddings;
}

/** Given a set of chunks, store embeddings for them. */
async function EmbedChunks(
  supabase: SupabaseClient,
  chunks: TextSplit[],
  sourceUrl: string,
  checksum: string,
  episodeId?: number,
  meta?: object,
): Promise<number> {
  console.log(`Embedding ${chunks.length} chunks for episode ${episodeId} from ${sourceUrl} with checksum ${checksum}`);

  const embeddings = await CreateEmbeddingBatch(chunks.map((chunk) => chunk.text));

  // Create Document entry.
  const { data: document, error } = await supabase
    .from('Documents')
    .upsert(
      {
        checksum,
        episode: episodeId,
        source: sourceUrl,
        meta,
      },
      { onConflict: 'episode,source' },
    )
    .select()
    .limit(1)
    .single();
  if (error) {
    console.error('error inserting Embed page entry', error);
    throw error;
  }

  // For each chunk, we create a "page section" entry, with the page created above
  // as a parent. Each section contains the content of the chunk and its vector embedding.
  try {
    await Promise.all(
      chunks.map((chunk, i) => {
        const embedding = embeddings[i];
        return supabase
          .from('Chunks')
          .insert({
            document: document.id,
            content: chunk.text,
            embedding,
            meta: chunk.meta,
          })
          .select()
          .limit(1)
          .single();
      }),
    );
    console.log(`Embedded ${chunks.length} chunks for document ID ${document.id}`);
    return document.id;
  } catch (error) {
    console.error('error inserting Chunk entries', error);
    throw error;
  }
}

/** Represents a vector search result. */
export interface VectorSearchResult {
  chunkId: number;
  documentId: number;
  similarity: number;
  content: string;
  meta?: object;
}

/** Given the provided text, perform a vector search. */
export async function VectorSearch({
  supabase,
  input,
  podcastId,
  episodeId,
}: {
  supabase: SupabaseClient;
  input: string;
  podcastId?: number | undefined;
  episodeId?: number | undefined;
}): Promise<VectorSearchResult[]> {
  console.log(`VectorSearch [episodeId=${episodeId}, podcastId=${podcastId}] with input: ${input}`);
  const queryEmbedding = await CreateEmbedding(input.trim().replace(/\s+/g, ' '));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let functionCall: any = {
    embedding: queryEmbedding,
    match_threshold: 0.3,
    match_count: 10,
    min_content_length: 50,
  };
  let functionName = 'chunk_vector_search';

  if (episodeId !== undefined) {
    functionCall = { ...functionCall, episode_id: episodeId };
    functionName = 'chunk_vector_search_episode';
  } else if (podcastId !== undefined) {
    functionCall = { ...functionCall, podcast_id: podcastId };
    functionName = 'chunk_vector_search_podcast';
  }
  const { data, error } = await supabase.rpc(functionName, functionCall);
  if (error) {
    console.error(`Error with RPC ${functionName}: `, error);
    throw error;
  }
  console.log(`VectorSearch got RPC result: ${data.length} rows`);
  return data.map((row: { id: number; document: number; similarity: number; content: string; meta: object }) => {
    return {
      chunkId: row.id,
      documentId: row.document,
      similarity: row.similarity,
      content: row.content,
      meta: row.meta,
    };
  });
}
