/*
 * Core logic of the MindApps write API. AWS-event plumbing lives in lambda.js.
 *
 * Flow: verify Cognito ID token -> resolve roles (users table with env-list
 * fallback) -> authorize (authz.js) -> write -> recompute current-index flags
 * for the affected app group -> return the finalized row + flag changes so
 * the client can update its local store without re-fetching.
 */
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { CognitoIdentityProviderClient, ListUsersCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { authorize, canListRegisteredUsers } = require('./authz');
const { buildEmail, SOURCE } = require('./email');
const submissions = require('./submissions');
const { randomUUID } = require('crypto');
const { diffCurrentFlags, groupOf } = require('./currentFlags');

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}), { marshallOptions: { removeUndefinedValues: true } });

const USERS_TABLE = process.env.USERS_TABLE || 'users';
const GROUP_INDEX = 'group-index';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID,
  tokenUse: 'id',
  clientId: process.env.USER_POOL_CLIENT_ID
});

// Prefetch Cognito's signing keys during container init instead of lazily on
// the first verification — measured at ~700-900 ms when paid inside the first
// request (the "first click is slow" symptom).
const jwksReady = verifier.hydrate().catch(err => console.error('JWKS prefetch failed (will retry on first verify):', err.message));

// Roster: the users table is the single source of truth (the package.json
// fallback lists were retired 2026-08-26). A failed lookup denies privileged
// roles — fail closed.
const resolveRoles = async email => {
  try {
    const res = await doc.send(new GetCommand({ TableName: USERS_TABLE, Key: { email } }));
    if (res.Item && res.Item.active !== false) {
      const roles = Array.isArray(res.Item.roles) ? res.Item.roles : [];
      return { isAdmin: roles.includes('admin'), isSuperAdmin: roles.includes('superadmin'), isSubmissionReviewer: roles.includes('submissionreviewer') };
    }
  } catch (err) {
    console.error('users table lookup failed (denying privileged roles):', err.message);
  }
  return { isAdmin: false, isSuperAdmin: false, isSubmissionReviewer: false };
};

const getExisting = async (Model, Data) => {
  const TableName = Model === 'users' ? USERS_TABLE : Model;
  const Key = Model === 'users' ? { email: String(Data.email ?? '').toLowerCase() } : { _id: Data._id };
  if (Model === 'users' ? !Key.email : !Key._id) return undefined;
  const res = await doc.send(new GetCommand({ TableName, Key }));
  return res.Item;
};

// Guardrails for the Users admin page: never lock the last admin or the last
// Super Admin out of the system.
const usersGuardrails = async (caller, data, existing) => {
  const losing = role =>
    existing && Array.isArray(existing.roles) && existing.roles.includes(role) && (!(data.roles || []).includes(role) || data.active === false);
  const losingAdmin = losing('admin');
  const losingSuper = losing('superadmin');
  if (!losingAdmin && !losingSuper) return null;
  if (data.email === caller && losingSuper) return 'You cannot remove your own Super Admin role';
  if (data.email === caller && losingAdmin) return 'You cannot remove your own admin role';
  const all = [];
  let start;
  do {
    const page = await doc.send(new ScanCommand({ TableName: USERS_TABLE, ExclusiveStartKey: start }));
    all.push(...(page.Items || []));
    start = page.LastEvaluatedKey;
  } while (start);
  const activeWith = role => all.filter(u => u.active !== false && Array.isArray(u.roles) && u.roles.includes(role)).length;
  if (losingSuper && activeWith('superadmin') <= 1) return 'Cannot remove the last active Super Admin';
  if (losingAdmin && activeWith('admin') <= 1) return 'Cannot remove the last active admin';
  return null;
};

const recomputeFlags = async written => {
  const gId = groupOf(written);
  const rows = [];
  let start;
  do {
    const page = await doc.send(
      new QueryCommand({
        TableName: 'applications',
        IndexName: GROUP_INDEX,
        KeyConditionExpression: 'groupId = :g',
        ExpressionAttributeValues: { ':g': gId },
        ExclusiveStartKey: start
      })
    );
    rows.push(...(page.Items || []));
    start = page.LastEvaluatedKey;
  } while (start);
  const merged = [...rows.filter(r => r._id !== written._id), written];
  const changes = diffCurrentFlags(merged);
  await Promise.all(
    changes.map(c =>
      doc.send(
        new UpdateCommand({
          TableName: 'applications',
          Key: { _id: c._id },
          ...(c.cur
            ? { UpdateExpression: 'SET #c = :v', ExpressionAttributeNames: { '#c': 'cur' }, ExpressionAttributeValues: { ':v': c.cur } }
            : { UpdateExpression: 'REMOVE #c', ExpressionAttributeNames: { '#c': 'cur' } })
        })
      )
    )
  );
  return changes;
};

async function handleWrite(token, body) {
  const { Model, Action = 'c', Data } = body || {};
  if (!Model || !Data) return { type: 'bad_request', error: 'Model and Data are required' };

  let payload;
  try {
    await jwksReady; // ensure the init-time key prefetch has settled
    payload = await verifier.verify(token);
  } catch {
    return { type: 'unauthorized', error: 'Sign in required' };
  }
  const email = String(payload.email || '').toLowerCase();
  if (!email) return { type: 'unauthorized', error: 'Token has no email claim' };
  const username = payload['cognito:username'] || payload.sub; // comment ownership (createdBy)

  const roles = await resolveRoles(email);

  const existing = await getExisting(Model, Data).catch(() => undefined);
  const decision = authorize({ email, username, isAdmin: roles.isAdmin, isSuperAdmin: roles.isSuperAdmin }, { Model, Action, Data }, existing);
  if (!decision.allow) {
    console.log(JSON.stringify({ audit: 'DENIED', email, Model, Action, id: Data._id, reason: decision.reason }));
    return { type: 'forbidden', error: decision.reason };
  }

  let data = decision.data;
  if (Model === 'users') {
    // 'd' on the users model is a HARD delete (someone left the company) —
    // guardrails treat it as losing every role.
    const effective = Action === 'd' ? { ...data, roles: [], active: false } : data;
    if (Action === 'd' && data.email === email) return { type: 'forbidden', error: 'You cannot delete your own account' };
    const guard = await usersGuardrails(email, effective, existing);
    if (guard) return { type: 'forbidden', error: guard };
    if (Action === 'd') {
      await doc.send(new DeleteCommand({ TableName: USERS_TABLE, Key: { email: data.email } }));
      console.log(JSON.stringify({ audit: 'DELETE_USER', email, Model, id: data.email }));
      return { ok: true, deleted: true, data };
    }
  }

  // The 'd' action mirrors useProcessData's contract: a delete is a put with
  // delete=true; 'c' forces delete=false.
  data = { ...data, delete: Action === 'c' ? false : Action === 'd' ? true : data.delete };

  await doc.send(new PutCommand({ TableName: Model === 'users' ? USERS_TABLE : Model, Item: data }));

  let flagChanges = [];
  if (Model === 'applications') {
    try {
      flagChanges = await recomputeFlags(data);
    } catch (err) {
      console.error('flag recompute failed (reconcile script will repair):', err);
    }
  }

  console.log(
    JSON.stringify({ audit: 'WRITE', email, admin: roles.isAdmin, Model, Action, id: data._id, approved: data.approved === true, deleted: data.delete === true })
  );
  return { ok: true, data, flagChanges };
}

/* ---------------------------------------------------------------------------
 * Email operations (the five browser SES flows moved server-side).
 * Templates/validation live in email.js; this resolves roster recipients and
 * performs the send. Three types are deliberately anonymous (public survey /
 * interest / suggest-edit forms) — abuse is bounded by fixed templates,
 * validation, and API Gateway throttling. surveyFollowUp requires an admin.
 * ------------------------------------------------------------------------- */
const ses = new SESClient({});

const rosterRecipients = async role => {
  const rows = [];
  let start;
  do {
    const page = await doc.send(new ScanCommand({ TableName: USERS_TABLE, ExclusiveStartKey: start }));
    rows.push(...(page.Items || []));
    start = page.LastEvaluatedKey;
  } while (start);
  return rows.filter(u => u.active !== false && Array.isArray(u.roles) && u.roles.includes(role)).map(u => u.email);
};

async function handleEmail(token, payload) {
  const { type, data } = payload || {};
  const built = buildEmail(type, data);
  if (built.error) return { type: 'bad_request', error: built.error };

  let caller = 'anonymous';
  if (built.requiresAdmin) {
    let jwt;
    try {
      await jwksReady;
      jwt = await verifier.verify(token);
    } catch {
      return { type: 'unauthorized', error: 'Sign in required' };
    }
    caller = String(jwt.email || '').toLowerCase();
    const roles = await resolveRoles(caller);
    if (!roles.isAdmin) {
      console.log(JSON.stringify({ audit: 'DENIED', email: caller, op: 'email', emailType: type }));
      return { type: 'forbidden', error: 'Sending this email requires an admin account' };
    }
  }

  const sent = await sendBuiltEmail(built);
  if (sent.error) return { type: 'error', error: sent.error };
  console.log(JSON.stringify({ audit: 'EMAIL', by: caller, emailType: type, recipients: sent.recipients }));
  return { ok: true };
}

async function sendBuiltEmail(built) {
  const recipients = built.to === 'participant' ? [built.participantEmail] : await rosterRecipients(built.to.split(':')[1]);
  if (recipients.length === 0) return { error: 'No active recipients configured for this notification' };

  await ses.send(
    new SendEmailCommand({
      Destination: { ToAddresses: recipients },
      Message: {
        Body: { Html: { Charset: 'UTF-8', Data: built.body }, Text: { Charset: 'UTF-8', Data: built.body } },
        Subject: { Charset: 'UTF-8', Data: built.subject }
      },
      Source: SOURCE,
      ReplyToAddresses: [SOURCE]
    })
  );
  return { recipients: recipients.length };
}

/* ---------------------------------------------------------------------------
 * App Submissions (public "Submit an App" form -> Admin > App Submissions).
 *   submit - anonymous; sanitized against a fixed schema (submissions.js),
 *            stored with status 'new', then reviewers are emailed.
 *   list   - Submission Reviewer / Super Admin only (the rows hold submitter
 *            PII, so the table is NOT readable by the public Cognito role).
 *   update - same roles; status / linked rating id / appended review note.
 * ------------------------------------------------------------------------- */
const verifyCaller = async token => {
  try {
    await jwksReady;
    const jwt = await verifier.verify(token);
    const email = String(jwt.email || '').toLowerCase();
    return email ? { email, roles: await resolveRoles(email) } : undefined;
  } catch {
    return undefined;
  }
};

async function handleSubmission(token, payload) {
  const { op } = payload || {};

  if (op === 'submit') {
    const result = submissions.sanitizeSubmission(payload.data);
    if (result.error) return { type: 'bad_request', error: result.error };
    if (result.spam) {
      console.log(JSON.stringify({ audit: 'SUBMISSION_SPAM' }));
      return { ok: true };
    }
    const now = Date.now();
    const item = { _id: randomUUID(), created: now, updated: now, status: 'new', ...result.item };
    await doc.send(
      new PutCommand({ TableName: submissions.TABLE, Item: item, ConditionExpression: 'attribute_not_exists(#id)', ExpressionAttributeNames: { '#id': '_id' } })
    );
    console.log(JSON.stringify({ audit: 'SUBMISSION', id: item._id, app: item.app.name }));
    try {
      const built = buildEmail('appSubmission', { id: item._id, submitter: item.submitter, app: item.app }, { internal: true });
      const sent = built.error ? built : await sendBuiltEmail(built);
      if (sent.error) console.error('submission notification not sent:', sent.error);
    } catch (err) {
      // The submission is stored and visible in the queue; a failed email must not fail the submit.
      console.error('submission notification failed:', err);
    }
    return { ok: true, id: item._id };
  }

  if (op !== 'list' && op !== 'update') return { type: 'bad_request', error: 'Unknown submission operation' };

  const caller = await verifyCaller(token);
  if (!caller) return { type: 'unauthorized', error: 'Sign in required' };
  if (!submissions.canReviewSubmissions(caller.roles)) {
    console.log(JSON.stringify({ audit: 'DENIED', email: caller.email, op: `submission:${op}` }));
    return { type: 'forbidden', error: 'Reviewing submissions requires the Submission Reviewer role' };
  }

  if (op === 'list') {
    const rows = [];
    let start;
    do {
      const page = await doc.send(new ScanCommand({ TableName: submissions.TABLE, ExclusiveStartKey: start }));
      rows.push(...(page.Items || []));
      start = page.LastEvaluatedKey;
    } while (start);
    rows.sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
    return { ok: true, submissions: rows };
  }

  const result = submissions.sanitizeStatusUpdate(payload.data);
  if (result.error) return { type: 'bad_request', error: result.error };
  const now = Date.now();
  const sets = { ...result.update, updated: now, updatedBy: caller.email };
  const names = { '#id': '_id' };
  const values = {};
  const clauses = Object.entries(sets).map(([k, v], i) => {
    names[`#f${i}`] = k;
    values[`:v${i}`] = v;
    return `#f${i} = :v${i}`;
  });
  if (result.note) {
    names['#notes'] = 'notes';
    values[':note'] = [{ at: now, by: caller.email, text: result.note, ...(result.update.status ? { status: result.update.status } : {}) }];
    values[':empty'] = [];
    clauses.push('#notes = list_append(if_not_exists(#notes, :empty), :note)');
  }
  try {
    const res = await doc.send(
      new UpdateCommand({
        TableName: submissions.TABLE,
        Key: { _id: payload.data._id },
        UpdateExpression: `SET ${clauses.join(', ')}`,
        ConditionExpression: 'attribute_exists(#id)',
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW'
      })
    );
    console.log(JSON.stringify({ audit: 'SUBMISSION_UPDATE', email: caller.email, id: payload.data._id, status: result.update.status }));
    return { ok: true, data: res.Attributes };
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') return { type: 'bad_request', error: 'Submission not found' };
    throw err;
  }
}

/* ---------------------------------------------------------------------------
 * Registered-users report (Admin > Users > "View All Registered Users").
 * Read-only, Super Admin only: lists every Cognito account in the pool
 * (self-registered raters included) with per-user rating activity derived
 * from the email-index. No actions are exposed — this is a report.
 * ------------------------------------------------------------------------- */
const cognito = new CognitoIdentityProviderClient({});

// Above this many accounts the per-user activity queries risk the 30s
// timeout; return the plain account list instead (statsSkipped tells the UI
// to hide those columns). The pool held 530 accounts in Aug 2026 and stats
// took ~2s, so this leaves generous headroom.
const STATS_MAX_USERS = 2500;

const ratingStats = async email => {
  // One query on email-index (SK = created, ascending) projecting only the
  // sort key: count + first/last activity in a single pass.
  const created = [];
  let start;
  do {
    const page = await doc.send(
      new QueryCommand({
        TableName: 'applications',
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :e',
        ExpressionAttributeValues: { ':e': email },
        ProjectionExpression: 'created',
        ExclusiveStartKey: start
      })
    );
    created.push(...(page.Items || []).map(r => r.created).filter(c => typeof c === 'number'));
    start = page.LastEvaluatedKey;
  } while (start);
  return { ratings: created.length, firstActivity: created.length ? Math.min(...created) : undefined, lastActivity: created.length ? Math.max(...created) : undefined };
};

async function handleListRegisteredUsers(token) {
  let payload;
  try {
    await jwksReady;
    payload = await verifier.verify(token);
  } catch {
    return { type: 'unauthorized', error: 'Sign in required' };
  }
  const caller = String(payload.email || '').toLowerCase();
  const roles = await resolveRoles(caller);
  if (!canListRegisteredUsers(roles)) {
    console.log(JSON.stringify({ audit: 'DENIED', email: caller, op: 'listRegisteredUsers' }));
    return { type: 'forbidden', error: 'Viewing registered users requires a Super Admin account' };
  }

  const users = [];
  let PaginationToken;
  do {
    const page = await cognito.send(new ListUsersCommand({ UserPoolId: process.env.USER_POOL_ID, Limit: 60, PaginationToken }));
    for (const u of page.Users || []) {
      const attr = name => (u.Attributes || []).find(a => a.Name === name)?.Value;
      users.push({
        email: String(attr('email') || u.Username || '').toLowerCase(),
        emailVerified: attr('email_verified') === 'true',
        status: u.UserStatus,
        enabled: u.Enabled !== false,
        created: u.UserCreateDate ? new Date(u.UserCreateDate).getTime() : undefined
      });
    }
    PaginationToken = page.PaginationToken;
  } while (PaginationToken);

  const statsSkipped = users.length > STATS_MAX_USERS;
  if (!statsSkipped) {
    // Bounded concurrency: chunks of 25 keep this well inside the 30s timeout
    // (one tiny projected query per account).
    for (let i = 0; i < users.length; i += 25) {
      await Promise.all(
        users.slice(i, i + 25).map(async u => {
          try {
            Object.assign(u, await ratingStats(u.email));
          } catch (err) {
            console.error('rating stats failed for', u.email, err.message);
          }
        })
      );
    }
  }

  console.log(JSON.stringify({ audit: 'LIST_REGISTERED_USERS', email: caller, count: users.length, statsSkipped }));
  return { ok: true, users, statsSkipped };
}

module.exports = { handleWrite, handleEmail, handleListRegisteredUsers, handleSubmission };
