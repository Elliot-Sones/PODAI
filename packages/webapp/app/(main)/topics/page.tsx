'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getPopularTopics, searchTopics, searchTopicChunks } from '@/lib/actions';
import { TopicPodcastResult } from 'podverse-utils';

interface TopicDisplay {
  id: number;
  name: string;
  slug: string;
  episode_count: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TopicsPage() {
  const [query, setQuery] = useState('');
  const [topics, setTopics] = useState<TopicDisplay[]>([]);
  const [searchResults, setSearchResults] = useState<TopicDisplay[] | null>(null);
  const [chunkResults, setChunkResults] = useState<TopicPodcastResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    getPopularTopics().then((data) => {
      setTopics(data);
      setLoading(false);
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchResults(null);
      setChunkResults(null);
      return;
    }
    setSearching(true);
    try {
      const [topicResults, chunks] = await Promise.all([
        searchTopics(query),
        searchTopicChunks(query),
      ]);
      setSearchResults(topicResults);
      setChunkResults(chunks);
    } catch (error) {
      console.error('Search error:', error);
    }
    setSearching(false);
  };

  const displayTopics = searchResults ?? topics;

  return (
    <div className="mx-auto mt-8 max-w-6xl px-4 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Topics</h1>
        <p className="text-muted-foreground mt-2">
          Discover podcast episodes by topic across all podcasts.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <MagnifyingGlassIcon className="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics... e.g. artificial intelligence, nutrition, startups"
            className="bg-secondary w-full rounded-lg border py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </form>

      {searchResults && (
        <div className="mb-4">
          <button
            onClick={() => {
              setSearchResults(null);
              setChunkResults(null);
              setQuery('');
            }}
            className="text-primary text-sm hover:underline"
          >
            &larr; Clear search, show all topics
          </button>
        </div>
      )}

      {loading || searching ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-800" />
          ))}
        </div>
      ) : (
        <>
          {/* Related Topics */}
          {searchResults && displayTopics.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 font-mono text-lg font-semibold">Related Topics</h2>
            </div>
          )}

          {displayTopics.length > 0 ? (
            <div className="mb-10 flex flex-wrap gap-3">
              {displayTopics.map((topic) => {
                const size = Math.min(Math.max(topic.episode_count, 1), 20);
                const fontSize = 0.75 + size * 0.04;
                return (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.slug}`}
                    className="hover:border-primary hover:bg-primary/10 inline-flex items-center gap-2 rounded-full border px-4 py-2 transition-colors"
                    style={{ fontSize: `${fontSize}rem` }}
                  >
                    <span>{topic.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {topic.episode_count}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            !chunkResults && (
              <div className="mt-12 text-center">
                <p className="text-muted-foreground">
                  {searchResults ? 'No topics found for your search.' : 'No topics discovered yet. Topics are extracted automatically when episodes are processed.'}
                </p>
              </div>
            )
          )}

          {/* Relevant Moments (chunk search results) */}
          {chunkResults && chunkResults.length > 0 && (
            <div>
              <h2 className="mb-4 font-mono text-lg font-semibold">Relevant Moments</h2>
              <div className="space-y-6">
                {chunkResults.slice(0, 10).map((podcast) => (
                  <div key={podcast.podcastId} className="rounded-lg border p-4">
                    <Link
                      href={`/podcast/${podcast.podcastSlug}`}
                      className="mb-3 flex items-center gap-3 hover:opacity-80"
                    >
                      {podcast.podcastImage && (
                        <Image
                          src={podcast.podcastImage}
                          alt={podcast.podcastTitle}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                      )}
                      <h3 className="flex-1 font-semibold">{podcast.podcastTitle}</h3>
                      <span className="rounded bg-amber-600/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                        {Math.round(podcast.maxSimilarity * 100)}% match
                      </span>
                    </Link>
                    <div className="space-y-3">
                      {podcast.episodes.slice(0, 3).map((episode) => (
                        <div key={episode.episodeId} className="ml-2">
                          <Link
                            href={`/podcast/${podcast.podcastSlug}/episode/${episode.episodeSlug}`}
                            className="mb-1.5 block text-sm font-medium hover:underline"
                          >
                            {episode.episodeTitle}
                          </Link>
                          {episode.snippets.slice(0, 2).map((snippet, i) => {
                            const seekParam = snippet.startTime != null ? `?seek=${Math.floor(snippet.startTime)}` : '';
                            const href = `/podcast/${podcast.podcastSlug}/episode/${episode.episodeSlug}${seekParam}`;
                            const text = snippet.content.length > 150
                              ? snippet.content.slice(0, 150) + '...'
                              : snippet.content;
                            return (
                              <Link
                                key={i}
                                href={href}
                                className="mb-1.5 ml-3 block rounded border border-border/50 bg-muted/30 p-2.5 text-xs leading-relaxed text-foreground/80 transition-colors hover:border-amber-500/30"
                              >
                                &ldquo;{text}&rdquo;
                                {snippet.startTime != null && (
                                  <span className="ml-2 inline-flex items-center gap-0.5 rounded bg-amber-600/20 px-1 py-0.5 text-[10px] font-medium text-amber-400">
                                    &#9654; {formatTime(snippet.startTime)}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {chunkResults && chunkResults.length === 0 && searchResults && searchResults.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">No results found. Try a different search term.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
