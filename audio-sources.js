import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { client } from './client.js';

const params = { speech_models: ['assemblyai-stt-3-7', 'universal-2'], language_detection: true };

// A public URL: AssemblyAI fetches the file itself.
const fromUrl = await client.transcripts.transcribe({ ...params, audio: 'https://assembly.ai/sports_injuries.mp3' });

// A local path: the SDK uploads the file first.
const fromPath = await client.transcripts.transcribe({ ...params, audio: './meeting.mp3' });

// A Buffer you already hold in memory.
const fromBuffer = await client.transcripts.transcribe({ ...params, audio: await readFile('./meeting.mp3') });

// A readable stream, e.g. from an upload handler.
const fromStream = await client.transcripts.transcribe({ ...params, audio: createReadStream('./meeting.mp3') });

for (const t of [fromUrl, fromPath, fromBuffer, fromStream]) console.log(t.id, t.status);
