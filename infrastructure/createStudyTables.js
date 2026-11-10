/*
 * Creates the two Workflow Analytics (MIND study) tables.
 *
 * - studyRuns:   PK `_id` (S) = runId. One row per trial: who, which task,
 *                start/end, status, the answers after Stop, summary numbers.
 * - studyEvents: PK `runId` (S) + SK `seq` (N). Every recorded step of a
 *                trial, in order (filter checks, hovers, scrolls, assistant
 *                messages with their transcript text, app opens...).
 *
 * Both PAY_PER_REQUEST. Additive — no existing resource is touched.
 * Rerunnable (skips tables that exist). Access: ONLY the mindapps-write-api
 * Lambda role (createWriteApi.js POLICY) — transcripts are research data, so
 * neither table is in the public Cognito role's read list
 * (lockdownPublicRole.js); admins read them through the API's admin-gated
 * `study` route.
 *
 * Usage: node infrastructure/createStudyTables.js --profile <admin> [--apply]
 * (dry run by default, mirroring the other infrastructure scripts)
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

const TABLES = [
  {
    TableName: 'studyRuns',
    AttributeDefinitions: [{ AttributeName: '_id', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: '_id', KeyType: 'HASH' }]
  },
  {
    TableName: 'studyEvents',
    AttributeDefinitions: [
      { AttributeName: 'runId', AttributeType: 'S' },
      { AttributeName: 'seq', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'runId', KeyType: 'HASH' },
      { AttributeName: 'seq', KeyType: 'RANGE' }
    ]
  }
];

(async () => {
  console.log(`createStudyTables — ${isApply ? '*** APPLY ***' : 'DRY RUN (pass --apply to execute)'}`);
  for (const def of TABLES) {
    const exists = await raw
      .describeTable({ TableName: def.TableName })
      .promise()
      .then(() => true)
      .catch(() => false);
    if (exists) {
      console.log(`${def.TableName}: already exists — skipped`);
      continue;
    }
    if (!isApply) {
      console.log(`${def.TableName}: would create (${def.KeySchema.map(k => `${k.AttributeName} ${k.KeyType}`).join(', ')})`);
      continue;
    }
    await raw.createTable({ ...def, BillingMode: 'PAY_PER_REQUEST' }).promise();
    await raw.waitFor('tableExists', { TableName: def.TableName }).promise();
    console.log(`${def.TableName}: created, ACTIVE`);
  }
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
