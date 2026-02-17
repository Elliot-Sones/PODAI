import { getSupabaseClient } from '@/lib/supabase';
import { GetTopicBySlug, SearchTopicChunks, TopicPodcastResult } from 'podverse-utils';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export async function generateMetadata({ params }: { params: { topicSlug: string } }): Promise<Metadata> {
  const supabase = await getSupabaseClient();
  const topic = await GetTopicBySlug(supabase, params.topicSlug);
  if (!topic) return { title: 'Topic Not Found' };
  return {
    title: `${topic.name} - Podcast Episodes | Podverse`,
    description: `Discover podcast episodes about ${topic.name}`,
  };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function SnippetCard({
  snippet,
  podcastSlug,
  episodeSlug,
}: {
  snippet: { content: string; startTime: number | null; similarity: number };
  podcastSlug: string;
  episodeSlug: string;
}) {
  const seekParam = snippet.startTime != null ? `?seek=${Math.floor(snippet.startTime)}` : '';
  const href = `/podcast/${podcastSlug}/episode/${episodeSlug}${seekParam}`;

  // Truncate to ~200 chars
  const text = snippet.content.length > 200
    ? snippet.content.slice(0, 200) + '...'
    : snippet.content;

  return (
    <Link href={href} className="block rounded-md border border-border/50 bg-muted/30 p-3 transition-colors hover:border-amber-500/30 hover:bg-muted/50">
      <p className="text-sm leading-relaxed text-foreground/80">
        &ldquo;{text}&rdquo;
      </p>
      <div className="mt-2 flex items-center gap-3 text-xs">
        {snippet.startTime != null && (
          <span className="inline-flex items-center gap-1 rounded bg-amber-600/20 px-1.5 py-0.5 font-medium text-amber-400">
            &#9654; {formatTime(snippet.startTime)}
          </span>
        )}
        <span className="text-muted-foreground">
          {Math.round(snippet.similarity * 100)}% match
        </span>
      </div>
    </Link>
  );
}

export default async function TopicResultsPage({ params }: { params: { topicSlug: string } }) {
  const supabase = await getSupabaseClient();
  const topic = await GetTopicBySlug(supabase, params.topicSlug);

  if (!topic) {
    return (
      <div className="mx-auto mt-16 max-w-4xl text-center">
        <h1 className="text-2xl font-bold">Topic not found</h1>
        <Link href="/topics" className="text-primary mt-4 block underline">
          Browse all topics
        </Link>
      </div>
    );
  }

  // Use the topic name to search for relevant chunks
  let results: TopicPodcastResult[] = [];
  try {
    results = await SearchTopicChunks(supabase, topic.name, 60);
  } catch (err) {
    console.error('Chunk search failed, falling back:', err);
  }

  const totalEpisodes = results.reduce((sum, p) => sum + p.episodes.length, 0);

  return (
    <div className="mx-auto mt-8 max-w-6xl px-4 pb-16">
      <div className="mb-8">
        <Link href="/topics" className="text-muted-foreground hover:text-primary text-sm">
          &larr; Back to topics
        </Link>
        <h1 className="mt-4 text-3xl font-bold">{topic.name}</h1>
        {topic.description && (
          <p className="text-muted-foreground mt-2">{topic.description}</p>
        )}
        <p className="text-muted-foreground mt-1 text-sm">
          {totalEpisodes} episode{totalEpisodes !== 1 ? 's' : ''} across{' '}
          {results.length} podcast{results.length !== 1 ? 's' : ''}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="space-y-8">
          {results.map((podcast) => (
            <div key={podcast.podcastId} className="rounded-lg border p-4">
              <Link
                href={`/podcast/${podcast.podcastSlug}`}
                className="mb-4 flex items-center gap-3 hover:opacity-80"
              >
                {podcast.podcastImage && (
                  <Image
                    src={podcast.podcastImage}
                    alt={podcast.podcastTitle}
                    width={48}
                    height={48}
                    className="rounded"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{podcast.podcastTitle}</h2>
                </div>
                <span className="rounded bg-amber-600/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                  {Math.round(podcast.maxSimilarity * 100)}% match
                </span>
              </Link>

              <div className="space-y-4">
                {podcast.episodes.map((episode) => (
                  <div key={episode.episodeId} className="ml-2">
                    <Link
                      href={`/podcast/${podcast.podcastSlug}/episode/${episode.episodeSlug}`}
                      className="mb-2 block text-sm font-medium hover:underline"
                    >
                      {episode.episodeTitle}
                    </Link>
                    <div className="space-y-2 pl-3">
                      {episode.snippets.map((snippet, i) => (
                        <SnippetCard
                          key={i}
                          snippet={snippet}
                          podcastSlug={podcast.podcastSlug}
                          episodeSlug={episode.episodeSlug}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">No relevant transcript snippets found yet. Episodes need to be processed first.</p>
        </div>
      )}
    </div>
  );
}
