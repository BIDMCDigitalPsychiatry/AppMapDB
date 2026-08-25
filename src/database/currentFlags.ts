/*
 * Pure logic: which rows of an app group are "current" and carry the `cur`
 * flag that puts them in the current-index GSI (see PLAN_DATABASE_INDEXES.md).
 *
 * MIRROR NOTICE: scripts/db-migration/currentFlags.js is the Node mirror used
 * by the backfill/reconcile tooling. If you change one, change the other.
 *
 * Rules (per app group):
 *   cur = 'approved' -> the newest row with approved === true, not deleted, not draft
 *   cur = 'deleted'  -> the newest row with delete === true
 *   cur = 'pending'  -> the newest row not approved, not deleted, not draft
 *   drafts never carry a flag (they reach their owner via email-index instead)
 */
import { isEmpty } from '../helpers';

export type CurFlag = 'approved' | 'deleted' | 'pending';

export interface FlaggableRow {
  _id: string;
  groupId?: string;
  created?: number;
  approved?: boolean;
  draft?: boolean;
  delete?: boolean;
  cur?: CurFlag;
}

export const groupOf = (r: { _id: string; groupId?: string }): string => (isEmpty(r.groupId) ? r._id : (r.groupId as string));

const newest = <T extends FlaggableRow>(list: T[]): T => list.reduce((a, b) => (Number(b.created) > Number(a.created) ? b : a), list[0]);

// rows: all rows of one group (or the whole table). Returns Map<_id, CurFlag>.
export const computeCurrentFlags = (rows: FlaggableRow[]): Map<string, CurFlag> => {
  const groups = new Map<string, FlaggableRow[]>();
  for (const r of rows) {
    const g = groupOf(r);
    if (!groups.has(g)) groups.set(g, []);
    (groups.get(g) as FlaggableRow[]).push(r);
  }
  const flags = new Map<string, CurFlag>();
  groups.forEach(list => {
    const approved = list.filter(r => r.approved === true && r.delete !== true && r.draft !== true);
    const deleted = list.filter(r => r.delete === true);
    const pending = list.filter(r => r.approved !== true && r.delete !== true && r.draft !== true);
    if (approved.length) flags.set(newest(approved)._id, 'approved');
    if (deleted.length) flags.set(newest(deleted)._id, 'deleted');
    if (pending.length) flags.set(newest(pending)._id, 'pending');
  });
  return flags;
};

// The flag changes needed to bring a group's rows in line with the rules.
export const diffCurrentFlags = (rows: FlaggableRow[]): { _id: string; cur: CurFlag | undefined }[] => {
  const desired = computeCurrentFlags(rows);
  const changes: { _id: string; cur: CurFlag | undefined }[] = [];
  for (const r of rows) {
    const want = desired.get(r._id);
    if (want !== r.cur) changes.push({ _id: r._id, cur: want });
  }
  return changes;
};
