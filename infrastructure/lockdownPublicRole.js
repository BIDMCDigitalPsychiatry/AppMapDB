/*
 * DYNAMODB PUBLIC-ROLE LOCKDOWN (approved by Chris 2026-08-26).
 *
 * Every browser — anonymous or signed in — uses the identity pool's
 * UNAUTHENTICATED role (the frontend never exchanges user-pool logins for
 * credentials, and the auth role has no DynamoDB access). Until now that role
 * carried the AWS-managed AmazonDynamoDBFullAccess policy: full read/write/
 * delete on every table in the account, which is what let any visitor write
 * the database directly.
 *
 * This script replaces that with a customer-managed policy that preserves
 * exactly what the frontend still does directly:
 *   - READS on the 10 app tables (+ the applications GSIs): the library,
 *     app views, My Ratings, roster hints, community, admin views/exports.
 *   - PutItem ONLY on the 3 anonymous-submission tables: tracking (visitor
 *     analytics), surveys and signUpSurveys (public survey forms; admin
 *     archive/follow-up updates are also PutItems on surveys).
 * Everything else (applications, users, posts, comments, events, team,
 * filters) writes exclusively through the authenticated write API.
 *
 * Also detaches AWSLambdaFullAccess (approved by Chris 2026-08-26): it let
 * any visitor invoke and modify Lambda functions, and nothing in the frontend
 * uses the Lambda SDK — both proxies go through API Gateway URLs.
 *
 * ROLLBACK (one command each):
 *   aws iam attach-role-policy --role-name Cognito_AppMapDBUnauth_Role \
 *     --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
 *   aws iam attach-role-policy --role-name Cognito_AppMapDBUnauth_Role \
 *     --policy-arn arn:aws:iam::aws:policy/AWSLambdaFullAccess
 *
 * Usage:
 *   node infrastructure/lockdownPublicRole.js --profile <admin>            # dry run
 *   node infrastructure/lockdownPublicRole.js --profile <admin> --apply
 *
 * NOT touched here: the AppMapAdminS3 policy, the auth role, all Lambda roles.
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
const iam = new AWS.IAM();

const ROLE = 'Cognito_AppMapDBUnauth_Role';
const POLICY_NAME = 'AppMapDBPublicDataAccess';
const FULL_ACCESS_ARN = 'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess';
const LAMBDA_FULL_ARN = 'arn:aws:iam::aws:policy/AWSLambdaFullAccess';

const TABLES = ['applications', 'users', 'posts', 'comments', 'events', 'team', 'filters', 'surveys', 'signUpSurveys', 'tracking'];
const PUBLIC_WRITE_TABLES = ['tracking', 'surveys', 'signUpSurveys'];

const arnFor = t => `arn:aws:dynamodb:*:*:table/${t}`;

const POLICY = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicReads',
      Effect: 'Allow',
      Action: ['dynamodb:GetItem', 'dynamodb:BatchGetItem', 'dynamodb:Query', 'dynamodb:Scan'],
      Resource: [...TABLES.map(arnFor), 'arn:aws:dynamodb:*:*:table/applications/index/*']
    },
    {
      Sid: 'AnonymousSubmissions',
      Effect: 'Allow',
      Action: ['dynamodb:PutItem'],
      Resource: PUBLIC_WRITE_TABLES.map(arnFor)
    }
  ]
};

(async () => {
  console.log(`lockdownPublicRole — ${isApply ? '*** APPLY ***' : 'DRY RUN (pass --apply to execute)'}`);
  console.log(`role: ${ROLE}`);
  console.log(`will attach customer-managed policy '${POLICY_NAME}':`);
  console.log(JSON.stringify(POLICY, null, 2));
  console.log(`will detach: ${FULL_ACCESS_ARN}`);
  console.log(`will detach: ${LAMBDA_FULL_ARN}`);
  if (!isApply) return;

  // 1. Create (or reuse) the customer-managed policy.
  const accountId = (await new AWS.STS().getCallerIdentity({}).promise()).Account;
  const policyArn = `arn:aws:iam::${accountId}:policy/${POLICY_NAME}`;
  try {
    await iam.createPolicy({ PolicyName: POLICY_NAME, PolicyDocument: JSON.stringify(POLICY), Description: 'MindApps public browser access: reads + anonymous submission PutItems only' }).promise();
    console.log('policy created:', policyArn);
  } catch (e) {
    if (e.code !== 'EntityAlreadyExists') throw e;
    console.log('policy already exists:', policyArn);
  }

  // 2. Attach it, THEN detach the full-access policy (never a gap with neither).
  await iam.attachRolePolicy({ RoleName: ROLE, PolicyArn: policyArn }).promise();
  console.log('attached', POLICY_NAME);
  await iam.detachRolePolicy({ RoleName: ROLE, PolicyArn: FULL_ACCESS_ARN }).promise();
  console.log('detached AmazonDynamoDBFullAccess');
  await iam.detachRolePolicy({ RoleName: ROLE, PolicyArn: LAMBDA_FULL_ARN }).promise().catch(e => {
    if (e.code !== 'NoSuchEntity') throw e;
    console.log('AWSLambdaFullAccess was already detached');
  });
  console.log('detached AWSLambdaFullAccess');

  const attached = (await iam.listAttachedRolePolicies({ RoleName: ROLE }).promise()).AttachedPolicies.map(p => p.PolicyName);
  console.log('\nrole now has attached policies:', attached.join(', '));
  console.log('Done. Allow ~1 minute for IAM propagation, then verify: public browse, survey submit, admin approve, survey archive.');
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
