/*
 * Step 2: merge the split rating groups so each app shows one public card.
 *
 * Three apps have a second lineage created when a re-review was saved as a
 * "new app" (fresh groupId). Every row of the splinter group is re-pointed to
 * the original group's groupId; nothing is deleted; the normal newest-approved
 * dedupe then shows exactly one card and the History dialog shows the full
 * combined lineage.
 *
 * DECISION (Chris, 2026-08-25): Welltory is deliberately NOT merged — its two
 * lineages are iOS-only vs Android-only and the raters will decide.
 *
 * Safety: each row is only re-pointed if its store appId matches the app's
 * known store ids (guards against a groupId collision or a fresh unrelated
 * row). Mismatches are reported and skipped.
 *
 * Usage:
 *   node 02_merge_duplicate_groups.js --profile <admin-profile>            # dry run
 *   node 02_merge_duplicate_groups.js --profile <admin-profile> --apply    # write
 */
const { docClient, TableName, scanAll, isApply, banner } = require('./awsClient');

const MERGES = [
  {
    name: 'CBT Companion: Therapy Journal',
    from: 'be32237c6ede4cfba2de1edb45265a0c',
    to: '28bf26df639f491985f90ae536fae574',
    appIds: ['co.swasth.cbtcompanion']
  },
  {
    name: 'Slumber: Calm Stories & Sleep',
    from: '7ceed83485f54400af4525e925189162',
    to: '6addc0f0961f419db86b7bb1717da183',
    appIds: ['com.summermedia.slumber', 'fm.slumber.sleep.meditation.stories']
  },
  {
    name: 'Dare: Panic & Anxiety Relief',
    from: '9ba97b18e94f48ae8dbe6d3ce7a6a95d',
    to: '74d820e31f6044aa876655e856595bf9',
    appIds: ['ie.johnquirke.dareapp', 'ie.armour.dare2']
  }
];

const storeIds = r => [r.appleStore?.appId, r.androidStore?.appId].filter(Boolean);

(async () => {
  banner('02_merge_duplicate_groups');
  const rows = await scanAll();

  const planned = [];
  let mismatches = 0;
  for (const m of MERGES) {
    const members = rows.filter(r => r.groupId === m.from);
    const target = rows.filter(r => r.groupId === m.to);
    console.log(`\n${m.name}: ${members.length} rows to re-point ${m.from.slice(0, 8)}… -> ${m.to.slice(0, 8)}… (target group has ${target.length} rows)`);
    if (target.length === 0) {
      console.log('  !! target group not found — skipping this merge entirely');
      mismatches++;
      continue;
    }
    for (const r of members) {
      const ids = storeIds(r);
      const ok = ids.length === 0 || ids.some(id => m.appIds.includes(id));
      if (!ok) {
        console.log(`  !! SKIP _id ${r._id} — store ids [${ids.join(', ')}] do not match expected [${m.appIds.join(', ')}]`);
        mismatches++;
        continue;
      }
      console.log(`  re-point _id ${r._id} (created ${new Date(Number(r.created)).toISOString().split('T')[0]}, was groupId ${r.groupId})`);
      planned.push({ _id: r._id, from: r.groupId, to: m.to });
    }
  }

  console.log(`\nplanned updates: ${planned.length} rows${mismatches ? `  (${mismatches} skipped mismatches — investigate before applying)` : ''}`);

  if (!isApply) {
    console.log('\nDry run only. Re-run with --apply to write these changes.');
    return;
  }
  if (mismatches > 0) {
    console.error('\nRefusing to apply while mismatches exist. Resolve them first.');
    process.exit(1);
  }

  for (const p of planned) {
    await docClient
      .update({
        TableName,
        Key: { _id: p._id },
        UpdateExpression: 'SET groupId = :to',
        ConditionExpression: 'groupId = :from', // only if unchanged since the scan
        ExpressionAttributeValues: { ':to': p.to, ':from': p.from }
      })
      .promise();
    console.log(`  updated ${p._id}: groupId ${p.from} -> ${p.to}`);
  }
  console.log(`\nDone. ${planned.length} rows merged. Original groupIds are logged above for reversibility.`);
  console.log('Run 04_backfill_current_flags.js next (or again) so cur flags reflect the merged groups.');
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
