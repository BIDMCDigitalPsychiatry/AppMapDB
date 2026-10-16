import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import useProcessData from '../../../../database/useProcessData';
import { tables } from '../../../../database/dbConfig';
import Switch from '../../DialogField/Switch';
import DateTimePicker from '../../DialogField/DateTimePicker';
import useTableRow from '../../../../database/useTableRow';
import Label from '../../DialogField/Label';
import { Divider } from '@mui/material';
import TextLink from '../../DialogField/TextLink';
import { tx } from '../../../../i18n';

export const title = tx('Edit Event');
const Model = tables.events;

export default function EditEventDialog({ id = title, disabled = false, onClose }) {
  const [{ eventId, open }, setState] = useDialogState(id);

  const { row: initialValues } = useTableRow({ id: eventId, Model: tables.events, active: open });

  const handleClose = React.useCallback(
    (props = undefined) => {
      setState(prev => ({ ...prev, open: false, loading: false }));
      onClose && onClose();
    },
    [onClose, setState]
  );

  const processData = useProcessData();

  const submitData = React.useCallback(
    ({ values, OnSuccess }) => {
      const Data = values;
      setState(prev => ({ ...prev, loading: true }));
      processData({
        Model,
        Action: 'u',
        Data,
        onError: () => setState(prev => ({ ...prev, loading: false, error: tx('Error submitting values') })),
        onSuccess: () => OnSuccess(Data)
      });
    },
    [setState, processData]
  );

  const onError = React.useCallback(() => {
    handleClose({ open: true, variant: 'error', message: 'Error' });
  }, [handleClose]);

  const onSuccess = React.useCallback(() => {
    handleClose({ open: true, variant: 'success', message: 'Success' });
  }, [handleClose]);

  const handleDelete = React.useCallback(
    values => {
      const Data = { ...values, deleted: true };
      setState(prev => ({ ...prev, loading: true }));
      processData({
        Model,
        Action: 'u',
        Data,
        onError: () => setState(prev => ({ ...prev, loading: false, error: tx('Error submitting values') })),
        onSuccess: () => onSuccess()
      });
    },
    [setState, processData, onSuccess]
  );

  const handleSubmit = React.useCallback(values => submitData({ values, OnSuccess: onSuccess, OnError: onError } as any), [submitData, onSuccess, onError]);

  return (
    <GenericDialog
      id={id}
      title={disabled ? tx('View Event') : id}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      onClose={onClose}
      onDelete={!disabled ? handleDelete : undefined}
      submitLabel={disabled ? null : tx('Save')}
      cancelLabel={tx('Close')}
      fields={[
        {
          id: 'id',
          hidden: true
        },
        {
          Field: Label,
          label: tx('Event Information')
        },
        {
          Field: Divider
        },
        {
          id: 'title',
          label: tx('Title'),
          required: true,
          disabled
        },
        {
          id: 'description',
          label: tx('Description'),
          disabled,
          multiline: true,
          rows: 4
        },
        {
          id: 'link',
          label: tx('Link'),
          Field: TextLink,
          disabled
        },
        {
          id: 'allDay',
          label: tx('All day'),
          Field: Switch,
          disabled
        },
        {
          id: 'start',
          label: tx('Start'),
          Field: DateTimePicker,
          disabled
        },
        {
          id: 'end',
          label: tx('End'),
          Field: DateTimePicker,
          disabled
        }
      ]}
    />
  );
}
