/*
 * Creates the MIND study (Workflow Analytics) test accounts.
 *
 * The study team supplied placeholder addresses that cannot receive mail, so
 * each account is created by an admin call instead of normal sign-up:
 *   - Cognito: AdminCreateUser with email_verified=true and MessageAction
 *     SUPPRESS (no invitation email is sent), then AdminSetUserPassword
 *     --permanent so participants are never asked to change the password.
 *   - users roster table: a row with the `analytics` role, which turns on the
 *     study tools (Start/Stop panel). A super admin can untick the role on
 *     Admin -> Users to switch an account off.
 *
 * Rerunnable: accounts / roster rows that already exist are left untouched
 * (pass --reset-password to re-apply the shared password to existing ones).
 *
 * Usage:
 *   STUDY_PASSWORD='...' node infrastructure/createStudyAccounts.js --profile mindapps            # dry run
 *   STUDY_PASSWORD='...' node infrastructure/createStudyAccounts.js --profile mindapps --apply
 * The password is read from the environment so it never lands in the repo.
 */
const AWS = require('aws-sdk');
const pkg = require('../package.json');

const argProfile = (() => {
  const i = process.argv.indexOf('--profile');
  return i > -1 ? process.argv[i + 1] : undefined;
})();
if (argProfile) AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: argProfile });
AWS.config.region = pkg.region || 'us-east-1';

const isApply = process.argv.includes('--apply');
const resetPassword = process.argv.includes('--reset-password');
const UserPoolId = 'us-east-1_hXektTdUL';
const TableName = 'users';
const ROLE = 'analytics';
const PASSWORD = process.env.STUDY_PASSWORD;

// List supplied by the study team 2026-11-09: test_subject + subject2..subject101.
const EMAILS = ['test_subject@mind.org', ...Array.from({ length: 100 }, (_, i) => `subject${i + 2}@mind.org`)];

const cognito = new AWS.CognitoIdentityServiceProvider();
const doc = new AWS.DynamoDB.DocumentClient();

const cognitoExists = async email => {
  const r = await cognito.listUsers({ UserPoolId, Filter: `email = "${email}"`, Limit: 1 }).promise();
  return r.Users.length > 0;
};

const setPassword = email => cognito.adminSetUserPassword({ UserPoolId, Username: email, Password: PASSWORD, Permanent: true }).promise();

(async () => {
  console.log(`createStudyAccounts — ${isApply ? '*** APPLY ***' : 'DRY RUN (pass --apply to execute)'}`);
  if (!PASSWORD || PASSWORD.length < 8) throw new Error('Set STUDY_PASSWORD (8+ characters) in the environment');
  console.log(`${EMAILS.length} accounts: ${EMAILS[0]}, ${EMAILS[1]} … ${EMAILS[EMAILS.length - 1]}`);

  const tally = { created: 0, existed: 0, passwordReset: 0, rosterAdded: 0, rosterExisted: 0 };
  for (const email of EMAILS) {
    const exists = await cognitoExists(email);
    if (!isApply) {
      console.log(`  ${email}: ${exists ? 'exists (skip)' : 'would create'}`);
      continue;
    }
    if (exists) {
      tally.existed++;
      if (resetPassword) {
        await setPassword(email);
        tally.passwordReset++;
      }
    } else {
      await cognito
        .adminCreateUser({
          UserPoolId,
          Username: email,
          MessageAction: 'SUPPRESS',
          TemporaryPassword: PASSWORD,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'true' }
          ]
        })
        .promise();
      await setPassword(email);
      tally.created++;
    }

    try {
      const now = Date.now();
      await doc
        .put({
          TableName,
          Item: { email, roles: [ROLE], active: true, created: now, updated: now, updatedBy: 'seed:createStudyAccounts' },
          ConditionExpression: 'attribute_not_exists(email)'
        })
        .promise();
      tally.rosterAdded++;
    } catch (e) {
      if (e.code !== 'ConditionalCheckFailedException') throw e;
      tally.rosterExisted++;
    }
  }
  if (isApply) console.log('done:', tally);
})().catch(e => {
  console.error('FAILED:', e.message || e);
  process.exit(1);
});
