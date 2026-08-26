/*
 * POST-MERGE EMAIL VERIFICATION (PLAN_MODERNIZATION.md §1 — the five browser
 * SES flows moved behind the write API).
 *
 * Exercises every moved email scenario against the LIVE API while making
 * sure ONLY the test inbox (cvanem@gmail.com) receives mail:
 *   1. Snapshots the roster, then temporarily moves the `notify` and
 *      `surveynotify` roles onto the test inbox (removing them from real
 *      staff for the duration).
 *   2. Fires the four token-less scenarios through the public API:
 *        - surveyConfirmation  (participant email -> test inbox)
 *        - surveyStaffNotice   (surveynotify role -> test inbox)
 *        - ratingInterest      (notify role       -> test inbox)
 *        - suggestEdit         (notify role       -> test inbox)
 *   3. Runs the negative checks (no emails sent): unknown type -> 400,
 *      surveyFollowUp without a token -> 401, invalid data -> 400.
 *   4. Creates a dummy survey row (participant = test inbox) so the fifth,
 *      admin-gated scenario can be exercised through the REAL UI: open
 *      Admin -> Surveys, find "EMAIL VERIFICATION TEST", click its
 *      follow-up action — the invite lands in the test inbox.
 *   5. RESTORES the roster exactly (also on failure).
 *
 * Usage:
 *   node infrastructure/verifyEmails.js --profile <admin>            # dry run
 *   node infrastructure/verifyEmails.js --profile <admin> --apply    # run it
 *   node infrastructure/verifyEmails.js --profile <admin> --cleanup  # remove the dummy survey row
 *
 * Expected inbox result after --apply: FOUR emails at the test inbox
 * (Survey Complete, Survey Completed Notification, App Rating Interest,
 * Suggested Edit), plus a FIFTH (Survey Follow Up) after the manual UI step.
 */
const AWS = require('aws-sdk');
const https = require('https');
const pkg = require('../package.json');

const argProfile = (() => {
  const i = process.argv.indexOf('--profile');
  return i > -1 ? process.argv[i + 1] : undefined;
})();
if (argProfile) AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: argProfile });
AWS.config.region = pkg.region || 'us-east-1';

const isApply = process.argv.includes('--apply');
const isCleanup = process.argv.includes('--cleanup');
const doc = new AWS.DynamoDB.DocumentClient();

const API_URL = 'https://c9f9mkxos6.execute-api.us-east-1.amazonaws.com';
const TEST_INBOX = 'cvanem@gmail.com';
const TEST_ROLES = ['notify', 'surveynotify'];
const TEST_SURVEY_ID = 'emailverificationtest0000000000001';

const post = body =>
  new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, res => {
      let out = '';
      res.on('data', c => (out += c));
      res.on('end', () => resolve({ status: res.statusCode, body: out }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });

const scanUsers = async () => {
  const rows = [];
  let start;
  do {
    const page = await doc.scan({ TableName: 'users', ExclusiveStartKey: start }).promise();
    rows.push(...page.Items);
    start = page.LastEvaluatedKey;
  } while (start);
  return rows;
};

const setRoles = (email, roles) =>
  doc
    .update({
      TableName: 'users',
      Key: { email },
      UpdateExpression: 'SET #r = :r, updated = :u, updatedBy = :b',
      ExpressionAttributeNames: { '#r': 'roles' },
      ExpressionAttributeValues: { ':r': roles, ':u': Date.now(), ':b': 'verifyEmails.js' }
    })
    .promise();

(async () => {
  if (isCleanup) {
    await doc.delete({ TableName: 'surveys', Key: { _id: TEST_SURVEY_ID } }).promise();
    console.log('Removed the EMAIL VERIFICATION TEST survey row. Done.');
    return;
  }

  const users = await scanUsers();
  const affected = users.filter(u => (u.roles || []).some(r => TEST_ROLES.includes(r)));
  console.log(`Roster snapshot (${affected.length} rows hold notify/surveynotify):`);
  affected.forEach(u => console.log(`  ${u.email}: ${(u.roles || []).join(', ')}`));
  console.log(`\nPlan: route ALL notification emails to ${TEST_INBOX}, fire 4 scenarios + negatives, create the dummy survey, restore the roster.`);
  if (!isApply) {
    console.log('\nDry run only. Re-run with --apply to execute.');
    return;
  }

  const snapshot = new Map(users.map(u => [u.email, u.roles || []]));
  const restore = async () => {
    for (const [email, roles] of snapshot) {
      const current = (await doc.get({ TableName: 'users', Key: { email } }).promise()).Item;
      if (JSON.stringify((current && current.roles) || []) !== JSON.stringify(roles)) await setRoles(email, roles);
    }
    console.log('Roster restored to snapshot.');
  };

  try {
    // 1. Route the notification roles to the test inbox only.
    for (const u of affected) await setRoles(u.email, (u.roles || []).filter(r => !TEST_ROLES.includes(r)));
    const mine = snapshot.get(TEST_INBOX) || [];
    await setRoles(TEST_INBOX, [...new Set([...mine, ...TEST_ROLES])]);
    console.log(`\nRoles redirected to ${TEST_INBOX}. Sending...`);

    // 2. The four token-less scenarios.
    const scenarios = [
      ['surveyConfirmation', { email: TEST_INBOX }],
      ['surveyStaffNotice', { email: TEST_INBOX, appName: 'EMAIL VERIFICATION TEST' }],
      ['ratingInterest', { name: 'Email Verification', title: 'Test', email: TEST_INBOX, institution: 'Test Run', details: 'Automated post-merge check' }],
      ['suggestEdit', { name: 'Email Verification', email: TEST_INBOX, suggestion: 'Automated post-merge check', appName: 'EMAIL VERIFICATION TEST', appCompany: 'Test', appId: 'abc123' }]
    ];
    for (const [type, data] of scenarios) {
      const res = await post({ email: { type, data } });
      console.log(`  ${type}: ${res.status} ${res.body}`);
    }

    // 3. Negative checks (nothing sent).
    const negatives = [
      ['unknown type -> 400', { email: { type: 'hax', data: {} } }, 400],
      ['followUp w/o token -> 401', { email: { type: 'surveyFollowUp', data: { email: TEST_INBOX, followUpSurveyType: '2 Week', surveyId: 'a1', appId: 'b2' } } }, 401],
      ['bad participant email -> 400', { email: { type: 'surveyConfirmation', data: { email: 'nope' } } }, 400]
    ];
    for (const [label, body, expected] of negatives) {
      const res = await post(body);
      console.log(`  ${label}: got ${res.status} ${res.status === expected ? 'PASS' : '*** FAIL ***'}`);
    }

    // 4. Dummy survey row for the manual admin-gated scenario.
    await doc
      .put({
        TableName: 'surveys',
        Item: {
          _id: TEST_SURVEY_ID,
          'What is the best email address we can reach you at?': TEST_INBOX,
          surveyType: 'Initial',
          app: { _id: 'emailtest0000000000000000000000001', name: 'EMAIL VERIFICATION TEST' },
          created: Date.now()
        }
      })
      .promise();
    console.log('\nDummy survey created. Manual step: Admin -> Surveys -> find "EMAIL VERIFICATION TEST" -> send the follow-up.');
    console.log(`Then check ${TEST_INBOX} for 5 emails total, and finish with --cleanup to remove the dummy survey.`);
  } finally {
    await restore();
  }
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
