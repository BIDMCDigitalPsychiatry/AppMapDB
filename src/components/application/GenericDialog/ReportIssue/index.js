import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';

export const title = 'Report Issue';

export default function ReportIssue({ id = title }) {
  const [dialogState, setState] = useDialogState(id);
  const { initialValues } = dialogState;

  const handleSubmit = ({ name, email, review }) => {
    console.log({ name, email, review, initialValues });
    setState(prev => ({ ...prev, open: false, showErrors: true, loading: false }));
    alert('Your issue has been reported.  Thank you.');
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
          placeholder: 'Enter name of person reporting the issue'
        },
        {
          id: 'email',
          label: 'Email',
          placeholder: 'Enter email of person reporting the issue',
          email: true
        },
        {
          id: 'review',
          label: 'Issue',
          multiline: true,
          required: true,
          rows: 12,
          placeholder: 'Enter a description of the issue you are reporting',
          hidden: false
        }
      ]}
    />
  );
}
