# Agent Guidelines

## Deployment Safety

- Treat runtime hosts as stateless/ephemeral. Do not rely on local filesystem persistence.
- For episode/audio/transcript pipelines, do not write payloads to local temp files.
- Stream data directly between external sources, Supabase Storage, and processing APIs.
- Durable artifacts must be stored in Supabase (database or storage buckets), not local disk.
- If a change appears to require local staging, stop and propose a hosted-safe alternative first.
