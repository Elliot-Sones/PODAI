# Podverse Deployment Guide

This guide covers deploying Podverse to production using Vercel and Supabase.

## Prerequisites

- Node.js 18.18+ (managed via Volta)
- Yarn 3.6
- A [Vercel](https://vercel.com) account
- A [Supabase](https://supabase.com) project
- API keys for: OpenAI, Anthropic, Deepgram, Clerk, Inngest

## 1. Environment Variables

Create all required environment variables in your Vercel project dashboard under **Settings > Environment Variables**.

### Required Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Supabase dashboard |
| `SUPABASE_URL` | Supabase URL (used by CLI/scripts) | Same as `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_API_KEY` | Supabase key (used by CLI/scripts) | Same as service role key |
| `OPENAI_API_KEY` | OpenAI API key (embeddings, summaries) | [OpenAI](https://platform.openai.com/api-keys) |
| `ANTHROPIC_API_KEY` | Anthropic API key (chat, topics, speaker ID) | [Anthropic](https://console.anthropic.com/) |
| `DEEPGRAM_API_KEY` | Deepgram API key (transcription fallback) | [Deepgram](https://console.deepgram.com/) |
| `DEEPGRAM_API_KEY_IDENTIFIER` | Deepgram key identifier | Deepgram dashboard |
| `INNGEST_EVENT_KEY` | Inngest event key | Inngest dashboard or Vercel integration |
| `INNGEST_SIGN_KEY` | Inngest signing key | Inngest dashboard or Vercel integration |
| `INNGEST_SIGNING_KEY` | Inngest signing key (backward-compat alias) | Same as `INNGEST_SIGN_KEY` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | [Clerk](https://dashboard.clerk.com/) |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk dashboard |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret | Clerk dashboard > Webhooks |
| `PODVERSE_APP_URL` | Public app URL (e.g. `https://podverse.ai`) | Your deployment URL |

> **Note:** Stripe billing has been disabled. The Stripe routes are stubbed and `PurchaseButton` is a no-op. You do not need Stripe environment variables. Email functionality has also been removed.

### Vercel Auto-Populated Variables

When you add the Supabase and Inngest Vercel integrations, many of these variables are set automatically. Verify they match the values above after enabling the integrations.

## 2. Supabase Database Setup

### Initial Schema

The database schema is split across multiple SQL files in the `supabase/` directory. Run them in order against your Supabase database:

```bash
# Connect to your Supabase database
psql -h YOUR_SUPABASE_DB_HOST -U postgres -d postgres

# Run setup files in order
\i supabase/setup-1-extensions.sql
\i supabase/setup-2-tables.sql
\i supabase/setup-3-functions.sql
\i supabase/setup-4-functions2.sql
\i supabase/setup-5-views-rpc.sql
\i supabase/setup-6-rpc.sql
\i supabase/setup-7-rls.sql
\i supabase/setup-8-topic-rpc.sql
\i supabase/setup-9-missing-functions.sql
```

Alternatively, restore the full schema dump:

```bash
psql -h YOUR_SUPABASE_DB_HOST -U postgres -d postgres -f supabase-schema.sql
```

### Migrations

After the initial schema, apply the migrations:

```bash
psql -h YOUR_SUPABASE_DB_HOST -U postgres -d postgres \
  -f supabase/migrations/20260215000001_categories.sql

psql -h YOUR_SUPABASE_DB_HOST -U postgres -d postgres \
  -f supabase/migrations/20260215000002_topics.sql
```

> **Warning:** Do NOT run `supabase/setup-9-vector-384.sql`. That file was for a removed local embeddings approach. The production system uses OpenAI `text-embedding-ada-002` with 1536-dimension vectors.

### Vector Extension

The database uses `pgvector` for embedding storage. The extension is enabled in `setup-1-extensions.sql`. Verify it is active:

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

## 3. Vercel Configuration

### Project Setup

1. Import the repository into Vercel
2. Set the **Root Directory** to the repository root (not a subdirectory)
3. Set the **Framework Preset** to Next.js
4. Set the **Build Command** to `yarn build` (this runs Turbo, which builds `utils` before `webapp`)
5. Set the **Output Directory** to `packages/webapp/.next`
6. Set the **Install Command** to `yarn install`

### Build Pipeline

The monorepo uses Turborepo. The build order is:

1. `packages/utils` -- shared library, must build first
2. `packages/webapp` -- Next.js app, depends on `utils`
3. `packages/cli` -- CLI tool (not deployed to Vercel)

Turbo handles dependency ordering automatically via `turbo.json`.

### Node.js Version

Set the Node.js version to **18.x** in Vercel project settings. The project uses Volta to pin Node 18.18.0.

### Server Actions

The Next.js config allows server action bodies up to 10 MB (`serverActions.bodySizeLimit: '10mb'`). This supports large file uploads for podcast audio.

### Inngest Integration

1. Add the [Inngest Vercel integration](https://vercel.com/integrations/inngest)
2. This automatically provisions the event key and signing key
3. The Inngest serve endpoint is at `/api/inngest` (provided by the Next.js app)
4. Inngest functions include:
   - `process-episode` -- Full episode processing pipeline (transcribe, summarize, speaker ID, embed, topics)
   - `process-podcast` -- Batch process episodes for a podcast
   - `ingest-podcast` -- Import/refresh a podcast RSS feed
   - `clear-errors` -- Reset error state for a podcast
   - `refresh-podcasts` -- Daily cron job (1am UTC) to refresh all podcast feeds

### Clerk Integration

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
3. Configure a webhook in Clerk dashboard pointing to `YOUR_APP_URL/api/clerk-webhook`
4. Set `CLERK_WEBHOOK_SECRET` to the signing secret from the webhook configuration

## 4. Processing Episodes

### Via the Web UI

Users can add podcasts via the `/request` page. This triggers the Inngest `ingest/podcast` event, which imports the RSS feed and starts processing.

### Via the CLI

The CLI (`packages/cli`) can be used for bulk operations:

```bash
# Set environment variables
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_API_KEY=your-service-role-key
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
export INNGEST_EVENT_KEY=your-inngest-event-key
export INNGEST_SIGN_KEY=your-inngest-sign-key

# List all podcasts
yarn workspace cli ts-node src/main.ts list

# Ingest a new podcast
yarn workspace cli ts-node src/main.ts ingest "https://example.com/feed.xml"

# Process a podcast (sends Inngest events)
yarn workspace cli ts-node src/main.ts process my-podcast-slug

# Process with options
yarn workspace cli ts-node src/main.ts process my-podcast-slug --force --numEpisodes 5

# Populate from curated catalog
yarn workspace cli ts-node src/main.ts populate --all
yarn workspace cli ts-node src/main.ts populate --category technology

# Refresh all podcast feeds
yarn workspace cli ts-node src/main.ts refresh
```

### Re-processing Episodes

To re-process episodes that failed or need updating:

1. **Clear errors first:**
   ```bash
   # Via Inngest dashboard: manually trigger clear/errors event
   # Or via CLI:
   yarn workspace cli ts-node src/main.ts process my-podcast-slug --force
   ```

2. **Force reprocess specific podcast:**
   ```bash
   yarn workspace cli ts-node src/main.ts process my-podcast-slug --force --numEpisodes 10
   ```

3. **Via Inngest dashboard:**
   Navigate to your Inngest dashboard, find failed runs, and replay them.

### Processing Pipeline Steps

Each episode goes through these steps in order:

1. **Transcribe** -- Try RSS transcript, then YouTube transcript, then Deepgram
2. **Summarize** -- Generate AI summary via OpenAI
3. **Speaker ID** -- Identify speakers via Anthropic Claude
4. **Suggestions** -- Generate suggested queries
5. **Embed** -- Create vector embeddings via OpenAI (1536 dimensions)
6. **Topics** -- Extract topics via Anthropic Claude Haiku

## 5. Monitoring

### Inngest Dashboard

The Inngest dashboard provides visibility into:
- Active and completed function runs
- Failed runs with error details
- Cron job execution (daily refresh at 1am UTC)
- Concurrency usage (process-episode limited to 5 concurrent)

### Vercel Dashboard

Monitor via the Vercel dashboard:
- **Deployments** -- Build logs and deployment status
- **Analytics** -- Page views and Web Vitals (via `@vercel/analytics`)
- **Speed Insights** -- Performance data (via `@vercel/speed-insights`)
- **Logs** -- Runtime logs from serverless functions

### Supabase Dashboard

Monitor database health:
- **Table Editor** -- Inspect podcast and episode data
- **SQL Editor** -- Run ad-hoc queries
- **Logs** -- Database query logs and errors
- **Storage** -- Audio files, transcripts, and summaries in buckets

## 6. Rollback Procedures

### Vercel Deployment Rollback

1. Go to your Vercel project dashboard
2. Navigate to **Deployments**
3. Find the last known-good deployment
4. Click the three-dot menu and select **Promote to Production**

This is instant and does not require a rebuild.

### Database Rollback

Supabase provides point-in-time recovery (PITR) on Pro plans:

1. Go to your Supabase project dashboard
2. Navigate to **Settings > Database > Backups**
3. Select a recovery point before the issue occurred
4. Restore to a new project or the existing one

For manual rollback of specific migrations, write a reverse migration SQL script and execute it against the database.

### Inngest Function Rollback

Inngest functions are deployed as part of the Vercel deployment. Rolling back the Vercel deployment also rolls back the Inngest function definitions. To cancel in-flight function runs:

```bash
export INNGEST_SIGN_KEY=your-signing-key
yarn workspace cli ts-node src/main.ts cancel <function-id>
```

## 7. Pre-Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] Supabase schema and migrations are applied
- [ ] pgvector extension is enabled
- [ ] Clerk application is configured with correct webhook URL
- [ ] Inngest integration is active on Vercel
- [ ] `yarn build` passes locally with no errors
- [ ] Test a podcast import via the web UI or CLI
- [ ] Verify the daily refresh cron is registered in Inngest dashboard
- [ ] Check that `PODVERSE_APP_URL` matches your production domain

## 8. Local Development

For local development, create `packages/webapp/.env.local` with all required variables (see `packages/webapp/.env.example` for the template).

```bash
# Install dependencies
yarn

# Build all packages
yarn build

# Start the Next.js dev server
yarn workspace webapp dev

# In a separate terminal, start the Inngest dev server
npx inngest-cli@latest dev
```

The Inngest dev server provides a local dashboard at `http://localhost:8288` for testing background jobs.
