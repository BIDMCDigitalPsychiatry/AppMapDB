/*
 * Step 4: backfill the `cur` flags — and afterwards, the reconcile/audit tool.
 *
 * For every app group, stamps `cur` on the rows the list views need
 * (newest approved / newest deleted / newest pending — see currentFlags.js),
 * removes stray flags, and repairs two data gaps found in the 2026-08-25 scan:
 *   - 51 legacy rows have no groupId at all -> set groupId = _id (matches the
 *     frontend's long-standing fallback; without it those rows would be
 *     invisible to group-index queries)
 *   - reports (does not fix) any mixed-case emails, which 01_migrate_emails.js
 *     owns
 *
 * RERUNNABLE: after the initial backfill this same script is the drift
 * repair — run it periodically until Phase 2 moves writes server-side. A
 * clean run prints "0 differences".
 *
 * Usage:
 *   node 04_backfill_current_flags.js --profile <admin-profile>            # dry run / audit
 *   node 04_backfill_current_flags.js --profile <admin-profile> --apply    # write
 */
const { docClient, TableName, scanAll, isApply, banner } = require('./awsClient');
const { computeCurrentFlags, isEmpty } = require('./currentFlags');

(async () => {
  banner('04_backfill_current_flags');
  const rows = await scanAll();

  // Repair 1: rows with no groupId become their own group (groupId = _id).
  const missingGroup = rows.filter(r => isEmpty(r.groupId));
  console.log(`\nrows missing groupId (will set groupId = _id): ${missingGroup.length}`);
  for (const r of missingGroup) r.groupId = r._id; // apply locally so flag computation sees final groups

  // Desired vs actual flags.
  const desired = computeCurrentFlags(rows);
  const toSet = [];
  const toClear = [];
  for (const r of rows) {
    const want = desired.get(r._id);
    if (want && r.cur !== want) toSet.push({ _id: r._id, cur: want, was: r.cur });
    if (!want && r.cur !== undefined) toClear.push({ _id: r._id, was: r.cur });
  }
  const counts = { approved: 0, deleted: 0, pending: 0 };
  for (const f of desired.values()) counts[f]++;
  console.log(`desired flags: ${desired.size} total (${counts.approved} approved, ${counts.deleted} deleted, ${counts.pending} pending)`);
  console.log(`differences vs database: ${toSet.length} to set/change, ${toClear.length} to clear, ${missingGroup.length} groupId repairs`);

  // Audit-only report: mixed-case emails (owned by 01_migrate_emails.js).
  const mixed = rows.filter(r => typeof r.email === 'string' && r.email !== r.email.toLowerCase());
  if (mixed.length) console.log(`NOTE: ${mixed.length} rows have mixed-case emails — run 01_migrate_emails.js`);

  if (toSet.length + toClear.length + missingGroup.length === 0) {
    console.log('\n0 differences — database matches the expected state.');
    return;
  }

  if (!isApply) {
    for (const s of toSet.slice(0, 20)) console.log(`  SET   ${s._id}: cur ${s.was ?? '(none)'} -> ${s.cur}`);
    if (toSet.length > 20) console.log(`  ... and ${toSet.length - 20} more`);
    for (const c of toClear.slice(0, 20)) console.log(`  CLEAR ${c._id}: cur ${c.was} -> (none)`);
    if (toClear.length > 20) console.log(`  ... and ${toClear.length - 20} more`);
    console.log('\nDry run only. Re-run with --apply to write these changes.');
    return;
  }

  let done = 0;
  const total = missingGroup.length + toSet.length + toClear.length;
  const tick = () => process.stdout.write(`\r  updated ${++done}/${total}`);
  for (const r of missingGroup) {
    await docClient
      .update({ TableName, Key: { _id: r._id }, UpdateExpression: 'SET groupId = :g', ConditionExpression: 'attribute_not_exists(groupId) OR groupId = :empty', ExpressionAttributeValues: { ':g': r._id, ':empty': '' } })
      .promise();
    tick();
  }
  for (const s of toSet) {
    await docClient.update({ TableName, Key: { _id: s._id }, UpdateExpression: 'SET #c = :v', ExpressionAttributeNames: { '#c': 'cur' }, ExpressionAttributeValues: { ':v': s.cur } }).promise();
    tick();
  }
  for (const c of toClear) {
    await docClient.update({ TableName, Key: { _id: c._id }, UpdateExpression: 'REMOVE #c', ExpressionAttributeNames: { '#c': 'cur' } }).promise();
    tick();
  }
  console.log('\nDone. Re-run without --apply to verify a clean "0 differences" audit.');
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
