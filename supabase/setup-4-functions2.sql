-- Part 4: More functions

CREATE OR REPLACE FUNCTION "public"."is_podcast_owner"("episodeid" bigint, "userid" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1
      FROM "Episodes" e
      JOIN "Podcasts" p ON p.id = e.podcast
      WHERE e.id = episodeid
      AND p.owner = userid
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION "public"."is_podcast_owner_with_podcast_id"("podcastId" bigint, "userid" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1
      FROM "Podcasts" p
      WHERE p.id = "podcastId" AND p.owner = userid
    )
  );
END;
$$;
