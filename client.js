import { AssemblyAI } from 'assemblyai';

const apiKey = process.env.ASSEMBLYAI_API_KEY;
if (!apiKey) {
  console.error('Set ASSEMBLYAI_API_KEY before running this script.');
  process.exit(1);
}

// ASSEMBLYAI_REGION=eu keeps transcription, Sync and LLM Gateway traffic in the EU.
const eu = process.env.ASSEMBLYAI_REGION === 'eu';

export const client = new AssemblyAI({
  apiKey,
  baseUrl: eu ? 'https://api.eu.assemblyai.com' : 'https://api.assemblyai.com',
  syncBaseUrl: eu ? 'https://sync.eu.assemblyai.com' : 'https://sync.assemblyai.com'
});

const GATEWAY_URL = eu
  ? 'https://llm-gateway.eu.assemblyai.com/v1/chat/completions'
  : 'https://llm-gateway.assemblyai.com/v1/chat/completions';

export async function chatCompletion(body) {
  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: { authorization: apiKey, 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `LLM Gateway error ${response.status} (request_id: ${result.request_id ?? 'n/a'}): ` +
        JSON.stringify(result)
    );
  }

  // Log both on every call: request_id is what support asks for, and the
  // model field shows which model answered when a fallback fired.
  console.error(`request_id=${result.request_id} model=${result.model ?? result.request?.model}`);
  return result;
}
