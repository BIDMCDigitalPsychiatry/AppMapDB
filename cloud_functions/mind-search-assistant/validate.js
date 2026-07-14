const crypto = require('crypto');
const taxonomy = require('./taxonomy.json');

// Server-enforced input caps — the client enforces the same limits for UX,
// but these are the ones that matter (anyone can curl the endpoint).
const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY_TURNS = 8; // total entries (user + assistant)
const MAX_HISTORY_ENTRY_CHARS = 1000;
const MAX_REPLY_CHARS = 600;

/**
 * Validates the raw request body. Returns { message, history } on success or
 * { error } on failure. History entries are coerced to plain
 * { role, content } text pairs — nothing else from the client is trusted.
 */
// The client's pseudonymous id is untrusted input like everything else: we
// re-hash it server-side so that whatever the browser sends, what reaches
// Anthropic is a fixed-length opaque hex string and never anything that
// could carry PII (an email, a raw fingerprint, an injected payload).
const hashUserId = clientId => {
  if (typeof clientId !== 'string' || clientId.length === 0 || clientId.length > 200) return undefined;
  return crypto.createHash('sha256').update(`mindapps-assistant:${clientId}`).digest('hex').slice(0, 40);
};

function validateRequest(body) {
  if (!body || typeof body !== 'object') return { error: 'Invalid request body' };
  const { message, history, currentFilters, clientId } = body;
  if (typeof message !== 'string' || message.trim().length === 0) return { error: 'message is required' };
  if (message.length > MAX_MESSAGE_CHARS) return { error: `message exceeds ${MAX_MESSAGE_CHARS} characters` };

  const cleanHistory = [];
  if (Array.isArray(history)) {
    for (const entry of history.slice(-MAX_HISTORY_TURNS)) {
      if (!entry || typeof entry !== 'object') continue;
      const role = entry.role === 'assistant' ? 'assistant' : 'user';
      if (typeof entry.content !== 'string' || entry.content.length === 0) continue;
      cleanHistory.push({ role, content: entry.content.slice(0, MAX_HISTORY_ENTRY_CHARS) });
    }
  }
  // The live filter state (the user may have edited it by hand between turns),
  // whitelisted like any other client input.
  return {
    message: message.trim(),
    history: cleanHistory,
    currentFilters: validateFilters(currentFilters),
    userId: hashUserId(clientId)
  };
}

// Rendered into the user turn — never the cached system prefix, since it
// changes every request.
const describeCurrentFilters = filters => {
  const entries = Object.entries(filters || {}).filter(([, v]) => v.length > 0);
  if (entries.length === 0) return 'Currently applied filters: none';
  return `Currently applied filters: ${entries.map(([cat, vals]) => `${cat} = ${vals.join(', ')}`).join('; ')}`;
};

/**
 * Whitelists model-proposed filters against the real taxonomy. Anything the
 * model invents — a category not in the taxonomy, a value not in that
 * category's enum — is silently dropped. Returns only non-empty categories.
 */
// Values within a category AND together, so a burst of many values in one
// category guarantees zero results. The prompt asks for one value per
// category; if the model degenerately emits more than this many anyway,
// dropping the whole category (unfiltered) beats an empty result set.
const MAX_VALUES_PER_CATEGORY = 3;

function validateFilters(rawFilters) {
  const clean = {};
  if (!rawFilters || typeof rawFilters !== 'object') return clean;
  for (const [category, allowed] of Object.entries(taxonomy)) {
    const proposed = rawFilters[category];
    if (!Array.isArray(proposed)) continue;
    const allowedSet = new Set(allowed);
    let values = [...new Set(proposed.filter(v => allowedSet.has(v)))];
    // "Totally Free" is deliberately sparing (product decision): if the model
    // hedges with both free tags, keep only the broad one.
    if (category === 'Cost' && values.includes('Totally Free') && values.includes('Free to Download')) {
      values = values.filter(v => v !== 'Totally Free');
    }
    if (values.length === 0 || values.length > MAX_VALUES_PER_CATEGORY) continue;
    clean[category] = values;
  }
  return clean;
}

const truncateReply = reply => (typeof reply === 'string' ? reply.slice(0, MAX_REPLY_CHARS) : '');

module.exports = { validateRequest, validateFilters, describeCurrentFilters, hashUserId, truncateReply, MAX_MESSAGE_CHARS, MAX_HISTORY_TURNS };
