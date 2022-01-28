const AWS = require('aws-sdk');

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:d6802415-4c63-433c-92f5-4a5c05756abe'
});

const dynamo = new AWS.DynamoDB.DocumentClient();

function hostAddress(append) {
  return `https://mindapps.org${append !== undefined ? append : ''}`;
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

async function sendSurveyFollowUpEmail({ email, appName, surveyId = '', appId, followUpSurveyType }) {
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

  return new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
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

const twoWeekMS = 1210000000;
const fourWeekMS = twoWeekMS * 2;

function insertReminder({ appId, email, appName, key }) {
  return new Promise(function (resolve, reject) {
    const reminderId = key; // just use survey Id so we don't have to include uuid package
    const TableName = 'surveyReminders';
    const Data = { _id: reminderId, surveyId: key, email, appId, appName, time: new Date().getTime() };
    dynamo.put({ TableName, Item: Data }, function (err, data) {
      if (err) {
        var message = `(Error processing data.  Table: ${TableName}`;
        console.error({ message, err, TableName, Data, reminderId, email, appName });
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

exports.handler = async event => {
  const surveys = await getRows('surveys');
  const surveyReminders = await getRows('surveyReminders');
  const remindersSent = {};

  for (const key of Object.keys(surveys)) {
    // Must use a for loop (not for each) for use with await
    const survey = surveys[key];
    const { surveyType, app, created } = survey;
    const now = new Date().getTime();

    const delta = surveyType === 'Initial' ? twoWeekMS : surveyType === '2 Week' ? fourWeekMS : undefined;
    const followUpPeriodElapsed = delta === undefined ? false : now - Number(created) >= delta ? true : false;
    //console.log({ key, surveyType, created, now, nowMinusCreated: now - Number(created), delta, followUpPeriodElapsed });

    if (followUpPeriodElapsed) {
      // Survey should have a follow up completed, check for already existing or reminder that has already been sent
      const hasFollowUp = Object.keys(surveys).find(key2 => surveys[key2].parentId === key) ? true : false;
      const hasReminder = Object.keys(surveyReminders).find(rk => surveyReminders[rk].surveyId === key) ? true : false;
      if (!hasFollowUp && !hasReminder) {
        // No reminder has been sent and no follow up survey has been completed so go ahead and send the reminder email
        const email = survey['What is the best email address we can reach you at?'];
        if (!isEmpty(email)) {
          const appName = getAppName(app);
          const appId = app._id;
          const followUpSurveyType = surveyType === 'Initial' ? '2 Week' : surveyType === '2 Week' ? '6 Week' : 'Unknown';

          const insertReminderResult = await insertReminder({ appId, email, appName, key });
          const sendReminderResult = await sendSurveyFollowUpEmail({
            email,
            appName,
            appId,
            surveyId: key,
            followUpSurveyType
          });

          remindersSent[key] = {
            email,
            appName,
            appId,
            insertReminderResult,
            sendReminderResult,
            followUpSurveyType
          };
        }
      }
    }
  }

  const results = {
    remindersSentCount: Object.keys(remindersSent).length,
    surveyCount: Object.keys(surveys).length,
    surveyReminderCount: Object.keys(surveyReminders).length,
    remindersSent
  };
  console.log({ results });

  return {
    statusCode: 200,
    body: JSON.stringify(results)
  };
};
