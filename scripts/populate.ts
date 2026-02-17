/**
 * Populate script — imports curated podcasts from the catalog into the database.
 * Run with: npx tsx scripts/populate.ts [--category technology|health|business] [--all]
 */

import { createClient } from '@supabase/supabase-js';
import { getPodcastsByCategory, getAvailableCategories } from '../packages/utils/src/populate.js';
import { Ingest } from '../packages/utils/src/podcast.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_API_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    'Missing Supabase credentials. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_API_KEY).',
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function populateCategory(category: string) {
  const podcasts = getPodcastsByCategory(category);
  console.log(`\n📂 Populating category: ${category} (${podcasts.length} podcasts)`);

  // Get category ID
  const { data: catRow } = await supabase
    .from('Categories')
    .select('id')
    .eq('slug', category)
    .single();

  if (!catRow) {
    console.error(`❌ Category "${category}" not found in database.`);
    return;
  }

  // Get existing podcasts to skip duplicates
  let existingPodcasts: any[] = [];
  try {
    // Get ALL podcasts (including private/unpublished) for dedup
    const { data } = await supabase.from('Podcasts').select('id, slug, rssUrl, title');
    existingPodcasts = data || [];
  } catch {}

  for (const entry of podcasts) {
    const existing = existingPodcasts.find(
      (p) => p.rssUrl === entry.rssUrl || p.title === entry.name
    );

    if (existing) {
      console.log(`  ⏭  Skipping (exists): ${entry.name}`);
      // Ensure category mapping exists
      await supabase.from('PodcastCategories').upsert(
        { podcast: existing.id, category: catRow.id },
        { onConflict: 'podcast,category' }
      );
      // Ensure it's public
      await supabase
        .from('Podcasts')
        .update({ private: false, published: true })
        .eq('id', existing.id);
      continue;
    }

    try {
      console.log(`  📥 Importing: ${entry.name}...`);
      const podcast = await Ingest({
        supabase,
        podcastUrl: entry.rssUrl,
      });
      console.log(`  ✅ Imported: ${podcast.slug} (${podcast.Episodes?.length || 0} episodes)`);

      // Set as public and published
      await supabase
        .from('Podcasts')
        .update({ private: false, published: true })
        .eq('id', podcast.id);

      // Create category mapping
      await supabase.from('PodcastCategories').upsert(
        { podcast: podcast.id, category: catRow.id },
        { onConflict: 'podcast,category' }
      );

      // Add to existing list for dedup
      existingPodcasts.push({ id: podcast.id, rssUrl: entry.rssUrl, title: entry.name });
    } catch (err: any) {
      console.error(`  ❌ Error importing ${entry.name}: ${err.message || err}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  let categories: string[] = [];

  if (args.includes('--all')) {
    categories = getAvailableCategories();
  } else {
    const catIdx = args.indexOf('--category');
    if (catIdx !== -1 && args[catIdx + 1]) {
      categories = [args[catIdx + 1]];
    }
  }

  if (categories.length === 0) {
    console.log('Usage: npx tsx scripts/populate.ts --all');
    console.log('       npx tsx scripts/populate.ts --category technology');
    console.log(`Available categories: ${getAvailableCategories().join(', ')}`);
    // Default to all
    console.log('\nNo category specified, populating all...\n');
    categories = getAvailableCategories();
  }

  console.log(`Populating categories: ${categories.join(', ')}`);

  for (const category of categories) {
    await populateCategory(category);
  }

  console.log('\n🎉 Population complete!');
}

main().catch(console.error);
