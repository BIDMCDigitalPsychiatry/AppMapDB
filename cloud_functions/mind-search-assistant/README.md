# mind-search-assistant

LLM search assistant for the mindapps.org app library. Translates a
visitor's natural-language request ("free CBT apps for anxiety on iPhone")
into search filters constrained to the site's real filter taxonomy, plus a
one-line reply. The frontend applies the returned filters to the existing
app-library search — the model itself has **no database access of any kind**.

## Safety / abuse design

- **No DB access**: the Lambda's only outbound call is to the Anthropic API.
  There is nothing a jailbreak can read or write.
- **LLM as query compiler**: forced tool use (`tool_choice: tool` +
  `strict: true`) means the model can only emit filter values from
  `taxonomy.json`; the server re-whitelists everything in `validate.js`
  anyway.
- **Crisis short-circuit**: first-person crisis language returns crisis
  resources deterministically before any LLM call (`crisis.js`); searches
  *about* self-harm/suicide topics proceed but get a resources footer.
- **Anti-freeloading**: cheap model (Haiku), `max_tokens` capped, message
  ≤ 500 chars, history ≤ 8 turns, system prompt refuses off-topic work,
  API Gateway throttling + a daily budget kill switch (configured at deploy).

## Files

- `handler.js` — the whole brain: `handleChat({message, history})`. Pure
  Node, no AWS dependencies.
- `taxonomy.json` — generated from `src/database/models/Application.tsx` by
  `npm run export-taxonomy` (repo root). Regenerate after any enum change.
- `toolSchema.js` / `prompt.js` / `crisis.js` / `validate.js` / `mock.js`
- `lambda.js` — the only AWS-specific file (API Gateway proxy adapter).
- `local-server.js` — dev server on :3999 for the frontend.
- `evals/` — `npm test` (offline, free) and `npm run eval` (live model).

## Local development

```sh
npm install
npm test                 # offline checks, no API key needed
npm run start:mock       # dev server with zero-cost keyword mock
ANTHROPIC_API_KEY=... npm start      # dev server with the real model
ANTHROPIC_API_KEY=... npm run eval   # live eval suite (~a few cents)
```

POST http://localhost:3999/chat with `{"message": "...", "history": [...]}`.

## Deploy (manual, like the other cloud functions)

1. `npm install --omit=dev`, zip the folder contents (including
   `node_modules/`), upload to a Lambda (nodejs20.x), handler
   `lambda.handler`.
2. Env vars: `ANTHROPIC_API_KEY`, `ALLOWED_ORIGIN=https://mindapps.org`.
3. API Gateway HTTP API: `POST /chat` → this Lambda; enable throttling
   (suggested: 5 rps rate, 10 burst) — this is the primary abuse control.
4. Budget kill switch: CloudWatch alarm on Lambda invocation count (and/or
   Anthropic console spend limit on a dedicated API key for this function).
5. Point the frontend's assistant endpoint config at the API Gateway URL.
