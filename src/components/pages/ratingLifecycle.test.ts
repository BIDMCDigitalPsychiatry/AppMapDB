import { dedupeByGroupId } from './useAppTableData';

/**
 * Rating lifecycle regression test.
 *
 * The public-facing search work rewrote the grouping/dedup step that decides
 * WHICH review of an app the site shows. That same step sits underneath the
 * volunteer and admin flows: submit a rating -> it lands in the pending queue
 * -> an admin approves it -> it becomes the public record. If the rewrite got
 * this wrong, the failure is silent and looks like data loss (an approved
 * review vanishing, or an unapproved draft going public), so it is pinned down
 * here rather than left to manual clicking.
 *
 * Modelled directly on the real data rules (src/.../Applications/selectors.tsx
 * and README_DATABASE.md):
 *   - every review is a NEW immutable row; rows are never updated in place
 *   - rows for the same app share a `groupId`
 *   - the pending queue is rows with `approved !== true`
 *   - the public site shows the newest APPROVED row per groupId
 *   - admin sees the newest approved row, or the newest row if none approved
 */

type Row = { _id: string; groupId: string; created: number; approved?: boolean; parent?: string; draft?: boolean; delete?: boolean };

const app = (over: Partial<Row> & Pick<Row, '_id' | 'groupId' | 'created'>): Row => ({ approved: false, ...over });

// The public site's view: only approved rows are ever candidates.
const publicView = (rows: Row[]) => dedupeByGroupId(rows.filter(r => r.approved === true && r.draft !== true && r.delete !== true));

// The admin table's view: everything (approved or not), deduped.
const adminView = (rows: Row[]) => dedupeByGroupId(rows.filter(r => r.draft !== true && r.delete !== true));

// The pending-approval queue.
const pendingQueue = (rows: Row[]) => rows.filter(r => r.approved !== true && r.draft !== true && r.delete !== true);

describe('rating -> pending -> approved lifecycle', () => {
  it('a brand new app rating is pending, and is NOT public until approved', () => {
    const rows = [app({ _id: 'r1', groupId: 'g1', created: 1000 })];

    expect(pendingQueue(rows).map(r => r._id)).toEqual(['r1']);
    expect(publicView(rows)).toEqual([]); // nothing public yet
    expect(adminView(rows).map(r => r._id)).toEqual(['r1']); // admin still sees it
  });

  it('approving the first rating publishes it', () => {
    const rows = [app({ _id: 'r1', groupId: 'g1', created: 1000, approved: true })];

    expect(pendingQueue(rows)).toEqual([]);
    expect(publicView(rows).map(r => r._id)).toEqual(['r1']);
  });

  it('a re-review does NOT replace the live record until it is approved', () => {
    const rows = [
      app({ _id: 'r1', groupId: 'g1', created: 1000, approved: true }), // live
      app({ _id: 'r2', groupId: 'g1', created: 2000, parent: 'r1' }) // newer, awaiting approval
    ];

    // This is the important one: the public site must keep showing the older
    // APPROVED review, not the newer unapproved one.
    expect(publicView(rows).map(r => r._id)).toEqual(['r1']);
    expect(pendingQueue(rows).map(r => r._id)).toEqual(['r2']);
    // Admin sees the newest approved for the group (r1), with r2 in the queue.
    expect(adminView(rows).map(r => r._id)).toEqual(['r1']);
  });

  it('approving the re-review swaps in the new record and retires the old one', () => {
    const rows = [
      app({ _id: 'r1', groupId: 'g1', created: 1000, approved: true }),
      app({ _id: 'r2', groupId: 'g1', created: 2000, parent: 'r1', approved: true })
    ];

    const pub = publicView(rows);
    expect(pub.map(r => r._id)).toEqual(['r2']); // newest approved wins
    expect(pub).toHaveLength(1); // and the app appears exactly ONCE, not twice
    expect(pendingQueue(rows)).toEqual([]);
  });

  it('history is never lost: old reviews stay in the table, just not on the site', () => {
    const rows = [
      app({ _id: 'r1', groupId: 'g1', created: 1000, approved: true }),
      app({ _id: 'r2', groupId: 'g1', created: 2000, approved: true }),
      app({ _id: 'r3', groupId: 'g1', created: 3000, approved: true })
    ];

    expect(publicView(rows).map(r => r._id)).toEqual(['r3']); // only newest shown
    expect(rows).toHaveLength(3); // but all three rows still exist
  });

  it('an app whose only rating is unapproved shows to admin but never to the public', () => {
    const rows = [
      app({ _id: 'r1', groupId: 'g1', created: 1000 }),
      app({ _id: 'r2', groupId: 'g1', created: 2000, parent: 'r1' })
    ];

    expect(publicView(rows)).toEqual([]);
    // Admin falls back to the newest row when the group has no approved member.
    expect(adminView(rows).map(r => r._id)).toEqual(['r2']);
  });

  it('drafts and deleted rows never reach the public site or the queue', () => {
    const rows = [
      app({ _id: 'r1', groupId: 'g1', created: 1000, approved: true }),
      app({ _id: 'r2', groupId: 'g2', created: 2000, draft: true }),
      app({ _id: 'r3', groupId: 'g3', created: 3000, delete: true })
    ];

    expect(publicView(rows).map(r => r._id)).toEqual(['r1']);
    expect(pendingQueue(rows).map(r => r._id)).toEqual([]); // draft/deleted are not "pending work"
  });

  it('out-of-order arrival still resolves to the newest approved review', () => {
    // Rows come back from a DynamoDB scan in arbitrary order — the dedup must
    // not depend on input ordering.
    const rows = [
      app({ _id: 'r3', groupId: 'g1', created: 3000, approved: true }),
      app({ _id: 'r1', groupId: 'g1', created: 1000, approved: true }),
      app({ _id: 'r2', groupId: 'g1', created: 2000 }) // unapproved, newest-but-one
    ];

    expect(publicView(rows).map(r => r._id)).toEqual(['r3']);
  });

  it('separate apps are never collapsed together', () => {
    const rows = [
      app({ _id: 'a1', groupId: 'gA', created: 1000, approved: true }),
      app({ _id: 'b1', groupId: 'gB', created: 1000, approved: true })
    ];

    expect(publicView(rows).map(r => r._id).sort()).toEqual(['a1', 'b1']);
  });
});
