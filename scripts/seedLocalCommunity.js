// Seed community data (posts + comments + team) for local-data mode.
//
// Pulls the REAL team/posts/comments tables via the same public read-only
// Cognito pool the site uses (so covers/avatars are real S3 images), 
// Writes public/local-data/{team,posts,comments}.json for localDynamo.ts.
// Local testing only — never uploaded anywhere.
//
// Usage: node scripts/seedLocalCommunity.js

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const pkg = require('../package.json');

AWS.config.region = pkg.region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: pkg.identityPoolId });
const dynamo = new AWS.DynamoDB.DocumentClient();

const scanAll = async TableName => {
  const rows = [];
  let items;
  const params = { TableName, ExclusiveStartKey: undefined };
  try {
    do {
      items = await dynamo.scan(params).promise();
      items.Items.forEach(i => rows.push(i));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== 'undefined');
  } catch (err) {
    console.warn(`Scan of '${TableName}' failed (${err.code ?? err.message}); seeding synthetic data only.`);
  }
  return rows;
};

const main = async () => {
  const outDir = path.join(__dirname, '..', 'public', 'local-data');
  fs.mkdirSync(outDir, { recursive: true });

  const [realPosts, realComments, realTeam] = await Promise.all([scanAll('posts'), scanAll('comments'), scanAll('team')]);

  const allPosts = realPosts;
  const allComments = realComments;

  fs.writeFileSync(path.join(outDir, 'posts.json'), JSON.stringify(allPosts, null, 2));
  fs.writeFileSync(path.join(outDir, 'comments.json'), JSON.stringify(allComments, null, 2));
  fs.writeFileSync(path.join(outDir, 'team.json'), JSON.stringify(realTeam, null, 2));
  console.log(
    `Wrote ${allPosts.length} posts, ${allComments.length} comments, and ${realTeam.length} team members to ${outDir}`
  );
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
