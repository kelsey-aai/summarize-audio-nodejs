import { chatCompletion } from './client.js';
import { PROMPTS } from './prompts.js';

// Reuse a finished transcript: no need to transcribe the audio again.
const [transcriptId, type = 'bullets'] = process.argv.slice(2);
if (!transcriptId || !PROMPTS[type]) {
  console.error(`Usage: node summary-types.js <transcript_id> [${Object.keys(PROMPTS).join('|')}]`);
  process.exit(1);
}

const result = await chatCompletion({
  model: process.env.SUMMARY_MODEL ?? 'claude-sonnet-4-6',
  messages: [{ role: 'user', content: `${PROMPTS[type]}\n\n{{ transcript }}` }],
  transcript_id: transcriptId,
  max_tokens: 1000
});

console.log(result.choices[0].message.content);
