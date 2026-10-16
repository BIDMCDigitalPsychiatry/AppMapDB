/*
 * Creates the `appSubmissions` table behind the public "Submit an App" form
 * (Admin > App Submissions queue).
 *
 * - Table: PK `_id` (S), PAY_PER_REQUEST. Additive — no existing resource is
 *   touched. Rerunnable (skips creation if it exists).
 * - Access: ONLY the mindapps-write-api Lambda role (createWriteApi.js POLICY).
 *   Rows hold submitter PII, so the table is deliberately NOT in the public
 *   Cognito role's read list (lockdownPublicRole.js) — reviewers read it
 *   through the API's reviewer-gated `submission: { op: 'list' }` route.
 *
 * Usage: node infrastructure/createSubmissionsTable.js --profile <admin> [--apply]
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
const TableName = 'appSubmissions';

(async () => {
  console.log(`createSubmissionsTable — ${isApply ? '*** APPLY ***' : 'DRY RUN (pass --apply to execute)'}`);
  const exists = await raw
    .describeTable({ TableName })
    .promise()
    .then(() => true)
    .catch(() => false);
  console.log(`table '${TableName}': ${exists ? 'already exists' : 'will be created (PK _id, on-demand)'}`);
  if (!isApply || exists) return;

  await raw
    .createTable({
      TableName,
      AttributeDefinitions: [{ AttributeName: '_id', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: '_id', KeyType: 'HASH' }],
      BillingMode: 'PAY_PER_REQUEST'
    })
    .promise();
  await raw.waitFor('tableExists', { TableName }).promise();
  // Point-in-time recovery: submissions are the only copy of what developers sent.
  await raw.updateContinuousBackups({ TableName, PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true } }).promise();
  console.log('table ACTIVE (point-in-time recovery enabled)');
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
