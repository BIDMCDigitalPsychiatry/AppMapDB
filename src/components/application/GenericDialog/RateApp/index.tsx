import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import { useProcessData } from '../../../../database/useProcessData';
import { tables } from '../../../../database/dbConfig';

export const title = 'Rate Application';

export default function RateApp({ id = title, onClose, ...other }) {
  const [, setDialogState] = useDialogState(id);
  const processData = useProcessData();

  const handleSubmit = React.useCallback(
    values => {
      processData({ Model: tables.ratings, Data: { ...values, time: new Date().getTime() } });
      setDialogState(prev => ({ ...prev, open: false, submitting: false, errors: {} }));
      onClose && onClose();
    },
    [processData, setDialogState, onClose]
  );

  const handleValidation = (values, dialogState) => {
    var errors = { ...dialogState.errors };
    return errors;
  };

  return (
    <GenericDialog
      id={id}
      title={title}
      submitLabel='Submit'
      onSubmit={handleSubmit}
      onClose={onClose}
      validate={handleValidation}
      initialValues={{}}
      fields={[
        { id: 'appId', hidden: true },
        { id: 'name', label: 'Enter name of reviewer', initialValue: 'Anonymous', required: true },
        //{ id: 'rating', label: 'Select Rating', Field: Rating, xs: 4, required: true },
        {
          id: 'review',
          label: 'Enter Review',
          multiline: true,
          rows: 10,
          xs: 12,
          required: true,
          autoFocus: true
        }
      ]}
      {...other}
    />
  );
}
