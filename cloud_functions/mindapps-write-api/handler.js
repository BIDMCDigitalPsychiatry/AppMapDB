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
      return { isAdmin: roles.includes('admin'), isSuperAdmin: roles.includes('superadmin') };
    }
  } catch (err) {
    console.error('users table lookup failed (denying privileged roles):', err.message);
  }
  return { isAdmin: false, isSuperAdmin: false };
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

  const roles = await resolveRoles(email);

  const existing = await getExisting(Model, Data).catch(() => undefined);
  const decision = authorize({ email, isAdmin: roles.isAdmin, isSuperAdmin: roles.isSuperAdmin }, { Model, Action, Data }, existing);
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

  const recipients = built.to === 'participant' ? [built.participantEmail] : await rosterRecipients(built.to.split(':')[1]);
  if (recipients.length === 0) return { type: 'error', error: 'No active recipients configured for this notification' };

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
  console.log(JSON.stringify({ audit: 'EMAIL', by: caller, emailType: type, recipients: recipients.length }));
  return { ok: true };
}

/* ---------------------------------------------------------------------------
 * Registered-users report (Admin > Users > "View All Registered Users").
 * Read-only, Super Admin only: lists every Cognito account in the pool
 * (self-registered raters included) with per-user rating activity derived
 * from the email-index. No actions are exposed — this is a report.
 * ------------------------------------------------------------------------- */
const cognito = new CognitoIdentityProviderClient({});

// Above this many accounts the per-user activity queries get slow; return
// the plain account list instead (statsSkipped tells the UI to hide those
// columns).
const STATS_MAX_USERS = 400;

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
    // Bounded concurrency: chunks of 10 keep this well inside the 30s timeout
    // (one tiny projected query per account).
    for (let i = 0; i < users.length; i += 10) {
      await Promise.all(
        users.slice(i, i + 10).map(async u => {
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

module.exports = { handleWrite, handleEmail, handleListRegisteredUsers };
