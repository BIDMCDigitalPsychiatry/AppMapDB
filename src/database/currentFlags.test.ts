import { computeCurrentFlags, diffCurrentFlags, FlaggableRow } from './currentFlags';
import { normalizeEmailFields } from './normalize';

/**
 * The `cur` flags decide which rows live in the current-index GSI — i.e.
 * which rows the public site, admin library, pending queue, and archived list
 * are built from. These tests pin the flag rules to the same lifecycle
 * scenarios as ratingLifecycle.test.ts.
 */

const app = (over: Partial<FlaggableRow> & Pick<FlaggableRow, '_id' | 'created'>): FlaggableRow => ({ groupId: 'g1', approved: false, ...over });

const flagsOf = (rows: FlaggableRow[]) => Object.fromEntries(computeCurrentFlags(rows));

describe('computeCurrentFlags', () => {
  it('a brand new rating is the pending row; nothing is approved yet', () => {
    expect(flagsOf([app({ _id: 'r1', created: 1000 })])).toEqual({ r1: 'pending' });
  });

  it('approving the rating moves the flag from pending to approved', () => {
    expect(flagsOf([app({ _id: 'r1', created: 1000, approved: true })])).toEqual({ r1: 'approved' });
  });

  it('a re-review keeps the older approved row current until it is approved itself', () => {
    const rows = [app({ _id: 'r1', created: 1000, approved: true }), app({ _id: 'r2', created: 2000 })];
    expect(flagsOf(rows)).toEqual({ r1: 'approved', r2: 'pending' });
  });

  it('approving the re-review retires the old approved row to history (no flag)', () => {
    const rows = [app({ _id: 'r1', created: 1000, approved: true }), app({ _id: 'r2', created: 2000, approved: true })];
    expect(flagsOf(rows)).toEqual({ r2: 'approved' });
  });

  it('archiving one rating promotes the next-newest approved rating (intended per-record archive semantics)', () => {
    const rows = [
      app({ _id: 'r1', created: 1000, approved: true }),
      app({ _id: 'r2', created: 2000, approved: true, delete: true }) // admin archived the newest rating only
    ];
    // r2 is the app's archived record; r1 goes back to being the public one.
    expect(flagsOf(rows)).toEqual({ r1: 'approved', r2: 'deleted' });
  });

  it('a fully archived app has only a deleted flag — nothing public, nothing pending', () => {
    const rows = [app({ _id: 'r1', created: 1000, approved: true, delete: true }), app({ _id: 'r2', created: 2000, delete: true })];
    // Production's archived view picks the newest APPROVED archived row when
    // one exists (r1), even if a newer unapproved archived row (r2) exists.
    expect(flagsOf(rows)).toEqual({ r1: 'deleted' });
  });

  it('archived flag falls back to the newest archived row when none were approved', () => {
    const rows = [app({ _id: 'r1', created: 1000, delete: true }), app({ _id: 'r2', created: 2000, delete: true })];
    expect(flagsOf(rows)).toEqual({ r2: 'deleted' });
  });

  it('drafts never carry a flag (they reach their owner via email-index)', () => {
    const rows = [app({ _id: 'r1', created: 1000, draft: true })];
    expect(flagsOf(rows)).toEqual({});
  });

  it('only the newest pending row per group is the queue entry', () => {
    const rows = [app({ _id: 'r1', created: 1000 }), app({ _id: 'r2', created: 2000 })];
    expect(flagsOf(rows)).toEqual({ r2: 'pending' });
  });

  it('rows without a groupId fall back to _id grouping (legacy rows)', () => {
    const rows = [app({ _id: 'r1', created: 1000, approved: true, groupId: undefined }), app({ _id: 'r2', created: 2000, approved: true, groupId: undefined })];
    // Two distinct legacy groups -> both current.
    expect(flagsOf(rows)).toEqual({ r1: 'approved', r2: 'approved' });
  });

  it('separate apps never affect each other', () => {
    const rows = [app({ _id: 'a1', created: 1000, approved: true, groupId: 'gA' }), app({ _id: 'b1', created: 500, approved: true, groupId: 'gB' })];
    expect(flagsOf(rows)).toEqual({ a1: 'approved', b1: 'approved' });
  });
});

describe('diffCurrentFlags', () => {
  it('reports exactly the writes needed to move flags after an approval', () => {
    const rows = [
      app({ _id: 'r1', created: 1000, approved: true, cur: 'approved' }),
      app({ _id: 'r2', created: 2000, approved: true, cur: 'pending' }) // just approved; flag not yet moved
    ];
    expect(diffCurrentFlags(rows)).toEqual([
      { _id: 'r1', cur: undefined }, // clear the retired row
      { _id: 'r2', cur: 'approved' } // promote the new one
    ]);
  });

  it('reports nothing when flags already match', () => {
    const rows = [app({ _id: 'r1', created: 1000, approved: true, cur: 'approved' })];
    expect(diffCurrentFlags(rows)).toEqual([]);
  });
});

describe('normalizeEmailFields', () => {
  it('lowercases email and approverEmail, leaving other fields alone', () => {
    expect(normalizeEmailFields({ email: 'BKALEMBA@MGH.Harvard.edu', approverEmail: 'Admin@Example.com', name: 'MixedCase App' } as any)).toEqual({
      email: 'bkalemba@mgh.harvard.edu',
      approverEmail: 'admin@example.com',
      name: 'MixedCase App'
    });
  });

  it('tolerates missing or non-string values', () => {
    expect(normalizeEmailFields({ email: undefined, approverEmail: null } as any)).toEqual({ email: undefined, approverEmail: null });
    expect(normalizeEmailFields({} as any)).toEqual({});
  });
});
