/** Auto-categorize podcasts using Claude Haiku via OpenRouter. */

import OpenAI from 'openai';
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

/** Given a podcast title and description, return the best matching category slug. */
export async function CategorizePodcast(
  supabase: SupabaseClient,
  title: string,
  description: string | null,
): Promise<string | null> {
  // Get available categories
  const { data: categories } = await supabase
    .from('Categories')
    .select('slug, name, description');

  if (!categories || categories.length === 0) return null;

  const categoryList = categories
    .map((c: { slug: string; name: string; description: string | null }) =>
      `- ${c.slug}: ${c.name}${c.description ? ` (${c.description})` : ''}`)
    .join('\n');

  try {
    const client = getOpenRouterClient();
    const response = await client.chat.completions.create({
      model: 'anthropic/claude-3.5-haiku',
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: `You categorize podcasts. Given a podcast title and description, return the single best matching category slug from the list below. Return ONLY the slug string, nothing else. If none fit, return "none".

Categories:
${categoryList}`,
        },
        {
          role: 'user',
          content: `Title: ${title}\nDescription: ${description || 'No description'}`,
        },
      ],
    });

    const slug = response.choices[0]?.message?.content?.trim().toLowerCase() || 'none';
    if (slug === 'none') return null;

    // Verify it's a valid category
    const valid = categories.find((c: { slug: string }) => c.slug === slug);
    return valid ? slug : null;
  } catch (error) {
    console.error('Auto-categorization failed:', error);
    return null;
  }
}

/** Assign a podcast to a category by slug. */
export async function AssignPodcastCategory(
  supabase: SupabaseClient,
  podcastId: number,
  categorySlug: string,
): Promise<void> {
  const { data: category } = await supabase
    .from('Categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) return;

  await supabase
    .from('PodcastCategories')
    .upsert(
      { podcast: podcastId, category: category.id },
      { onConflict: 'podcast,category' },
    );
}
