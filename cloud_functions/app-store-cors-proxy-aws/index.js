var gplay = require('google-play-scraper');
var apple = require('app-store-scraper');

exports.handler = (event, context, callback) => {
  var appId = event['queryStringParameters'] && event['queryStringParameters']['appId'];
  var type = event['queryStringParameters'] && event['queryStringParameters']['type'];

  const key = type === 'apple' ? 'id' : 'appId';
  const store = type === 'apple' ? apple : gplay;

  const response = {
    statusCode: 400,
    body: 'Invalid appId',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET'
    }
  };

  if (appId) {
    store.app({ [key]: appId }).then(
      success => {
        console.log({ Success: appId });
        response.statusCode = 200;
        response.body = JSON.stringify(success);        
        callback(undefined, response);
      },
      error => {
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
