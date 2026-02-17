-- Migration: Vector embeddings 1536-dim (OpenAI ada-002) -> 768-dim (BAAI/bge-base-en-v1.5)
--
-- This migration changes the embedding dimension from 1536 to 768 for both
-- Chunks and Topics tables, and updates all vector search RPC functions.
--
-- IMPORTANT: Existing embeddings are INCOMPATIBLE with the new dimension.
-- After running this migration, all episodes must be re-processed to generate
-- new embeddings, and all topic embeddings must be regenerated.
--
-- Rollback: See 20260216000002_vector_768_rollback.sql

BEGIN;

-- ============================================================================
-- Step 1: Drop existing indexes that depend on the old vector dimension
-- ============================================================================

-- Drop the IVFFlat index on Topics.embedding (cannot ALTER with index present)
DROP INDEX IF EXISTS topics_embedding_idx;

-- ============================================================================
-- Step 2: Null out existing embeddings (incompatible dimensions)
-- ============================================================================

-- Set all existing embeddings to NULL rather than deleting rows.
-- This preserves chunk text/metadata and topic names so they can be
-- re-embedded without re-processing transcripts from scratch.
UPDATE "Chunks" SET embedding = NULL WHERE embedding IS NOT NULL;
UPDATE "Topics" SET embedding = NULL WHERE embedding IS NOT NULL;

-- ============================================================================
-- Step 3: Alter column types from vector(1536) to vector(768)
-- ============================================================================

ALTER TABLE "Chunks" ALTER COLUMN embedding TYPE vector(768);
ALTER TABLE "Topics" ALTER COLUMN embedding TYPE vector(768);

-- ============================================================================
-- Step 4: Recreate indexes for the new dimension
-- ============================================================================

-- HNSW index on Chunks for inner-product search (used by <#> operator)
-- HNSW is preferred over IVFFlat for better recall without needing to tune lists
CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON "Chunks"
  USING hnsw (embedding vector_ip_ops)
  WITH (m = 16, ef_construction = 64);

-- HNSW index on Topics for cosine search (used by <=> operator)
CREATE INDEX IF NOT EXISTS topics_embedding_idx ON "Topics"
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- Step 5: Recreate vector search RPC functions for 768-dim vectors
-- ============================================================================

-- chunk_vector_search: global search across all public/published podcasts
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
  WHERE c.embedding IS NOT NULL
    AND length(c.content) >= min_content_length
    AND (c.embedding <#> chunk_vector_search.embedding) * -1 > match_threshold
    AND (p.private = FALSE AND p.published = TRUE)
  ORDER BY c.embedding <#> chunk_vector_search.embedding
  LIMIT match_count;
END;
$$;

-- chunk_vector_search_episode: search within a specific episode
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
  WHERE c.embedding IS NOT NULL
    AND length(c.content) >= min_content_length
    AND (c.embedding <#> chunk_vector_search_episode.embedding) * -1 > match_threshold
  ORDER BY c.embedding <#> chunk_vector_search_episode.embedding
  LIMIT match_count;
END;
$$;

-- chunk_vector_search_podcast: search within a specific podcast
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
  WHERE c.embedding IS NOT NULL
    AND length(c.content) >= min_content_length
    AND (c.embedding <#> chunk_vector_search_podcast.embedding) * -1 > match_threshold
  ORDER BY c.embedding <#> chunk_vector_search_podcast.embedding
  LIMIT match_count;
END;
$$;

-- topic_vector_search: semantic search across topics
CREATE OR REPLACE FUNCTION "public"."topic_vector_search"(
  "query_embedding" vector(768),
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

-- ============================================================================
-- Step 6: Grant permissions on updated functions
-- ============================================================================

GRANT ALL ON FUNCTION "public"."chunk_vector_search"(vector, double precision, integer, integer) TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."chunk_vector_search_episode"(vector, double precision, integer, integer, bigint) TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."chunk_vector_search_podcast"(vector, double precision, integer, integer, bigint) TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."topic_vector_search"(vector, float, integer) TO "anon", "authenticated", "service_role";

COMMIT;
