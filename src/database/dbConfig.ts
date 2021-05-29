import Application from './models/Application';
import { identityPoolId, region } from '../../package.json';
export const AWS = require('aws-sdk'); // Load the AWS SDK for Node.js

// Initialize the Amazon Cognito credentials provider
AWS.config.region = region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: identityPoolId
});

export const dynamo = new AWS.DynamoDB.DocumentClient();

export type DataModel = Application;
export type TableName = 'applications' | 'filters' | 'posts' | 'comments';

export const tables = {
  applications: 'applications' as TableName,
  filters: 'filters' as TableName,
  posts: 'posts' as TableName,
  comments: 'comments' as TableName
};
