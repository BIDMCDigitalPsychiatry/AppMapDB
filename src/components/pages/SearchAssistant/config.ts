// Endpoint for the mind-search-assistant chat backend
// (cloud_functions/mind-search-assistant). In development it defaults to the
// local dev server (`npm run start:mock` or `npm start` in that folder). In
// production it must be set explicitly (REACT_APP_ASSISTANT_URL at build
// time, pointing at the API Gateway URL) — until then the assistant FAB
// simply doesn't render, so shipping this code is safe before the AWS
// wiring exists.
export const ASSISTANT_ENDPOINT =
  process.env.REACT_APP_ASSISTANT_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3999/chat' : '');

export const assistantEnabled = ASSISTANT_ENDPOINT !== '';

// Client-side copies of the server caps in cloud_functions/mind-search-assistant/validate.js
export const MAX_MESSAGE_CHARS = 500;
export const MAX_HISTORY_TURNS = 8;

// Gentle per-visit ceiling so the widget can't be farmed from the UI. The
// server-side rate limits are the real control; this just keeps honest
// sessions bounded.
export const MAX_USER_TURNS = 10;
