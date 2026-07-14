// Refresh the local snapshot of the `applications` table for local-data mode.
//
// Scans the live table using the same unauthenticated Cognito identity pool
// the public site uses (read-only, no credentials setup needed), then writes:
//   - appmap-db-dump.json                      (repo root; used by analysis scripts)
//   - public/local-data/applications.json      (served by the dev server for
//                                               REACT_APP_USE_LOCAL_DATA=true)
//
// Usage: node scripts/dumpApplications.js

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const pkg = require('../package.json');

AWS.config.region = pkg.region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: pkg.identityPoolId
});

const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = 'applications';

const getRows = async () => {
  const scanResults = [];
  let items;
  const params = { TableName, ExclusiveStartKey: undefined };
  do {
    items = await dynamo.scan(params).promise();
    items.Items.forEach(i => scanResults.push(i));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
    process.stdout.write(`\rScanned ${scanResults.length} rows...`);
  } while (typeof items.LastEvaluatedKey !== 'undefined');
  process.stdout.write('\n');
  return scanResults;
};

const main = async () => {
  console.log(`Scanning table: ${TableName}`);
  const rows = await getRows();
  const json = JSON.stringify(rows);

  const rootDump = path.join(__dirname, '..', 'appmap-db-dump.json');
  fs.writeFileSync(rootDump, json);

  const localDataDir = path.join(__dirname, '..', 'public', 'local-data');
  fs.mkdirSync(localDataDir, { recursive: true });
  fs.writeFileSync(path.join(localDataDir, 'applications.json'), json);

  const groupIds = new Set(rows.map(r => r.groupId).filter(Boolean));
  console.log(`Wrote ${rows.length} rows (${groupIds.size} unique apps) to:`);
  console.log(`  ${rootDump}`);
  console.log(`  ${path.join(localDataDir, 'applications.json')}`);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
