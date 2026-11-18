import { client, chatCompletion } from './client.js';

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node batch-summarize.js <audio> [<audio> ...]');
  process.exit(1);
}

// Stage 1: transcribe every file at once.
const transcripts = await Promise.all(
  files.map((audio) =>
    client.transcripts.transcribe({
      audio,
      speech_models: ['assemblyai-stt-3-7', 'universal-2'],
      language_detection: true
    })
  )
);

// A failed job still resolves, so drop it before spending LLM tokens on it.
for (const t of transcripts.filter((t) => t.status !== 'completed')) {
  console.error(`Skipping ${t.id}: ${t.error}`);
}
const completed = transcripts.filter((t) => t.status === 'completed');

// Stage 2: summarize the completed transcripts in parallel.
const summaries = await Promise.allSettled(
  completed.map((t) =>
    chatCompletion({
      model: process.env.SUMMARY_MODEL ?? 'claude-sonnet-4-6',
      messages: [{ role: 'user', content: 'Summarize this transcript in three bullets.\n\n{{ transcript }}' }],
      transcript_id: t.id,
      max_tokens: 500,
      fallbacks: [{ model: 'gemini-3.7-flash' }]
    })
  )
);

summaries.forEach((s, i) => {
  const id = completed[i].id;
  if (s.status === 'fulfilled') console.log(`\n## ${id}\n${s.value.choices[0].message.content}`);
  else console.error(`Summary failed for ${id}: ${s.reason.message}`);
});
