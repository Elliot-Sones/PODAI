-- Harden topic_chunk_search and align similarity operator with Chunks index.
-- - Restrict results to public + published podcasts
-- - Skip NULL embeddings
-- - Use inner-product operator (<#>) to align with chunks_embedding_idx (vector_ip_ops)

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
    ((c.embedding <#> topic_chunk_search.query_embedding) * -1)::float AS similarity,
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
    c.embedding IS NOT NULL
    AND LENGTH(c.content) >= min_content_length
    AND ((c.embedding <#> topic_chunk_search.query_embedding) * -1) > match_threshold
    AND (p.private = FALSE AND p.published = TRUE)
  ORDER BY c.embedding <#> topic_chunk_search.query_embedding
  LIMIT topic_chunk_search.match_count;
END;
$$;

GRANT ALL ON FUNCTION topic_chunk_search(vector, float, int, int) TO anon, authenticated, service_role;
