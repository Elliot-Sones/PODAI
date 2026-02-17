-- Rich topic/chunk search: joins Chunks → Documents → Episodes → Podcasts
-- Returns transcript snippets with podcast context for topic search results

CREATE OR REPLACE FUNCTION topic_chunk_search(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 60,
  min_content_length int DEFAULT 100
)
RETURNS TABLE(
  chunk_id bigint,
  content text,
  meta jsonb,
  similarity float,
  episode_id bigint,
  episode_title text,
  episode_slug text,
  podcast_id bigint,
  podcast_title text,
  podcast_slug text,
  podcast_image text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id::bigint AS chunk_id,
    c.content,
    c.meta,
    (1 - (c.embedding <=> query_embedding))::float AS similarity,
    e.id::bigint AS episode_id,
    e.title AS episode_title,
    e.slug AS episode_slug,
    p.id::bigint AS podcast_id,
    p.title AS podcast_title,
    p.slug AS podcast_slug,
    p."imageUrl" AS podcast_image
  FROM "Chunks" c
  JOIN "Documents" d ON c.document = d.id
  JOIN "Episodes" e ON d.episode = e.id
  JOIN "Podcasts" p ON e.podcast = p.id
  WHERE
    LENGTH(c.content) >= min_content_length
    AND (1 - (c.embedding <=> query_embedding)) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
