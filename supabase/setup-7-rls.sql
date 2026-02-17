-- Part 7: Row Level Security

ALTER TABLE "public"."Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Podcasts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Episodes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Chunks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."SpeakerMap" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Suggestions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."PodcastCategories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Topics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."EpisodeTopics" ENABLE ROW LEVEL SECURITY;

-- Read access for all
CREATE POLICY "Allow read access for all users" ON "public"."Podcasts" FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON "public"."Episodes" FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON "public"."Documents" FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON "public"."Chunks" FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON "public"."SpeakerMap" FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON "public"."Suggestions" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "public"."Users" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "public"."Invitations" FOR SELECT USING (true);
CREATE POLICY "Categories are viewable by everyone" ON "Categories" FOR SELECT USING (true);
CREATE POLICY "PodcastCategories are viewable by everyone" ON "PodcastCategories" FOR SELECT USING (true);
CREATE POLICY "Topics are viewable by everyone" ON "Topics" FOR SELECT USING (true);
CREATE POLICY "EpisodeTopics are viewable by everyone" ON "EpisodeTopics" FOR SELECT USING (true);

-- Insert policies
CREATE POLICY "Allow insert by any authed user" ON "public"."Podcasts" FOR INSERT WITH CHECK (("public"."requesting_user_id"() <> ''));
CREATE POLICY "Allow insert on Users" ON "public"."Users" FOR INSERT WITH CHECK (("public"."requesting_user_id"() <> ''));
CREATE POLICY "Allow insert by any authed user" ON "public"."Subscriptions" FOR INSERT WITH CHECK (("public"."requesting_user_id"() <> ''));
CREATE POLICY "Enable insert for authenticated users only" ON "public"."Invitations" FOR INSERT TO "authenticated" WITH CHECK (true);
CREATE POLICY "Allow insert by Podcast owner" ON "public"."Episodes" FOR INSERT WITH CHECK ("public"."is_podcast_owner_with_podcast_id"("podcast", "public"."requesting_user_id"()));
CREATE POLICY "Allow insert by Podcast owner" ON "public"."Documents" FOR INSERT WITH CHECK ("public"."is_podcast_owner"("episode", "public"."requesting_user_id"()));
CREATE POLICY "Allow insert by Podcast owner" ON "public"."Chunks" FOR INSERT WITH CHECK ("public"."is_podcast_owner"(( SELECT "d"."episode" FROM "public"."Documents" "d" WHERE ("d"."id" = "Chunks"."document")), "public"."requesting_user_id"()));
CREATE POLICY "Allow insert by Podcast owner" ON "public"."SpeakerMap" FOR INSERT WITH CHECK ("public"."is_podcast_owner"("episode", "public"."requesting_user_id"()));
CREATE POLICY "Allow insert by Podcast owner" ON "public"."Suggestions" FOR INSERT WITH CHECK ("public"."is_podcast_owner"("episode", "public"."requesting_user_id"()));

-- Update policies
CREATE POLICY "Allow update by Podcast owner" ON "public"."Podcasts" FOR UPDATE USING (("public"."requesting_user_id"() = "owner"));
CREATE POLICY "Allow update by Podcast owner" ON "public"."Episodes" FOR UPDATE USING ("public"."is_podcast_owner_with_podcast_id"("podcast", "public"."requesting_user_id"()));
CREATE POLICY "Allow update by Podcast owner" ON "public"."Documents" FOR UPDATE USING ("public"."is_podcast_owner"("episode", "public"."requesting_user_id"()));
CREATE POLICY "Allow update by Podcast owner" ON "public"."SpeakerMap" FOR UPDATE USING ("public"."is_podcast_owner"("episode", "public"."requesting_user_id"()));
CREATE POLICY "Allow update by Podcast owner" ON "public"."Suggestions" FOR UPDATE USING ("public"."is_podcast_owner"("episode", "public"."requesting_user_id"()));
CREATE POLICY "Allow user update" ON "public"."Users" FOR UPDATE USING (("id" = "public"."requesting_user_id"()));

-- Delete policies
CREATE POLICY "Allow delete by Podcast owner" ON "public"."Podcasts" FOR DELETE USING (("public"."requesting_user_id"() = "owner"));
CREATE POLICY "Allow delete by Podcast owner" ON "public"."Episodes" FOR DELETE USING ("public"."is_podcast_owner_with_podcast_id"("podcast", "public"."requesting_user_id"()));
CREATE POLICY "Allow delete by Podcast owner" ON "public"."Documents" FOR DELETE USING ("public"."is_podcast_owner"("episode", "public"."requesting_user_id"()));
CREATE POLICY "Allow delete by Podcast owner" ON "public"."Chunks" FOR DELETE USING ("public"."is_podcast_owner"(( SELECT "d"."episode" FROM "public"."Documents" "d" WHERE ("d"."id" = "Chunks"."document")), "public"."requesting_user_id"()));
CREATE POLICY "Allow delete by Podcast owner" ON "public"."SpeakerMap" FOR DELETE USING ("public"."is_podcast_owner"("episode", "public"."requesting_user_id"()));
CREATE POLICY "Allow delete by Podcast owner" ON "public"."Suggestions" FOR DELETE USING ("public"."is_podcast_owner"("episode", "public"."requesting_user_id"()));
CREATE POLICY "Allow access by owner" ON "public"."Subscriptions" USING (("public"."requesting_user_id"() = "user"));

-- Full access for service role on custom tables
CREATE POLICY "Service role can manage categories" ON "Categories" FOR ALL USING (true);
CREATE POLICY "Service role can manage podcast categories" ON "PodcastCategories" FOR ALL USING (true);
CREATE POLICY "Service role can manage topics" ON "Topics" FOR ALL USING (true);
CREATE POLICY "Service role can manage episode topics" ON "EpisodeTopics" FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "anon", "authenticated", "service_role";
GRANT ALL ON ALL SEQUENCES IN SCHEMA "public" TO "anon", "authenticated", "service_role";
GRANT ALL ON ALL FUNCTIONS IN SCHEMA "public" TO "anon", "authenticated", "service_role";
