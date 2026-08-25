/*
 * Pure logic: which rows of an app group are "current" and carry the `cur`
 * flag that puts them in the current-index GSI.
 *
 * MIRROR NOTICE: this is the Lambda copy of src/database/currentFlags.ts
 * (unit-tested there) and scripts/db-migration/currentFlags.js (used by the
 * backfill/reconcile tooling). If you change one, change all three.
 */
const isEmpty = v => v === undefined || v === null || v === '';
const groupOf = r => (isEmpty(r.groupId) ? r._id : r.groupId);

const newest = list => list.reduce((a, b) => (Number(b.created) > Number(a.created) ? b : a), list[0]);

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

const diffCurrentFlags = rows => {
  const desired = computeCurrentFlags(rows);
  const changes = [];
  for (const r of rows) {
    const want = desired.get(r._id);
    if (want !== r.cur) changes.push({ _id: r._id, cur: want });
  }
  return changes;
};

module.exports = { computeCurrentFlags, diffCurrentFlags, groupOf, isEmpty };
