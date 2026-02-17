-- Migrate vector dimensions from 1536 (OpenAI) to 384 (all-MiniLM-L6-v2 local model)

-- Clear any existing embeddings (they're incompatible with the new dimension)
DELETE FROM "Chunks";
DELETE FROM "Documents";

-- Change Chunks embedding column from vector(1536) to vector(384)
ALTER TABLE "Chunks" ALTER COLUMN embedding TYPE vector(384);

-- Change Topics embedding column from vector(1536) to vector(384)
ALTER TABLE "Topics" ALTER COLUMN embedding TYPE vector(384);

-- Recreate chunk_vector_search with updated vector dimension
CREATE OR REPLACE FUNCTION chunk_vector_search(
  embedding vector(384),
  match_threshold double precision,
  match_count integer,
  min_content_length integer
)
RETURNS TABLE(id bigint, document bigint, meta jsonb, content text, similarity double precision)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.document, c.meta, c.content,
    (c.embedding <#> embedding) * -1 as similarity
  FROM "Chunks" c
  WHERE length(c.content) >= min_content_length
    AND (c.embedding <#> embedding) * -1 > match_threshold
  ORDER BY c.embedding <#> embedding
  LIMIT match_count;
END;
$$;

-- Recreate chunk_vector_search_episode
CREATE OR REPLACE FUNCTION chunk_vector_search_episode(
  embedding vector(384),
  match_threshold double precision,
  match_count integer,
  min_content_length integer,
  episode_id bigint
)
RETURNS TABLE(id bigint, document bigint, meta jsonb, content text, similarity double precision)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.document, c.meta, c.content,
    (c.embedding <#> embedding) * -1 as similarity
  FROM "Chunks" c
  JOIN "Documents" d ON d.id = c.document
  WHERE d.episode = episode_id
    AND length(c.content) >= min_content_length
    AND (c.embedding <#> embedding) * -1 > match_threshold
  ORDER BY c.embedding <#> embedding
  LIMIT match_count;
END;
$$;

-- Recreate chunk_vector_search_podcast
CREATE OR REPLACE FUNCTION chunk_vector_search_podcast(
  embedding vector(384),
  match_threshold double precision,
  match_count integer,
  min_content_length integer,
  podcast_id bigint
)
RETURNS TABLE(id bigint, document bigint, meta jsonb, content text, similarity double precision)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.document, c.meta, c.content,
    (c.embedding <#> embedding) * -1 as similarity
  FROM "Chunks" c
  JOIN "Documents" d ON d.id = c.document
  JOIN "Episodes" e ON e.id = d.episode
  WHERE e.podcast = podcast_id
    AND length(c.content) >= min_content_length
    AND (c.embedding <#> embedding) * -1 > match_threshold
  ORDER BY c.embedding <#> embedding
  LIMIT match_count;
END;
$$;

-- Recreate topic_vector_search with updated vector dimension
CREATE OR REPLACE FUNCTION topic_vector_search(
  query_embedding vector(384),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 20
)
RETURNS TABLE(
  id bigint,
  name text,
  slug text,
  description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id, t.name, t.slug, t.description,
    (1 - (t.embedding <=> query_embedding))::float as similarity
  FROM "Topics" t
  WHERE t.embedding IS NOT NULL
    AND 1 - (t.embedding <=> query_embedding) > similarity_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
