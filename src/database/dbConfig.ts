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

export const dynamo = new AWS.DynamoDB.DocumentClient();

export type DataModel = Application | Post | Event | Comment | Team | any;
export type TableName = 'applications' | 'applications_trimmed' | 'filters' | 'posts' | 'comments' | 'events' | 'surveys' | 'surveyReminders' | 'signUpSurveys' | 'team' | 'tracking';

// Function to get the appropriate applications table name for DynamoDB operations
export const getApplicationsTableName = (): TableName => {
  return pkg.enableTrimmedDb ? 'applications_trimmed' : 'applications';
};

// Tables object - always use 'applications' for Redux store consistency
// Only use getApplicationsTableName() for actual DynamoDB operations
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
