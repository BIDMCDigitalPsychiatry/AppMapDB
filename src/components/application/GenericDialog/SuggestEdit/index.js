import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import { getAppCompany, getAppName } from '../../GenericTable/Applications/selectors';
import { sendApiEmail } from '../../../../database/sendEmail';

// Sent server-side via the write API (template + roster `notify` recipients
// live in the Lambda). Note: the old email embedded the entire application
// JSON — the server template sends the app id instead.
function sendEmail(name, email, suggestion, applicationInfo) {
  sendApiEmail('suggestEdit', {
    name,
    email,
    suggestion,
    appName: getAppName(applicationInfo),
    appCompany: getAppCompany(applicationInfo),
    appId: applicationInfo?._id
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
