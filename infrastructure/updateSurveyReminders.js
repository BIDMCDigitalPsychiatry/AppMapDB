/*
 * SURVEY-REMINDERS LAMBDA FIX + RUNTIME UPGRADE (approved by Chris 2026-08-26).
 *
 * The nodejs16 version authenticated with the PUBLIC Cognito identity pool's
 * unauthenticated role in code — so the security lockdown (SES revocation +
 * scoped DynamoDB policy) broke it. This script:
 *   1. Adds a scoped inline policy to the function's OWN execution role:
 *      Scan on surveys, Scan+PutItem on surveyReminders,
 *      ses:SendEmail on the psych.digital identity, CloudWatch logs.
 *   2. Deploys the SDK v3 rewrite from cloud_functions/app-map-db-survey-reminders
 *      (no bundled deps — the v3 SDK ships in the runtime).
 *   3. Upgrades the runtime to nodejs20.x.
 *   4. Test-invokes and prints the result counts (idempotent: only sends for
 *      surveys past their follow-up window with no reminder row yet).
 *
 * Also bumps the app-map-db (store-metadata proxy) runtime to nodejs20.x —
 * config-only, no code change — and test-invokes it with a known appId.
 * Rollback for either: set the runtime back / remove the inline policy.
 *
 * Usage:
 *   node infrastructure/updateSurveyReminders.js --profile <admin>            # dry run
 *   node infrastructure/updateSurveyReminders.js --profile <admin> --apply
 */
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const pkg = require('../package.json');

const argProfile = (() => {
  const i = process.argv.indexOf('--profile');
  return i > -1 ? process.argv[i + 1] : undefined;
})();
if (argProfile) AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: argProfile });
AWS.config.region = pkg.region || 'us-east-1';

const isApply = process.argv.includes('--apply');
const iam = new AWS.IAM();
const lambda = new AWS.Lambda();

const FN = 'app-map-db-survey-reminders';
const ROLE = 'app-map-db-survey-reminders-role-posz7lnf';
const PROXY_FN = 'app-map-db';
const SRC = path.join(__dirname, '..', 'cloud_functions', 'app-map-db-survey-reminders');

const POLICY = {
  Version: '2012-10-17',
  Statement: [
    { Effect: 'Allow', Action: ['dynamodb:Scan'], Resource: 'arn:aws:dynamodb:*:*:table/surveys' },
    { Effect: 'Allow', Action: ['dynamodb:Scan', 'dynamodb:PutItem'], Resource: 'arn:aws:dynamodb:*:*:table/surveyReminders' },
    { Effect: 'Allow', Action: ['ses:SendEmail'], Resource: 'arn:aws:ses:*:*:identity/psych.digital' },
    { Effect: 'Allow', Action: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'], Resource: 'arn:aws:logs:*:*:*' }
  ]
};

(async () => {
  console.log(`updateSurveyReminders — ${isApply ? '*** APPLY ***' : 'DRY RUN (pass --apply to execute)'}`);
  console.log(`1. put inline policy 'survey-reminders-scoped-access' on role ${ROLE}:`);
  console.log(JSON.stringify(POLICY, null, 2));
  console.log(`2. deploy ${SRC} to ${FN}; runtime -> nodejs20.x; test invoke`);
  console.log(`3. ${PROXY_FN}: runtime -> nodejs20.x (config only); test invoke`);
  if (!isApply) return;

  // 1. Scoped permissions on the function's own role
  await iam.putRolePolicy({ RoleName: ROLE, PolicyName: 'survey-reminders-scoped-access', PolicyDocument: JSON.stringify(POLICY) }).promise();
  console.log('role policy set');

  // 2. Bundle + deploy + runtime
  const zipPath = path.join(SRC, 'function.zip');
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  execSync(`powershell -Command "Compress-Archive -Path '${SRC}\\index.js' -DestinationPath '${zipPath}' -Force"`, { stdio: 'inherit' });
  await lambda.updateFunctionCode({ FunctionName: FN, ZipFile: fs.readFileSync(zipPath) }).promise();
  await lambda.waitFor('functionUpdated', { FunctionName: FN }).promise();
  await lambda.updateFunctionConfiguration({ FunctionName: FN, Runtime: 'nodejs20.x' }).promise();
  await lambda.waitFor('functionUpdated', { FunctionName: FN }).promise();
  console.log(`${FN}: code deployed, runtime nodejs20.x`);

  const inv = await lambda.invoke({ FunctionName: FN, Payload: '{}' }).promise();
  const payload = JSON.parse(inv.Payload || '{}');
  if (inv.FunctionError) throw new Error(`${FN} test invoke FAILED: ${inv.Payload}`);
  const body = JSON.parse(payload.body || '{}');
  console.log(`${FN} test invoke OK:`, {
    remindersSentCount: body.remindersSentCount,
    surveyCount: body.surveyCount,
    surveyReminderCount: body.surveyReminderCount
  });

  // 3. Store-metadata proxy: runtime bump only + live test
  await lambda.updateFunctionConfiguration({ FunctionName: PROXY_FN, Runtime: 'nodejs20.x' }).promise();
  await lambda.waitFor('functionUpdated', { FunctionName: PROXY_FN }).promise();
  const proxyInv = await lambda
    .invoke({ FunctionName: PROXY_FN, Payload: JSON.stringify({ queryStringParameters: { appId: 'com.bearpty.talklife', type: 'android' } }) })
    .promise();
  const proxyPayload = JSON.parse(proxyInv.Payload || '{}');
  if (proxyInv.FunctionError || proxyPayload.statusCode !== 200) {
    console.error(`${PROXY_FN} test invoke FAILED (payload below). ROLLBACK: aws lambda update-function-configuration --function-name ${PROXY_FN} --runtime nodejs16.x`);
    console.error(String(proxyInv.Payload).slice(0, 500));
    process.exit(1);
  }
  const app = JSON.parse(proxyPayload.body || '{}');
  console.log(`${PROXY_FN} test invoke OK on nodejs20.x:`, { title: app.title, developer: app.developer });
  console.log('\nDone.');
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
