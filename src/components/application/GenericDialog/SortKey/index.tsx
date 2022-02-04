import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import useProcessData from '../../../../database/useProcessData';
import { isEmpty } from '../../../../helpers';
import WholeNumberUpDown from '../../DialogField/WholeNumberUpDown';
import useValues from '../../../pages/Team/useValues';

export const title = 'Sort Key';

export default function SortKeyDialog({ id = title, onClose, handleRefresh }) {
  const [{ open, initialValues }, setState] = useDialogState(id);
  const { _id } = initialValues;

  const { values, loading, handleSave } = useValues({ type: 'edit', values: initialValues, trigger: open && !isEmpty(_id) });

  const handleClose = React.useCallback(() => {
    setState(prev => ({ ...prev, open: false, loading: false }));
    handleRefresh && handleRefresh();
    onClose && onClose();
  }, [onClose, setState, handleRefresh]);

  const processData = useProcessData();

  const handleSubmit = React.useCallback(
    ({ sortKey }) => {
      setState(prev => ({ ...prev, loading: true }));
      handleSave({
        values: { ...values, sortKey },
        onError: () => setState(prev => ({ ...prev, loading: false, error: 'Error submitting values' })),
        onSuccess: () => {
          setState(prev => ({ ...prev, loading: false }));
          handleClose();
        }
      });
    },
    // eslint-disable-next-line
    [handleSave, setState, processData, JSON.stringify(values), handleClose]
  );

  return (
    <GenericDialog
      id={id}
      title={id}
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel='Update Sort Key'
      onClose={onClose}
      initialValues={{
        _id,
        sortKey: values?.sortKey
      }}
      fields={[
        {
          id: '_id',
          hidden: true
        },
        {
          id: 'sortKey',
          Field: WholeNumberUpDown,
          min: 0,
          max: 99999,
          margin: 'normal',
          label: 'Sort Key (Leave blank or enter a larger number to move up)'
        }
      ]}
    />
  );
}
