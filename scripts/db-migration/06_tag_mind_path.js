/*
 * Step 6 (MIND-PATH Study filter): tag the 8 MIND-PATH study apps.
 *
 * Adds 'MIND-PATH Study' to `treatmentApproaches` on each study app's current
 * approved rating, and on its current pending rating if one is in progress
 * (so approving that pending rating later doesn't drop the tag). Other values
 * are kept (Mindfulness etc.).
 *
 * Rows are edited IN PLACE (no new rating version): created/approved/cur
 * don't change, so the cur flags and the rating history stay as they are. The
 * write is conditional on the row not having changed since it was read, so a
 * concurrent rating save is never overwritten.
 *
 * Run it only AFTER the frontend with the MIND-PATH filter is deployed, or the
 * app cards show the chip before the filter exists.
 *
 * Two steps, so a person checks the matches before anything is written:
 *   node 06_tag_mind_path.js --profile <admin-profile>
 *       dry run: prints matches per study app and writes a plan file
 *       (backups/06_mind_path_plan_<ts>.json) of the _ids it would tag.
 *       Review it; remove wrong rows or add missed ones (an _id of the right
 *       app's current approved row) by hand.
 *   node 06_tag_mind_path.js --profile <admin-profile> --apply --plan <plan-file>
 *       tags exactly the _ids in the plan file and nothing else.
 * Re-runnable: rows that already have the tag are skipped.
 */
const fs = require('fs');
const path = require('path');
const { docClient, TableName, isApply, banner } = require('./awsClient');

const TAG = 'MIND-PATH Study';

// The study apps, as the MIND-PATH team named them (Nov 2026 request).
const STUDY_APPS = [
  'Insight Timer',
  'Healthy Minds Program',
  'Mindfulness Coach',
  'Headspace',
  'Calm',
  'Aura',
  'The Mindfulness App',
  'Smiling Mind'
];

const arg = name => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
};

const titleOf = r => r.name || r.appleStore?.title || r.androidStore?.title || '';
const titlesOf = r => [r.name, r.appleStore?.title, r.androidStore?.title].filter(Boolean);
const norm = s =>
  String(s)
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/^the /, '');
// Store titles look like "Calm: Sleep & Meditation" or "Insight Timer - Meditation App";
// the part before the first separator is the app's name.
const baseName = s => norm(String(s).split(/\s*[:|–—]\s*|\s+-\s+/)[0]);

const queryCur = async cur => {
  const rows = [];
  const params = {
    TableName,
    IndexName: 'current-index',
    KeyConditionExpression: 'cur = :c',
    ExpressionAttributeValues: { ':c': cur },
    ExclusiveStartKey: undefined
  };
  let page;
  do {
    page = await docClient.query(params).promise();
    rows.push(...page.Items);
    params.ExclusiveStartKey = page.LastEvaluatedKey;
  } while (page.LastEvaluatedKey);
  return rows;
};

const groupOf = r => r.groupId || r._id;
const hasTag = r => Array.isArray(r.treatmentApproaches) && r.treatmentApproaches.includes(TAG);
const describe = r =>
  `${r._id}  cur=${r.cur}  "${titleOf(r)}"  apple=${r.appleStore?.appId ?? r.appleStore?.id ?? '-'}  android=${r.androidStore?.appId ?? '-'}` +
  `  approaches=${JSON.stringify(r.treatmentApproaches ?? [])}${hasTag(r) ? '  (already tagged)' : ''}`;

const dryRun = async () => {
  const approved = await queryCur('approved');
  const pending = await queryCur('pending');
  console.log(`\ncurrent approved apps: ${approved.length}, current pending ratings: ${pending.length}`);
  const pendingByGroup = new Map(pending.map(r => [groupOf(r), r]));

  const planIds = [];
  const problems = [];
  for (const app of STUDY_APPS) {
    const target = norm(app);
    const exact = approved.filter(r => titlesOf(r).some(t => baseName(t) === target || norm(t) === target));
    const exactIds = new Set(exact.map(r => r._id));
    const loose = approved.filter(r => !exactIds.has(r._id) && titlesOf(r).some(t => norm(t).includes(target)));

    console.log(`\n${app}`);
    if (!exact.length) {
      console.log('  NO MATCH among current approved apps');
      problems.push(`${app}: no match`);
    }
    for (const r of exact) {
      console.log(`  TAG   ${describe(r)}`);
      planIds.push(r._id);
      const p = pendingByGroup.get(groupOf(r));
      if (p) {
        console.log(`  TAG   ${describe(p)}   <- in-progress rating of the same app`);
        planIds.push(p._id);
      }
    }
    if (exact.length > 1) problems.push(`${app}: ${exact.length} separate app cards matched (check they are the same app, e.g. iOS vs Android)`);
    for (const r of loose.slice(0, 8)) console.log(`  maybe ${describe(r)}   <- NOT in plan; add its _id by hand if it is this app`);
  }

  const already = new Set([...approved, ...pending].filter(hasTag).map(r => r._id));
  const strays = [...already].filter(id => !planIds.includes(id));
  if (strays.length) console.log(`\nNOTE: already tagged but not matched to a study app: ${strays.join(', ')}`);

  const planFile = path.join(__dirname, 'backups', `06_mind_path_plan_${Date.now()}.json`);
  fs.mkdirSync(path.dirname(planFile), { recursive: true });
  fs.writeFileSync(planFile, JSON.stringify([...new Set(planIds)], null, 2));

  console.log(`\nPlan: ${new Set(planIds).size} rows (${planIds.filter(id => !already.has(id)).length} need the tag) -> ${planFile}`);
  if (problems.length) console.log(`\nCHECK BEFORE APPLYING:\n  ${problems.join('\n  ')}`);
  console.log(`\nDry run only. Review/edit the plan file, then:\n  node 06_tag_mind_path.js --profile <admin-profile> --apply --plan "${planFile}"`);
};

const apply = async planFile => {
  if (!planFile) throw new Error('--apply needs --plan <plan-file> from a dry run');
  const ids = JSON.parse(fs.readFileSync(planFile, 'utf8'));
  console.log(`\nplan ${planFile}: ${ids.length} rows`);

  const logFile = path.join(__dirname, 'backups', `06_tag_mind_path_${Date.now()}.json`);
  const updated = [];
  for (const _id of ids) {
    const { Item: r } = await docClient.get({ TableName, Key: { _id } }).promise();
    if (!r) {
      console.log(`  SKIP ${_id}: row not found`);
      continue;
    }
    if (r.cur !== 'approved' && r.cur !== 'pending') {
      console.log(`  SKIP ${_id}: no longer a current approved/pending rating (cur=${r.cur})`);
      continue;
    }
    if (hasTag(r)) {
      console.log(`  ok   ${_id} "${titleOf(r)}" already tagged`);
      continue;
    }
    const before = Array.isArray(r.treatmentApproaches) ? r.treatmentApproaches : [];
    try {
      await docClient
        .update({
          TableName,
          Key: { _id },
          UpdateExpression: 'SET treatmentApproaches = :v',
          // Untouched since we read it: same `updated` stamp (or still none)
          ConditionExpression: r.updated === undefined ? 'attribute_not_exists(updated)' : 'updated = :u',
          ExpressionAttributeValues: { ':v': [...before, TAG], ...(r.updated === undefined ? {} : { ':u': r.updated }) }
        })
        .promise();
      updated.push({ _id, before });
      fs.writeFileSync(logFile, JSON.stringify(updated, null, 2));
      console.log(`  TAGGED ${_id} "${titleOf(r)}"`);
    } catch (e) {
      if (e.code !== 'ConditionalCheckFailedException') throw e;
      console.log(`  SKIP ${_id}: changed since read (a rater saved it) — re-run to pick it up`);
    }
  }
  console.log(`\nDone. ${updated.length} rows tagged.${updated.length ? ` Rollback: set treatmentApproaches back to "before" for each _id in ${logFile}` : ''}`);
  console.log('Next: run 04_backfill_current_flags.js (no --apply) as the drift audit; expect 0 differences.');
};

(async () => {
  banner('06_tag_mind_path');
  if (isApply) await apply(arg('--plan'));
  else await dryRun();
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
