# Summarize audio with LLMs in Node.js

Companion code for the AssemblyAI blog post [Summarize audio with LLMs in Node.js](https://www.assemblyai.com/blog/summarize-audio-with-llms-nodejs).

Transcribe recorded audio with AssemblyAI-STT-3.7 (or short clips with the Sync API on Universal-3.6 Pro), then summarize the transcript through AssemblyAI's [LLM Gateway](https://www.assemblyai.com/docs/llm-gateway/quickstart) with one API key.

## Requirements

- Node.js 20 or later
- An AssemblyAI API key ([sign up](https://www.assemblyai.com/dashboard/signup))

## Setup

```bash
git clone https://github.com/kelsey-aai/summarize-audio-nodejs.git
cd summarize-audio-nodejs
npm install
export ASSEMBLYAI_API_KEY=<YOUR_KEY>
```

Optional environment variables:

| Variable | Effect |
| --- | --- |
| `SUMMARY_MODEL` | LLM Gateway model ID to summarize with (default `claude-sonnet-4-6`; `claude-haiku-4-5-20251001` for the Sync script) |
| `ASSEMBLYAI_REGION=eu` | Send transcription, Sync and LLM Gateway requests to the EU endpoints |

## Scripts

| File | What it does |
| --- | --- |
| `client.js` | Shared client, region switch and LLM Gateway helper (logs `request_id` and model) |
| `summarize.js [audio]` | Transcribe a URL or local file with AssemblyAI-STT-3.7, then summarize it by `transcript_id` with fallback models |
| `sync-summarize.js [file.wav]` | Transcribe a clip of up to 120 seconds with the Sync API (`universal-3-6-pro`), then summarize the text |
| `audio-sources.js` | Transcribe from a URL, a local path, a Buffer and a stream (expects `./meeting.mp3`) |
| `meeting-summary.js [audio]` | Speaker-labeled meeting summary with decisions and action items |
| `summary-types.js <transcript_id> [type]` | Re-summarize an existing transcript as `paragraph`, `bullets`, `headline`, `actions` or `gist` |
| `structured-summary.js <transcript_id>` | Schema-constrained JSON summary with `response_format` |
| `batch-summarize.js <audio...>` | Transcribe several files in parallel, then summarize the completed ones |

```bash
node summarize.js                       # uses a public sample file
node summarize.js ./meeting.mp3
SUMMARY_MODEL=gemini-3.7-flash node summarize.js
node summary-types.js <transcript_id> actions
npm run check                           # node --check every file
```

## Notes

- `{{ transcript }}` must be written exactly like that (with the spaces). LLM Gateway replaces its first occurrence with the transcript text when you pass `transcript_id`.
- The EU LLM Gateway endpoint serves Anthropic Claude and Google Gemini models only, so the defaults and fallbacks here are all Claude or Gemini.
- See [Choose a model](https://www.assemblyai.com/docs/llm-gateway/choose-a-model) for current summary benchmarks by audio length.

## License

MIT
