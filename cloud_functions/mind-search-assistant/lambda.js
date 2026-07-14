/**
 * AWS Lambda adapter (API Gateway proxy integration). This file is the ONLY
 * AWS-specific code in the function — everything real lives in handler.js.
 *
 * Wiring still to be decided/configured in the AWS console (see README.md):
 *   - API Gateway route (POST /chat) + throttling (rate/burst limits)
 *   - ALLOWED_ORIGIN env var (lock CORS to https://mindapps.org)
 *   - ANTHROPIC_API_KEY env var (or Secrets Manager reference)
 *   - Daily budget kill switch (CloudWatch alarm on spend / invocation count)
 */
const { handleChat, handleFilterEvent } = require('./handler');

const STATUS_BY_TYPE = { bad_request: 400, error: 502 };

const routeOf = event => event.requestContext?.http?.path || event.rawPath || event.path || '';

exports.handler = async event => {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  const method = event.requestContext?.http?.method || event.httpMethod;
  if (method === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (method !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let body;
  try {
    body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ type: 'bad_request', error: 'Invalid JSON' }) };
  }

  try {
    // /event is the no-LLM analytics route (manual filter usage); everything
    // else is the chat endpoint.
    const result = routeOf(event).endsWith('/event') ? await handleFilterEvent(body) : await handleChat(body);
    return { statusCode: STATUS_BY_TYPE[result.type] || 200, headers, body: JSON.stringify(result) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ type: 'error', error: 'Internal error' }) };
  }
};
