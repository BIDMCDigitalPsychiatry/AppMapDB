const Anthropic = require('@anthropic-ai/sdk');
const { isTier1Crisis, isTier2Sensitive, CRISIS_MESSAGE, RESOURCES_FOOTER } = require('./crisis');
const { validateRequest, validateFilters, describeCurrentFilters, hashUserId, truncateReply } = require('./validate');
const { searchFiltersTool } = require('./toolSchema');
const { SYSTEM_PROMPT } = require('./prompt');
const { recordUsage, recordFilterUsage } = require('./metrics');

// Cheap model by explicit product requirement — this endpoint is public and
// unauthenticated, so per-message cost is the abuse ceiling.
const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 1000;

let defaultClient;
const getClient = () => (defaultClient = defaultClient || new Anthropic());

/**
 * The whole brain of the assistant, independent of any AWS wiring.
 *   handleChat({message, history}) -> one of:
 *     { type: 'crisis',  reply }                    — deterministic, no LLM call
 *     { type: 'filters', reply, filters }           — filters validated against taxonomy
 *     { type: 'bad_request', error }                — caller sent garbage (HTTP 400)
 *     { type: 'error', error, retryable }           — upstream failure (HTTP 502/429)
 *
 * opts.client lets tests/evals inject a mock or custom Anthropic client.
 */
async function handleChat(body, opts = {}) {
  const validated = validateRequest(body);
  if (validated.error) return { type: 'bad_request', error: validated.error };
  const { message, history, currentFilters, userId } = validated;
  // Counts-only usage metrics (see metrics.js). `turn` is derived from the
  // history length rather than trusted from the client.
  const usage = { conversationId: body.conversationId, turn: Math.floor(history.length / 2) + 1, userIdHash: userId };

  // Deterministic short-circuit: a person in crisis never waits on an LLM.
  //
  // Nothing is recorded on this path, deliberately. Even a counts-only row
  // would be a record that a person in crisis was here, which is exactly the
  // sensitive fact we have chosen not to retain. Usage metrics undercount
  // slightly as a result; that is the correct trade.
  if (isTier1Crisis(message)) return { type: 'crisis', reply: CRISIS_MESSAGE };

  const client = opts.client || getClient();

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Pseudonymous per-browser id (sha256 of a random client-generated
      // value — never PII). Gives Anthropic's abuse tooling a per-user handle,
      // so enforcement against one abusive visitor is scoped to that visitor
      // instead of to our API key / organization.
      ...(userId ? { metadata: { user_id: userId } } : {}),
      // cache_control on the static system prompt; tools render before
      // system, so this breakpoint caches both together. (Haiku 4.5's
      // minimum cacheable prefix is 4096 tokens — if the prompt is under
      // that, caching silently doesn't engage, which is fine.)
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      tools: [searchFiltersTool],
      tool_choice: { type: 'tool', name: 'set_search_filters' },
      // The live filter state rides on the user turn (never the cached system
      // prefix — it changes every request) so the model can carry filters
      // forward, remove one, or clear them all relative to what's really on
      // screen, including filters the user set by hand in the drawer.
      messages: [...history, { role: 'user', content: `${describeCurrentFilters(currentFilters)}\n\n${message}` }]
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return { type: 'error', error: 'Too many requests right now — please try again in a moment.', retryable: true };
    if (err instanceof Anthropic.APIError) return { type: 'error', error: 'The assistant is temporarily unavailable.', retryable: true };
    throw err;
  }

  const toolUse = response.content.find(block => block.type === 'tool_use' && block.name === 'set_search_filters');
  if (!toolUse) return { type: 'error', error: 'The assistant returned an unexpected response.', retryable: true };

  // Defense in depth: strict tool use already constrains output to the
  // taxonomy enums, but everything is re-whitelisted server-side anyway.
  const filters = validateFilters(toolUse.input.filters);
  let reply = truncateReply(toolUse.input.reply) || 'Here is what I found.';
  if (isTier2Sensitive(message)) reply += RESOURCES_FOOTER;

  // `apply` disambiguates an empty filter set: with apply=true it means
  // "clear the search" (the user asked to); with apply=false it means "this
  // message wasn't a search — leave the user's filters alone".
  //
  // On no_change the model tends to echo the current filters back; we drop
  // them so the payload can't be misread as something to apply. The only
  // filters that ever leave this function are ones meant to be applied.
  const apply = toolUse.input.intent === 'apply_filters';
  const applied = apply ? filters : {};

  await recordUsage({ ...usage, message, reply, filters: applied });

  return { type: 'filters', reply, filters: applied, apply };
}

/**
 * Records a manual (filter-drawer) search. No LLM call, no cost, no message
 * text — the client sends only which filter categories are active and how many
 * results came back. This is the control group the assistant is measured
 * against; see metrics.js.
 */
async function handleFilterEvent(body) {
  if (!body || typeof body !== 'object') return { type: 'bad_request', error: 'Invalid request body' };
  // validateFilters whitelists against the real taxonomy, so a forged request
  // can't inject junk categories into the research data.
  const filters = validateFilters(body.filters);
  await recordFilterUsage({
    conversationId: body.conversationId,
    filters,
    resultCount: body.resultCount,
    userIdHash: hashUserId(body.clientId)
  });
  return { type: 'ok' };
}

module.exports = { handleChat, handleFilterEvent, MODEL };
