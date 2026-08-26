/*
 * Authorization matrix tests for the write API (see PLAN_MODERNIZATION.md §1).
 * These pin the server-side security invariants: authorship comes from the
 * verified token, approval/archival is admin-only, raters touch only their
 * own rows.
 */
import { authorize } from './authz';

const rater = { email: 'rater@x.com', isAdmin: false, isSuperAdmin: false };
const admin = { email: 'admin@x.com', isAdmin: true, isSuperAdmin: false };
const superAdmin = { email: 'super@x.com', isAdmin: true, isSuperAdmin: true };

describe('write-api authorization matrix', () => {
  it('lets any signed-in user create a rating, with authorship forced to the token', () => {
    const d = authorize(rater, { Model: 'applications', Action: 'c', Data: { _id: '1', email: 'SPOOF@y.com', approved: true, approverEmail: 'fake@x.com' } }, undefined);
    expect(d.allow).toBe(true);
    expect(d.data.email).toBe('rater@x.com'); // spoofed author overwritten
    expect(d.data.approved).toBe(false); // ratings are never born approved
    expect(d.data.approverEmail).toBeUndefined();
  });

  it('lets an admin create/edit on behalf of the original rater (admin-edit dialog)', () => {
    const d = authorize(admin, { Model: 'applications', Action: 'c', Data: { _id: '1', email: 'Original@Rater.com' } }, undefined);
    expect(d.allow).toBe(true);
    expect(d.data.email).toBe('original@rater.com'); // preserved, but normalized
  });

  it('denies a rater flipping approval on an existing row — even their own', () => {
    const d = authorize(rater, { Model: 'applications', Action: 'u', Data: { _id: '1', email: 'rater@x.com', approved: true } }, { _id: '1', email: 'rater@x.com', approved: false });
    expect(d.allow).toBe(false);
  });

  it('denies a rater editing someone else\'s row', () => {
    const d = authorize(rater, { Model: 'applications', Action: 'u', Data: { _id: '1', approved: false } }, { _id: '1', email: 'other@x.com', approved: false });
    expect(d.allow).toBe(false);
  });

  it('allows a rater editing their own unapproved row without status changes', () => {
    const d = authorize(rater, { Model: 'applications', Action: 'u', Data: { _id: '1', email: 'rater@x.com', approved: false, name: 'edit' } }, { _id: '1', email: 'rater@x.com', approved: false });
    expect(d.allow).toBe(true);
  });

  it('denies a rater archiving; allows an admin', () => {
    expect(authorize(rater, { Model: 'applications', Action: 'd', Data: { _id: '1' } }, { _id: '1', email: 'rater@x.com' }).allow).toBe(false);
    expect(authorize(admin, { Model: 'applications', Action: 'd', Data: { _id: '1' } }, { _id: '1', email: 'rater@x.com' }).allow).toBe(true);
  });

  it('allows an admin approving and stamps approverEmail from the token', () => {
    const d = authorize(admin, { Model: 'applications', Action: 'u', Data: { _id: '1', email: 'rater@x.com', approved: true } }, { _id: '1', email: 'rater@x.com', approved: false });
    expect(d.allow).toBe(true);
    expect(d.data.approverEmail).toBe('admin@x.com');
  });

  it('restricts users-table management to Super Admins — regular admins are denied', () => {
    expect(authorize(rater, { Model: 'users', Action: 'c', Data: { _id: 'e', email: 'e' } }, undefined).allow).toBe(false);
    expect(authorize(admin, { Model: 'users', Action: 'c', Data: { _id: 'e', email: 'e', roles: ['notify'] } }, undefined).allow).toBe(false);
    const d = authorize(superAdmin, { Model: 'users', Action: 'c', Data: { _id: 'e', email: 'e', roles: ['notify'] } }, undefined);
    expect(d.allow).toBe(true);
    expect(d.data.updatedBy).toBe('super@x.com'); // audit stamp
  });

  it('rejects models this API does not serve (tracking is anonymous-direct)', () => {
    expect(authorize(admin, { Model: 'tracking', Action: 'c', Data: { _id: '1' } }, undefined).allow).toBe(false);
  });

  it('community writes: signed-in create allowed, delete admin-only', () => {
    expect(authorize(rater, { Model: 'posts', Action: 'c', Data: { _id: 'p1' } }, undefined).allow).toBe(true);
    expect(authorize(rater, { Model: 'posts', Action: 'd', Data: { _id: 'p1' } }, undefined).allow).toBe(false);
    expect(authorize(admin, { Model: 'posts', Action: 'd', Data: { _id: 'p1' } }, undefined).allow).toBe(true);
  });
});
