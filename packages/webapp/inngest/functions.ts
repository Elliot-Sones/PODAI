/** This module contains Inngest Functions that are invoked in response to Inngest events. */

import { getSupabaseClientWithToken } from '../lib/supabase';
import { inngest } from './client';
import {
  Episode,
  EpisodeStatus,
  Json,
  GetEpisode,
  UpdateEpisode,
  GetPodcastWithEpisodesByID,
  Ingest,
  GetPodcastStats,
  GetEpisodeWithPodcast,
  EpisodeWithPodcast,
  EpisodeWithPodcastToEpisode,
  ClearPodcastErrors,
  isReady,
} from 'podverse-utils';
import {
  TranscribeEpisode,
  SummarizeEpisode,
  SpeakerIDEpisode,
  EmbedEpisode,
  SuggestEpisode,
} from '@/lib/process';
import { ExtractTopics, AssignTopics } from 'podverse-utils';

/** Process a single episode. */
export const processEpisode = inngest.createFunction(
  {
    id: 'process-episode',
    retries: 0,
    concurrency: {
      // Limit number of concurrent transcription calls to avoid hitting API limits.
      limit: 5,
    },
  },
  { event: 'process/episode' },
  async ({ event, step }) => {
    const { episodeId, force, supabaseAccessToken } = event.data;
    if (!episodeId) {
      throw new Error('process/episode - Missing episodeId in event data');
    }
    console.log(`process/episode event received for episodeId ${episodeId}`, event);
    const token = supabaseAccessToken || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = await getSupabaseClientWithToken(token);
    let episodeWithPodcast = await GetEpisodeWithPodcast(supabase, episodeId);
    let podcast = episodeWithPodcast.podcast;
    let episode = EpisodeWithPodcastToEpisode(episodeWithPodcast);

    episode.status = {
      ...(episode.status as EpisodeStatus),
      startedAt: new Date().toISOString(),
      completedAt: null,
      message: 'Starting processing',
    };
    episode.error = null;
    await UpdateEpisode(supabase, episode);

    try {
      // Always use AssemblyAI for transcription to get speaker diarization.
      // RSS and YouTube transcripts lack speaker labels, so all segments would
      // be attributed to "Speaker 0" — resulting in a poor transcript experience.
      let transcribeResult = await step.run('transcribe', async () => {
        console.log(`process/episode [${episodeId}] - Transcribing via AssemblyAI (speaker diarization)`);
        const result = await TranscribeEpisode({
          supabase,
          supabaseToken: token,
          episode,
          podcast,
          force,
        });
        console.log(`process/episode [${episodeId}] - Transcribe result: ${result}`);
        return result;
      });

      // Run all post-transcription steps in parallel.
      const postProcessResult = await step.run('post-process', async () => {
        const results = await Promise.all([
          SummarizeEpisode({ supabase, episode, force })
            .then((r) => { console.log(`process/episode [${episodeId}] - Summarize result: ${r}`); return r; }),
          SpeakerIDEpisode({ supabase, episode, force })
            .then((r) => { console.log(`process/episode [${episodeId}] - Speaker ID result: ${r}`); return r; }),
          SuggestEpisode({ supabase, episode, force })
            .then((r) => { console.log(`process/episode [${episodeId}] - Suggest result: ${r}`); return r; }),
          EmbedEpisode({ supabase, episode, force })
            .then((r) => { console.log(`process/episode [${episodeId}] - Embed result: ${r}`); return r; }),
          // Topics: use transcriptUrl directly (available before summary)
          (async () => {
            try {
              const ep = await GetEpisode(supabase, episodeId);
              let text = '';
              if (ep.transcriptUrl) {
                const res = await fetch(ep.transcriptUrl);
                text = await res.text();
              }
              if (text) {
                const topics = await ExtractTopics(text);
                await AssignTopics(supabase, episodeId, topics);
                console.log(`process/episode [${episodeId}] - Extracted ${topics.length} topics: ${topics.join(', ')}`);
                return `Extracted ${topics.length} topics`;
              }
              return 'No text available for topic extraction';
            } catch (err) {
              console.error(`process/episode [${episodeId}] - Topic extraction error:`, err);
              return `Topic extraction failed: ${err}`;
            }
          })(),
        ]);
        return {
          summarizeResult: results[0],
          speakerIdResult: results[1],
          suggestionResult: results[2],
          embedResult: results[3],
          topicsResult: results[4],
        };
      });

      episode = await GetEpisode(supabase, episodeId);
      episode.status = {
        ...(episode.status as EpisodeStatus),
        message: 'Finished processing',
        completedAt: new Date().toISOString(),
      };
      await UpdateEpisode(supabase, episode);
      console.log(`Finished processing episode ${episodeId}: ${episode.title}`);
      return {
        event,
        body: {
          transcribeResult: await transcribeResult,
          ...postProcessResult,
        },
      };
    } catch (error) {
      console.error(`Error processing episode ${episodeId}`, error);
      episode.error = error as Json;
      episode.status = {
        ...(episode.status as EpisodeStatus),
        message: `Error: ${JSON.stringify(error)}`,
        completedAt: new Date().toISOString(),
      };
      await UpdateEpisode(supabase, episode);
    }
  },
);

/** Scan for unprocessed episodes and fire off events to process them. */
export const processPodcast = inngest.createFunction(
  {
    id: 'process-podcast',
    retries: 0,
    concurrency: {
      // Limit number of concurrent transcription calls to avoid hitting API limits.
      limit: 5,
    },
  },
  { event: 'process/podcast' },
  async ({ event, step, runId }) => {
    const { podcastId, force, supabaseAccessToken, episodes, episodeLimit, maxEpisodes } = event.data;
    console.log(
      `process/podcast - event ${runId} received for ${podcastId}, force ${force}, episodeLimit ${episodeLimit}`,
    );
    const token = supabaseAccessToken || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = await getSupabaseClientWithToken(token);
    const podcast = await GetPodcastWithEpisodesByID(supabase, podcastId);
    let cap = episodeLimit;
    if (maxEpisodes && !force) {
      let processedEpisodes = podcast.Episodes.filter((episode) => isReady(episode)).length;
      cap = Math.max(0, maxEpisodes - processedEpisodes);
      console.log(
        `process/podcast - Podcast ${podcastId} has ${processedEpisodes}, max is ${maxEpisodes}, cap is ${cap}`,
      );
    }
    let episodesToProcess = force
      ? podcast.Episodes
      : podcast.Episodes.filter((episode) => (episodes ? episodes.includes(episode.id) : !isReady(episode)));
    if (episodeLimit) {
      console.log(
        `process/podcast - Podcast ${podcastId} has ${episodesToProcess.length} episodes to process, capping to ${cap}`,
      );
      episodesToProcess = episodesToProcess.slice(0, cap);
    }
    console.log(`process/podcast - Podcast ${podcastId}, processing ${episodesToProcess.length} episodes`);
    const results = await Promise.all(
      episodesToProcess.map(async (episode) => {
        const result = step.sendEvent('process-episode', {
          name: 'process/episode',
          data: {
            episodeId: episode.id,
            force,
            supabaseAccessToken,
          },
        });
        return result;
      }),
    );
    console.log(`process/podcast for podcast ${podcastId} - Done.`);
    return {
      message: `Finished processing ${results.length} episodes for podcast ${podcastId}`,
    };
  },
);

/** Import or refresh a podcast RSS feed. */
export const ingestPodcast = inngest.createFunction(
  {
    id: 'ingest-podcast',
    retries: 5,
  },
  { event: 'ingest/podcast' },
  async ({ event, step, runId }) => {
    const { podcastId, rssUrl, supabaseAccessToken } = event.data;
    console.log(`ingest/podcast - event ${runId}, podcastId ${podcastId}, rssUrl ${rssUrl}`);
    const token = supabaseAccessToken || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = await getSupabaseClientWithToken(token);
    let rssFeed = rssUrl;
    let originalEpisodes: Episode[] = [];
    if (podcastId) {
      // We are refreshing an existing podcast.
      console.log(`ingest/podcast - Refreshing existing podcast ${podcastId}`);
      const podcast = await GetPodcastWithEpisodesByID(supabase, podcastId);
      if (!podcast.rssUrl) {
        throw new Error('Podcast has no RSS feed URL');
      }
      originalEpisodes = podcast.Episodes;
      rssFeed = podcast.rssUrl;
    }
    const newPodcast = await Ingest({ supabase, podcastUrl: rssFeed, refresh: !!podcastId });
    if (newPodcast.process) {
      const newEpisodes = newPodcast.Episodes.filter((episode) => !originalEpisodes.find((e) => e.id === episode.id));
      console.log(`ingest/podcast - Processing podcast ${newPodcast.id} with ${newEpisodes.length} new episodes`);
      const result = step.sendEvent('process-podcast', {
        name: 'process/podcast',
        data: {
          podcastId: newPodcast.id,
          supabaseAccessToken,
          episodes: newEpisodes.map((episode) => episode.id),
        },
      });
      return result;
    }
    if (!!podcastId) {
      return { message: `Refreshed podcast ${podcastId}` };
    } else {
      return { message: `Ingested podcast ${newPodcast.id}` };
    }
  },
);

/** Clear errors and processing state for a podcast. */
export const clearErrors = inngest.createFunction(
  {
    id: 'clear-errors',
    retries: 5,
  },
  { event: 'clear/errors' },
  async ({ event, step, runId }) => {
    const { podcastId, supabaseAccessToken } = event.data;
    console.log(`clear/errors - event ${runId}, podcastId ${podcastId}`);
    const token = supabaseAccessToken || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = await getSupabaseClientWithToken(token);
    await ClearPodcastErrors({ supabase, podcastId });
    return { message: `Cleared errors for podcast ${podcastId}` };
  },
);

/** Refresh all podcast feeds. Runs daily. */
export const refreshPodcasts = inngest.createFunction(
  {
    id: 'refresh-podcasts',
    retries: 5,
  },
  { cron: '0 1 * * *' }, // Run daily at 1am UTC
  async ({ step }) => {
    console.log(`refreshPodcasts - Starting`);
    const supabase = await getSupabaseClientWithToken(process.env.SUPABASE_SERVICE_ROLE_KEY as string);
    const stats = await GetPodcastStats(supabase);

    console.log(`refreshPodcasts - Clearing errors for ${stats.length} podcasts`);
    await Promise.all(
      stats.map(async (stat) => {
        console.log(`refreshPodcasts - Clearing podcast ${stat.id}`);
        const result = step.sendEvent('clear-errors', {
          name: 'clear/errors',
          data: {
            podcastId: stat.id,
            supabaseAccessToken: process.env.SUPABASE_SERVICE_ROLE_KEY,
          },
        });
        return result;
      }),
    );
    console.log(`refreshPodcasts - Done clearing errors.`);

    console.log(`refreshPodcasts - Refreshing ${stats.length} podcasts`);
    const results = await Promise.all(
      stats.map(async (stat) => {
        console.log(`refreshPodcasts - Refreshing podcast ${stat.id}`);
        const result = step.sendEvent('ingest-podcast', {
          name: 'ingest/podcast',
          data: {
            podcastId: stat.id,
            supabaseAccessToken: process.env.SUPABASE_SERVICE_ROLE_KEY,
          },
        });
        return result;
      }),
    );
    console.log(`refreshPodcasts - Done ingesting.`);

    // console.log(`refreshPodcasts - Processing ${stats.length} podcasts`);
    // await Promise.all(
    //   stats.map(async (stat) => {
    //     console.log(`refreshPodcasts - Processing podcast ${stat.id}`);
    //     const result = step.sendEvent('process-podcast', {
    //       name: 'process/podcast',
    //       data: {
    //         podcastId: stat.id,
    //         supabaseAccessToken: process.env.SUPABASE_SERVICE_ROLE_KEY,
    //       },
    //     });
    //     return result;
    //   }),
    // );
    // console.log(`refreshPodcasts - Done processing.`);

    console.log(`Daily podcast refresh completed for ${stats.length} podcasts`);
    return {
      message: `Finished refreshing ${stats.length} podcasts`,
    };
  },
);
