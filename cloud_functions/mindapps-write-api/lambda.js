/**
 * AWS Lambda adapter (Function URL / API Gateway proxy). This file is the ONLY
 * AWS-event-specific code in the function — everything real lives in handler.js.
 * Mirrors the adapter pattern of cloud_functions/mind-search-assistant.
 *
 * Environment:
 *   ALLOWED_ORIGIN        lock CORS (e.g. https://mindapps.org); '*' for dev
 *   USER_POOL_ID          Cognito user pool (us-east-1_hXektTdUL)
 *   USER_POOL_CLIENT_ID   Cognito app client id
 *   USERS_TABLE           roster table name (users)
 *   FALLBACK_ADMINS / FALLBACK_TESTERS / FALLBACK_NOTIFY
 *                         comma-separated fallback lists (seeded from
 *                         package.json; retire once the users table is trusted)
 */
const { handleWrite } = require('./handler');

const STATUS_BY_TYPE = { bad_request: 400, unauthorized: 401, forbidden: 403, conflict: 409, error: 502 };

exports.handler = async event => {
  // Warmer ping (EventBridge schedule): keep a container warm so admin
  // actions never pay a cold start. Not an HTTP request — return immediately.
  if (event && event.ping) return { ok: true, warm: true };

  const origin = process.env.ALLOWED_ORIGIN || '*';
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  const auth = event.headers?.authorization || event.headers?.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

  try {
    const result = await handleWrite(token, body);
    return { statusCode: STATUS_BY_TYPE[result.type] || 200, headers, body: JSON.stringify(result) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ type: 'error', error: 'Internal error' }) };
  }
};
