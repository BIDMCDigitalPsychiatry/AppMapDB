const AWS = require('aws-sdk');
var gplay = require('google-play-scraper');
var apple = require('app-store-scraper');

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:d6802415-4c63-433c-92f5-4a5c05756abe'
});

const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = 'applications';

function isEmpty(str) {
  return !str || 0 === str.length;
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

const getAndroidIdFromUrl = url => {
  var searchStr = '?id=';
  var index = url?.indexOf(searchStr);
  if (index >= 0) {
    var indexEnd = url.indexOf('&', index);
    var returnUrl = url.substring(index + searchStr.length, indexEnd >= 0 ? indexEnd : undefined);
    return returnUrl.split('?')[0]?.split('&')[0]; // disregard any extra url parameters
  }
};

const getAppleIdFromUrl = url => {
  var searchStr = '/id';
  var index = url?.indexOf(searchStr);
  if (index >= 0) {
    var indexEnd = url.indexOf('&', index);
    var returnUrl = url.substring(index + searchStr.length, indexEnd >= 0 ? indexEnd : undefined);
    return returnUrl.split('?')[0]?.split('&')[0]; // disregard any extra url parameters
  }
};

const androidKeys = ['appId', 'title', 'icon', 'developer', 'description', 'installs', 'offersIAP', 'free', 'adSupported', 'url', 'screenshots'];
const appleKeys = ['appId', 'title', 'icon', 'developer', 'description', 'free', 'url', 'screenshots'];

const filterKeys = (data, type) => {
  const keys = type === 'apple' ? appleKeys : androidKeys;
  var filteredData = {};
  keys.forEach(k => (filteredData[k] = data[k]));
  return filteredData;
};

async function getAppInfo({ type, appId }) {
  return new Promise(function (resolve, reject) {
    const key = type === 'apple' ? 'id' : 'appId';
    const store = type === 'apple' ? apple : gplay;
    const props = type !== 'apple' ? { [key]: appId } : { [key]: appId };

    console.log({ appId, props });

    if (appId) {
      store.app(props).then(
        success => {
          resolve(filterKeys(success, type));
        },
        error => {
          reject(error);
        }
      );
    } else {
      reject('Invalid appId');
    }
  });
}

var errors = [];
var success = {};
const limit = 500;
async function processRow({ _id, uid, groupId, androidLink, iosLink }) {
  const googleAppId = getAndroidIdFromUrl(androidLink);
  const appleAppId = getAppleIdFromUrl(iosLink);
  var androidStore = {};
  var appleStore = {};

  try {
    if (!isEmpty(googleAppId)) {
      androidStore = await getAppInfo({ appId: googleAppId, type: 'android' });
    }
  } catch (ex) {
    if (ex.status === 404) {
      errors.push({ _id, androidLink, iosLink, type: 'Android', appId: googleAppId, status: ex.status, ex });
    } else {
      errors.push({ _id, androidLink, iosLink, type: 'Android', appId: googleAppId, status: ex.status, ex });
    }
  }
  try {
    if (!isEmpty(appleAppId)) {
      appleStore = await getAppInfo({ appId: appleAppId, type: 'apple' });
    }
  } catch (ex) {
    if (ex.status === 404) {
      errors.push({ _id, androidLink, iosLink, type: 'apple', appId: appleAppId, status: ex.statusCode, ex });
    } else {
      errors.push({ _id, androidLink, iosLink, type: 'apple', appId: appleAppId, status: ex.statusCode, ex });
    }
  }
  return { _id, androidStore, appleStore, googleAppId, appleAppId, iosLink, androidLink };
}

async function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

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

function updateRow(Data) {
  return new Promise(function (resolve, reject) {
    console.log('Updating row: ' + Data?._id);
    dynamo.put({ TableName, Item: Data }, function (err, data) {
      if (err) {
        var message = `(Error processing data.  Table: ${TableName}`;
        console.error({ message, err, TableName, Data });
        reject(err);
      } else {
        console.log('Updated application: ' + Data?._id + ', ' + getAppName(Data));
        resolve(true);
      }
    });
  });
}

const syncDatabase = async () => {
  console.log(`Getting all rows from AWS dynamo db table: ${TableName}`);
  const rows = await getRows(TableName);
  console.log(`Received ${Object.keys(rows).length} rows from AWS dynamo db table: ${TableName}`);
  const rowKeys = Object.keys(rows);
  var itemsProcessed = 0;
  for (let i = 0; i < rowKeys.length; i++) {
    const rowKey = rowKeys[i];
    const rowData = rows[rowKey];

    if (
      ((rowData.platforms ?? []).includes('iOS') && isEmptyObject(rowData.appleStore)) ||
      ((rowData.platforms ?? []).includes('Android') && isEmptyObject(rowData.androidStore))
    ) {
      console.log('Total Items Processed: ' + itemsProcessed);
      itemsProcessed = itemsProcessed + 1;
      if (itemsProcessed === limit + 1) {
        console.log('Done syncing!', { success, errors });
        return;
      }
      console.log('Found empty metadata, id' + rowKey);
      success[rowKey] = {};
      // The row contains either an empty appleStore or androidStore object
      const { appleStore, androidStore } = await processRow(rowData);
      var newRowData = { ...rowData };
      if ((rowData.platforms ?? []).includes('iOS') && isEmptyObject(rowData.appleStore)) {
        newRowData.appleStore = appleStore; // Populate empty data with actual data;
        console.log('Storing new iOS meta data, id' + rowKey);
        success[rowKey]['apple'] = 'updated missing data';
      }
      if ((rowData.platforms ?? []).includes('Android') && isEmptyObject(rowData.androidStore)) {
        newRowData.androidStore = androidStore; // Populate empty data with actual data;
        console.log('Storing new android meta data, id' + rowKey);
        success[rowKey]['android'] = 'updated missing data';
      }

      console.log({ rowData, newRowData });
      success[rowKey]['name'] = getAppName(newRowData);
      try {
        success[rowKey].dbUpdateSuccess = await updateRow(newRowData);
      } catch (ex) {
        console.error('Error updating', { rowKey });
      }
      console.log('waiting', { i, itemsProcessed });
      await sleep(1); // sleep for 5 seconds so we don't overload the app scraper api and get blocked
    }
  }

  console.log('Done copying!', { success, errors });

  return;
};

syncDatabase();
