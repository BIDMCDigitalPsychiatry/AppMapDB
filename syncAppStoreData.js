const AWS = require('aws-sdk');

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:d6802415-4c63-433c-92f5-4a5c05756abe'
});

const dynamo = new AWS.DynamoDB.DocumentClient();

const TableName = 'applications-test';

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

const isEmptyObject = obj => {
  if (isEmpty(obj)) {
    return true;
  } else if (typeof obj === 'object') {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  } else {
    return false; // Is not empty and is not an object
  }
};

// This syncs the exclude column.
// Items that have exclude = true do not need to be included in the initial snapshot for display in the applications table.
// If an item is restored that was previosly deleted this function may need to be re-executed
const syncAppStoreData = async () => {
  const rows = await getRows(TableName);
  const rowKeys = Object.keys(rows);
  for (let i = 0; i < rowKeys.length; i++) {
    const k = rowKeys[i];
    const { childId, androidStore, appleStore, ...remaining } = rows[k];
    await updateRow({ ...remaining });

    /*if (isEmpty(childId)) {
      // find the newest child and then link that id
      const child = Object.keys(rows).find(k2 => rows[k2].parent?._id === k && rows[k2].approved === true && rows[k2].delete !== true);
      if (child) {
        await updateRow({ ...remaining, childId: child._id });
      }
    }
    */
  }

  return;
};

syncAppStoreData();
