/** Topic extraction and management for cross-podcast discovery. */

import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateEmbedding } from './embed.js';

export interface Topic {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  embedding: number[] | null;
  created_at: string;
}

export interface EpisodeTopic {
  id: number;
  episode: number;
  topic: number;
  confidence: number;
}

export interface TopicWithCount extends Topic {
  episode_count: number;
}

export interface EpisodeTopicResult {
  episode_id: number;
  episode_title: string;
  episode_slug: string;
  podcast_id: number;
  podcast_title: string;
  podcast_slug: string;
  podcast_image: string | null;
  confidence: number;
}

export interface ChunkSnippet {
  content: string;
  startTime: number | null;
  similarity: number;
}

export interface TopicEpisodeResult {
  episodeId: number;
  episodeTitle: string;
  episodeSlug: string;
  snippets: ChunkSnippet[];
  maxSimilarity: number;
}

export interface TopicPodcastResult {
  podcastId: number;
  podcastTitle: string;
  podcastSlug: string;
  podcastImage: string | null;
  episodes: TopicEpisodeResult[];
  maxSimilarity: number;
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

/** Extract 3-8 topics from a transcript or summary using Claude Haiku via OpenRouter. */
export async function ExtractTopics(text: string): Promise<string[]> {
  const client = getOpenRouterClient();

  // Truncate text to avoid token limits
  const truncated = text.slice(0, 12000);

  const response = await client.chat.completions.create({
    model: 'anthropic/claude-3.5-haiku',
    max_tokens: 1024,
    messages: [
      {
        role: 'system',
        content: `You are a topic extraction assistant. Given a podcast transcript or summary, extract 3-8 key topics discussed.
Each topic should be a concise phrase (1-4 words), like "Artificial Intelligence", "Mental Health", "Startup Funding", "Climate Change".
Topics should be general enough to appear across multiple podcast episodes but specific enough to be meaningful.
Return ONLY a JSON object with a "topics" key containing an array of topic strings. No explanations. Example: {"topics": ["AI", "Robotics"]}`,
      },
      { role: 'user', content: truncated },
    ],
  });

  const content = response.choices[0]?.message?.content || '{"topics":[]}';
  try {
    const parsed = JSON.parse(content);
    const topics = parsed.topics || parsed;
    if (Array.isArray(topics)) {
      return topics.filter((t: unknown) => typeof t === 'string').slice(0, 8);
    }
  } catch {
    console.error('Failed to parse topic extraction response:', content);
  }
  return [];
}

/** Create an embedding for a topic name using OpenAI. */
async function createTopicEmbedding(name: string): Promise<number[]> {
  return CreateEmbedding(name);
}

/** Convert a topic name to a URL-safe slug. */
function topicSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Find or create a topic, deduplicating via embedding similarity. */
async function findOrCreateTopic(supabase: SupabaseClient, name: string): Promise<number> {
  const slug = topicSlug(name);

  // First check if exact slug exists
  const { data: existing } = await supabase.from('Topics').select('id').eq('slug', slug).single();
  if (existing) return existing.id;

  // Create embedding and check for similar topics
  const embedding = await createTopicEmbedding(name);

  const { data: similar } = await supabase.rpc('topic_vector_search', {
    query_embedding: embedding,
    similarity_threshold: 0.85,
    match_count: 1,
  });

  if (similar && similar.length > 0) {
    return similar[0].id;
  }

  // Create new topic
  const { data: newTopic, error } = await supabase
    .from('Topics')
    .insert({
      name,
      slug,
      embedding,
    })
    .select('id')
    .single();

  if (error) {
    // May be a race condition - try to find again
    const { data: retry } = await supabase.from('Topics').select('id').eq('slug', slug).single();
    if (retry) return retry.id;
    throw error;
  }

  return newTopic.id;
}

/** Assign topics to an episode. Creates/matches topics via embedding similarity. */
export async function AssignTopics(
  supabase: SupabaseClient,
  episodeId: number,
  topicNames: string[],
): Promise<void> {
  for (const name of topicNames) {
    try {
      const topicId = await findOrCreateTopic(supabase, name);
      await supabase.from('EpisodeTopics').upsert(
        {
          episode: episodeId,
          topic: topicId,
          confidence: 1.0,
        },
        { onConflict: 'episode,topic' },
      );
    } catch (error) {
      console.error(`Error assigning topic "${name}" to episode ${episodeId}:`, error);
    }
  }
}

/** Get all episodes for a given topic slug, across all podcasts. */
export async function GetEpisodesByTopic(
  supabase: SupabaseClient,
  topicSlug: string,
): Promise<EpisodeTopicResult[]> {
  const { data, error } = await supabase.rpc('episodes_by_topic', {
    topic_slug: topicSlug,
    match_count: 50,
  });
  if (error) throw error;
  return data || [];
}

/** Semantic search for topics. Returns topics matching the query. */
export async function SearchTopics(
  supabase: SupabaseClient,
  query: string,
): Promise<TopicWithCount[]> {
  const embedding = await createTopicEmbedding(query);

  const { data, error } = await supabase.rpc('topic_vector_search', {
    query_embedding: embedding,
    similarity_threshold: 0.5,
    match_count: 20,
  });
  if (error) throw error;
  return data || [];
}

/** Get popular topics with episode counts. */
export async function GetPopularTopics(
  supabase: SupabaseClient,
  limit: number = 30,
): Promise<TopicWithCount[]> {
  const { data, error } = await supabase
    .from('Topics')
    .select(`
      *,
      EpisodeTopics(count)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || [])
    .map((topic: { id: number; name: string; slug: string; description: string | null; embedding: number[] | null; created_at: string; EpisodeTopics: Array<{ count: number }> }) => ({
      ...topic,
      episode_count: topic.EpisodeTopics?.[0]?.count || 0,
    }))
    .sort((a: TopicWithCount, b: TopicWithCount) => b.episode_count - a.episode_count);
}

/** Get a single topic by slug. */
export async function GetTopicBySlug(supabase: SupabaseClient, slug: string): Promise<Topic | null> {
  const { data, error } = await supabase.from('Topics').select('*').eq('slug', slug).single();
  if (error) return null;
  return data;
}

/** Search for transcript chunks matching a query, grouped by podcast then episode. */
export async function SearchTopicChunks(
  supabase: SupabaseClient,
  query: string,
  limit: number = 60,
): Promise<TopicPodcastResult[]> {
  const embedding = await CreateEmbedding(query);

  const { data, error } = await supabase.rpc('topic_chunk_search', {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: limit,
    min_content_length: 100,
  });

  if (error) {
    console.error('topic_chunk_search error:', error);
    return [];
  }
  if (!data || data.length === 0) return [];

  // Group by podcast → episode
  const podcastMap = new Map<number, TopicPodcastResult>();

  for (const row of data) {
    let podcast = podcastMap.get(row.podcast_id);
    if (!podcast) {
      podcast = {
        podcastId: row.podcast_id,
        podcastTitle: row.podcast_title,
        podcastSlug: row.podcast_slug,
        podcastImage: row.podcast_image,
        episodes: [],
        maxSimilarity: 0,
      };
      podcastMap.set(row.podcast_id, podcast);
    }

    let episode = podcast.episodes.find((e) => e.episodeId === row.episode_id);
    if (!episode) {
      episode = {
        episodeId: row.episode_id,
        episodeTitle: row.episode_title,
        episodeSlug: row.episode_slug,
        snippets: [],
        maxSimilarity: 0,
      };
      podcast.episodes.push(episode);
    }

    const rawStart = row.meta?.startTime ?? row.meta?.start ?? null;
    const startTime = rawStart != null && Number.isFinite(Number(rawStart)) ? Number(rawStart) : null;

    episode.snippets.push({
      content: row.content,
      startTime,
      similarity: row.similarity,
    });

    episode.maxSimilarity = Math.max(episode.maxSimilarity, row.similarity);
    podcast.maxSimilarity = Math.max(podcast.maxSimilarity, row.similarity);
  }

  // Sort podcasts by max similarity, episodes within by max similarity, snippets by similarity
  const results = Array.from(podcastMap.values());
  results.sort((a, b) => b.maxSimilarity - a.maxSimilarity);
  for (const podcast of results) {
    podcast.episodes.sort((a, b) => b.maxSimilarity - a.maxSimilarity);
    for (const episode of podcast.episodes) {
      episode.snippets.sort((a, b) => b.similarity - a.similarity);
      // Keep only top 3 snippets per episode
      episode.snippets = episode.snippets.slice(0, 3);
    }
  }

  return results;
}
