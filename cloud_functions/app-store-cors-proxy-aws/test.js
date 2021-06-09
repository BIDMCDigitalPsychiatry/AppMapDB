var gplay = require('google-play-scraper');
var apple = require('app-store-scraper');

const callback = (a, response) => console.log({ a, response });

https://ke22op7ylg.execute-api.us-east-1.amazonaws.com/default/app-map-db?appId=&type=apple

var appId = '1424248915'
var type = 'apple'

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
