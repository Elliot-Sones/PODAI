#!/usr/bin/env node
/**
 * Create a test episode with a multi-speaker transcript to test UI changes.
 * Uses convertToDeepgramFormat with speaker data to verify speaker grouping.
 */

require('dotenv').config({ path: './packages/webapp/.env.local' });

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_API_KEY
);

const { convertToDeepgramFormat, Upload } = require('../packages/utils/dist/src/index.js');

const PODCAST_ID = 1; // Lex Fridman

// Simulate AssemblyAI-style utterances with speaker labels
const segments = [
  { text: "Welcome to the Lex Fridman podcast.", startTime: 0, endTime: 3, speaker: "A" },
  { text: "Today we have an incredible guest joining us.", startTime: 3, endTime: 6, speaker: "A" },
  { text: "Let's dive right into it.", startTime: 6, endTime: 8, speaker: "A" },
  { text: "Thanks for having me, Lex. It's great to be here.", startTime: 8, endTime: 12, speaker: "B" },
  { text: "I've been looking forward to this conversation for a long time.", startTime: 12, endTime: 16, speaker: "B" },
  { text: "So let's start with the big question.", startTime: 16, endTime: 19, speaker: "A" },
  { text: "What got you interested in artificial intelligence?", startTime: 19, endTime: 23, speaker: "A" },
  { text: "That's a great question.", startTime: 23, endTime: 25, speaker: "B" },
  { text: "It started when I was in graduate school.", startTime: 25, endTime: 29, speaker: "B" },
  { text: "I was working on optimization problems and realized that the algorithms were learning.", startTime: 29, endTime: 35, speaker: "B" },
  { text: "That moment changed everything for me.", startTime: 35, endTime: 38, speaker: "B" },
  { text: "I decided to dedicate my career to understanding intelligence.", startTime: 38, endTime: 43, speaker: "B" },
  { text: "That's fascinating.", startTime: 43, endTime: 45, speaker: "A" },
  { text: "So you went from pure mathematics to machine learning?", startTime: 45, endTime: 49, speaker: "A" },
  { text: "Exactly.", startTime: 49, endTime: 50, speaker: "B" },
  { text: "The transition was natural because at its core, machine learning is applied mathematics.", startTime: 50, endTime: 56, speaker: "B" },
  { text: "But the applications are what make it exciting.", startTime: 56, endTime: 60, speaker: "B" },
  { text: "You can solve real problems that affect millions of people.", startTime: 60, endTime: 65, speaker: "B" },
  { text: "Let me ask you about the current state of large language models.", startTime: 65, endTime: 70, speaker: "A" },
  { text: "Do you think we're on the right path to AGI?", startTime: 70, endTime: 74, speaker: "A" },
  { text: "I think we're making incredible progress.", startTime: 74, endTime: 78, speaker: "B" },
  { text: "But there are fundamental challenges that we haven't solved yet.", startTime: 78, endTime: 83, speaker: "B" },
  { text: "Reasoning, planning, and true understanding are still open problems.", startTime: 83, endTime: 89, speaker: "B" },
  { text: "What do you mean by true understanding?", startTime: 89, endTime: 92, speaker: "A" },
  { text: "Well, current models can generate impressive text.", startTime: 92, endTime: 96, speaker: "B" },
  { text: "But do they actually understand what they're saying?", startTime: 96, endTime: 100, speaker: "B" },
  { text: "That's the deep philosophical question at the heart of AI research.", startTime: 100, endTime: 106, speaker: "B" },
  { text: "I love that question.", startTime: 106, endTime: 108, speaker: "A" },
  { text: "It connects to consciousness and the nature of mind.", startTime: 108, endTime: 113, speaker: "A" },
  { text: "Do you think consciousness is necessary for intelligence?", startTime: 113, endTime: 118, speaker: "A" },
  { text: "That's perhaps the deepest question in all of science.", startTime: 118, endTime: 123, speaker: "B" },
  { text: "I personally believe that consciousness and intelligence are separable.", startTime: 123, endTime: 129, speaker: "B" },
  { text: "You can have intelligent behavior without conscious experience.", startTime: 129, endTime: 134, speaker: "B" },
  { text: "But consciousness might emerge naturally from sufficiently complex systems.", startTime: 134, endTime: 140, speaker: "B" },
  { text: "That's a beautiful thought.", startTime: 140, endTime: 143, speaker: "A" },
  { text: "Thank you for sharing your perspective on this.", startTime: 143, endTime: 147, speaker: "A" },
  { text: "Let's talk about the practical implications.", startTime: 147, endTime: 151, speaker: "A" },
  { text: "How should society prepare for advanced AI systems?", startTime: 151, endTime: 156, speaker: "A" },
  { text: "Education is the key.", startTime: 156, endTime: 159, speaker: "B" },
  { text: "We need to teach people how to work alongside AI, not compete against it.", startTime: 159, endTime: 165, speaker: "B" },
  { text: "The future belongs to those who can leverage these tools effectively.", startTime: 165, endTime: 171, speaker: "B" },
  { text: "And we need thoughtful regulation that doesn't stifle innovation.", startTime: 171, endTime: 177, speaker: "B" },
  { text: "I couldn't agree more.", startTime: 177, endTime: 179, speaker: "A" },
  { text: "This has been an incredible conversation.", startTime: 179, endTime: 183, speaker: "A" },
  { text: "Thank you so much for your time.", startTime: 183, endTime: 186, speaker: "A" },
  { text: "Thank you, Lex. It was a pleasure.", startTime: 186, endTime: 190, speaker: "B" },
];

async function main() {
  console.log(`Processing ${segments.length} segments...`);

  const deepgramFormat = convertToDeepgramFormat(segments);
  const paragraphs = deepgramFormat.results.channels[0].alternatives[0].paragraphs.paragraphs;
  console.log(`Generated ${paragraphs.length} paragraphs (speaker turns)`);

  // Show speaker turn summary
  for (const p of paragraphs) {
    console.log(`  Speaker ${p.speaker}: ${p.sentences.length} sentences (${p.start.toFixed(0)}s - ${p.end.toFixed(0)}s)`);
  }

  const transcriptText = segments.map(s => s.text).join(' ');

  // Upload raw transcript JSON
  console.log('\nUploading raw transcript...');
  const rawTranscriptUrl = await Upload(
    supabase,
    JSON.stringify(deepgramFormat, null, 2),
    'transcripts',
    `${PODCAST_ID}/youtube-test/transcript.json`
  );
  console.log('Raw transcript URL:', rawTranscriptUrl);

  // Upload plain text
  const transcriptUrl = await Upload(
    supabase,
    transcriptText,
    'transcripts',
    `${PODCAST_ID}/youtube-test/transcript.txt`
  );

  // Upsert test episode
  const { data: existing } = await supabase
    .from('Episodes')
    .select('id')
    .eq('slug', 'youtube-transcript-test')
    .eq('podcast', PODCAST_ID)
    .single();

  let episodeId;
  if (existing) {
    console.log('Updating existing test episode:', existing.id);
    await supabase
      .from('Episodes')
      .update({
        rawTranscriptUrl,
        transcriptUrl,
        status: 'ready',
        title: 'Speaker Test — AI & Consciousness',
      })
      .eq('id', existing.id);
    episodeId = existing.id;
  } else {
    console.log('Creating new test episode...');
    const { data, error } = await supabase
      .from('Episodes')
      .insert({
        podcast: PODCAST_ID,
        slug: 'youtube-transcript-test',
        title: 'Speaker Test — AI & Consciousness',
        rawTranscriptUrl,
        transcriptUrl,
        status: 'ready',
        guid: 'youtube-test-' + Date.now(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating episode:', error);
      process.exit(1);
    }
    episodeId = data.id;
  }

  console.log(`\n✅ Done! Episode ID: ${episodeId}`);
  console.log(`\nView at: http://localhost:3000/podcast/lex-fridman-podcast/episode/youtube-transcript-test`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
