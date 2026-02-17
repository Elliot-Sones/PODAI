'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { discoverPodcasts, requestPodcast } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SearchResult {
  name: string;
  artist: string;
  artworkUrl: string;
  feedUrl: string | null;
  genres: string[];
  trackCount: number;
  collectionId: number;
}

export default function RequestPodcastPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setHasSearched(true);
    try {
      const data = await discoverPodcasts(query);
      setResults(data);
    } catch (error) {
      toast.error('Search failed. Please try again.');
      console.error(error);
    }
    setSearching(false);
  };

  const handleImport = async (result: SearchResult) => {
    if (!result.feedUrl) {
      toast.error('This podcast does not have a public RSS feed available.');
      return;
    }

    setImporting(result.collectionId);
    try {
      const podcast = await requestPodcast(result.feedUrl);
      toast.success(`"${result.name}" has been added!`);
      router.push(`/podcast/${podcast.slug}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message.includes('duplicate') || message.includes('already exists')) {
        toast.info('This podcast has already been added.');
      } else {
        toast.error(`Failed to add podcast: ${message}`);
      }
    }
    setImporting(null);
  };

  return (
    <div className="mx-auto mt-8 max-w-3xl px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add a Podcast</h1>
        <p className="text-muted-foreground mt-2">
          Search by name or paste a link from Spotify or Apple Podcasts.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Podcast name, Spotify link, or Apple Podcasts link"
              className="bg-secondary w-full rounded-lg border py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <Button type="submit" disabled={searching || !query.trim()}>
            {searching ? <Icons.spinner className="size-4 animate-spin" /> : 'Search'}
          </Button>
        </div>
      </form>

      {/* Examples */}
      {!hasSearched && (
        <div className="mb-8 rounded-lg border p-4">
          <p className="mb-3 text-sm font-medium">Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {['Lex Fridman', 'Huberman Lab', 'My First Million', 'Joe Rogan'].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setQuery(example);
                }}
                className="rounded-full border px-3 py-1 text-sm transition-colors hover:bg-amber-500/10 hover:border-amber-500"
              >
                {example}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            You can also paste a Spotify or Apple Podcasts link directly.
          </p>
        </div>
      )}

      {/* Results */}
      {searching ? (
        <div className="flex justify-center py-12">
          <Icons.spinner className="text-primary size-8 animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.collectionId}
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-secondary/50"
            >
              {result.artworkUrl ? (
                <Image
                  src={result.artworkUrl}
                  alt={result.name}
                  width={64}
                  height={64}
                  className="shrink-0 rounded-lg"
                />
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-2xl">
                  🎙
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{result.name}</p>
                <p className="text-muted-foreground truncate text-sm">{result.artist}</p>
                <p className="text-muted-foreground text-xs">
                  {result.trackCount} episodes
                  {result.genres.length > 0 && ` · ${result.genres.slice(0, 2).join(', ')}`}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleImport(result)}
                disabled={importing === result.collectionId || !result.feedUrl}
              >
                {importing === result.collectionId ? (
                  <Icons.spinner className="size-4 animate-spin" />
                ) : !result.feedUrl ? (
                  'No feed'
                ) : (
                  'Add'
                )}
              </Button>
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No podcasts found. Try a different search.</p>
        </div>
      ) : null}
    </div>
  );
}
