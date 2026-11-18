import { chatCompletion } from './client.js';

const transcriptId = process.argv[2];
if (!transcriptId) {
  console.error('Usage: node structured-summary.js <transcript_id>');
  process.exit(1);
}

const result = await chatCompletion({
  model: process.env.SUMMARY_MODEL ?? 'claude-sonnet-4-6',
  messages: [{ role: 'user', content: 'Summarize this transcript.\n\n{{ transcript }}' }],
  transcript_id: transcriptId,
  max_tokens: 1000,
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'audio_summary',
      schema: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          key_points: { type: 'array', items: { type: 'string' } },
          action_items: { type: 'array', items: { type: 'string' } },
          conclusion: { type: 'string' }
        },
        required: ['topic', 'key_points', 'action_items', 'conclusion'],
        additionalProperties: false
      },
      strict: true
    }
  }
});

const summary = JSON.parse(result.choices[0].message.content);
console.log(summary.topic);
console.log(summary.action_items);
