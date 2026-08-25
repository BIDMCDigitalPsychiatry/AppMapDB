/*
 * Step 1: normalize email casing on existing rows.
 *
 * Lowercases the `email` and `approverEmail` fields on any applications row
 * where they contain uppercase characters. As of the 2026-08-25 live scan
 * this is 121 rows (6 raters) for `email` and 0 for `approverEmail`.
 *
 * DEPLOY THE CODE FIX FIRST (useProcessData lowercases on write) so no new
 * mixed-case rows appear behind this migration.
 *
 * Usage:
 *   node 01_migrate_emails.js --profile <admin-profile>            # dry run
 *   node 01_migrate_emails.js --profile <admin-profile> --apply    # write
 */
const { docClient, TableName, scanAll, isApply, banner } = require('./awsClient');

(async () => {
  banner('01_migrate_emails');
  const rows = await scanAll();

  const fixes = [];
  for (const r of rows) {
    const updates = {};
    for (const field of ['email', 'approverEmail']) {
      const v = r[field];
      if (typeof v === 'string' && v !== v.toLowerCase()) updates[field] = v.toLowerCase();
    }
    if (Object.keys(updates).length) fixes.push({ _id: r._id, updates, before: { email: r.email, approverEmail: r.approverEmail } });
  }

  console.log(`\nrows needing normalization: ${fixes.length}`);
  const byAddr = {};
  for (const f of fixes) for (const [field, v] of Object.entries(f.updates)) byAddr[`${field}: ${f.before[field]} -> ${v}`] = (byAddr[`${field}: ${f.before[field]} -> ${v}`] || 0) + 1;
  for (const [k, n] of Object.entries(byAddr)) console.log(`  ${k}  (${n} rows)`);

  if (!isApply) {
    console.log('\nDry run only. Re-run with --apply to write these changes.');
    return;
  }

  let done = 0;
  for (const f of fixes) {
    const names = {};
    const values = {};
    const sets = Object.keys(f.updates).map((field, i) => {
      names[`#f${i}`] = field;
      values[`:v${i}`] = f.updates[field];
      return `#f${i} = :v${i}`;
    });
    await docClient
      .update({ TableName, Key: { _id: f._id }, UpdateExpression: `SET ${sets.join(', ')}`, ExpressionAttributeNames: names, ExpressionAttributeValues: values })
      .promise();
    done++;
    process.stdout.write(`\r  updated ${done}/${fixes.length}`);
  }
  console.log(`\nDone. ${done} rows normalized. Original values are logged above for reversibility.`);
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
