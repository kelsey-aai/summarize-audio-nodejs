import { client, chatCompletion } from './client.js';

const audio = process.argv[2] ?? 'https://assembly.ai/sports_injuries.mp3';

const transcript = await client.transcripts.transcribe({
  audio,
  // AssemblyAI-STT-3.7 covers 32 languages; Universal-2 picks up the rest of the 99.
  speech_models: ['assemblyai-stt-3-7', 'universal-2'],
  language_detection: true
});

if (transcript.status === 'error') {
  console.error(`Transcription failed: ${transcript.error}`);
  process.exit(1);
}
console.error(`transcript_id=${transcript.id}`);

const result = await chatCompletion({
  model: process.env.SUMMARY_MODEL ?? 'claude-sonnet-4-6',
  messages: [
    {
      role: 'user',
      content: 'Summarize this transcript in one short paragraph.\n\n{{ transcript }}'
    }
  ],
  transcript_id: transcript.id,
  max_tokens: 1000,
  fallbacks: [{ model: 'gemini-3.7-flash' }, { model: 'claude-haiku-4-5-20251001' }],
  fallback_config: { depth: 2 }
});

console.log(result.choices[0].message.content);
