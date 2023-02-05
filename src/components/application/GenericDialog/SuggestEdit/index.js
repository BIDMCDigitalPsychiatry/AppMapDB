import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import pkg from '../../../../../package.json';
import { getAppCompany, getAppName } from '../../GenericTable/Applications/selectors';
import { AWS } from '../../../../database/dbConfig';

function sendEmail(name, email, suggestion, applicationInfo) {
  const emailAddresses = pkg.emailUsers.split(',');
  const sourceEmailAddress = 'appmap@psych.digital';

  const appName = getAppName(applicationInfo);
  const appCompany = getAppCompany(applicationInfo);

  const body = `A suggested edit has been made:
    <p>Application: ${appName}</p>
    <p>Application Company: ${appCompany}</p>
    <p>User Name: ${name}</p>
    <p>User Email: ${email}</p>
    <p>Suggestion: ${suggestion}</p>
    <p>Application Info: ${JSON.stringify(applicationInfo)}</p>`;

  // Create sendEmail params
  var params = {
    Destination: {
      /* required */ CcAddresses: [],
      ToAddresses: emailAddresses
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
        Data: 'AppMapDB - Suggested Edit'
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

export const title = 'Suggest Edit';

export default function SuggestEdit({ id = title }) {
  const [dialogState, setState] = useDialogState(id);
  const { initialValues } = dialogState;

  const handleSubmit = ({ name, email, suggestion }) => {
    setState(prev => ({ ...prev, open: false, showErrors: true, loading: false }));
    sendEmail(name, email, suggestion, initialValues.applications);
    alert('Your suggestion has been reported!  Thank you.');
  };

  return (
    <GenericDialog
      id={id}
      title={id}
      submitLabel={id}
      onSubmit={handleSubmit}
      fields={[
        {
          id: 'name',
          label: 'Name',
          placeholder: 'Enter name of person suggesting the edit',
          required: true
        },
        {
          id: 'email',
          label: 'Email',
          placeholder: 'Enter email of person suggesting the edit',
          email: true,
          required: true
        },
        {
          id: 'suggestion',
          label: 'Suggestion',
          multiline: true,
          required: true,
          rows: 12,
          placeholder: 'Enter a description of the edit you are suggesting',
          hidden: false
        }
      ]}
    />
  );
}
