-- Part 5: Views

CREATE OR REPLACE VIEW "public"."Episodes_with_state" WITH ("security_invoker"='on') AS
 SELECT "Episodes"."id",
    "Episodes"."created_at",
    "Episodes"."podcast",
    "Episodes"."slug",
    "Episodes"."title",
    "Episodes"."description",
    "Episodes"."url",
    "Episodes"."imageUrl",
    "Episodes"."audioUrl",
    "Episodes"."transcriptUrl",
    "Episodes"."summaryUrl",
    "Episodes"."pubDate",
    "Episodes"."guid",
    "Episodes"."error",
    "Episodes"."rawTranscriptUrl",
    "Episodes"."modified_at",
    "Episodes"."status",
    "Episodes"."originalAudioUrl",
    "Episodes"."published",
    "Episodes"."duration",
    "public"."episode_state"("Episodes"."status") AS "state"
   FROM "public"."Episodes";
