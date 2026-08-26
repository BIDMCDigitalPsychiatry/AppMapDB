import Application from './models/Application';
import pkg from '../../package.json';
import { Post } from './models/Post';
import { Event } from './models/Event';
import { Comment } from './models/Comment';
import { Team } from './models/Team';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
// Deliberately the browser-safe Cognito-specific provider — the aggregate
// @aws-sdk/credential-providers package pulls Node-only providers
// (node:child_process) that break the web build.
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { createLocalDynamo } from './localDynamo';

/*
 * AWS SDK v3 (PLAN_MODERNIZATION.md §3): the monolithic v2 bundle (~700 KB
 * gzipped) is replaced with modular clients behind a thin adapter that keeps
 * the v2 DocumentClient calling convention — `dynamo.op(params).promise()`
 * and `dynamo.op(params, callback)` — so the ~30 existing call sites are
 * unchanged. Credentials remain the public Cognito identity pool (reads are
 * intentionally public; writes flow through the write API when configured).
 */

const region = pkg.region;
const credentials = fromCognitoIdentityPool({ identityPoolId: pkg.identityPoolId, clientConfig: { region } });

const document = DynamoDBDocument.from(new DynamoDBClient({ region, credentials }), {
  // v2's DocumentClient ignored undefined values; v3 throws without this.
  marshallOptions: { removeUndefinedValues: true }
});

type DynamoCallback = (err: any, data?: any) => void;
const withCallback = (promise: Promise<any>, callback?: DynamoCallback) => {
  if (typeof callback === 'function') promise.then(d => callback(null, d)).catch(e => callback(e));
  return { promise: () => promise };
};

const createDynamo = () => ({
  get: (params: any, callback?: DynamoCallback) => withCallback(document.get(params), callback),
  put: (params: any, callback?: DynamoCallback) => withCallback(document.put(params), callback),
  scan: (params: any, callback?: DynamoCallback) => withCallback(document.scan(params), callback),
  query: (params: any, callback?: DynamoCallback) => withCallback(document.query(params), callback),
  update: (params: any, callback?: DynamoCallback) => withCallback(document.update(params), callback),
  delete: (params: any, callback?: DynamoCallback) => withCallback(document.delete(params), callback)
});

// Local-data mode (dev only): serve a snapshot of the applications table from
// public/local-data/ instead of hitting DynamoDB. See src/database/localDynamo.ts.
const useLocalData = process.env.NODE_ENV !== 'production' && process.env.REACT_APP_USE_LOCAL_DATA === 'true';

export const dynamo = useLocalData ? createLocalDynamo() : createDynamo();

// (Email sending moved entirely server-side — src/database/sendEmail.ts
// posts to the write API, which owns templates, recipients, and SES.)

export type DataModel = Application | Post | Event | Comment | Team | any;
export type TableName = 'applications' | 'filters' | 'posts' | 'comments' | 'events' | 'surveys' | 'surveyReminders' | 'signUpSurveys' | 'team' | 'tracking' | 'users';

// GSIs on the applications table (see PLAN_DATABASE_INDEXES.md and
// scripts/db-migration/). All project full rows.
export const indexes = {
  current: 'current-index', // PK cur ('approved'|'deleted'|'pending'), SK created — the list views' data
  group: 'group-index', // PK groupId, SK created — full history of one app
  email: 'email-index' // PK email (lowercased), SK created — a rater's own rows
};

export const tables = {
  users: 'users' as TableName, // roster: admin/notify roles (PLAN_MODERNIZATION.md §2)
  applications: 'applications' as TableName,
  filters: 'filters' as TableName,
  posts: 'posts' as TableName,
  comments: 'comments' as TableName,
  events: 'events' as TableName,
  surveys: 'surveys' as TableName,
  surveyReminders: 'surveyReminders' as TableName,
  signUpSurveys: 'signUpSurveys' as TableName,
  team: 'team' as TableName,
  tracking: 'tracking' as TableName
};
