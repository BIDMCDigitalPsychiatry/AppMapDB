var gplay = require('google-play-scraper');
var apple = require('app-store-scraper');
const AWS = require('aws-sdk');
const fs = require('fs');

(async function main() {
  AWS.config.region = 'us-east-1';
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:d6802415-4c63-433c-92f5-4a5c05756abe'
  });

  const dynamo = new AWS.DynamoDB.DocumentClient();
  const TableName = 'applications';

  const androidKeys = ['appId', 'ratings', 'histogram'];
  const appleKeys = ['appId', 'ratings', 'histogram'];

  var exportRows = [];
  var errors = [];

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const getCsv = (data, columns) => {
    var csv = '';
    data.forEach((row, i) => {
      if (i === 0) {
        csv += columns.map(name => `"${name ?? ''}"`).join(',') + '\r\n'; // Output columns to first row
      }

      var rowData = row.getExportValues ? row.getExportValues() : row;

      csv +=
        columns
          .map(name => {
            var cell = (typeof (rowData[name] === 'object') ? JSON.stringify(rowData[name]) : rowData[name]) ?? '';
            const formatted = isEmpty(cell) ? cell : cell.replace(/["]+/g, ''); // Remove all double quotes
            return isEmpty(cell) ? '""' : `"${formatted}"`; // Wrap all values in double quotes to support commas within value
          })
          .join(',') + '\r\n';
    });
    return csv;
  };

  const getAndroidIdFromUrl = url => {
    var searchStr = '?id=';
    var index = url?.indexOf(searchStr);
    if (index >= 0) {
      var indexEnd = url.indexOf('&', index);
      return url.substring(index + searchStr.length, indexEnd >= 0 ? indexEnd : undefined);
    }
  };

  const getAppleIdFromUrl = url => {
    var searchStr = '/id';
    var index = url?.indexOf(searchStr);
    if (index >= 0) {
      var indexEnd = url.indexOf('&', index);
      return url.substring(index + searchStr.length, indexEnd >= 0 ? indexEnd : undefined);
    }
  };

  const filterKeys = (data, type) => {
    const keys = type === 'apple' ? appleKeys : type == 'android' ? androidKeys : [];
    var filteredData = {};
    keys.forEach(k => (filteredData[k] = data[k]));
    return filteredData;
  };

  async function getAppInfo({ type, appId }) {
    return new Promise(function (resolve, reject) {
      const key = type === 'apple' ? 'id' : 'appId';
      const store = type === 'apple' ? apple : gplay;
      const props = type !== 'apple' ? { [key]: appId } : { [key]: appId, country: 'US', ratings: true };

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

  async function processRow({ _id, uid, groupId, androidLink, iosLink }) {
    const googleAppId = getAndroidIdFromUrl(androidLink);
    const appleAppId = getAppleIdFromUrl(iosLink);
    var androidAppInfo = {};
    var appleAppInfo = {};

    try {
      if (!isEmpty(googleAppId)) {
        androidAppInfo = await getAppInfo({ appId: googleAppId, type: 'android' });
      }
    } catch (ex) {
      if (ex.status === 404) {
        errors.push({ type: 'Android', appId: googleAppId, status: ex.status, ex });
      } else {
        errors.push({ type: 'Android', appId: googleAppId, status: ex.status, ex });
      }
    }
    try {
      if (!isEmpty(appleAppId)) {
        appleAppInfo = await getAppInfo({ appId: appleAppId, type: 'apple' });
      }
    } catch (ex) {
      if (ex.status === 404) {
        errors.push({ type: 'Apple', appId: appleAppId, status: ex.statusCode, ex });
      } else {        
        errors.push({ type: 'Apple', appId: appleAppId, status: ex.statusCode, ex });
      }
    }

    const { appId: android_appId, ratings: android_ratings, histogram: android_histogram } = androidAppInfo;
    const { appId: apple_appId, ratings: apple_ratings, histogram: apple_histogram } = appleAppInfo;

    const Data = {
      _id,
      uid,
      groupId,
      androidLink,
      iosLink,
      android_appId,
      android_ratings,
      android_histogram,
      apple_appId,
      apple_ratings,
      apple_histogram
    };
    exportRows.push(Data);
  }
  
  const runScript = async () => {
    console.log('Getting all rows from database...');
    const rows = await getRows(TableName);
    const rowKeys = Object.keys(rows);
    console.log(`Received ${rowKeys.length} rows...`);
    for (let i = 0; i < rowKeys.length; i++) {
      const k = rowKeys[i];
      const { _id, uid, groupId, androidLink, iosLink } = rows[k];
      await processRow({ _id, uid, groupId, androidLink, iosLink });
      if (i % 20 === 0) {
        process.stdout.write(`${i}`);
      } else {
        process.stdout.write('.');
      }
      sleep(500); // wait between api requests to prevent being blocked
    }
    return 'Completed!';
  };

  const result = await runScript();
  console.log(''); // new line
  console.log('Finished, result...');
  console.log(result);
  console.log('Exporting csv...');

  const csv = getCsv(exportRows, [
    '_id',
    'uid',
    'groupId',
    'androidLink',
    'android_appId',
    'android_ratings',
    'android_histogram',
    'iosLink',
    'apple_appId',
    'apple_ratings',
    'apple_histogram'
  ]);
  const errorsCsv = getCsv(errors, ['type', 'appId', 'status', 'ex']);
  console.log('Done exporting...');
  console.log('Writing export.csv...');
  await fs.writeFileSync('export.csv', csv);
  console.log('Writing errors.csv...');
  await fs.writeFileSync('errors.csv', errorsCsv);
  console.log('Done writing. Exported data is located in the export.csv file.');
  return true;
})();
