/*
 * Step 5 (Country Availability): backfill `countries` from the legacy Canada use.
 *
 * Sets `countries = ['Canada']` on every applications row that has the legacy
 * `uses` value 'Available in Canada' and no `countries` answer yet. Rows a
 * rater has already answered (any `countries` attribute, even []) are never
 * touched, and the write is conditional on that so a concurrent rating save
 * cannot be overwritten. `uses` is left as-is: another organization may still
 * read the legacy value, and the app keeps it in sync on every save.
 *
 * Safe to run any time after the Country Availability frontend is deployed:
 * until then the frontend already treats these rows as available in Canada
 * (getAppCountries in Application.tsx), so this changes nothing users see.
 * Re-runnable; a second run finds 0 rows.
 *
 * Usage:
 *   node 05_backfill_countries.js --profile <admin-profile>            # dry run
 *   node 05_backfill_countries.js --profile <admin-profile> --apply    # write
 */
const fs = require('fs');
const path = require('path');
const { docClient, TableName, scanAll, isApply, banner } = require('./awsClient');

const LEGACY_CANADA_USE = 'Available in Canada';

(async () => {
  banner('05_backfill_countries');
  const rows = await scanAll();

  const legacy = rows.filter(r => Array.isArray(r.uses) && r.uses.includes(LEGACY_CANADA_USE));
  const answered = legacy.filter(r => r.countries !== undefined);
  const fixes = legacy.filter(r => r.countries === undefined);

  console.log(`\nrows with '${LEGACY_CANADA_USE}': ${legacy.length}`);
  console.log(`  already have a countries answer (skipped): ${answered.length}`);
  console.log(`  to backfill with countries = ['Canada']: ${fixes.length}`);
  console.log(`    of which current (cur flag set): ${fixes.filter(r => r.cur !== undefined).length}`);
  const conflicting = answered.filter(r => !Array.isArray(r.countries) || !r.countries.includes('Canada'));
  if (conflicting.length) {
    console.log(`\n  NOTE: ${conflicting.length} answered rows have the legacy value but not Canada in countries (left alone):`);
    for (const r of conflicting.slice(0, 20)) console.log(`    ${r._id}  ${r.name ?? ''}  countries=${JSON.stringify(r.countries)}`);
  }
  console.log('\nsample:');
  for (const r of fixes.slice(0, 10)) console.log(`  ${r._id}  ${r.name ?? r.appleStore?.title ?? r.androidStore?.title ?? ''}`);

  if (!isApply) {
    console.log('\nDry run only. Re-run with --apply to write these changes.');
    return;
  }

  // Every updated _id is written as it happens, so rollback is exact even if the run is interrupted
  const logFile = path.join(__dirname, 'backups', `05_backfill_countries_${Date.now()}.json`);
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  const updatedIds = [];

  let done = 0;
  let skipped = 0;
  for (const r of fixes) {
    try {
      await docClient
        .update({
          TableName,
          Key: { _id: r._id },
          UpdateExpression: 'SET countries = :c',
          ConditionExpression: 'attribute_not_exists(countries)',
          ExpressionAttributeValues: { ':c': ['Canada'] }
        })
        .promise();
      updatedIds.push(r._id);
      fs.writeFileSync(logFile, JSON.stringify(updatedIds, null, 2));
      done++;
    } catch (e) {
      if (e.code !== 'ConditionalCheckFailedException') throw e;
      skipped++; // answered by a rater since the scan
    }
    process.stdout.write(`\r  updated ${done}/${fixes.length}${skipped ? ` (${skipped} answered since scan, skipped)` : ''}`);
  }
  console.log(`\nDone. ${done} rows backfilled. Rollback: REMOVE countries on the _ids in ${logFile}`);
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
