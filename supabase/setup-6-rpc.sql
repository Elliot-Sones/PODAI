-- Part 6: Vector search RPCs

CREATE OR REPLACE FUNCTION "public"."chunk_vector_search"("embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "min_content_length" integer) RETURNS TABLE("id" bigint, "document" bigint, "meta" "jsonb", "content" "text", "similarity" double precision)
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

CREATE OR REPLACE FUNCTION "public"."chunk_vector_search_episode"("embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "min_content_length" integer, "episode_id" bigint) RETURNS TABLE("id" bigint, "document" bigint, "meta" "jsonb", "content" "text", "similarity" double precision)
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

CREATE OR REPLACE FUNCTION "public"."chunk_vector_search_podcast"("embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "min_content_length" integer, "podcast_id" bigint) RETURNS TABLE("id" bigint, "document" bigint, "meta" "jsonb", "content" "text", "similarity" double precision)
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

CREATE OR REPLACE FUNCTION "public"."latest_episodes"("limit" integer) RETURNS TABLE("id" bigint, "title" "text", "description" "text", "slug" "text", "imageUrl" "text", "pubDate" timestamp with time zone, "podcastSlug" "text", "podcastTitle" "text", "podcastImageUrl" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    SELECT DISTINCT ON ("Episodes".podcast)
      "Episodes".id,
      "Episodes".title,
      "Episodes".description,
      "Episodes".slug,
      "Episodes"."imageUrl",
      "Episodes"."pubDate",
      "Podcasts"."slug" AS "podcastSlug",
      "Podcasts"."title" AS "podcastTitle",
      "Podcasts"."imageUrl" AS "podcastImageUrl"
    FROM "Episodes"
    INNER JOIN "Podcasts" ON "Podcasts".id = "Episodes".podcast
    WHERE "Episodes"."status" IS NOT NULL
      AND ("Podcasts".private = false)
      AND ("Podcasts".published = true)
      AND ("Episodes"."status" ->> 'startedAt') <> 'null'
      AND ("Episodes"."status" ->> 'completedAt') <> 'null'
      AND "Episodes"."status" ->> 'message' NOT LIKE 'Error%'
    ORDER BY "Episodes".podcast, "Episodes"."pubDate" DESC
  ) AS e
  ORDER BY "pubDate" DESC
  LIMIT latest_episodes."limit";
END;
$$;
