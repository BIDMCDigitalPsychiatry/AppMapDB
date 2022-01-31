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
function dayAbbrOfWeek(dayIndex) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
}

function monthAbbrOfYear(monthIndex) {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIndex];
}

function nth(d) {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function addZero(i) {
  if (i < 10) {
    i = '0' + i;
  }
  return i;
}

function getDayTimeFromTimestamp(timestamp) {
  var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  d.setUTCMilliseconds(timestamp); //utc time
  var day = dayAbbrOfWeek(d.getDay());
  var dayNumber = d.getDate() + nth(d.getDate());
  var year = d.getFullYear();
  var h = d.getHours();
  var m = addZero(d.getMinutes());
  var isPM = h > 12 ? true : false;
  h = isPM ? h - 12 : h === 0 ? 12 : h; //If PM, subtract 12.  If we are 0 or midnight, then set to 12, otherwise use the normal hour index
  var month = monthAbbrOfYear(d.getMonth());

  return `${day} ${month} ${dayNumber} ${year} ${h}:${m} ${isPM ? 'PM' : 'AM'}`;
}

function sortDescending(a = 0, b = 0) {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
}

function sortAscending(a = 0, b = 0) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

const sortAscendingByKey =
  key =>
  (a = 0, b = 0) => {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  };
const sortDescendingByKey =
  key =>
  (a = 0, b = 0) => {
    if (a[key] < b[key]) return 1;
    if (a[key] > b[key]) return -1;
    return 0;
  };

const getAppName = app => {
  const androidStore = app?.androidStore;
  const appleStore = app?.appleStore;
  return !isEmpty(app?.name)
    ? app.name
    : androidStore && !isEmpty(androidStore.title)
    ? androidStore.title
    : appleStore && !isEmpty(appleStore.title)
    ? appleStore.title
    : app?.name;
};

const main = async () => {
  var rows = await getRows('applications');
  var sorted = Object.keys(rows)
    .map(k => ({ ...rows[k] }))
    .sort(sortAscendingByKey('updated'));

  const filtered = sorted
    .filter(
      row =>
        //rows[k].email === 'jmelcher@bidmc.harvard.edu'
        //rows[k].webLink === 'https://www.aurumwellness.in/'
        //row.groupId === 'ba6fca1ca4a64b5f9ac89442574c49b7'
        Number(row.created) > 1643401125235 || Number(row.updated) > 1643401125235
    )
    .map(row => ({
      ...row,
      name: getAppName(row),

      updatedStamp: getDayTimeFromTimestamp(row.updated),
      createdStamp: getDayTimeFromTimestamp(row.created)
    }));

  filtered.forEach(({ name, email, approverEmail, updated, approved, created, updatedStamp, createdStamp }, i) => {
    //if (i > filtered.length - 100)
    console.log({ name, email, approverEmail, updated, approved, created, updatedStamp, createdStamp });
  });

  console.log('Rows: ' + Object.keys(rows).length);
  console.log('Filtered: ' + filtered.length);
  /*if (toUpdate.length > 0) {
    var surveyUpdate = toUpdate[0];
    await updateSurvey(surveyUpdate);
  }*/
};

main();
