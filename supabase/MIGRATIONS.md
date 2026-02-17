# Supabase Migrations Guide

## Vector Embedding Migration: 1536-dim to 768-dim

### Overview

This migration changes the vector embedding dimension from 1536 (OpenAI `text-embedding-ada-002`) to 768 (BAAI `bge-base-en-v1.5` via OpenRouter). This reduces storage costs and improves search performance while maintaining high-quality semantic search.

**Migration file:** `supabase/migrations/20260216000001_vector_768.sql`
**Rollback file:** `supabase/migrations/20260216000002_vector_768_rollback.sql`

### What Changes

| Component | Before | After |
|-----------|--------|-------|
| Chunks.embedding | vector(1536) | vector(768) |
| Topics.embedding | vector(1536) | vector(768) |
| Chunk index type | None (sequential scan) | HNSW (vector_ip_ops) |
| Topic index type | IVFFlat (vector_cosine_ops) | HNSW (vector_cosine_ops) |
| Embedding model | OpenAI text-embedding-ada-002 | BAAI/bge-base-en-v1.5 |
| API provider | OpenAI direct | OpenRouter |

### Prerequisites

1. **Backup your database** before running the migration
2. Ensure the `OPENROUTER_API_KEY` environment variable is set (for re-embedding after migration)
3. Plan for downtime: vector search will return no results until episodes are re-processed
4. Ensure the application code has been updated to use the new embedding model (see `packages/utils/src/embed.ts`)

### Running the Migration

#### Option A: Using Supabase CLI

```bash
# From the project root
supabase db push
```

This will apply all pending migrations in order, including `20260216000001_vector_768.sql`.

#### Option B: Running Manually via SQL Editor

1. Open the Supabase Dashboard for your project
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20260216000001_vector_768.sql`
4. Execute the query

#### Option C: Using psql

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260216000001_vector_768.sql
```

### What the Migration Does (Step by Step)

1. **Drops existing indexes** on embedding columns (required before ALTER TYPE)
2. **Nulls out existing embeddings** -- old 1536-dim vectors are incompatible with the new 768-dim column; chunk text and topic names are preserved
3. **Alters column types** from `vector(1536)` to `vector(768)` on both `Chunks` and `Topics` tables
4. **Creates HNSW indexes** for both tables (better recall than IVFFlat, no training step required)
5. **Recreates all vector search RPC functions** to accept 768-dim vectors:
   - `chunk_vector_search` -- global search across public podcasts
   - `chunk_vector_search_episode` -- search within a specific episode
   - `chunk_vector_search_podcast` -- search within a specific podcast
   - `topic_vector_search` -- semantic search across topics
6. **Grants permissions** on all updated functions

### After the Migration: Re-processing Episodes

After the migration completes, all existing embeddings will be NULL. You must re-process episodes to regenerate embeddings with the new model.

#### Re-process All Episodes

Use the Inngest dashboard or trigger re-processing programmatically:

1. **Via Inngest Dashboard:** Navigate to your Inngest dashboard and manually trigger the `process-episode` function for each episode that needs re-embedding.

2. **Via the CLI:** If you have the CLI set up:
   ```bash
   # Re-process a specific podcast's episodes
   yarn cli process --podcast <podcast-slug>
   ```

3. **Via Supabase SQL:** Reset episode status to trigger re-processing:
   ```sql
   -- Reset all completed episodes so they get re-processed
   UPDATE "Episodes"
   SET status = jsonb_build_object(
     'startedAt', null,
     'completedAt', null,
     'message', 'Pending re-processing for 768-dim embeddings'
   )
   WHERE status IS NOT NULL
     AND status ->> 'completedAt' IS NOT NULL;
   ```

#### Re-embed Topics

Topic embeddings also need regeneration. This happens automatically when episodes are processed (topic extraction creates embeddings), but you can also trigger it manually through the application's topic extraction pipeline.

### Verifying the Migration

After running the migration and re-processing, verify everything works:

```sql
-- Check column dimensions
SELECT column_name, udt_name
FROM information_schema.columns
WHERE table_name IN ('Chunks', 'Topics')
  AND column_name = 'embedding';

-- Check that new embeddings exist
SELECT COUNT(*) as total,
       COUNT(embedding) as with_embedding
FROM "Chunks";

SELECT COUNT(*) as total,
       COUNT(embedding) as with_embedding
FROM "Topics";

-- Test vector search (replace with a real 768-dim vector)
-- SELECT * FROM chunk_vector_search(
--   '[0.1, 0.2, ...]'::vector,
--   0.3, 10, 50
-- );

-- Check indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('Chunks', 'Topics')
  AND indexname LIKE '%embedding%';
```

### Rollback Procedure

If you need to revert to 1536-dim embeddings:

1. **Run the rollback migration:**
   ```bash
   psql "$DATABASE_URL" -f supabase/migrations/20260216000002_vector_768_rollback.sql
   ```

2. **Revert application code** to use OpenAI `text-embedding-ada-002` in `packages/utils/src/embed.ts`

3. **Re-process all episodes** to regenerate 1536-dim embeddings (same process as above)

**Important:** The rollback will also null out all embeddings, requiring a full re-processing cycle. Plan for the same downtime window as the forward migration.

### Production Notes

- **Downtime:** Vector search returns no results between migration and re-processing completion. The rest of the application (browsing, playback, transcripts) continues working normally.
- **Storage:** 768-dim vectors use 50% less storage than 1536-dim vectors.
- **HNSW vs IVFFlat:** The migration switches from IVFFlat to HNSW indexes. HNSW provides better recall without requiring a training step, which is especially beneficial when the index starts empty after migration.
- **Index build time:** HNSW indexes build incrementally as embeddings are inserted. There is no separate training step needed.
- **Cost:** BAAI/bge-base-en-v1.5 via OpenRouter is significantly cheaper than OpenAI ada-002.

### Fresh Install

For a fresh database setup (no existing data), simply run the setup scripts in order. The base schema files (`setup-2-tables.sql`, `setup-8-topic-rpc.sql`, `setup.sql`) have been updated to use `vector(768)` directly, so no migration is needed.

### File Reference

| File | Purpose |
|------|---------|
| `setup.sql` | Monolithic setup script (768-dim) |
| `setup-2-tables.sql` | Table definitions (768-dim) |
| `setup-6-rpc.sql` | Chunk vector search RPCs (untyped vector param) |
| `setup-8-topic-rpc.sql` | Topic vector search RPCs (768-dim) |
| `migrations/20260216000001_vector_768.sql` | Forward migration (1536 -> 768) |
| `migrations/20260216000002_vector_768_rollback.sql` | Rollback migration (768 -> 1536) |
| `setup-9-vector-384.sql` | **DEPRECATED** -- Do NOT run this file |
