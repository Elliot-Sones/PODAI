/** Auto-populate podcasts by category with YouTube transcript support. */

import { SupabaseClient } from '@supabase/supabase-js';

export interface PodcastEntry {
  name: string;
  rssUrl: string;
  youtubeChannelId?: string;
  category: string;
}

/** Curated list of top podcasts per category. */
export const PODCAST_CATALOG: PodcastEntry[] = [
  // Technology
  { name: 'Lex Fridman Podcast', rssUrl: 'https://lexfridman.com/feed/podcast/', category: 'technology' },
  { name: 'All-In Podcast', rssUrl: 'https://rss.libsyn.com/shows/254861/destinations/1928300.xml', category: 'technology' },
  { name: 'Hard Fork', rssUrl: 'https://feeds.simplecast.com/l2i9YnTd', category: 'technology' },
  { name: 'Acquired', rssUrl: 'https://feeds.pacific-content.com/acquired', category: 'technology' },
  { name: 'The Vergecast', rssUrl: 'https://feeds.megaphone.fm/vergecast', category: 'technology' },
  { name: 'Darknet Diaries', rssUrl: 'https://feeds.megaphone.fm/darknetdiaries', category: 'technology' },
  { name: 'This Week in Tech', rssUrl: 'https://feeds.twit.tv/twit.xml', category: 'technology' },
  { name: 'Waveform: The MKBHD Podcast', rssUrl: 'https://feeds.megaphone.fm/STU4418364045', category: 'technology' },
  { name: 'a16z Podcast', rssUrl: 'https://a16z.simplecast.com/episodes/feed', category: 'technology' },
  { name: 'The AI Podcast (NVIDIA)', rssUrl: 'https://feeds.soundcloud.com/users/soundcloud:users:264034133/sounds.rss', category: 'technology' },

  // Health
  { name: 'Huberman Lab', rssUrl: 'https://feeds.megaphone.fm/hubermanlab', category: 'health' },
  { name: 'The Peter Attia Drive', rssUrl: 'https://peterattiadrive.libsyn.com/rss', category: 'health' },
  { name: 'The Rich Roll Podcast', rssUrl: 'https://feeds.megaphone.fm/the-rich-roll-podcast', category: 'health' },
  { name: 'Feel Better, Live More', rssUrl: 'https://feeds.acast.com/public/shows/feelbetterlivemore', category: 'health' },
  { name: 'Found My Fitness', rssUrl: 'https://rss.libsyn.com/shows/51714/destinations/184296.xml', category: 'health' },
  { name: 'The Model Health Show', rssUrl: 'https://themodelhealthshow.libsyn.com/rss', category: 'health' },
  { name: 'On Purpose with Jay Shetty', rssUrl: 'https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/32f1779e-bc01-4d36-89e6-afcb01070c82/e0c8382f-48d4-42bb-89d5-afcb01075cb4/podcast.rss', category: 'health' },
  { name: 'Armchair Expert', rssUrl: 'https://rss.art19.com/armchair-expert', category: 'health' },
  { name: 'The Dr. Hyman Show', rssUrl: 'https://feeds.megaphone.fm/thedoctorsfarmacy', category: 'health' },
  { name: 'The Huberman Lab Guest Series', rssUrl: 'https://feeds.megaphone.fm/hubaboratory', category: 'health' },

  // Business
  { name: 'My First Million', rssUrl: 'https://feeds.megaphone.fm/HS2300184645', category: 'business' },
  { name: 'The Diary of a CEO', rssUrl: 'https://rss2.flightcast.com/xmsftuzjjykcmqwolaqn6mdn', category: 'business' },
  { name: 'How I Built This', rssUrl: 'https://feeds.simplecast.com/4T39_jAj', category: 'business' },
  { name: 'Masters of Scale', rssUrl: 'https://rss.art19.com/masters-of-scale', category: 'business' },
  { name: 'The Tim Ferriss Show', rssUrl: 'https://rss.art19.com/tim-ferriss-show', category: 'business' },
  { name: 'Invest Like the Best', rssUrl: 'https://investlikethebest.libsyn.com/rss', category: 'business' },
  { name: 'The Knowledge Project', rssUrl: 'https://theknowledgeproject.libsyn.com/rss', category: 'business' },
  { name: 'Founders Podcast', rssUrl: 'https://feeds.transistor.fm/founders-podcast', category: 'business' },
  { name: 'The Prof G Pod', rssUrl: 'https://feeds.megaphone.fm/WWO6655869236', category: 'business' },
  { name: 'Lenny\'s Podcast', rssUrl: 'https://api.substack.com/feed/podcast/10845.rss', category: 'business' },
];

/** Get podcasts for a specific category. */
export function getPodcastsByCategory(category: string): PodcastEntry[] {
  return PODCAST_CATALOG.filter((p) => p.category === category.toLowerCase());
}

/** Get all available categories. */
export function getAvailableCategories(): string[] {
  return [...new Set(PODCAST_CATALOG.map((p) => p.category))];
}
