import { SyncTranscriptError } from 'assemblyai';
import { client, chatCompletion } from './client.js';

const audioPath = process.argv[2] ?? './sample.wav'; // WAV or raw PCM, up to 120 seconds

let text;
try {
  await client.sync.warm(); // open the connection before the audio is ready
  const result = await client.sync.transcribe(audioPath, { model: 'universal-3-6-pro' });
  console.error(`session_id=${result.session_id}`);
  text = result.text;
} catch (error) {
  if (error instanceof SyncTranscriptError) {
    console.error(`Sync transcription failed (${error.status}/${error.errorCode}): ${error.message}`);
    process.exit(1);
  }
  throw error;
}

// There is no async transcript to reference, so send the text itself.
const summary = await chatCompletion({
  model: process.env.SUMMARY_MODEL ?? 'claude-haiku-4-5-20251001',
  messages: [
    { role: 'user', content: `Summarize this voice note in two sentences.\n\n${text}` }
  ],
  max_tokens: 300,
  fallbacks: [{ model: 'gemini-3.7-flash' }]
});

console.log(summary.choices[0].message.content);
