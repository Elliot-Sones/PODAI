# PODAI - AI Superpowers for Podcasts

[![CI](https://github.com/Elliot-Sones/PODAI/actions/workflows/ci.yml/badge.svg)](https://github.com/Elliot-Sones/PODAI/actions/workflows/ci.yml)

<img src="./packages/webapp/public/images/podverse-episode-screenshot.png" alt="drawing" width="400"/>

PODAI is a full-stack web app that brings AI superpowers to podcasts. Import any podcast by RSS feed and get automatic transcription, AI-generated summaries, topic extraction, semantic search, and an LLM-powered chatbot — all out of the box.

## Features

* Import a podcast by providing its RSS feed URL or searching by name
* Automatic transcript generation using [AssemblyAI](https://assemblyai.com) (Universal-2)
* Automatic AI-generated diarization and speaker identification
* Automatic AI-generated episode summaries
* Topic extraction and semantic browsing
* Category-based podcast organization with auto-categorization
* LLM-powered chatbot with RAG (retrieval-augmented generation)
* Full-text and vector search against transcripts, metadata, and summaries
* Citation moments with seekable timestamp links
* Podcast discovery via iTunes API (Apple Podcasts / Spotify link support)

## Architecture

PODAI is an entirely serverless architecture built with **Next.js 14** and deployed on [Vercel](https://vercel.com). It uses [TailwindCSS](https://tailwindcss.com/) for styling and [ShadCN](https://ui.shadcn.com/) for UI components.

The project is organized as a monorepo with three packages:
* `packages/webapp` — Next.js frontend and API routes
* `packages/utils` — Shared library (database, AI, search, embeddings)
* `packages/cli` — Command-line tools for bulk import and management

### Services

* [Supabase](https://supabase.com) — Database with pgvector for semantic search (768-dim embeddings)
* [Clerk](https://clerk.com) — Authentication
* [Inngest](https://inngest.com) — Background job processing
* [AssemblyAI](https://assemblyai.com) — Audio transcription (Universal-2)
* [OpenRouter](https://openrouter.ai) — LLM access (Claude 3.5 Haiku for chat, summaries, topics, speaker ID; BAAI/bge-base-en-v1.5 for embeddings)

## Getting Started

### Prerequisites

* Node.js 18+
* `yarn` (v3.6+)

### Installation

```bash
git clone https://github.com/Elliot-Sones/PODAI.git
cd PODAI
yarn install
```

### Environment Setup

Copy the example env file and fill in your keys:

```bash
cp packages/webapp/.env.example packages/webapp/.env.local
```

You'll need API keys for:
* **Supabase** — URL, anon key, and service role key
* **OpenRouter** — API key for LLM and embeddings
* **AssemblyAI** — API key for transcription
* **Clerk** — Publishable and secret keys
* **Inngest** — Event key and signing key

See `packages/webapp/.env.example` for the full list.

### Supabase Setup

The file `supabase-schema.sql` contains the database schema. Restore it with:

```bash
psql -h YOUR_SUPABASE_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f supabase-schema.sql
```

Additional migrations are in `supabase/migrations/` for categories, topics, and vector dimensions.

### Local Development

Run the webapp:

```bash
yarn workspace webapp dev
```

Background processing (podcast ingestion, transcription, etc.) uses [Inngest](https://inngest.com). Run the dev server locally:

```bash
npx inngest-cli@latest dev
```

### Building

```bash
yarn build
```

This builds all three packages (utils, webapp, cli) via Turborepo.

## Deployment

Deploy to Vercel and add the **Supabase** and **Inngest** integrations to your project. See `docs/DEPLOYMENT.md` for a detailed deployment guide.

## Help, Support, and Questions

Please [file an issue](https://github.com/Elliot-Sones/PODAI/issues) if you have any problems or need help!
