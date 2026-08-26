/*
 * MEDIA BUCKET (repo video relocation, approved by Chris 2026-08-26).
 *
 * Creates the mindapps-media-<accountId> S3 bucket and uploads the three
 * training/intro MP4s (~98 MB) that previously lived in src/content and
 * shipped with every clone and every Pages deploy. Objects under /videos/*
 * are public-read and immutable-cached; the frontend references them via
 * src/content/videos.ts.
 *
 * Rerunnable: bucket creation and policy are idempotent; uploads overwrite.
 *
 * Usage:
 *   node infrastructure/createMediaBucket.js --profile <admin>            # dry run
 *   node infrastructure/createMediaBucket.js --profile <admin> --apply
 */
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const argProfile = (() => {
  const i = process.argv.indexOf('--profile');
  return i > -1 ? process.argv[i + 1] : undefined;
})();
if (argProfile) AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: argProfile });
AWS.config.region = pkg.region || 'us-east-1';

const isApply = process.argv.includes('--apply');
const s3 = new AWS.S3();

const VIDEOS_DIR = path.join(__dirname, '..', 'src', 'content');
const FILES = ['Intro.mp4', 'zoom_0.mp4', 'zoom_1.mp4'];

(async () => {
  const accountId = (await new AWS.STS().getCallerIdentity({}).promise()).Account;
  const BUCKET = `mindapps-media-${accountId}`;
  console.log(`createMediaBucket — ${isApply ? '*** APPLY ***' : 'DRY RUN (pass --apply to execute)'}`);
  console.log(`bucket: ${BUCKET} (${AWS.config.region})`);
  for (const f of FILES) {
    const p = path.join(VIDEOS_DIR, f);
    if (!fs.existsSync(p)) throw new Error(`missing source file: ${p} — run before deleting the local videos`);
    console.log(`  will upload videos/${f} (${(fs.statSync(p).size / 1048576).toFixed(1)} MB)`);
  }
  if (!isApply) return;

  // 1. Bucket (us-east-1 needs no CreateBucketConfiguration)
  try {
    await s3.createBucket({ Bucket: BUCKET }).promise();
    console.log('bucket created');
  } catch (e) {
    if (e.code !== 'BucketAlreadyOwnedByYou') throw e;
    console.log('bucket already exists (owned by us)');
  }

  // 2. Allow a public-read bucket policy (scoped to /videos/*), keep ACLs blocked.
  await s3
    .putPublicAccessBlock({
      Bucket: BUCKET,
      PublicAccessBlockConfiguration: { BlockPublicAcls: true, IgnorePublicAcls: true, BlockPublicPolicy: false, RestrictPublicBuckets: false }
    })
    .promise();
  await s3
    .putBucketPolicy({
      Bucket: BUCKET,
      Policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Sid: 'PublicVideoRead', Effect: 'Allow', Principal: '*', Action: 's3:GetObject', Resource: `arn:aws:s3:::${BUCKET}/videos/*` }]
      })
    })
    .promise();
  console.log('public-read policy set for videos/*');

  // 3. Upload with long-lived immutable caching (the files never change; a
  //    replacement would get a new name).
  for (const f of FILES) {
    process.stdout.write(`uploading videos/${f}... `);
    await s3
      .upload({
        Bucket: BUCKET,
        Key: `videos/${f}`,
        Body: fs.createReadStream(path.join(VIDEOS_DIR, f)),
        ContentType: 'video/mp4',
        CacheControl: 'public, max-age=31536000, immutable'
      })
      .promise();
    console.log('done');
  }

  // 4. Verify each object is publicly reachable.
  const https = require('https');
  for (const f of FILES) {
    const url = `https://${BUCKET}.s3.amazonaws.com/videos/${f}`;
    const status = await new Promise(resolve => https.request(url, { method: 'HEAD' }, res => resolve(res.statusCode)).on('error', () => resolve(0)).end());
    console.log(`${status === 200 ? 'OK ' : 'FAIL'} ${url} -> ${status}`);
    if (status !== 200) process.exitCode = 1;
  }
  console.log('\nDone. The frontend URLs live in src/content/videos.ts; the local MP4s can now be removed from the repo.');
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
