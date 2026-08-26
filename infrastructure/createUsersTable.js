/*
 * Creates and seeds the `users` roster table (PLAN_MODERNIZATION.md §1/§2).
 *
 * - Table: PK `email` (S, stored lowercase), PAY_PER_REQUEST. Additive — no
 *   existing resource is touched. Rerunnable (skips creation if it exists).
 * - Seed: from package.json adminUsers/emailUsers (deduped,
 *   lowercased). Existing rows are NOT overwritten on re-runs, so manual
 *   roster edits survive.
 *
 * Usage: node infrastructure/createUsersTable.js --profile <admin> [--apply]
 * (dry run by default, mirroring scripts/db-migration conventions)
 */
const AWS = require('aws-sdk');
const pkg = require('../package.json');

const argProfile = (() => {
  const i = process.argv.indexOf('--profile');
  return i > -1 ? process.argv[i + 1] : undefined;
})();
if (argProfile) AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: argProfile });
AWS.config.region = pkg.region || 'us-east-1';

const isApply = process.argv.includes('--apply');
const raw = new AWS.DynamoDB();
const doc = new AWS.DynamoDB.DocumentClient();
const TableName = 'users';

const list = s =>
  (s || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

const buildRoster = () => {
  const roster = new Map();
  const add = (emails, role) =>
    emails.forEach(e => {
      if (!roster.has(e)) roster.set(e, new Set());
      roster.get(e).add(role);
    });
  add(list(pkg.adminUsers), 'admin');
  add(list(pkg.emailUsers), 'notify');
  return roster;
};

(async () => {
  console.log(`createUsersTable — ${isApply ? '*** APPLY ***' : 'DRY RUN (pass --apply to execute)'}`);
  const roster = buildRoster();
  console.log(`roster from package.json: ${roster.size} distinct emails`);
  for (const [email, roles] of roster) console.log(`  ${email}: ${[...roles].join(', ')}`);

  if (!isApply) return;

  const exists = await raw
    .describeTable({ TableName })
    .promise()
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    console.log('creating table...');
    await raw
      .createTable({
        TableName,
        AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST'
      })
      .promise();
    await raw.waitFor('tableExists', { TableName }).promise();
    console.log('table ACTIVE');
  } else {
    console.log('table already exists — seeding only');
  }

  let seeded = 0;
  for (const [email, roles] of roster) {
    try {
      await doc
        .put({
          TableName,
          Item: { email, roles: [...roles], active: true, created: Date.now(), updated: Date.now(), updatedBy: 'seed:package.json' },
          ConditionExpression: 'attribute_not_exists(email)' // never clobber manual edits
        })
        .promise();
      seeded++;
    } catch (e) {
      if (e.code !== 'ConditionalCheckFailedException') throw e;
    }
  }
  console.log(`done: ${seeded} new rows seeded (${roster.size - seeded} already present)`);
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
