const AWS = require('aws-sdk');

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:d6802415-4c63-433c-92f5-4a5c05756abe'
});

const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = 'applications';

const getRows = async TableName => {
  let scanResults = [];
  let items;
  var params = {
    TableName,
    ExclusiveStartKey: undefined
  };
  var rows = {};
  do {
    items = await dynamo.scan(params).promise();
    items.Items.forEach(i => scanResults.push(i));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey != 'undefined');
  rows = scanResults.reduce((f, c) => {
    f[c._id] = c;
    return f;
  }, {});

  return rows;
};

function copyRow(rowData) {
  return new Promise(function (resolve, reject) {
    // console.log('Copying row: ' + rowData?._id);
    // Add logic here to copy the row to data to another destination
    resolve(true);
  });
}
const copyDatabase = async () => {
  console.log(`Getting all rows from AWS dynamo db table: ${TableName}`);
  const rows = await getRows(TableName);
  console.log(`Received ${Object.keys(rows).length} rows from AWS dynamo db table: ${TableName}`);
  const rowKeys = Object.keys(rows);
  for (let i = 0; i < rowKeys.length; i++) {
    const rowKey = rowKeys[i];
    const rowData = rows[rowKey];
    await copyRow(rowData);
  }
  console.log('Done copying!');

  return;
};

copyDatabase();
