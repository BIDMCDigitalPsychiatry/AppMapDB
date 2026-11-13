import { describe, expect, it, vi } from 'vitest';
import { StudyTracker } from './tracker';
import { diffFilters } from './hooks';
import { displayStatus, eventsCsv, runsCsv, sortRuns, summarizeByWorkflow, toCsv, transcriptCsv, transcriptsByRun, ABANDONED_AFTER_MS } from './report';
import { CODEBOOK } from './codebook';
import type { StudyEvent, StudyRun } from './api';

const memoryStorage = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } as any as Storage;
};

describe('StudyTracker', () => {
  it('records nothing until a trial starts', () => {
    const send = vi.fn().mockResolvedValue({ ok: true });
    const tr = new StudyTracker(send, memoryStorage());
    tr.track('filter_check', { value: 'Sleep' });
    expect(tr.pending()).toEqual([]);
    expect(tr.isActive()).toBe(false);
  });

  it('numbers events, sends them, and finishes with the answers and the Stop time', async () => {
    const send = vi.fn().mockResolvedValue({ ok: true });
    const storage = memoryStorage();
    const tr = new StudyTracker(send, storage);
    const run = tr.start('Subject2@mind.org', { id: 'filters-only', label: 'Filters only' }, 'en');
    expect(run.email).toBe('subject2@mind.org');
    tr.track('filter_check', { category: 'Conditions', value: 'Sleep', ignored: undefined });
    expect(tr.pending().map(e => [e.seq, e.type])).toEqual([
      [0, 'run_start'],
      [1, 'filter_check']
    ]);
    expect(tr.pending()[1].data).toEqual({ category: 'Conditions', value: 'Sleep' });

    await tr.flush();
    expect(tr.pending()).toEqual([]);
    const first = send.mock.calls[send.mock.calls.length - 1][0];
    expect(first.run.email).toBeUndefined(); // the server takes the owner from the token
    expect(first.run.status).toBe('active');

    tr.pressStop();
    const stoppedAt = tr.getRun()!.stoppedAt!;
    await tr.stop({ found: 'yes', ease: 6, app: 'MindDoc' });
    const final = send.mock.calls[send.mock.calls.length - 1][0];
    expect(final.run).toMatchObject({ status: 'completed', ended: stoppedAt, answers: { found: 'yes', ease: 6, app: 'MindDoc' } });
    expect(final.events.map((e: any) => e.type)).toEqual(['run_stop_pressed', 'run_stop']);
    expect(tr.isActive()).toBe(false);
    expect(storage.getItem('mindapps-study-run')).toBeNull();
  });

  it('keeps unsent events when the network fails, and survives a reload', async () => {
    const send = vi.fn().mockRejectedValue(new Error('offline'));
    const storage = memoryStorage();
    const tr = new StudyTracker(send, storage);
    tr.start('a@mind.org', { id: 'free', label: 'Free exploration' });
    await tr.flush();
    expect(tr.pending()).toHaveLength(1);

    const reloaded = new StudyTracker(vi.fn().mockResolvedValue({ ok: true }), storage);
    expect(reloaded.getRun()?.workflowId).toBe('free');
    reloaded.resume('A@mind.org');
    expect(reloaded.pending().map(e => e.type)).toEqual(['run_start', 'run_resume']);
    expect(reloaded.pending()[1].seq).toBe(1);
  });

  it("doesn't pick up another account's run", () => {
    const storage = memoryStorage();
    const tr = new StudyTracker(vi.fn().mockResolvedValue({}), storage);
    tr.start('a@mind.org', { id: 'free', label: 'Free' });
    const other = new StudyTracker(vi.fn().mockResolvedValue({}), storage);
    other.resume('b@mind.org');
    expect(other.pending().map(e => e.type)).toEqual(['run_start']);
  });

  it('labels filter changes by where they came from', () => {
    const tr = new StudyTracker(vi.fn().mockResolvedValue({}), memoryStorage());
    expect(tr.currentFilterSource()).toBe('manual');
    tr.markFilterSource('assistant', 1000);
    expect(tr.currentFilterSource()).toBe('assistant');
    tr.markFilterSource('reset', -1);
    expect(tr.currentFilterSource()).toBe('manual');
  });

  it('undoing Stop keeps the clock running', () => {
    const tr = new StudyTracker(vi.fn().mockResolvedValue({}), memoryStorage());
    tr.start('a@mind.org', { id: 'free', label: 'Free' });
    tr.pressStop();
    expect(tr.getRun()?.stoppedAt).toBeDefined();
    tr.undoStop();
    expect(tr.getRun()?.stoppedAt).toBeUndefined();
    expect(tr.pending().map(e => e.type)).toEqual(['run_start', 'run_stop_pressed', 'run_stop_undone']);
  });
});

describe('diffFilters', () => {
  it('finds checked and unchecked tags per category', () => {
    expect(diffFilters({ Conditions: ['Sleep', 'PTSD'] }, { Conditions: ['Sleep'], Cost: ['Totally Free'] })).toEqual({
      checked: [{ category: 'Cost', value: 'Totally Free' }],
      unchecked: [{ category: 'Conditions', value: 'PTSD' }]
    });
    expect(diffFilters({}, {})).toEqual({ checked: [], unchecked: [] });
  });
});

const NOW = 1_800_000_000_000;
const run = (over: Partial<StudyRun>): StudyRun => ({ _id: 'r', email: 'a@mind.org', workflowId: 'filters-only', workflowLabel: 'Filters only', started: NOW - 600000, status: 'completed', ...over });

describe('report', () => {
  it('derives abandoned runs from inactivity', () => {
    expect(displayStatus(run({ status: 'active', lastEventAt: NOW - 1000 }), NOW)).toBe('in progress');
    expect(displayStatus(run({ status: 'active', lastEventAt: NOW - ABANDONED_AFTER_MS - 1 }), NOW)).toBe('abandoned');
    expect(displayStatus(run({ status: 'cancelled' }), NOW)).toBe('cancelled');
  });

  it('summarizes by task using completed runs for timings', () => {
    const summary = (durationMs: number, extra = {}) => ({ durationMs, assistantTurns: 0, filterChecks: 2, ...extra }) as any;
    const rows = summarizeByWorkflow(
      [
        run({ _id: '1', summary: summary(60000), answers: { found: 'yes', ease: 6 } }),
        run({ _id: '2', summary: summary(120000), answers: { found: 'no', ease: 2 } }),
        run({ _id: '3', summary: summary(180000), answers: { found: 'yes', ease: 7 } }),
        run({ _id: '4', status: 'cancelled' }),
        run({ _id: '5', status: 'active', lastEventAt: NOW }),
        run({ _id: '6', workflowId: 'assistant-only', workflowLabel: 'Assistant only', summary: summary(30000, { assistantTurns: 2, assistantWaitMs: 4000 }) })
      ],
      NOW
    );
    const f = rows.find(r => r.workflowId === 'filters-only')!;
    expect(f).toMatchObject({ runs: 5, completed: 3, cancelled: 1, abandoned: 0, medianDurationMs: 120000, meanFilterChecks: 2 });
    expect(f.completionRate).toBeCloseTo(3 / 4); // the in-progress run isn't counted either way
    expect(f.foundYesRate).toBeCloseTo(2 / 3);
    expect(f.meanEase).toBeCloseTo(5);
    const a = rows.find(r => r.workflowId === 'assistant-only')!;
    expect(a.meanAssistantTurns).toBe(2);
    expect(a.meanAssistantWaitMs).toBe(2000);
  });

  it('writes CSV that spreadsheets read correctly', () => {
    expect(toCsv(['a', 'b'], [['x, y', 'say "hi"\nthere']])).toBe('a,b\r\n"x, y","say ""hi""\nthere"\r\n');
    const csv = runsCsv([run({ _id: 'r1', summary: { durationMs: 61500, assistantFinalFilters: { Conditions: ['Sleep'], Cost: ['Totally Free'] } } as any })], NOW);
    const [header, line] = csv.trim().split('\r\n');
    const cols = header.split(',');
    const values = line.split(',');
    expect(values[cols.indexOf('duration_s')]).toBe('61.5');
    expect(values[cols.indexOf('assistant_final_tags')]).toBe('Sleep; Totally Free');
    const ev = eventsCsv([{ runId: 'r1', seq: 0, type: 'filter_check', t: NOW, elapsedMs: 1500, data: { category: 'Cost', value: 'Totally Free', source: 'manual', activeFilters: 1 } }], [run({ _id: 'r1' })]);
    expect(ev).toContain('r1,a@mind.org,filters-only,0,');
    expect(ev).toContain('filter_check,,Cost,Totally Free,manual,,,"{""activeFilters"":1}"');
  });
});

describe('assistant transcript CSV', () => {
  it('lists each message in order with who said it', () => {
    const events: StudyEvent[] = [
      { runId: 'r1', seq: 3, type: 'assistant_reply', t: NOW + 3000, elapsedMs: 3000, data: { turn: 1, text: 'Here are free apps.', type: 'filters', latencyMs: 1200, filters: { Cost: ['Totally Free'] } } },
      { runId: 'r1', seq: 1, type: 'filter_check', t: NOW + 500, elapsedMs: 500, data: { category: 'Cost', value: 'Totally Free' } },
      { runId: 'r1', seq: 2, type: 'assistant_message', t: NOW + 1000, elapsedMs: 1000, data: { turn: 1, text: 'free apps please' } },
      { runId: 'r1', seq: 4, type: 'assistant_reply', t: NOW + 5000, elapsedMs: 5000, data: { turn: 2, type: 'network_error', latencyMs: 900 } }
    ];
    const lines = transcriptCsv(events, [run({ _id: 'r1' })]).trim().split('\r\n');
    expect(lines).toHaveLength(4); // header + 3 messages; the filter click is not part of the transcript
    expect(lines[1]).toContain(',Participant,free apps please,');
    expect(lines[2]).toContain(',AI search assistant,Here are free apps.,filters,1.2,Cost: Totally Free');
    expect(lines[3]).toContain('(no reply: network_error)');
  });

  it('puts the whole conversation in one Runs CSV cell per trial', () => {
    const events: StudyEvent[] = [
      { runId: 'r1', seq: 5, type: 'assistant_reply', t: NOW, elapsedMs: 0, data: { turn: 1, text: 'Try "Calm".', type: 'filters' } },
      { runId: 'r1', seq: 2, type: 'assistant_message', t: NOW, elapsedMs: 0, data: { turn: 1, text: 'sleep apps, free' } },
      { runId: 'r1', seq: 7, type: 'assistant_new_chat', t: NOW, elapsedMs: 0, data: {} },
      { runId: 'r2', seq: 1, type: 'filter_check', t: NOW, elapsedMs: 0, data: {} }
    ];
    const tr = transcriptsByRun(events);
    expect(tr.get('r1')).toBe('Participant: sleep apps, free\nAI search assistant: Try "Calm".\n[New chat]');
    expect(tr.has('r2')).toBe(false);
    const csv = runsCsv([run({ _id: 'r1' }), run({ _id: 'r2' })], NOW, tr);
    expect(csv).toContain('"Participant: sleep apps, free\nAI search assistant: Try ""Calm"".\n[New chat]"');
    expect(csv.split('\r\n')).toHaveLength(4); // header + 2 runs + trailing newline: the multi-line cell stays inside its quotes
  });
});

describe('study tasks', () => {
  it('underline a phrase that appears in each task, in every language', async () => {
    const { STUDY_WORKFLOWS } = await import('./workflows');
    const fr = (await import('../locales/fr.json')).default as Record<string, string>;
    const de = (await import('../locales/de.json')).default as Record<string, string>;
    expect(STUDY_WORKFLOWS.map(w => w.id)).toEqual(['filters-only', 'assistant-only']);
    for (const w of STUDY_WORKFLOWS) {
      expect(w.task).toContain(w.emphasis);
      for (const dict of [fr, de]) expect(dict[w.task]).toContain(dict[w.emphasis]);
    }
  });
});

describe('runs sorting', () => {
  const rs = [
    run({ _id: 'a', email: 'subject10@mind.org', started: NOW - 3000, summary: { durationMs: 5000 } as any }),
    run({ _id: 'b', email: 'subject2@mind.org', started: NOW - 1000, workflowId: 'assistant-only', workflowLabel: 'AI search assistant only' }),
    run({ _id: 'c', email: 'subject2@mind.org', started: NOW - 2000, summary: { durationMs: 9000 } as any })
  ];
  it('sorts by date, groups by account / task, and by duration', () => {
    expect(sortRuns(rs, 'newest', NOW).map(r => r._id)).toEqual(['b', 'c', 'a']);
    expect(sortRuns(rs, 'oldest', NOW).map(r => r._id)).toEqual(['a', 'c', 'b']);
    expect(sortRuns(rs, 'account', NOW).map(r => r._id)).toEqual(['b', 'c', 'a']); // subject2 before subject10, newest first within
    expect(sortRuns(rs, 'task', NOW).map(r => r._id)).toEqual(['b', 'c', 'a']);
    expect(sortRuns(rs, 'longest', NOW).map(r => r._id)).toEqual(['c', 'a', 'b']);
  });
});

describe('codebook', () => {
  const names = () => new Set(CODEBOOK.flatMap(e => e.name.split(/,\s*|\s*\/\s*/)));
  it('defines every column of every CSV export', () => {
    const defined = names();
    const header = (csv: string) => csv.split('\r\n')[0].split(',');
    const cols = [
      ...header(runsCsv([run({})], NOW)),
      ...header(eventsCsv([], [])),
      ...header(transcriptCsv([], []))
    ];
    expect(cols.filter(c => !defined.has(c))).toEqual([]);
  });

  it('defines every event type the server accepts', async () => {
    const { EVENT_TYPES } = await import('../../cloud_functions/mindapps-write-api/study.js');
    const defined = names();
    expect(Array.from(EVENT_TYPES as Set<string>).filter(t => !defined.has(t))).toEqual([]);
  });
});
