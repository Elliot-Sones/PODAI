-- Rollback: Vector embeddings 768-dim -> 1536-dim (OpenAI ada-002)
--
-- Run this ONLY if you need to revert to the original 1536-dim embeddings.
-- After rolling back, you must re-process all episodes to regenerate embeddings
-- using the OpenAI text-embedding-ada-002 model.
--
-- WARNING: This will null out all 768-dim embeddings since they are incompatible.

BEGIN;

-- Drop 768-dim indexes
DROP INDEX IF EXISTS chunks_embedding_idx;
DROP INDEX IF EXISTS topics_embedding_idx;

-- Null out incompatible embeddings
UPDATE "Chunks" SET embedding = NULL WHERE embedding IS NOT NULL;
UPDATE "Topics" SET embedding = NULL WHERE embedding IS NOT NULL;

-- Revert column types to vector(1536)
ALTER TABLE "Chunks" ALTER COLUMN embedding TYPE vector(1536);
ALTER TABLE "Topics" ALTER COLUMN embedding TYPE vector(1536);

-- Recreate IVFFlat index on Topics (original)
CREATE INDEX IF NOT EXISTS topics_embedding_idx ON "Topics"
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Restore original chunk_vector_search (1536-dim)
CREATE OR REPLACE FUNCTION "public"."chunk_vector_search"(
  "embedding" "public"."vector",
  "match_threshold" double precision,
  "match_count" integer,
  "min_content_length" integer
)
RETURNS TABLE(
  "id" bigint,
  "document" bigint,
  "meta" "jsonb",
  "content" "text",
  "similarity" double precision
)
LANGUAGE "plpgsql"
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.document, c.meta, c.content,
    (c.embedding <#> chunk_vector_search.embedding) * -1 as similarity
  FROM "Chunks" c
  JOIN "Documents" d ON d.id = c.document
  JOIN "Episodes" e ON e.id = d.episode
  JOIN "Podcasts" p ON p.id = e.podcast
  WHERE length(c.content) >= min_content_length
    AND (c.embedding <#> chunk_vector_search.embedding) * -1 > match_threshold
    AND (p.private = FALSE AND p.published = TRUE)
  ORDER BY c.embedding <#> chunk_vector_search.embedding
  LIMIT match_count;
END;
$$;

-- Restore original chunk_vector_search_episode (1536-dim)
CREATE OR REPLACE FUNCTION "public"."chunk_vector_search_episode"(
  "embedding" "public"."vector",
  "match_threshold" double precision,
  "match_count" integer,
  "min_content_length" integer,
  "episode_id" bigint
)
RETURNS TABLE(
  "id" bigint,
  "document" bigint,
  "meta" "jsonb",
  "content" "text",
  "similarity" double precision
)
LANGUAGE "plpgsql"
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.document, c.meta, c.content,
    (c.embedding <#> chunk_vector_search_episode.embedding) * -1 as similarity
  FROM "Chunks" c
  JOIN "Documents" d ON d.id = c.document
  JOIN "Episodes" e ON e.id = d.episode AND e.id = episode_id
  WHERE length(c.content) >= min_content_length
    AND (c.embedding <#> chunk_vector_search_episode.embedding) * -1 > match_threshold
  ORDER BY c.embedding <#> chunk_vector_search_episode.embedding
  LIMIT match_count;
END;
$$;

-- Restore original chunk_vector_search_podcast (1536-dim)
CREATE OR REPLACE FUNCTION "public"."chunk_vector_search_podcast"(
  "embedding" "public"."vector",
  "match_threshold" double precision,
  "match_count" integer,
  "min_content_length" integer,
  "podcast_id" bigint
)
RETURNS TABLE(
  "id" bigint,
  "document" bigint,
  "meta" "jsonb",
  "content" "text",
  "similarity" double precision
)
LANGUAGE "plpgsql"
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.document, c.meta, c.content,
    (c.embedding <#> chunk_vector_search_podcast.embedding) * -1 as similarity
  FROM "Chunks" c
  JOIN "Documents" d ON d.id = c.document
  JOIN "Episodes" e ON e.id = d.episode
  JOIN "Podcasts" p ON p.id = e.podcast AND p.id = podcast_id
  WHERE length(c.content) >= min_content_length
    AND (c.embedding <#> chunk_vector_search_podcast.embedding) * -1 > match_threshold
  ORDER BY c.embedding <#> chunk_vector_search_podcast.embedding
  LIMIT match_count;
END;
$$;

-- Restore original topic_vector_search (1536-dim)
CREATE OR REPLACE FUNCTION "public"."topic_vector_search"(
  "query_embedding" vector(1536),
  "similarity_threshold" float DEFAULT 0.7,
  "match_count" int DEFAULT 20
)
RETURNS TABLE(
  "id" bigint,
  "name" text,
  "slug" text,
  "description" text,
  "similarity" float
)
LANGUAGE "plpgsql"
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id, t.name, t.slug, t.description,
    (1 - (t.embedding <=> topic_vector_search.query_embedding))::float as similarity
  FROM "Topics" t
  WHERE t.embedding IS NOT NULL
    AND 1 - (t.embedding <=> topic_vector_search.query_embedding) > similarity_threshold
  ORDER BY t.embedding <=> topic_vector_search.query_embedding
  LIMIT topic_vector_search.match_count;
END;
$$;

-- Re-grant permissions
GRANT ALL ON FUNCTION "public"."chunk_vector_search"(vector, double precision, integer, integer) TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."chunk_vector_search_episode"(vector, double precision, integer, integer, bigint) TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."chunk_vector_search_podcast"(vector, double precision, integer, integer, bigint) TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."topic_vector_search"(vector, float, integer) TO "anon", "authenticated", "service_role";

COMMIT;
