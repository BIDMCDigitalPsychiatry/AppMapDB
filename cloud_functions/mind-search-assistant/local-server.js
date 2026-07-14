/**
 * Local dev server for the search assistant — the same handler the Lambda
 * will run, behind a plain HTTP server so the frontend can talk to it at
 * http://localhost:3999 during development.
 *
 *   node local-server.js          # real model if ANTHROPIC_API_KEY is set, else mock
 *   node local-server.js --mock   # force the zero-cost keyword mock
 */
const http = require('http');
const { handleChat, handleFilterEvent } = require('./handler');
const { mockClient } = require('./mock');

const PORT = process.env.PORT || 3999;
const forceMock = process.argv.includes('--mock');
const useMock = forceMock || !process.env.ANTHROPIC_API_KEY;
const opts = useMock ? { client: mockClient } : {};

const STATUS_BY_TYPE = { bad_request: 400, error: 502 };

const server = http.createServer((req, res) => {
  // Local dev only — the production CORS policy lives on API Gateway.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.writeHead(204).end();
  if (req.method === 'GET' && req.url === '/health') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, mode: useMock ? 'mock' : 'live' }));
  }
  if (req.method !== 'POST' || (req.url !== '/chat' && req.url !== '/event')) return res.writeHead(404).end();
  const isEvent = req.url === '/event';

  let raw = '';
  req.on('data', chunk => {
    raw += chunk;
    if (raw.length > 20_000) req.destroy();
  });
  req.on('end', async () => {
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ type: 'bad_request', error: 'Invalid JSON' }));
    }
    try {
      const result = isEvent ? await handleFilterEvent(body) : await handleChat(body, opts);
      res.writeHead(STATUS_BY_TYPE[result.type] || 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ type: 'error', error: 'Internal error' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`mind-search-assistant local server on http://localhost:${PORT} (${useMock ? 'MOCK — no tokens spent' : 'LIVE model'})`);
});
