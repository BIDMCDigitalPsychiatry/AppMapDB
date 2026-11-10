/*
 * Pure helpers for Admin > Study Analytics: run status, the summary table
 * by task, and the CSV exports. No React, no network — unit-tested.
 */
import type { StudyEvent, StudyRun } from './api';

// An "active" run that has heard nothing for this long was left open (tab
// closed, browser quit) — shown as abandoned, excluded from timing figures.
export const ABANDONED_AFTER_MS = 30 * 60 * 1000;

export type DisplayStatus = 'completed' | 'cancelled' | 'abandoned' | 'in progress';

export const displayStatus = (run: StudyRun, now = Date.now()): DisplayStatus => {
  if (run.status === 'completed') return 'completed';
  if (run.status === 'cancelled') return 'cancelled';
  const last = run.lastEventAt ?? run.started;
  return now - last > ABANDONED_AFTER_MS ? 'abandoned' : 'in progress';
};

const median = (values: number[]) => {
  if (values.length === 0) return undefined;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : undefined);

const defined = <T>(v: T | undefined): v is T => v !== undefined && v !== null && !(typeof v === 'number' && Number.isNaN(v));

export interface WorkflowRow {
  workflowId: string;
  workflowLabel: string;
  runs: number;
  completed: number;
  cancelled: number;
  abandoned: number;
  completionRate?: number;
  medianDurationMs?: number;
  meanDurationMs?: number;
  medianTimeToFirstAppMs?: number;
  foundYesRate?: number;
  meanEase?: number;
  meanAssistantTurns?: number;
  meanAssistantWaitMs?: number;
  meanFilterChecks?: number;
  meanFilterUnchecks?: number;
  meanFilterHovers?: number;
  meanScrollFiltersMs?: number;
  meanScrollLibraryMs?: number;
  meanAppOpens?: number;
}

/** One row per task. Timing and behaviour figures use completed runs only. */
export const summarizeByWorkflow = (runs: StudyRun[], now = Date.now()): WorkflowRow[] => {
  const groups = new Map<string, StudyRun[]>();
  runs.forEach(r => groups.set(r.workflowId, [...(groups.get(r.workflowId) ?? []), r]));
  return Array.from(groups.entries())
    .map(([workflowId, rs]) => {
      const status = rs.map(r => displayStatus(r, now));
      const done = rs.filter(r => r.status === 'completed');
      const s = (f: (r: StudyRun) => number | undefined) => done.map(f).filter(defined);
      const finished = status.filter(x => x !== 'in progress').length;
      const answeredFound = done.filter(r => r.answers?.found);
      return {
        workflowId,
        workflowLabel: rs.find(r => r.workflowLabel)?.workflowLabel ?? workflowId,
        runs: rs.length,
        completed: done.length,
        cancelled: status.filter(x => x === 'cancelled').length,
        abandoned: status.filter(x => x === 'abandoned').length,
        completionRate: finished ? done.length / finished : undefined,
        medianDurationMs: median(s(r => r.summary?.durationMs)),
        meanDurationMs: mean(s(r => r.summary?.durationMs)),
        medianTimeToFirstAppMs: median(s(r => r.summary?.timeToFirstAppMs)),
        foundYesRate: answeredFound.length ? answeredFound.filter(r => r.answers?.found === 'yes').length / answeredFound.length : undefined,
        meanEase: mean(s(r => r.answers?.ease)),
        meanAssistantTurns: mean(s(r => r.summary?.assistantTurns)),
        meanAssistantWaitMs: mean(s(r => (r.summary?.assistantTurns ? r.summary.assistantWaitMs / r.summary.assistantTurns : undefined))),
        meanFilterChecks: mean(s(r => r.summary?.filterChecks)),
        meanFilterUnchecks: mean(s(r => r.summary?.filterUnchecks)),
        meanFilterHovers: mean(s(r => r.summary?.filterHovers)),
        meanScrollFiltersMs: mean(s(r => r.summary?.scrollFiltersMs)),
        meanScrollLibraryMs: mean(s(r => r.summary?.scrollLibraryMs)),
        meanAppOpens: mean(s(r => r.summary?.appOpens))
      };
    })
    .sort((a, b) => b.runs - a.runs);
};

// ---- CSV
const cell = (v: any): string => {
  if (v === undefined || v === null) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (header: string[], rows: any[][]) => [header, ...rows].map(r => r.map(cell).join(',')).join('\r\n') + '\r\n';

const iso = (t?: number) => (t ? new Date(t).toISOString() : '');
const secs = (ms?: number) => (ms === undefined ? '' : (ms / 1000).toFixed(1));

export const runsCsv = (runs: StudyRun[], now = Date.now()) =>
  toCsv(
    [
      'run_id',
      'account',
      'task_id',
      'task',
      'status',
      'started_utc',
      'stopped_utc',
      'duration_s',
      'language',
      'device',
      'found',
      'app_chosen',
      'ease_1_7',
      'suggestions',
      'time_to_first_action_s',
      'time_to_first_app_s',
      'assistant_turns',
      'assistant_typing_s',
      'assistant_wait_s',
      'assistant_final_tags',
      'filter_checks',
      'filter_checks_by_assistant',
      'filter_unchecks',
      'filter_hovers',
      'filter_hover_s',
      'filter_clears',
      'filter_resets',
      'filter_group_toggles',
      'filter_panel_toggles',
      'scroll_filters_s',
      'scroll_library_s',
      'app_opens',
      'app_card_expands',
      'events'
    ],
    runs.map(r => {
      const s = r.summary;
      const tags = s?.assistantFinalFilters ? Object.values(s.assistantFinalFilters).flat().join('; ') : '';
      return [
        r._id,
        r.email,
        r.workflowId,
        r.workflowLabel,
        displayStatus(r, now),
        iso(r.started),
        iso(r.ended),
        secs(s?.durationMs),
        r.language,
        r.device,
        r.answers?.found,
        r.answers?.app,
        r.answers?.ease,
        r.answers?.suggestions,
        secs(s?.timeToFirstActionMs),
        secs(s?.timeToFirstAppMs),
        s?.assistantTurns,
        secs(s?.assistantTypingMs),
        secs(s?.assistantWaitMs),
        tags,
        s?.filterChecks,
        s?.filterChecksByAssistant,
        s?.filterUnchecks,
        s?.filterHovers,
        secs(s?.filterHoverMs),
        s?.filterClears,
        s?.filterResets,
        s?.filterGroupToggles,
        s?.filterPanelToggles,
        secs(s?.scrollFiltersMs),
        secs(s?.scrollLibraryMs),
        s?.appOpens,
        s?.appCardExpands,
        s?.events
      ];
    })
  );

export const eventsCsv = (events: StudyEvent[], runs: StudyRun[]) => {
  const byId = new Map(runs.map(r => [r._id, r]));
  const sorted = [...events].sort((a, b) => (a.runId ?? '').localeCompare(b.runId ?? '') || a.seq - b.seq);
  return toCsv(
    ['run_id', 'account', 'task_id', 'seq', 'time_utc', 'elapsed_s', 'event', 'page', 'category', 'value', 'source', 'duration_ms', 'text', 'details'],
    sorted.map(e => {
      const run = byId.get(e.runId ?? '');
      const { category, value, source, durationMs, text, ...rest } = e.data ?? {};
      return [
        e.runId,
        run?.email,
        run?.workflowId,
        e.seq,
        iso(e.t),
        secs(e.elapsedMs),
        e.type,
        e.path,
        category,
        value,
        source,
        durationMs,
        text,
        Object.keys(rest).length ? rest : ''
      ];
    })
  );
};

export const downloadText = (filename: string, text: string, type = 'text/csv;charset=utf-8') => {
  // BOM so Excel opens UTF-8 (French/German text, curly quotes) correctly.
  const blob = new Blob(['﻿' + text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
