/** Podcast search via iTunes Search API.
 * Works with podcast names, Spotify links, and Apple Podcasts links.
 * The iTunes API is free and requires no API key.
 */

export interface PodcastSearchResult {
  name: string;
  artist: string;
  artworkUrl: string;
  feedUrl: string | null;
  genres: string[];
  trackCount: number;
  collectionId: number;
}

/** Search for podcasts by name using the iTunes Search API. */
export async function searchPodcasts(query: string, limit: number = 10): Promise<PodcastSearchResult[]> {
  // Check if the input is a Spotify or Apple link and extract a usable query
  const extracted = await extractPodcastQuery(query);

  const url = `https://itunes.apple.com/search?${new URLSearchParams({
    term: extracted,
    media: 'podcast',
    limit: limit.toString(),
  })}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`iTunes search failed: ${res.status}`);
  }

  const data = await res.json();

  return (data.results || []).map((r: {
    collectionName: string;
    artistName: string;
    artworkUrl600?: string;
    artworkUrl100?: string;
    feedUrl?: string;
    genres?: string[];
    trackCount?: number;
    collectionId: number;
  }) => ({
    name: r.collectionName,
    artist: r.artistName,
    artworkUrl: r.artworkUrl600 || r.artworkUrl100 || '',
    feedUrl: r.feedUrl || null,
    genres: r.genres || [],
    trackCount: r.trackCount || 0,
    collectionId: r.collectionId,
  }));
}

/** Look up a specific podcast by its Apple Podcasts collection ID. */
export async function lookupPodcast(collectionId: number): Promise<PodcastSearchResult | null> {
  const url = `https://itunes.apple.com/lookup?id=${collectionId}&entity=podcast`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;

  const r = data.results[0];
  return {
    name: r.collectionName,
    artist: r.artistName,
    artworkUrl: r.artworkUrl600 || r.artworkUrl100 || '',
    feedUrl: r.feedUrl || null,
    genres: r.genres || [],
    trackCount: r.trackCount || 0,
    collectionId: r.collectionId,
  };
}

/** Extract a usable search query from various input formats.
 * Handles:
 * - Plain text podcast names
 * - Spotify links: https://open.spotify.com/show/xyz
 * - Apple Podcasts links: https://podcasts.apple.com/us/podcast/name/id123
 * - YouTube links
 */
async function extractPodcastQuery(input: string): Promise<string> {
  const trimmed = input.trim();

  // Spotify link - fetch the page to get the podcast name from the <title> tag
  if (trimmed.includes('open.spotify.com/show')) {
    try {
      const res = await fetch(trimmed, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        redirect: 'follow',
      });
      if (res.ok) {
        const html = await res.text();
        // Spotify page titles are like "Podcast Name | Podcast on Spotify"
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          const name = titleMatch[1]
            .replace(/\s*\|.*$/, '')    // Remove "| Podcast on Spotify"
            .replace(/\s*-\s*Spotify.*$/, '')
            .trim();
          if (name && name.length > 2) {
            return name;
          }
        }
      }
    } catch {
      // Fall through to return input as-is
    }
    return trimmed;
  }

  // Apple Podcasts link - extract the podcast name from the URL
  const appleMatch = trimmed.match(/podcasts\.apple\.com\/[^/]+\/podcast\/([^/]+)/);
  if (appleMatch) {
    // The name is URL-encoded in the path
    return decodeURIComponent(appleMatch[1]).replace(/-/g, ' ');
  }

  // YouTube channel/playlist - extract channel name
  const ytMatch = trimmed.match(/youtube\.com\/@([^/?]+)/);
  if (ytMatch) {
    return decodeURIComponent(ytMatch[1]).replace(/-/g, ' ');
  }

  // Plain text - return as-is
  return trimmed;
}

/** Try to extract an Apple Podcasts collection ID from a URL. */
export function extractAppleId(input: string): number | null {
  const match = input.match(/\/id(\d+)/);
  if (match) return parseInt(match[1]);
  return null;
}
