/*
 * Pure logic: which rows are "current" and deserve a `cur` flag.
 *
 * MIRROR NOTICE: this is the Node mirror of src/database/currentFlags.ts
 * (the frontend recomputes flags after each save with the same rules).
 * If you change one, change the other. The frontend copy is unit-tested;
 * the reconcile run of 04_backfill_current_flags.js verifies this copy
 * against production data.
 *
 * Rules (per app group):
 *   cur = 'approved' -> the newest row with approved === true, not deleted, not draft
 *   cur = 'deleted'  -> the newest APPROVED archived row, else the newest
 *                       archived row (mirrors the admin archived view's
 *                       long-standing newest-approved-else-newest pick)
 *   cur = 'pending'  -> the newest row not approved, not deleted, not draft
 *   drafts never carry a flag (they reach their owner via email-index instead)
 */
const isEmpty = v => v === undefined || v === null || v === '';
const groupOf = r => (isEmpty(r.groupId) ? r._id : r.groupId);

const newest = list => list.reduce((a, b) => (Number(b.created) > Number(a.created) ? b : a), list[0]);

// rows: all rows of the table (or of one group). Returns Map<_id, 'approved'|'deleted'|'pending'>.
const computeCurrentFlags = rows => {
  const groups = new Map();
  for (const r of rows) {
    const g = groupOf(r);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(r);
  }
  const flags = new Map();
  for (const list of groups.values()) {
    const approved = list.filter(r => r.approved === true && r.delete !== true && r.draft !== true);
    const deleted = list.filter(r => r.delete === true && r.draft !== true);
    const deletedApproved = deleted.filter(r => r.approved === true);
    const pending = list.filter(r => r.approved !== true && r.delete !== true && r.draft !== true);
    if (approved.length) flags.set(newest(approved)._id, 'approved');
    if (deleted.length) flags.set(newest(deletedApproved.length ? deletedApproved : deleted)._id, 'deleted');
    if (pending.length) flags.set(newest(pending)._id, 'pending');
  }
  return flags;
};

module.exports = { computeCurrentFlags, groupOf, isEmpty };
