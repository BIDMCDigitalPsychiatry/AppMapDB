/*
 * Workflow Analytics validation + summary tests (see study.js). Pins: the
 * payload is bounded (unknown event types dropped, strings capped, owner
 * taken from the token), an ended run never reopens, and the per-run numbers
 * the Admin page shows are computed correctly.
 */
import { sanitizeRecord, mergeRun, summarizeRun, median, MAX_EVENTS_PER_BATCH } from './study';

const T0 = 1_800_000_000_000;
const run = (over = {}) => ({ runId: 'run_abcdef12', workflowId: 'filters-only', started: T0, status: 'active', ...over });
const ev = (seq, type, dt, data = undefined) => ({ seq, type, t: T0 + dt, data });

describe('sanitizeRecord', () => {
  it('takes the owner from the token and ignores one in the payload', () => {
    const r = sanitizeRecord({ run: run({ email: 'someone@else.org' }), events: [] }, 'subject2@mind.org');
    expect(r.run.email).toBe('subject2@mind.org');
  });

  it('rejects bad run ids and missing start times', () => {
    expect(sanitizeRecord({ run: run({ runId: 'x' }) }, 'a@b.c').error).toBeDefined();
    expect(sanitizeRecord({ run: run({ runId: '../../etc' }) }, 'a@b.c').error).toBeDefined();
    expect(sanitizeRecord({ run: run({ started: undefined }) }, 'a@b.c').error).toBeDefined();
    expect(sanitizeRecord({}, 'a@b.c').error).toBeDefined();
  });

  it('drops unknown event types and malformed events, keeps the rest', () => {
    const r = sanitizeRecord(
      { run: run(), events: [ev(0, 'run_start', 0), ev(1, 'not_a_type', 5), { seq: 'x', type: 'scroll', t: T0 }, ev(2, 'filter_check', 1000, { value: 'Sleep' })] },
      'a@b.c'
    );
    expect(r.events.map(e => e.type)).toEqual(['run_start', 'filter_check']);
    expect(r.events[1].elapsedMs).toBe(1000);
    expect(r.events[1].runId).toBe('run_abcdef12');
  });

  it('caps batch size, transcript length and nested data', () => {
    const many = Array.from({ length: MAX_EVENTS_PER_BATCH + 1 }, (_, i) => ev(i, 'scroll', i));
    expect(sanitizeRecord({ run: run(), events: many }, 'a@b.c').error).toBeDefined();
    const long = 'x'.repeat(10000);
    const r = sanitizeRecord(
      { run: run(), events: [ev(0, 'assistant_message', 1, { text: long, label: long, deep: { a: { b: 1 } }, filters: { Conditions: ['Sleep', 3] } })] },
      'a@b.c'
    );
    const d = r.events[0].data;
    expect(d.text.length).toBe(4000);
    expect(d.label.length).toBe(300);
    expect(d.deep).toEqual({ a: undefined });
    expect(d.filters).toEqual({ Conditions: ['Sleep'] });
  });

  it('keeps answers only on a completed run and validates them', () => {
    const answers = { found: 'yes', app: 'MindDoc', ease: 5, suggestions: 'More filters' };
    expect(sanitizeRecord({ run: run({ status: 'completed', ended: T0 + 1, answers }) }, 'a@b.c').run.answers).toEqual(answers);
    expect(sanitizeRecord({ run: run({ status: 'active', answers }) }, 'a@b.c').run.answers).toBeUndefined();
    const bad = sanitizeRecord({ run: run({ status: 'completed', ended: T0 + 1, answers: { found: 'maybe', ease: 9 } }) }, 'a@b.c').run.answers;
    expect(bad.found).toBeUndefined();
    expect(bad.ease).toBeUndefined();
  });
});

describe('mergeRun', () => {
  it('never reopens an ended run', () => {
    const done = { _id: 'r', status: 'completed', ended: T0 + 50, answers: { ease: 6 }, lastEventAt: T0 + 50 };
    const merged = mergeRun(done, { _id: 'r', status: 'active', lastEventAt: T0 + 60 });
    expect(merged.status).toBe('completed');
    expect(merged.answers).toEqual({ ease: 6 });
    expect(merged.lastEventAt).toBe(T0 + 60);
  });

  it('applies a stop to an active run without losing stored fields', () => {
    const active = { _id: 'r', status: 'active', workflowLabel: 'Filters only', language: 'en' };
    const merged = mergeRun(active, { _id: 'r', status: 'completed', ended: T0 + 9, language: undefined });
    expect(merged.status).toBe('completed');
    expect(merged.language).toBe('en');
    expect(merged.workflowLabel).toBe('Filters only');
  });
});

describe('summarizeRun', () => {
  it('computes the per-run numbers', () => {
    const events = [
      ev(0, 'run_start', 0),
      ev(1, 'assistant_open', 2000),
      ev(2, 'assistant_message', 10000, { typingMs: 6000, turn: 1 }),
      ev(3, 'assistant_reply', 12500, { latencyMs: 2500, applied: true, filters: { Conditions: ['Sleep'] } }),
      ev(4, 'filter_check', 12600, { source: 'assistant', category: 'Conditions', value: 'Sleep' }),
      ev(5, 'filter_check', 20000, { source: 'manual', category: 'Cost', value: 'Totally Free' }),
      ev(6, 'filter_uncheck', 25000, { source: 'manual', category: 'Cost', value: 'Totally Free' }),
      ev(7, 'filter_hover', 26000, { durationMs: 800 }),
      ev(8, 'filter_hover', 27000, { durationMs: 400 }),
      ev(9, 'scroll', 28000, { area: 'filters', durationMs: 1200 }),
      ev(10, 'scroll', 29000, { area: 'library', durationMs: 3000 }),
      ev(11, 'scroll', 33000, { area: 'library', durationMs: 500 }),
      ev(12, 'filter_reset', 34000),
      ev(13, 'app_open', 40000, { appId: 'a1' }),
      ev(14, 'run_stop', 60000)
    ];
    const s = summarizeRun({ started: T0, ended: T0 + 60000 }, events.reverse());
    expect(s).toMatchObject({
      durationMs: 60000,
      timeToFirstActionMs: 10000,
      timeToFirstAppMs: 40000,
      assistantTurns: 1,
      assistantTypingMs: 6000,
      assistantWaitMs: 2500,
      assistantFinalFilters: { Conditions: ['Sleep'] },
      filterChecks: 2,
      filterChecksByAssistant: 1,
      filterUnchecks: 1,
      filterHovers: 2,
      filterHoverMs: 1200,
      filterResets: 1,
      filterClears: 0,
      scrollFiltersMs: 1200,
      scrollLibraryMs: 3500,
      appOpens: 1,
      events: 15
    });
  });

  it('handles a run with no events', () => {
    const s = summarizeRun({ started: T0 }, []);
    expect(s.durationMs).toBe(0);
    expect(s.assistantTurns).toBe(0);
    expect(s.timeToFirstAppMs).toBeUndefined();
  });
});

it('median', () => {
  expect(median([])).toBeUndefined();
  expect(median([5, 1, 3])).toBe(3);
  expect(median([4, 1, 3, 2])).toBe(2.5);
});
