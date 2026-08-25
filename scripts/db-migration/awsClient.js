/*
 * Shared AWS setup for the db-migration scripts.
 *
 * Credentials: uses your admin AWS profile, NOT the app's public Cognito pool.
 *   node <script> --profile mindapps-admin      (or set AWS_PROFILE)
 * Region and table name come from package.json (same source the app uses).
 */
const AWS = require('aws-sdk');
const pkg = require('../../package.json');

const argProfile = (() => {
  const i = process.argv.indexOf('--profile');
  return i > -1 ? process.argv[i + 1] : undefined;
})();

if (argProfile) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: argProfile });
} // otherwise the default provider chain applies (AWS_PROFILE, env keys, etc.)

AWS.config.region = pkg.region || 'us-east-1';

const TableName = 'applications';
const docClient = new AWS.DynamoDB.DocumentClient();
const rawClient = new AWS.DynamoDB();

const isApply = process.argv.includes('--apply');

// Full paginated scan of the applications table.
const scanAll = async () => {
  const rows = [];
  const params = { TableName, ExclusiveStartKey: undefined };
  let page;
  do {
    page = await docClient.scan(params).promise();
    rows.push(...page.Items);
    params.ExclusiveStartKey = page.LastEvaluatedKey;
    process.stdout.write(`\r  scanned ${rows.length} rows...`);
  } while (page.LastEvaluatedKey);
  console.log(`\n  scan complete: ${rows.length} rows`);
  return rows;
};

const banner = name => {
  console.log('='.repeat(70));
  console.log(`${name} — ${isApply ? '*** APPLY MODE: WILL WRITE TO THE DATABASE ***' : 'DRY RUN (no writes; pass --apply to execute)'}`);
  console.log('='.repeat(70));
};

module.exports = { AWS, docClient, rawClient, TableName, scanAll, isApply, banner };
