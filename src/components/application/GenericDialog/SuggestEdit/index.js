import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import { getAppCompany, getAppName } from '../../GenericTable/Applications/selectors';
import { sendApiEmail } from '../../../../database/sendEmail';
import { tx, useT } from '../../../../i18n';

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

// Dialog id (stays English); GenericDialog translates it for display.
export const title = tx('Suggest Edit');

export default function SuggestEdit({ id = title }) {
  const [dialogState, setState] = useDialogState(id);
  const { initialValues } = dialogState;
  const t = useT();

  const handleSubmit = ({ name, email, suggestion }) => {
    setState(prev => ({ ...prev, open: false, showErrors: true, loading: false }));
    sendEmail(name, email, suggestion, initialValues.applications);
    alert(t('Your suggestion has been reported!  Thank you.'));
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
          label: t('Name'),
          placeholder: t('Enter name of person suggesting the edit'),
          required: true
        },
        {
          id: 'email',
          label: t('Email'),
          placeholder: t('Enter email of person suggesting the edit'),
          email: true,
          required: true
        },
        {
          id: 'suggestion',
          label: t('Suggestion'),
          multiline: true,
          required: true,
          rows: 12,
          placeholder: t('Enter a description of the edit you are suggesting'),
          hidden: false
        }
      ]}
    />
  );
}
