/*
 * Workflow Analytics client: everything goes through the write API's `study`
 * route with the signed-in user's ID token. `record` needs the `analytics`
 * role (or admin); `list` / `events` / `export` are admin-only. The study
 * tables are NOT readable by the public Cognito role (transcripts are
 * research data), so there is no direct DynamoDB access here.
 */
import { Auth } from 'aws-amplify';
import { WRITE_API_URL } from '../database/useProcessData';

export interface StudyEvent {
  runId?: string;
  seq: number;
  type: string;
  t: number;
  elapsedMs: number;
  path?: string;
  data?: Record<string, any>;
}

export type RunStatus = 'active' | 'completed' | 'cancelled';

export interface StudyRunSummary {
  durationMs: number;
  timeToFirstActionMs?: number;
  timeToFirstAppMs?: number;
  assistantTurns: number;
  assistantMessages: number;
  assistantTypingMs: number;
  assistantWaitMs: number;
  assistantFinalFilters?: Record<string, string[]>;
  filterChecks: number;
  filterUnchecks: number;
  filterChecksByAssistant: number;
  filterHovers: number;
  filterHoverMs: number;
  filterClears: number;
  filterResets: number;
  filterGroupToggles: number;
  filterPanelToggles: number;
  scrollFiltersMs: number;
  scrollLibraryMs: number;
  appOpens: number;
  appCardExpands: number;
  events: number;
}

export interface StudyRun {
  _id: string;
  email: string;
  workflowId: string;
  workflowLabel?: string;
  started: number;
  ended?: number;
  status: RunStatus;
  language?: string;
  device?: string;
  lastEventAt?: number;
  answers?: { found?: 'yes' | 'partly' | 'no'; app?: string; ease?: number; suggestions?: string };
  summary?: StudyRunSummary;
}

const post = async (study: Record<string, any>, opts: { keepalive?: boolean } = {}) => {
  if (!WRITE_API_URL) throw new Error('Write API not configured');
  const session = await Auth.currentSession();
  const res = await fetch(WRITE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.getIdToken().getJwtToken()}` },
    body: JSON.stringify({ study }),
    keepalive: opts.keepalive
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json.ok !== true) throw new Error(json?.error ?? `Request failed (${res.status})`);
  return json;
};

export const recordStudy = (data: { run: Record<string, any>; events: StudyEvent[] }, keepalive = false) => post({ op: 'record', data }, { keepalive });

export const listStudyRuns = async (): Promise<StudyRun[]> => (await post({ op: 'list' })).runs ?? [];

export const getRunEvents = async (runId: string): Promise<StudyEvent[]> => (await post({ op: 'events', runId })).events ?? [];

export const exportStudyEvents = async (onProgress?: (n: number) => void): Promise<StudyEvent[]> => {
  const all: StudyEvent[] = [];
  let next: any;
  do {
    const page = await post({ op: 'export', next });
    all.push(...(page.events ?? []));
    next = page.next;
    onProgress?.(all.length);
  } while (next);
  return all;
};
