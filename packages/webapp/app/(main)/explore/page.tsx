import { getSupabaseClient } from '@/lib/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORY_KEYWORDS } from '@/lib/category-keywords';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Explore Episodes' };
}

const CATEGORY_COLORS: Record<string, string> = {
  technology: 'from-blue-600/20 to-blue-900/40 hover:from-blue-600/30 hover:to-blue-900/50 border-blue-500/30',
  health: 'from-green-600/20 to-green-900/40 hover:from-green-600/30 hover:to-green-900/50 border-green-500/30',
  business: 'from-amber-600/20 to-amber-900/40 hover:from-amber-600/30 hover:to-amber-900/50 border-amber-500/30',
};

async function getCategoryEpisodeCounts() {
  const supabase = await getSupabaseClient();

  const results = await Promise.all(
    Object.entries(CATEGORY_KEYWORDS).map(async ([slug, keywords]) => {
      const orFilter = keywords.map((k) => `title.ilike.%${k}%`).join(',');
      const { count } = await supabase
        .from('Episodes')
        .select('*', { count: 'exact', head: true })
        .or(orFilter);

      return { slug, count: count || 0 };
    }),
  );

  return Object.fromEntries(results.map((r) => [r.slug, r.count]));
}

async function getRecentEpisodes() {
  const supabase = await getSupabaseClient();
  const { data } = await supabase
    .from('Episodes')
    .select('id, title, slug, pubDate, duration, status, podcast:Podcasts!inner(id, title, slug, imageUrl)')
    .order('pubDate', { ascending: false })
    .limit(12);
  return data || [];
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const CATEGORY_META: Record<string, { name: string; description: string }> = {
  technology: { name: 'Technology', description: 'AI, software, startups, and the digital world' },
  health: { name: 'Health', description: 'Wellness, fitness, nutrition, and mental health' },
  business: { name: 'Business', description: 'Finance, entrepreneurship, and leadership' },
};

export default async function ExplorePage() {
  const [counts, recentEpisodes] = await Promise.all([
    getCategoryEpisodeCounts(),
    getRecentEpisodes(),
  ]);

  return (
    <div className="mx-auto mt-8 max-w-6xl px-4 pb-16">
      <div className="mb-8">
        <h1 className="font-mono text-3xl font-bold">Explore Episodes</h1>
        <p className="text-muted-foreground mt-2">
          Browse episodes by category across all podcasts. A single podcast can span many topics.
        </p>
      </div>

      {/* Category cards */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {Object.entries(CATEGORY_META).map(([slug, meta]) => (
          <Link
            key={slug}
            href={`/category/${slug}`}
            className={`group relative flex flex-col overflow-hidden rounded-xl border bg-gradient-to-br p-6 transition-all ${
              CATEGORY_COLORS[slug] || 'from-gray-600/20 to-gray-900/40 border-gray-500/30'
            }`}
          >
            <h3 className="text-2xl font-bold">{meta.name}</h3>
            <p className="text-muted-foreground mt-2 text-sm">{meta.description}</p>
            <p className="mt-4 text-sm font-medium">
              {(counts[slug] || 0).toLocaleString()} episode{counts[slug] !== 1 ? 's' : ''}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Episodes */}
      {recentEpisodes.length > 0 && (
        <div>
          <h2 className="mb-6 font-mono text-2xl font-bold">Recent Episodes</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentEpisodes.map((ep: any) => {
              const podcast = ep.podcast;
              return (
                <Link
                  key={ep.id}
                  href={`/podcast/${podcast.slug}/episode/${ep.slug}`}
                  className="group flex gap-3 rounded-lg border p-3 transition-colors hover:border-amber-500/50"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded bg-gray-800">
                    {podcast.imageUrl ? (
                      <Image src={podcast.imageUrl} alt={podcast.title} fill className="object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-lg text-gray-600">🎙</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{ep.title}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {podcast.title}
                      {ep.pubDate && ` · ${new Date(ep.pubDate).toLocaleDateString()}`}
                      {ep.duration ? ` · ${formatDuration(ep.duration)}` : ''}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
