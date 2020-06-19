// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws.json');

//const emailAddress = 'slagan@bidmc.harvard.edu';
const emailAddress = 'chris@greenlinkservices.com';
const sourceEmailAddress = 'appmap@psych.digital';
// Create sendEmail params
var params = {
  Destination: {
    /* required */ CcAddresses: [],
    ToAddresses: [emailAddress]
  },
  Message: {
    /* required */
    Body: {
      /* required */
      Html: {
        Charset: 'UTF-8',
        Data: 'A suggested edit has been made:'
      },
      Text: {
        Charset: 'UTF-8',
        Data: 'A suggested edit has been made:'
      }
    },
    Subject: {
      Charset: 'UTF-8',
      Data: 'AppMapDB - Suggested Edit'
    }
  },
  Source: sourceEmailAddress /* required */,
  ReplyToAddresses: [sourceEmailAddress]
};

//process.env.AWS_SDK_LOAD_CONFIG = 1;

// Create the promise and SES service object

var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();

// Handle promise's fulfilled/rejected states
sendPromise
  .then(function (data) {
    console.log(data.MessageId);
  })
  .catch(function (err) {
    console.error(err, err.stack);
  });
