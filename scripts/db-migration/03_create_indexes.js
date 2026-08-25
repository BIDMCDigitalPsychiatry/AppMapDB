/*
 * Step 3: create the three Global Secondary Indexes on `applications`.
 *
 *   current-index : PK cur (S),     SK created (N)  — the ~1,823 "current" rows
 *   group-index   : PK groupId (S), SK created (N)  — full history per app
 *   email-index   : PK email (S),   SK created (N)  — a rater's own rows
 *
 * All three project ALL attributes (DynamoDB cannot project partial nested
 * objects like appleStore.title, and full rows keep every dialog/export
 * working with no truncation risk — see PLAN_DATABASE_INDEXES.md).
 *
 * DynamoDB allows only ONE index creation per UpdateTable call, so they are
 * created sequentially, waiting for each to become ACTIVE. Existing indexes
 * are skipped, so the script is rerunnable. Creation is additive and causes
 * no downtime; base-table readers are unaffected.
 *
 * Usage:
 *   node 03_create_indexes.js --profile <admin-profile>            # dry run
 *   node 03_create_indexes.js --profile <admin-profile> --apply    # create
 */
const { rawClient, TableName, isApply, banner } = require('./awsClient');

const INDEXES = [
  { IndexName: 'current-index', pk: 'cur', sk: 'created' },
  { IndexName: 'group-index', pk: 'groupId', sk: 'created' },
  { IndexName: 'email-index', pk: 'email', sk: 'created' }
];

const ATTR_TYPES = { cur: 'S', groupId: 'S', email: 'S', created: 'N' };

const sleep = ms => new Promise(r => setTimeout(r, ms));

const waitForActive = async IndexName => {
  for (;;) {
    const { Table } = await rawClient.describeTable({ TableName }).promise();
    const idx = (Table.GlobalSecondaryIndexes || []).find(i => i.IndexName === IndexName);
    if (idx && idx.IndexStatus === 'ACTIVE') return;
    process.stdout.write(`\r  ${IndexName}: ${idx ? idx.IndexStatus : 'CREATING'} (backfilling ~70 MB, this can take several minutes)...`);
    await sleep(15000);
  }
};

(async () => {
  banner('03_create_indexes');
  const { Table } = await rawClient.describeTable({ TableName }).promise();
  const existing = (Table.GlobalSecondaryIndexes || []).map(i => i.IndexName);
  const billing = Table.BillingModeSummary?.BillingMode || 'PROVISIONED';
  console.log(`table: ${TableName}  billing: ${billing}  existing GSIs: [${existing.join(', ') || 'none'}]`);

  for (const idx of INDEXES) {
    if (existing.includes(idx.IndexName)) {
      console.log(`  ${idx.IndexName}: already exists — skipping`);
      continue;
    }
    console.log(`  ${idx.IndexName}: PK ${idx.pk} (${ATTR_TYPES[idx.pk]}), SK ${idx.sk} (N), projection ALL`);
    if (!isApply) continue;

    const params = {
      TableName,
      AttributeDefinitions: [
        { AttributeName: idx.pk, AttributeType: ATTR_TYPES[idx.pk] },
        { AttributeName: idx.sk, AttributeType: ATTR_TYPES[idx.sk] }
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: idx.IndexName,
            KeySchema: [
              { AttributeName: idx.pk, KeyType: 'HASH' },
              { AttributeName: idx.sk, KeyType: 'RANGE' }
            ],
            Projection: { ProjectionType: 'ALL' },
            // Only needed for PROVISIONED tables; PAY_PER_REQUEST inherits.
            ...(billing === 'PROVISIONED'
              ? { ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 } }
              : {})
          }
        }
      ]
    };
    await rawClient.updateTable(params).promise();
    await waitForActive(idx.IndexName);
    console.log(`\n  ${idx.IndexName}: ACTIVE`);
  }

  if (!isApply) console.log('\nDry run only. Re-run with --apply to create the missing indexes.');
  else console.log('\nDone. Remember: the app also needs dynamodb:Query allowed on table/applications/index/* for its Cognito role.');
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
