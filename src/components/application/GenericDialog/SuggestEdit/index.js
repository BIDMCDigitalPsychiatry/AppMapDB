import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
var AWS = require('aws-sdk'); // Load the AWS SDK for Node.js

AWS.config = {
  accessKeyId: 'AKIAX5W3PCXMKBCFM2X6',
  secretAccessKey: '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',
  region: 'us-east-1'
};

function sendEmail(name, email, suggestion, applicationInfo) {
  //const emailAddress = 'slagan@bidmc.harvard.edu';
  const emailAddress = 'chris@greenlinkservices.com';
  const sourceEmailAddress = 'appmap@psych.digital';
  const body = `A suggested edit has been made.
    <p>Name: ${name}</p>
    <p>Email: ${email}</p>
    <p>Suggestion: ${suggestion}</p>
    <p>Application Info: ${JSON.stringify(applicationInfo)}</p>`;
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
}

export const title = 'Suggest Edit';

export default function SuggestEdit({ id = title }) {
  const [dialogState, setState] = useDialogState(id);
  const { initialValues } = dialogState;

  const handleSubmit = ({ name, email, suggestion }) => {
    console.log({ name, email, suggestion });
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
