import Application from './models/Application';
import pkg from '../../package.json';
import { Post } from './models/Post';
import { Event } from './models/Event';
import { Comment } from './models/Comment';
import { Team } from './models/Team';
export const AWS = require('aws-sdk'); // Load the AWS SDK for Node.js

// Initialize the Amazon Cognito credentials provider
AWS.config.region = pkg.region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: pkg.identityPoolId
});

// Local-data mode (dev only): serve a snapshot of the applications table from
// public/local-data/ instead of hitting DynamoDB. See src/database/localDynamo.ts.
const useLocalData = process.env.NODE_ENV !== 'production' && process.env.REACT_APP_USE_LOCAL_DATA === 'true';

export const dynamo = useLocalData ? require('./localDynamo').createLocalDynamo() : new AWS.DynamoDB.DocumentClient();

export type DataModel = Application | Post | Event | Comment | Team | any;
export type TableName = 'applications' | 'filters' | 'posts' | 'comments' | 'events' | 'surveys' | 'surveyReminders' | 'signUpSurveys' | 'team' | 'tracking';

export const tables = {
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
