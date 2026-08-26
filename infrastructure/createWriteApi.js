/*
 * Creates the write-API Lambda + its scoped execution role + an API Gateway
 * HTTP API endpoint (PLAN_MODERNIZATION.md §1). Additive only: creates new
 * resources, never modifies existing roles/policies/functions of the
 * pre-existing stack. Rerunnable: updates code/config in place.
 *
 * NOTE: Lambda Function URLs turned out to be publicly blocked in this
 * account (AWS-level 403 despite a correct resource policy), which is
 * presumably why the search-assistant also fronts its Lambda with API
 * Gateway. This script uses an HTTP API with a Lambda proxy target.
 *
 * Prereq: `npm install` inside cloud_functions/mindapps-write-api (bundles
 * aws-jwt-verify; the AWS SDK v3 clients are provided by the Node 20 runtime).
 *
 * Usage: node infrastructure/createWriteApi.js --profile <admin> [--apply]
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

const FN = 'mindapps-write-api';
const ROLE = 'mindapps-write-api-role';
const SRC = path.join(__dirname, '..', 'cloud_functions', 'mindapps-write-api');

const list = s =>
  (s || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
    .join(',');

const ENV = {
  ALLOWED_ORIGIN: '*', // tighten to https://mindapps.org at the later lockdown
  USER_POOL_ID: 'us-east-1_hXektTdUL',
  USER_POOL_CLIENT_ID: '4ngc7297ls1pngpm8hapdv03f9',
  USERS_TABLE: 'users',
  FALLBACK_ADMINS: list(pkg.adminUsers),
  // Super Admins may view/manage the users roster; seeded per Chris
  // 2026-08-25 — these two grant the role to others via the Users page.
  FALLBACK_SUPERADMINS: 'selzzt@bu.edu,cvanem@gmail.com',
  FALLBACK_NOTIFY: list(pkg.emailUsers)
};

// Scoped: only the tables the API writes + the applications indexes + logs.
const POLICY = {
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:Query', 'dynamodb:Scan'],
      Resource: [
        'arn:aws:dynamodb:*:*:table/applications',
        'arn:aws:dynamodb:*:*:table/applications/index/*',
        'arn:aws:dynamodb:*:*:table/users',
        'arn:aws:dynamodb:*:*:table/posts',
        'arn:aws:dynamodb:*:*:table/comments',
        'arn:aws:dynamodb:*:*:table/events',
        'arn:aws:dynamodb:*:*:table/team',
        'arn:aws:dynamodb:*:*:table/filters',
        'arn:aws:dynamodb:*:*:table/surveys',
        'arn:aws:dynamodb:*:*:table/signUpSurveys'
      ]
    },
    // Hard-delete is intentionally allowed ONLY on the users roster (people
    // leaving the company) — the Lambda physically cannot delete application
    // rows or any other table's data.
    { Effect: 'Allow', Action: ['dynamodb:DeleteItem'], Resource: 'arn:aws:dynamodb:*:*:table/users' },
    { Effect: 'Allow', Action: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'], Resource: 'arn:aws:logs:*:*:*' }
  ]
};

const TRUST = {
  Version: '2012-10-17',
  Statement: [{ Effect: 'Allow', Principal: { Service: 'lambda.amazonaws.com' }, Action: 'sts:AssumeRole' }]
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log(`createWriteApi — ${isApply ? '*** APPLY ***' : 'DRY RUN (pass --apply to execute)'}`);
  console.log(`function: ${FN}  role: ${ROLE}  runtime: nodejs20.x  handler: lambda.handler`);
  console.log('env:', { ...ENV, FALLBACK_ADMINS: `${ENV.FALLBACK_ADMINS.split(',').length} emails`, FALLBACK_NOTIFY: `${ENV.FALLBACK_NOTIFY.split(',').length} emails` });
  if (!isApply) return;

  // 1. Bundle
  console.log('bundling (npm install + zip)...');
  execSync('npm install --omit=dev', { cwd: SRC, stdio: 'inherit' });
  const zipPath = path.join(SRC, 'function.zip');
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  execSync(`powershell -Command "Compress-Archive -Path '${SRC}\\*' -DestinationPath '${zipPath}' -Force"`, { stdio: 'inherit' });
  const ZipFile = fs.readFileSync(zipPath);
  console.log(`bundle: ${(ZipFile.length / 1024).toFixed(0)} KB`);

  // 2. Execution role (new, additive)
  let roleArn;
  try {
    roleArn = (await iam.getRole({ RoleName: ROLE }).promise()).Role.Arn;
    console.log('role exists:', roleArn);
  } catch {
    roleArn = (await iam.createRole({ RoleName: ROLE, AssumeRolePolicyDocument: JSON.stringify(TRUST), Description: 'MindApps write API execution role (scoped)' }).promise())
      .Role.Arn;
    console.log('role created:', roleArn);
    await sleep(10000); // IAM propagation
  }
  await iam.putRolePolicy({ RoleName: ROLE, PolicyName: 'mindapps-write-api-access', PolicyDocument: JSON.stringify(POLICY) }).promise();

  // 3. Function (create or update)
  const exists = await lambda
    .getFunction({ FunctionName: FN })
    .promise()
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    for (let attempt = 0; ; attempt++) {
      try {
        await lambda
          .createFunction({
            FunctionName: FN,
            Runtime: 'nodejs20.x',
            Handler: 'lambda.handler',
            Role: roleArn,
            Code: { ZipFile },
            Timeout: 30,
            MemorySize: 256,
            Environment: { Variables: ENV },
            Description: 'MindApps authenticated write API (PLAN_MODERNIZATION.md)'
          })
          .promise();
        break;
      } catch (e) {
        if (e.code === 'InvalidParameterValueException' && attempt < 6) {
          console.log('waiting for IAM propagation...');
          await sleep(10000);
        } else throw e;
      }
    }
    console.log('function created');
  } else {
    await lambda.updateFunctionCode({ FunctionName: FN, ZipFile }).promise();
    await lambda.waitFor('functionUpdated', { FunctionName: FN }).promise();
    await lambda.updateFunctionConfiguration({ FunctionName: FN, Environment: { Variables: ENV } }).promise();
    console.log('function code + config updated');
  }
  await lambda.waitFor('functionActive', { FunctionName: FN }).promise();

  // 4. API Gateway HTTP API (public endpoint; authorization happens inside via JWT)
  const apigw = new AWS.ApiGatewayV2();
  const fnArn = `arn:aws:lambda:${AWS.config.region}:${roleArn.split(':')[4]}:function:${FN}`;
  const existingApi = (await apigw.getApis({}).promise()).Items.find(a => a.Name === FN);
  let api = existingApi;
  if (!api) {
    api = await apigw
      .createApi({
        Name: FN,
        ProtocolType: 'HTTP',
        Target: fnArn,
        // MaxAge lets browsers cache the CORS preflight (Chrome caps at 2h);
        // without it Chrome re-preflights every ~5s, adding a round trip to
        // nearly every click.
        CorsConfiguration: { AllowOrigins: ['*'], AllowMethods: ['POST'], AllowHeaders: ['content-type', 'authorization'], MaxAge: 7200 }
      })
      .promise();
    await lambda
      .addPermission({
        FunctionName: FN,
        StatementId: 'apigateway-invoke',
        Action: 'lambda:InvokeFunction',
        Principal: 'apigateway.amazonaws.com',
        SourceArn: `arn:aws:execute-api:${AWS.config.region}:${roleArn.split(':')[4]}:${api.ApiId}/*`
      })
      .promise()
      .catch(e => {
        if (e.code !== 'ResourceConflictException') throw e;
      });
  }
  // 5. Warmer: ping the function every 5 minutes so admin actions never pay
  // a cold start (~1.5s measured: init + lazy JWKS fetch). Same EventBridge
  // pattern as the survey reminders. Cost: ~8.6k 2ms invocations/month ≈ $0.
  const events = new AWS.CloudWatchEvents();
  const RULE = 'mindapps-write-api-warmer';
  const rule = await events.putRule({ Name: RULE, ScheduleExpression: 'rate(5 minutes)', Description: 'Keep mindapps-write-api warm' }).promise();
  await events.putTargets({ Rule: RULE, Targets: [{ Id: 'write-api', Arn: fnArn, Input: JSON.stringify({ ping: true }) }] }).promise();
  await lambda
    .addPermission({ FunctionName: FN, StatementId: 'events-warmer', Action: 'lambda:InvokeFunction', Principal: 'events.amazonaws.com', SourceArn: rule.RuleArn })
    .promise()
    .catch(e => {
      if (e.code !== 'ResourceConflictException') throw e;
    });
  console.log('warmer schedule active:', RULE);

  console.log('\nAPI endpoint:', api.ApiEndpoint);
  console.log('Set REACT_APP_WRITE_API_URL to this value (baked into .env and the deploy workflow).');
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
