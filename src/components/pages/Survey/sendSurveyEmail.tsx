import pkg from '../../../../package.json';
import { AWS } from '../../../database/dbConfig';
import { hostAddress } from '../../../helpers';

export function sendSurveyNotificationEmail({ email, appName }) {
  const sourceEmailAddress = 'appmap@psych.digital';

  const body = `Notice: ${email} has submitted a survey for ${appName}.`;

  // Create sendEmail params
  var params = {
    Destination: {
      /* required */ CcAddresses: [],
      ToAddresses: [pkg.surveyNotificationEmail]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        },
        Text: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'MIND - Survey Completed Notification'
      }
    },
    Source: sourceEmailAddress /* required */,
    ReplyToAddresses: [sourceEmailAddress]
  };

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
}

export function sendSurveyEmail({ email }) {
  const sourceEmailAddress = 'appmap@psych.digital';

  const body = `Hi,
    
    <p>Thank you for agreeing to participate in our study! We look forward to hearing your thoughts about this app.</p>
    <p>If you have any questions regarding this study, please contact Erica Camacho at ecamach1@bidmc.harvard.edu.</p>
    <p></p>
    <p>Best,</p>
    <p>The Division of Digital Psychiatry</p>`;

  // Create sendEmail params
  var params = {
    Destination: {
      /* required */ CcAddresses: [],
      ToAddresses: [email]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        },
        Text: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'MIND - Survey Complete'
      }
    },
    Source: sourceEmailAddress /* required */,
    ReplyToAddresses: [sourceEmailAddress]
  };

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
}

export function sendSurveyFollowUpEmail({ email, appName, surveyId = '', appId, followUpSurveyType }) {
  const sourceEmailAddress = 'appmap@psych.digital';

  const body = `Hello,    
    <p>Thank you for participating in our study! We appreciate hearing your thoughts about the application: ${appName}. Would you be willing to participate in a follow up survey?  Please <a href="${hostAddress(
    `/Survey?surveyId=${surveyId}&followUpSurveyType=${followUpSurveyType}&appId=${appId}`
  )}">click here to participate in the ${followUpSurveyType} Follow Up Survey!</a></p>
    <p></p>
    <p>Best,</p>
    <p>The Division of Digital Psychiatry</p>`;

  // Create sendEmail params
  var params = {
    Destination: {
      /* required */ CcAddresses: [],
      ToAddresses: [email]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        },
        Text: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `MIND - ${followUpSurveyType} Survey Follow Up`
      }
    },
    Source: sourceEmailAddress /* required */,
    ReplyToAddresses: [sourceEmailAddress]
  };

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
}
