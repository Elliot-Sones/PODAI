-- Part 8: Topic search functions

CREATE OR REPLACE FUNCTION topic_vector_search(
  query_embedding vector(768),
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

CREATE OR REPLACE FUNCTION episodes_by_topic(
  topic_slug text,
  match_count int DEFAULT 50
)
RETURNS TABLE(
  episode_id bigint,
  episode_title text,
  episode_slug text,
  podcast_id bigint,
  podcast_title text,
  podcast_slug text,
  podcast_image text,
  confidence double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id as episode_id,
    e.title as episode_title,
    e.slug as episode_slug,
    p.id as podcast_id,
    p.title as podcast_title,
    p.slug as podcast_slug,
    p."imageUrl" as podcast_image,
    et.confidence
  FROM "EpisodeTopics" et
  JOIN "Episodes" e ON e.id = et.episode
  JOIN "Podcasts" p ON p.id = e.podcast
  JOIN "Topics" t ON t.id = et.topic
  WHERE t.slug = episodes_by_topic.topic_slug
  ORDER BY et.confidence DESC, e."pubDate" DESC
  LIMIT match_count;
END;
$$;
