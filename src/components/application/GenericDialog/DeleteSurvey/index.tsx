import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import { getSurveyEmail, isEmpty } from '../../../../helpers';
import useValues from './useValues';
import Label from '../../DialogField/Label';
import { getAppName } from '../../GenericTable/Applications/selectors';

export const title = 'Delete Survey';

export default function DeleteSurveyDialog({ id = title, onClose, handleRefresh }) {
  const [{ open, initialValues }, setState] = useDialogState(id);
  const { _id } = initialValues;

  const { values, loading, handleDelete } = useValues({ trigger: open && !isEmpty(_id), values: { _id } });
  const deleted = values?.deleted;

  const handleClose = React.useCallback(() => {
    setState(prev => ({ ...prev, open: false, loading: false }));
    handleRefresh && handleRefresh();
    onClose && onClose();
  }, [onClose, setState, handleRefresh]);

  const handleSubmit = React.useCallback(() => {
    handleDelete({ deleted: !deleted, onSuccess: handleClose });
  }, [handleDelete, handleClose, deleted]);

  return (
    <GenericDialog
      id={id}
      title={values?.deleted ? 'Restore Survey' : 'Delete Survey'}
      loading={loading}
      deleteLabel={values?.deleted ? 'Restore' : 'Delete'}
      onDelete={handleSubmit}
      submitLabel={null}
      onClose={onClose}
      initialValues={{
        _id
      }}
      fields={[
        {
          id: '_id',
          hidden: true
        },
        {
          Field: Label,
          label: `Survey by: ${getSurveyEmail(values) ?? 'Unknown'}`
        },
        {
          Field: Label,
          label: `App: ${getAppName(values?.app)}`
        }
      ]}
    />
  );
}
