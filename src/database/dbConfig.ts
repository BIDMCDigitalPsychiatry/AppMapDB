import Application from './models/Application';
import { identityPoolId, region } from '../../package.json';
import { Post } from './models/Post';
import { Event } from './models/Event';
import { Comment } from './models/Comment';
import { Team } from './models/Team';
export const AWS = require('aws-sdk'); // Load the AWS SDK for Node.js

// Initialize the Amazon Cognito credentials provider
AWS.config.region = region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: identityPoolId
});

export const dynamo = new AWS.DynamoDB.DocumentClient();

export type DataModel = Application | Post | Event | Comment | Team | any;
export type TableName = 'applications' | 'filters' | 'posts' | 'comments' | 'events' | 'surveys' | 'surveyReminders' | 'team';

export const tables = {
  applications: 'applications' as TableName,
  filters: 'filters' as TableName,
  posts: 'posts' as TableName,
  comments: 'comments' as TableName,
  events: 'events' as TableName,
  surveys: 'surveys' as TableName,
  surveyReminders: 'surveyReminders' as TableName,
  team: 'team' as TableName
};
