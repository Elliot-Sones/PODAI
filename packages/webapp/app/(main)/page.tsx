import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORY_KEYWORDS, CATEGORY_META } from '@/lib/category-keywords';

const CATEGORY_COLORS: Record<string, string> = {
  technology: 'from-blue-600/20 to-blue-900/40 hover:from-blue-600/30 hover:to-blue-900/50 border-blue-500/30',
  health: 'from-green-600/20 to-green-900/40 hover:from-green-600/30 hover:to-green-900/50 border-green-500/30',
  business: 'from-amber-600/20 to-amber-900/40 hover:from-amber-600/30 hover:to-amber-900/50 border-amber-500/30',
};

async function getCategoriesWithCounts() {
  const supabase = await getSupabaseClient();

  const results = await Promise.all(
    Object.entries(CATEGORY_KEYWORDS).map(async ([slug, keywords]) => {
      const orFilter = keywords.map((k) => `title.ilike.%${k}%`).join(',');
      const { count } = await supabase
        .from('Episodes')
        .select('*', { count: 'exact', head: true })
        .or(orFilter);

      return {
        slug,
        name: CATEGORY_META[slug].name,
        description: CATEGORY_META[slug].description,
        episodeCount: count || 0,
      };
    }),
  );

  return results;
}

async function getRecentPodcasts() {
  const supabase = await getSupabaseClient();
  const { data } = await supabase
    .from('Podcasts')
    .select('id, title, slug, description, imageUrl')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(6);
  return data || [];
}

export default async function HomePage() {
  const categories = await getCategoriesWithCounts();
  const recentPodcasts = await getRecentPodcasts();

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="font-mono text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl">
          Discover podcasts with AI.
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
          Browse by category, search topics across podcasts, and find the exact moments that matter.
          Every episode comes with transcripts, summaries, and AI chat.
        </p>
      </div>

      {/* Category cards */}
      {categories.length > 0 && (
        <div className="mb-16">
          <h2 className="mb-6 font-mono text-2xl font-bold">Browse by Category</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`group relative flex flex-col overflow-hidden rounded-xl border bg-gradient-to-br p-6 transition-all ${
                  CATEGORY_COLORS[cat.slug] || 'from-gray-600/20 to-gray-900/40 border-gray-500/30'
                }`}
              >
                <h3 className="text-2xl font-bold">{cat.name}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{cat.description}</p>
                <p className="mt-4 text-sm font-medium">
                  {cat.episodeCount.toLocaleString()} episode{cat.episodeCount !== 1 ? 's' : ''}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Podcasts */}
      {recentPodcasts.length > 0 && (
        <div className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-mono text-2xl font-bold">Recent Podcasts</h2>
            <Link href="/explore" className="text-primary text-sm hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {recentPodcasts.map((podcast: { id: number; title: string; slug: string; imageUrl: string | null }) => (
              <Link
                key={podcast.id}
                href={`/podcast/${podcast.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-800">
                  {podcast.imageUrl ? (
                    <Image
                      src={podcast.imageUrl}
                      alt={podcast.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-2xl text-gray-600">
                      🎙
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-xs font-medium">{podcast.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Topics CTA */}
      <div className="mb-8 rounded-xl border bg-gradient-to-r from-amber-600/10 to-amber-900/20 p-8 text-center">
        <h2 className="font-mono text-2xl font-bold">Search by Topic</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-xl">
          Find specific moments across all podcasts. Our AI extracts topics from every episode,
          so you can search for exactly what interests you.
        </p>
        <Link
          href="/topics"
          className="mt-4 inline-block rounded-lg bg-amber-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-amber-500"
        >
          Explore Topics
        </Link>
      </div>

      {/* Request a podcast */}
      <div className="rounded-xl border p-8 text-center">
        <h2 className="font-mono text-2xl font-bold">Can&apos;t find your podcast?</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-xl">
          Search by name or paste a Spotify or Apple Podcasts link and we&apos;ll add it automatically.
        </p>
        <Link
          href="/request"
          className="mt-4 inline-block rounded-lg border border-amber-600 px-6 py-2.5 font-medium text-amber-500 transition-colors hover:bg-amber-600 hover:text-white"
        >
          Add a Podcast
        </Link>
      </div>
    </section>
  );
}
