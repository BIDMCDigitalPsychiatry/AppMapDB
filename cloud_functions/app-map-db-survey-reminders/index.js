/*
 * Survey follow-up reminders (hourly EventBridge schedule).
 *
 * 2026-08-26 rewrite (behavior unchanged): the previous nodejs16 version
 * authenticated with the PUBLIC Cognito identity pool's unauthenticated role
 * instead of its own execution role — which broke when SES and the
 * surveyReminders table were removed from that role during the security
 * lockdown. Now on nodejs20 + AWS SDK v3 (bundled in the runtime) using the
 * function's own scoped execution role (see
 * infrastructure/updateSurveyReminders.js).
 *
 * Logic, thresholds, and the email template are byte-identical to the old
 * version: for each completed Initial (2-week) / 2 Week (4-week) survey past
 * its follow-up window with no follow-up survey and no reminder row, insert
 * a reminder row and email the participant a follow-up invitation.
 */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESClient({});

function hostAddress(append) {
  return `https://mindapps.org${append !== undefined ? append : ''}`;
}

function isEmpty(str) {
  return !str || 0 === str.length;
}

const getRows = async TableName => {
  const scanResults = [];
  let items;
  const params = { TableName, ExclusiveStartKey: undefined };
  do {
    items = await doc.send(new ScanCommand(params));
    items.Items.forEach(i => scanResults.push(i));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey != 'undefined');
  return scanResults.reduce((f, c) => {
    f[c._id] = c;
    return f;
  }, {});
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

  return ses.send(
    new SendEmailCommand({
      Destination: { CcAddresses: [], ToAddresses: [email] },
      Message: {
        Body: {
          Html: { Charset: 'UTF-8', Data: body },
          Text: { Charset: 'UTF-8', Data: body }
        },
        Subject: { Charset: 'UTF-8', Data: `MIND - ${followUpSurveyType} Survey Follow Up` }
      },
      Source: sourceEmailAddress,
      ReplyToAddresses: [sourceEmailAddress]
    })
  );
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

async function insertReminder({ appId, email, appName, key }) {
  const reminderId = key; // just use survey Id so we don't have to include uuid package
  const TableName = 'surveyReminders';
  const Data = { _id: reminderId, surveyId: key, email, appId, appName, time: new Date().getTime() };
  try {
    await doc.send(new PutCommand({ TableName, Item: Data }));
    return true;
  } catch (err) {
    console.error({ message: `(Error processing data.  Table: ${TableName}`, err, TableName, Data, reminderId, email, appName });
    throw err;
  }
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
