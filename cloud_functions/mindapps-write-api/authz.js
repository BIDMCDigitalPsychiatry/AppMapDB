/*
 * Pure authorization logic for the write API — no AWS calls, unit-testable.
 *
 * Decision model: given the verified caller (email + roles), the requested
 * operation ({Model, Action, Data}) and the existing row (if any), return
 * either { allow: true, data } — where `data` is the payload with
 * server-enforced fields applied — or { allow: false, reason }.
 */
const isEmpty = v => v === undefined || v === null || v === '';

// Models a signed-in browser is allowed to write through this API.
const AUTHENTICATED_MODELS = new Set(['applications', 'users', 'posts', 'comments', 'events', 'team', 'filters', 'surveys', 'signUpSurveys']);

// Content owned by staff: community posts, the events/team pages, filter
// configs, and the survey tables (participant PII; anonymous submissions go
// direct, not through this API). Self-registered accounts get no access.
const ADMIN_ONLY_MODELS = new Set(['posts', 'events', 'team', 'filters', 'surveys', 'signUpSurveys']);

const normalizeEmails = data => {
  const out = { ...data };
  for (const f of ['email', 'approverEmail']) if (typeof out[f] === 'string') out[f] = out[f].toLowerCase();
  return out;
};

const authorize = ({ email, username, isAdmin, isSuperAdmin }, { Model, Action = 'c', Data }, existing) => {
  if (!Data) return { allow: false, reason: 'Missing Data' };
  if (!AUTHENTICATED_MODELS.has(Model)) return { allow: false, reason: `Model '${Model}' is not writable via this API` };

  const data = normalizeEmails(Data);

  if (Model === 'users') {
    // users table is keyed by email, not _id. Roster management is restricted
    // to Super Admins — regular admins can approve/archive ratings but cannot
    // see or change who has which permissions.
    if (isEmpty(data.email)) return { allow: false, reason: 'Missing user email' };
    if (!isSuperAdmin) return { allow: false, reason: 'Managing users requires a Super Admin account' };
    return { allow: true, data: { ...data, _id: data.email, updated: Date.now(), updatedBy: email } };
  }

  if (isEmpty(Data._id)) return { allow: false, reason: 'Missing Data._id' };

  if (ADMIN_ONLY_MODELS.has(Model)) {
    if (!isAdmin) return { allow: false, reason: `Writing ${Model} requires an admin account` };
    return { allow: true, data };
  }

  if (Model === 'comments') {
    // Comments require sign-in (per Chris, 2026-08-26 — the Add Comment UI is
    // gated the same way). Anyone signed in may create; edits are limited to
    // the original author (createdBy = Cognito username) or an admin; deletes
    // stay admin-only. createdBy is server-stamped so it can't be spoofed.
    if (Action === 'd' && !isAdmin) return { allow: false, reason: 'Deleting comments requires an admin account' };
    if (existing) {
      if (!isAdmin && existing.createdBy !== username) return { allow: false, reason: 'You can only edit your own comments' };
      return { allow: true, data: { ...data, createdBy: existing.createdBy } };
    }
    return { allow: true, data: { ...data, createdBy: isAdmin ? data.createdBy ?? username : username } };
  }

  // ---- applications ----
  if (Action === 'd' && !isAdmin) return { allow: false, reason: 'Archiving requires an admin account' };

  const statusChanged =
    existing !== undefined && ((existing.approved === true) !== (data.approved === true) || (existing.delete === true) !== (data.delete === true));

  if (existing) {
    // In-place update of an existing row (approve / un-approve / archive
    // toggles, admin edits). Raters may only touch their own rows and may
    // never flip approval/archive status.
    if (!isAdmin) {
      if ((existing.email ?? '').toLowerCase() !== email) return { allow: false, reason: 'You can only modify your own ratings' };
      if (statusChanged) return { allow: false, reason: 'Approving or archiving requires an admin account' };
      if (typeof data.approverEmail === 'string' && data.approverEmail !== (existing.approverEmail ?? '').toLowerCase() && !isEmpty(data.approverEmail))
        return { allow: false, reason: 'approverEmail can only be set by an admin' };
    }
  } else {
    // Brand-new row (new rating, or the re-review path that creates a new
    // row linked to a parent). Authorship comes from the verified token —
    // except admins editing on behalf of the original rater, which the admin
    // edit dialog has always supported.
    if (!isAdmin) {
      data.email = email;
      data.approved = false; // new ratings are never born approved
      delete data.approverEmail;
    } else if (isEmpty(data.email)) {
      data.email = email;
    }
  }

  if (statusChanged && !isAdmin) return { allow: false, reason: 'Approving or archiving requires an admin account' };
  if (data.approved === true && isEmpty(data.approverEmail)) data.approverEmail = email;

  return { allow: true, data };
};

// Read-only Cognito account listing (Admin > Users > "View All Registered
// Users"): the pool holds every self-registered rater, so exposing it is
// restricted the same as roster management.
const canListRegisteredUsers = roles => roles?.isSuperAdmin === true;

module.exports = { authorize, AUTHENTICATED_MODELS, normalizeEmails, canListRegisteredUsers };
