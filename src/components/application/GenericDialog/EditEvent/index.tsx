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

export const title = 'Edit Event';
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
        onError: () => setState(prev => ({ ...prev, loading: false, error: 'Error submitting values' })),
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
        onError: () => setState(prev => ({ ...prev, loading: false, error: 'Error submitting values' })),
        onSuccess: () => onSuccess()
      });
    },
    [setState, processData, onSuccess]
  );

  const handleSubmit = React.useCallback(values => submitData({ values, OnSuccess: onSuccess, OnError: onError } as any), [submitData, onSuccess, onError]);

  return (
    <GenericDialog
      id={id}
      title={disabled ? 'View Event' : id}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      onClose={onClose}
      onDelete={!disabled ? handleDelete : undefined}
      submitLabel={disabled ? null : 'Save'}
      cancelLabel='Close'
      fields={[
        {
          id: 'id',
          hidden: true
        },
        {
          Field: Label,
          label: 'Event Information'
        },
        {
          Field: Divider
        },
        {
          id: 'title',
          label: 'Title',
          required: true,
          disabled
        },
        {
          id: 'description',
          label: 'Description',
          disabled,
          multiline: true,
          rows: 4
        },
        {
          id: 'link',
          label: 'Link',
          Field: TextLink,
          disabled
        },
        {
          id: 'allDay',
          label: 'All day',
          Field: Switch,
          disabled
        },
        {
          id: 'start',
          label: 'Start',
          Field: DateTimePicker,
          disabled
        },
        {
          id: 'end',
          label: 'End',
          Field: DateTimePicker,
          disabled
        }
      ]}
    />
  );
}
