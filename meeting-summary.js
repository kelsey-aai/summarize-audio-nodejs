import { client, chatCompletion } from './client.js';

const audio = process.argv[2] ?? './meeting.mp3';

const transcript = await client.transcripts.transcribe({
  audio,
  speech_models: ['assemblyai-stt-3-7', 'universal-2'],
  language_detection: true,
  speaker_labels: true
});

if (transcript.status === 'error') {
  console.error(`Transcription failed: ${transcript.error}`);
  process.exit(1);
}

// {{ transcript }} injects plain text only, so build the speaker-labeled version yourself.
const dialogue = (transcript.utterances ?? [])
  .map((u) => `Speaker ${u.speaker}: ${u.text}`)
  .join('\n');

const result = await chatCompletion({
  model: process.env.SUMMARY_MODEL ?? 'claude-sonnet-4-6',
  messages: [
    {
      role: 'system',
      content:
        'You summarize internal product meetings for engineers who missed the call. ' +
        'Be specific about names, numbers, and dates. Never invent an owner or a deadline.'
    },
    {
      role: 'user',
      content:
        'This is a weekly product sync. Write:\n' +
        '1. A two-sentence summary.\n' +
        '2. Decisions made.\n' +
        '3. Action items as "Speaker X: task (deadline if stated)".\n\n' +
        dialogue
    }
  ],
  max_tokens: 1500,
  fallbacks: [{ model: 'gemini-3.7-flash' }]
});

console.log(result.choices[0].message.content);
