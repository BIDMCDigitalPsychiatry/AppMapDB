/*
 * Admin > Study Analytics renders real-shaped data: the per-task summary,
 * the runs list, and a run's timeline with the assistant transcript.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { vi, it, expect } from 'vitest';

const NOW = Date.now();
const runs = [
  {
    _id: 'run_a',
    email: 'subject2@mind.org',
    workflowId: 'assistant-only',
    workflowLabel: 'Search assistant only',
    started: NOW - 300000,
    ended: NOW - 200000,
    status: 'completed',
    language: 'en',
    device: 'desktop',
    answers: { found: 'yes', app: 'MindDoc', ease: 6, suggestions: 'Loved it' },
    summary: {
      durationMs: 100000,
      timeToFirstAppMs: 60000,
      assistantTurns: 1,
      assistantMessages: 1,
      assistantTypingMs: 8000,
      assistantWaitMs: 2500,
      assistantFinalFilters: { Conditions: ['Mood Disorders'] },
      filterChecks: 1,
      filterUnchecks: 0,
      filterChecksByAssistant: 1,
      filterHovers: 0,
      filterHoverMs: 0,
      filterClears: 0,
      filterResets: 0,
      filterGroupToggles: 0,
      filterPanelToggles: 0,
      scrollFiltersMs: 0,
      scrollLibraryMs: 4000,
      appOpens: 1,
      appCardExpands: 0,
      events: 6
    }
  },
  { _id: 'run_b', email: 'subject3@mind.org', workflowId: 'filters-only', workflowLabel: 'Filters only', started: NOW - 7200000, status: 'active', lastEventAt: NOW - 7000000 }
];
const events = [
  { runId: 'run_a', seq: 0, type: 'run_start', t: NOW - 300000, elapsedMs: 0, data: { language: 'en' } },
  { runId: 'run_a', seq: 1, type: 'assistant_message', t: NOW - 290000, elapsedMs: 10000, data: { turn: 1, words: 6, typingMs: 8000, text: 'free app for depression on android' } },
  { runId: 'run_a', seq: 2, type: 'assistant_reply', t: NOW - 287500, elapsedMs: 12500, data: { turn: 1, latencyMs: 2500, applied: true, filters: { Conditions: ['Mood Disorders'] }, text: 'I set 1 filter for you.' } },
  { runId: 'run_a', seq: 3, type: 'scroll', t: NOW - 280000, elapsedMs: 20000, data: { area: 'library', durationMs: 4000, scrollTop: 900 } },
  { runId: 'run_a', seq: 4, type: 'app_open', t: NOW - 240000, elapsedMs: 60000, data: { name: 'MindDoc', from: 'ApplicationGrid' } },
  { runId: 'run_a', seq: 5, type: 'run_stop', t: NOW - 200000, elapsedMs: 100000, data: { found: 'yes', ease: 6 } }
];

vi.mock('../../../study/api', () => ({
  listStudyRuns: vi.fn(async () => runs),
  getRunEvents: vi.fn(async () => events),
  exportStudyEvents: vi.fn(async () => events)
}));
// Stable like the real dispatch — a new function per render would re-trigger the page's load effect forever.
const dispatch = () => undefined;
vi.mock('react-redux', async orig => ({ ...((await orig()) as any), useDispatch: () => dispatch }));

it('shows the summary, the runs and a run timeline', async () => {
  const { default: StudyAnalytics } = await import('./StudyAnalytics');
  const div = document.createElement('div');
  document.body.appendChild(div);
  const root = createRoot(div);
  await act(async () => {
    root.render(<StudyAnalytics height={800} />);
    await new Promise(r => setTimeout(r, 50));
  });
  const text = document.body.textContent ?? '';
  expect(text).toContain('Search assistant only');
  expect(text).toContain('subject2@mind.org');
  expect(text).toContain('abandoned'); // run_b: active but silent for ~2h
  expect(text).toContain('1:40'); // 100 s
  expect(text).toContain('MindDoc');

  const row = Array.from(div.querySelectorAll('tr')).find(tr => tr.textContent?.includes('subject2@mind.org'))!;
  await act(async () => {
    row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));
  });
  const dialog = document.body.textContent ?? '';
  expect(dialog).toContain('Assistant transcript');
  expect(dialog).toContain('free app for depression on android');
  expect(dialog).toContain('I set 1 filter for you.');
  expect(dialog).toContain('2.5s wait · applied 1 filter');
  expect(dialog).toContain('Loved it');
  act(() => root.unmount());
  div.remove();
}, 120000); // first import of the MUI icon set is slow
