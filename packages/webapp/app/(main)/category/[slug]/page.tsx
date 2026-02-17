import { getSupabaseClient } from '@/lib/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CATEGORY_KEYWORDS, CATEGORY_META } from '@/lib/category-keywords';
import { isReady } from 'podverse-utils';
import { ProcessEpisodeButton } from '@/components/ProcessButton';

const PAGE_SIZE = 50;

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

async function getEpisodesByCategory(slug: string, page: number) {
  const keywords = CATEGORY_KEYWORDS[slug];
  if (!keywords) return null;

  const supabase = await getSupabaseClient();
  const orFilter = keywords.map((k) => `title.ilike.%${k}%`).join(',');
  const offset = page * PAGE_SIZE;

  const [{ count }, { data }] = await Promise.all([
    supabase
      .from('Episodes')
      .select('*', { count: 'exact', head: true })
      .or(orFilter),
    supabase
      .from('Episodes')
      .select('id, title, slug, pubDate, duration, status, podcast:Podcasts!inner(id, title, slug, imageUrl)')
      .or(orFilter)
      .order('pubDate', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1),
  ]);

  return { episodes: data || [], total: count || 0 };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const meta = CATEGORY_META[params.slug];
  if (!meta) return { title: 'Category Not Found' };
  return {
    title: `${meta.name} Episodes | Podverse`,
    description: meta.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const meta = CATEGORY_META[params.slug];
  if (!meta) notFound();

  const page = Math.max(0, parseInt(searchParams.page || '0', 10));
  const result = await getEpisodesByCategory(params.slug, page);
  if (!result) notFound();

  const { episodes, total } = result;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto mt-8 max-w-6xl px-4 pb-16">
      <div className="mb-8">
        <Link href="/explore" className="text-muted-foreground hover:text-primary text-sm">
          &larr; Back to explore
        </Link>
        <h1 className="mt-4 text-3xl font-bold">{meta.name}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{meta.description}</p>
        <p className="text-muted-foreground mt-1 text-sm">
          {total.toLocaleString()} episode{total !== 1 ? 's' : ''} across all podcasts
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {episodes.map((ep: any) => {
          const podcast = ep.podcast;
          const processed = isReady(ep);
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
                {!processed && (
                  <div className="mt-1">
                    <ProcessEpisodeButton episodeId={ep.id} currentStatus={ep.status || 'pending'} />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {episodes.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">No episodes found in this category.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          {page > 0 && (
            <Link
              href={`/category/${params.slug}?page=${page - 1}`}
              className="rounded border px-4 py-2 text-sm hover:border-amber-500/50"
            >
              Previous
            </Link>
          )}
          <span className="text-muted-foreground text-sm">
            Page {page + 1} of {totalPages}
          </span>
          {page < totalPages - 1 && (
            <Link
              href={`/category/${params.slug}?page=${page + 1}`}
              className="rounded border px-4 py-2 text-sm hover:border-amber-500/50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
