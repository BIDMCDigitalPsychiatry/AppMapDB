var gplay = require('google-play-scraper');
var apple = require('app-store-scraper');

const androidKeys = ['appId', 'title', 'icon', 'developer', 'description', 'installs', 'offersIAP', 'free', 'adSupported', 'url', 'screenshots'];
const appleKeys = ['appId', 'title', 'icon', 'developer', 'description', 'free', 'url', 'screenshots'];

const filterKeys = (data, type) => {
    const keys = type === 'apple' ? appleKeys : androidKeys;
    var filteredData = {};
    keys.forEach(k => (filteredData[k] = data[k]));
    return filteredData;
  };

exports.handler = (event, context, callback) => {
  var appId = event['queryStringParameters'] && event['queryStringParameters']['appId'];
  var type = event['queryStringParameters'] && event['queryStringParameters']['type'];

  const key = type === 'apple' ? 'id' : 'appId';
  const store = type === 'apple' ? apple : gplay;
  const props = type !== 'apple' ? { [key]: appId } : { [key]: appId, country: 'US' };

  const response = {
    statusCode: 400,
    body: 'Invalid appId',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET'
    }
  };

  if (appId) {
    store.app(props).then(
      success => {
        console.log({ Success: appId });
        response.statusCode = 200;
        response.body = JSON.stringify(filterKeys(success, type));
        callback(undefined, response);
      },
      error => {
        console.log({ Error: appId, error });
        response.statusCode = 400;
        response.body = JSON.stringify(error);
        callback(response);
      }
    );
  } else {
    response.statusCode = 400;
    response.body = JSON.stringify('Invalid appId');
    callback(response);
  }
};
