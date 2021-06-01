import Application from './models/Application';
import { identityPoolId, region } from '../../package.json';
import { Post } from '../components/application/Blog/post';
import { Event } from './models/Event';
export const AWS = require('aws-sdk'); // Load the AWS SDK for Node.js

// Initialize the Amazon Cognito credentials provider
AWS.config.region = region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: identityPoolId
});

export const dynamo = new AWS.DynamoDB.DocumentClient();

export type DataModel = Application | Post | Event | any;
export type TableName = 'applications' | 'filters' | 'posts' | 'comments' | 'events';

export const tables = {
  applications: 'applications' as TableName,
  filters: 'filters' as TableName,
  posts: 'posts' as TableName,
  comments: 'comments' as TableName,
  events: 'events' as TableName
};
