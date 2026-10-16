import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import { getSurveyEmail, isEmpty } from '../../../../helpers';
import useValues from './useValues';
import Label from '../../DialogField/Label';
import { getAppName } from '../../GenericTable/Applications/selectors';
import { tx, useT } from '../../../../i18n';

// Dialog id (stays English).
export const title = tx('Delete Survey');

export default function DeleteSurveyDialog({ id = title, onClose, handleRefresh }) {
  const [{ open, initialValues }, setState] = useDialogState(id);
  const t = useT();
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
      title={values?.deleted ? t('Restore Survey') : t('Delete Survey')}
      loading={loading}
      deleteLabel={values?.deleted ? t('Restore') : t('Delete')}
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
          label: t('Survey by: {{email}}', { email: getSurveyEmail(values) ?? t('Unknown') })
        },
        {
          Field: Label,
          label: t('App: {{name}}', { name: getAppName(values?.app) })
        }
      ]}
    />
  );
}
