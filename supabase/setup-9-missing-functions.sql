-- Part 9: Missing RPC functions

CREATE OR REPLACE FUNCTION "public"."all_podcasts"("limit" integer, "isPrivate" boolean, "isPublished" boolean)
RETURNS TABLE("id" bigint, "title" "text", "description" "text", "slug" "text", "private" boolean, "published" boolean, "imageUrl" "text", "newestEpisode" timestamp with time zone)
LANGUAGE "plpgsql"
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.description, p.slug, p.private, p.published, p."imageUrl", e."pubDate" as "newestEpisode"
  FROM "Podcasts" p
  JOIN (
    SELECT DISTINCT ON (podcast)
      "Episodes".id, "Episodes".podcast, "Episodes"."pubDate"
    FROM "Episodes"
    ORDER BY podcast, "pubDate" DESC
  ) e ON e.podcast = p.id
  WHERE p.private = "isPrivate"
  ORDER BY e."pubDate" DESC
  LIMIT all_podcasts."limit";
END;
$$;

CREATE OR REPLACE FUNCTION "public"."assign_podcast_owner"("id" integer, "owner" "text", "activation_code" "text")
RETURNS "void"
LANGUAGE "plpgsql"
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Podcasts" WHERE "Podcasts".id = assign_podcast_owner.id AND REPLACE("Podcasts".uuid::text, '-', '') = activation_code) THEN
        UPDATE "Podcasts"
        SET owner = assign_podcast_owner.owner
        WHERE "Podcasts".id = assign_podcast_owner.id;
    ELSE
        RAISE EXCEPTION 'Access denied: Invalid access code for podcast ID %', assign_podcast_owner.id;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."podcast_stats"()
RETURNS TABLE("id" bigint, "title" "text", "description" "text", "slug" "text", "imageUrl" "text", "owner" "text", "newest" timestamp with time zone, "newestprocessed" timestamp with time zone, "allepisodes" bigint, "processed" bigint, "inprogress" bigint, "errors" bigint, "process" boolean, "private" boolean, "uuid" "text")
LANGUAGE "plpgsql"
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.description, p.slug, p."imageUrl", p.owner,
    allepisodes.newest as newest,
    processed.newest as newestprocessed,
    coalesce(allepisodes.count, 0::bigint) as allepisodes,
    coalesce(processed.count, 0::bigint) as processed,
    coalesce(inprogress.count, 0::bigint) as inprogress,
    coalesce(errors.count, 0::bigint) as errors,
    p.process, p.private,
    p.uuid::text as uuid
  FROM "Podcasts" p
  JOIN (
    SELECT podcast, MAX("pubDate") as newest, COUNT(*) as count FROM "Episodes" GROUP BY podcast
  ) allepisodes ON p.id = allepisodes.podcast
  LEFT OUTER JOIN (
    SELECT podcast, MAX("pubDate") as newest, COUNT(*) as count FROM "Episodes"
    WHERE status IS NOT NULL AND status -> 'startedAt' IS NOT NULL AND status -> 'completedAt' IS NOT NULL AND status ->> 'message' NOT LIKE 'Error%'
    GROUP BY podcast
  ) processed ON p.id = processed.podcast
  LEFT OUTER JOIN (
    SELECT podcast, COUNT(*) as count FROM "Episodes"
    WHERE status IS NOT NULL AND status -> 'startedAt' IS NOT NULL AND status -> 'completedAt' IS NULL
    GROUP BY podcast
  ) inprogress ON p.id = inprogress.podcast
  LEFT OUTER JOIN (
    SELECT podcast, COUNT(*) as count FROM "Episodes"
    WHERE status IS NOT NULL AND status -> 'startedAt' IS NOT NULL AND status -> 'completedAt' IS NOT NULL AND status ->> 'message' LIKE 'Error%'
    GROUP BY podcast
  ) errors ON p.id = errors.podcast;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."podcast_search"("query" "text", "match_count" integer)
RETURNS TABLE("id" bigint, "title" "text", "description" "text", "slug" "text", "imageUrl" "text")
LANGUAGE "plpgsql"
AS $$
BEGIN
  RETURN QUERY
  SELECT
    "Podcasts".id, "Podcasts".title, "Podcasts".description, "Podcasts".slug, "Podcasts"."imageUrl"
  FROM "Podcasts"
  WHERE ("Podcasts".private = FALSE AND "Podcasts".published = TRUE)
    AND (("Podcasts".title ILIKE '%' || query || '%') OR ("Podcasts".description ILIKE '%' || query || '%'))
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."episode_search"("query" "text", "podcast_slug" "text", "match_count" integer)
RETURNS TABLE("id" bigint, "title" "text", "description" "text", "slug" "text", "podcast" bigint, "imageUrl" "text")
LANGUAGE "plpgsql"
AS $$
BEGIN
  RETURN QUERY
  SELECT q.id, q.title, q.description, q.slug, q.podcast, q."imageUrl" FROM (
    SELECT
      e.id as id, e.title as title, e.description as description,
      e.slug as slug, e.podcast as podcast, e."imageUrl" as "imageUrl"
    FROM "Episodes" e
    JOIN "Podcasts" p ON p.id = e.podcast
    WHERE (episode_state(e.status) = 'ready')
      AND ((e.title ILIKE '%' || query || '%') OR (e.description ILIKE '%' || query || '%'))
      AND (podcast_slug IS NULL OR p.slug = podcast_slug)
    ORDER BY e."pubDate" DESC
    LIMIT match_count
  ) q;
END;
$$;

-- Grant permissions on new functions
GRANT ALL ON FUNCTION "public"."all_podcasts"(integer, boolean, boolean) TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."assign_podcast_owner"(integer, text, text) TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."podcast_stats"() TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."podcast_search"(text, integer) TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."episode_search"(text, text, integer) TO "anon", "authenticated", "service_role";
