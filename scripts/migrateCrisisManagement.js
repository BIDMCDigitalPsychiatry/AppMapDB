const AWS = require('aws-sdk');

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:d6802415-4c63-433c-92f5-4a5c05756abe'
});

const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = 'applications';

function isEmpty(str) {
  return !str || 0 === str.length;
}

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

function updateRow(Data) {
  return new Promise(function (resolve, reject) {
    console.log('Updating row: ' + Data?._id);
    dynamo.put({ TableName, Item: Data }, function (err, data) {
      if (err) {
        var message = `(Error processing data.  Table: ${TableName}`;
        console.error({ message, err, TableName, Data });
        reject(err);
      } else {
        console.log('Updated application: ' + Data?._id);
        resolve(true);
      }
    });
  });
}
const migrateDatabase = async () => {
  const rows = await getRows(TableName);
  console.log({ rows: Object.keys(rows).length });
  const rowKeys = Object.keys(rows);

  for (let i = 0; i < rowKeys.length; i++) {
    const k = rowKeys[i];
    const { clinicalFoundations, privacies, ...remaining } = rows[k];
    if (
      privacies !== undefined &&
      privacies.find(v => v === 'Has Crisis Management Feature') &&
      (clinicalFoundations === undefined || !clinicalFoundations.find(v => v === 'Appropriately Advises Patient in Case of Emergency'))
    ) {
      console.log('Migrating ' + k + ', i=' + i);
      const newClinicalFoundations = [...(clinicalFoundations ?? []), 'Appropriately Advises Patient in Case of Emergency'];
      const newPrivacies = [...privacies.filter(v => v !== 'Has Crisis Management Feature')];
      // remove any un-nessary data and only keep the required fields to reduce snapshot size
      await updateRow({ ...remaining, clinicalFoundations: newClinicalFoundations, privacies: newPrivacies });
    } else {
      console.log('Skipping ' + k + ', i=' + i);
    }
  }

  return;
};

console.log('Migrating database');

migrateDatabase();
