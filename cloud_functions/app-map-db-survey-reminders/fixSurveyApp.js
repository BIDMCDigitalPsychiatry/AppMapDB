const AWS = require('aws-sdk');

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:d6802415-4c63-433c-92f5-4a5c05756abe'
});

const dynamo = new AWS.DynamoDB.DocumentClient();

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

function updateSurvey(Data) {
  return new Promise(function (resolve, reject) {
    const TableName = 'surveys';
    console.log('Updating survey: ' + Data?._id);
    dynamo.put({ TableName, Item: Data }, function (err, data) {
      if (err) {
        var message = `(Error processing data.  Table: ${TableName}`;
        console.error({ message, err, TableName, Data });
        reject(err);
      } else {
        console.log('Updated survey: ' + Data?._id);
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

const main = async () => {
  const surveys = await getRows('surveys');
  const toUpdate = Object.keys(surveys)
    .filter(k => isEmptyObject(surveys[k].app))
    .map(k => ({ ...surveys[k], app: surveys[surveys[k].parentId].app }));

  console.log('Need to update ' + toUpdate.length);
  if (toUpdate.length > 0) {
    var surveyUpdate = toUpdate[0];
    await updateSurvey(surveyUpdate);
  }
};

main();
