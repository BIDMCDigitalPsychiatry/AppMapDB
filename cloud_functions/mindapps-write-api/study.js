/*
 * Workflow Analytics (MIND study) — pure helpers, no AWS calls.
 *
 * Study participants sign in with accounts carrying the `analytics` roster
 * role, press Start (choosing a task), use the site, then press Stop and
 * answer a few questions. The browser batches what they did into events and
 * sends them to the write API's `study` route; this module validates those
 * payloads and turns a run's events into the summary numbers shown on
 * Admin > Study Analytics.
 *
 * Tables: studyRuns (PK _id = runId) and studyEvents (PK runId, SK seq).
 */

const RUNS_TABLE = 'studyRuns';
const EVENTS_TABLE = 'studyEvents';

const MAX_EVENTS_PER_BATCH = 200;
const MAX_TEXT = 4000; // assistant transcripts: a user message is capped at 500 chars, replies are short
const MAX_STRING = 300;

// Every event type the browser may send. Anything else is dropped, so a
// typo in the client can't fill the table with junk.
const EVENT_TYPES = new Set([
  'run_start',
  'run_stop',
  'run_cancel',
  'run_resume',
  'run_stop_pressed',
  'run_stop_undone',
  'page_view',
  'filter_check',
  'filter_uncheck',
  'filter_hover',
  'filter_clear',
  'filter_reset',
  'filter_group_expand',
  'filter_group_collapse',
  'filter_panel_open',
  'filter_panel_close',
  'search_text',
  'scroll',
  'app_open',
  'app_card_expand',
  'app_card_collapse',
  'assistant_open',
  'assistant_close',
  'assistant_consent',
  'assistant_message',
  'assistant_reply',
  'assistant_new_chat',
  'language_change'
]);

const RUN_STATUSES = new Set(['active', 'completed', 'cancelled']);
const FOUND_VALUES = new Set(['yes', 'partly', 'no']);

const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const str = (v, max = MAX_STRING) => (typeof v === 'string' ? v.slice(0, max) : undefined);
const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

// Keep event data flat and bounded: strings trimmed, numbers kept, string
// arrays (filter tags) capped. Nested objects are only allowed one level down
// (the assistant's recommended filters: { category: [values] }).
const cleanData = (data, depth = 0) => {
  if (!isObj(data)) return undefined;
  const out = {};
  for (const [k, v] of Object.entries(data).slice(0, 30)) {
    if (!/^[A-Za-z0-9_]{1,40}$/.test(k)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, k === 'text' ? MAX_TEXT : MAX_STRING);
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
    else if (Array.isArray(v)) out[k] = v.filter(x => typeof x === 'string').slice(0, 100).map(x => x.slice(0, MAX_STRING));
    else if (isObj(v) && depth === 0) out[k] = cleanData(v, 1);
  }
  return out;
};

/**
 * Validates a `record` payload: { run: {...}, events: [...] }.
 * Returns { run, events } ready to store, or { error }.
 * `email` comes from the verified token, never from the payload.
 */
const sanitizeRecord = (payload, email) => {
  if (!isObj(payload) || !isObj(payload.run)) return { error: 'run is required' };
  const r = payload.run;
  const runId = str(r.runId, 64);
  if (!runId || !ID_RE.test(runId)) return { error: 'Invalid runId' };
  const status = RUN_STATUSES.has(r.status) ? r.status : 'active';
  const started = num(r.started);
  if (!started) return { error: 'run.started is required' };

  const run = {
    _id: runId,
    email,
    workflowId: str(r.workflowId, 60) || 'unknown',
    workflowLabel: str(r.workflowLabel, 200),
    started,
    status,
    language: str(r.language, 10),
    device: str(r.device, 20),
    userAgent: str(r.userAgent, 300),
    lastEventAt: num(r.lastEventAt)
  };
  if (status !== 'active') run.ended = num(r.ended) || Date.now();
  if (status === 'completed' && isObj(r.answers)) {
    const a = r.answers;
    run.answers = {
      found: FOUND_VALUES.has(a.found) ? a.found : undefined,
      app: str(a.app, 200),
      ease: Number.isInteger(a.ease) && a.ease >= 1 && a.ease <= 7 ? a.ease : undefined,
      suggestions: str(a.suggestions, 2000)
    };
  }

  const rawEvents = Array.isArray(payload.events) ? payload.events : [];
  if (rawEvents.length > MAX_EVENTS_PER_BATCH) return { error: `At most ${MAX_EVENTS_PER_BATCH} events per request` };
  const events = [];
  for (const e of rawEvents) {
    if (!isObj(e) || !EVENT_TYPES.has(e.type)) continue;
    const seq = e.seq;
    const t = num(e.t);
    if (!Number.isInteger(seq) || seq < 0 || !t) continue;
    events.push({
      runId,
      seq,
      type: e.type,
      t,
      elapsedMs: num(e.elapsedMs) ?? Math.max(0, t - started),
      path: str(e.path, 200),
      data: cleanData(e.data)
    });
  }
  return { run, events };
};

/**
 * Combines the stored run with an incoming update. An ended run stays ended:
 * a late "active" batch (a second tab, a retried request) only moves
 * lastEventAt forward and never drops the answers or the end time.
 */
const mergeRun = (existing, incoming) => {
  if (!existing) return { ...incoming };
  if (existing.status !== 'active' && incoming.status === 'active')
    return { ...existing, lastEventAt: Math.max(existing.lastEventAt ?? 0, incoming.lastEventAt ?? 0) || existing.lastEventAt };
  const merged = { ...existing, ...incoming };
  for (const k of Object.keys(incoming)) if (incoming[k] === undefined && existing[k] !== undefined) merged[k] = existing[k];
  return merged;
};

const median = values => {
  if (values.length === 0) return undefined;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

/**
 * Turns one run's events (any order) into the per-run numbers the Admin page
 * shows. Pure — also used by the browser for the CSV export.
 */
const summarizeRun = (run, events) => {
  const ev = [...events].sort((a, b) => a.seq - b.seq);
  const count = type => ev.filter(e => e.type === type).length;
  const sum = (type, field, pred = () => true) =>
    ev.filter(e => e.type === type && pred(e)).reduce((acc, e) => acc + (num(e.data?.[field]) ?? 0), 0);

  const messages = ev.filter(e => e.type === 'assistant_message');
  const replies = ev.filter(e => e.type === 'assistant_reply');
  const lastFilters = [...replies].reverse().find(e => e.data?.applied && isObj(e.data?.filters));
  const firstApp = ev.find(e => e.type === 'app_open');
  const firstAction = ev.find(e => ['filter_check', 'assistant_message', 'search_text'].includes(e.type));
  const end = run.ended ?? (ev.length ? ev[ev.length - 1].t : run.started);

  return {
    durationMs: Math.max(0, end - run.started),
    timeToFirstActionMs: firstAction ? firstAction.t - run.started : undefined,
    timeToFirstAppMs: firstApp ? firstApp.t - run.started : undefined,
    assistantTurns: Math.min(messages.length, replies.length),
    assistantMessages: messages.length,
    assistantTypingMs: sum('assistant_message', 'typingMs'),
    assistantWaitMs: sum('assistant_reply', 'latencyMs'),
    assistantFinalFilters: lastFilters ? lastFilters.data.filters : undefined,
    filterChecks: count('filter_check'),
    filterUnchecks: count('filter_uncheck'),
    filterChecksByAssistant: ev.filter(e => e.type === 'filter_check' && e.data?.source === 'assistant').length,
    filterHovers: count('filter_hover'),
    filterHoverMs: sum('filter_hover', 'durationMs'),
    filterClears: count('filter_clear'),
    filterResets: count('filter_reset'),
    filterGroupToggles: count('filter_group_expand') + count('filter_group_collapse'),
    filterPanelToggles: count('filter_panel_open') + count('filter_panel_close'),
    scrollFiltersMs: sum('scroll', 'durationMs', e => e.data?.area === 'filters'),
    scrollLibraryMs: sum('scroll', 'durationMs', e => e.data?.area === 'library'),
    appOpens: count('app_open'),
    appCardExpands: count('app_card_expand'),
    events: ev.length
  };
};

const MAX_NOTES = 4000; // admin notes on a run
const MAX_DELETE = 50; // runs per delete request (the browser sends bigger selections in chunks, to stay under the 30 s API limit)

module.exports = { RUNS_TABLE, EVENTS_TABLE, EVENT_TYPES, MAX_EVENTS_PER_BATCH, MAX_NOTES, MAX_DELETE, sanitizeRecord, mergeRun, summarizeRun, median, cleanData };
