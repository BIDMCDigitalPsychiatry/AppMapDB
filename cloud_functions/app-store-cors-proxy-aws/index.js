const aws = require('aws-sdk');
aws.config.update({ region: 'us-east-1' });
var ebevents = new aws.EventBridge({
  accessKeyId: 'AKIAVAWSZJGDRNWNGG2D',
  secretAccessKey: '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',
  apiVersion: '2015-10-07'
});

export default function sendEvent({ DetailType, body }) {
  return new Promise((resolve, reject) => {
    try {
      var params = {
        Entries: [
          {
            Detail: JSON.stringify(body),
            DetailType,
            Resources: ['arn:aws:events:us-east-1:345113184647:event-bus/admin'],
            Source: 'admin.familyhardware.com'
          }
        ]
      };

      ebevents.putEvents(params, function (err, data) {
        if (err) {
          console.log('Error', err);
          reject(err);
        } else {
          console.log('Success', data.Entries);
          resolve(true);
        }
      });
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}

export const handler = async event => {
  const response = {
    statusCode: 500
  };

  try {
    response.body = JSON.parse(event.body);
  } catch (ex) {
    console.log('Error parsing body', { ex, event });
  }

  try {
    const result = await sendEvent({ DetailType: 'mandrill-webhook', body: response.body });
    if (result === true) {
      console.log('Successfully sent mandrill-webhook event', result);
      response.statusCode = 200;
    } else {
      console.error('Error sending mandrill-webhook event', result);
      response.statusCode = 500;
    }
  } catch (ex) {
    console.log('Error sending event ', { ex });
    response.statusCode = 500;
  }
  return response;
};
