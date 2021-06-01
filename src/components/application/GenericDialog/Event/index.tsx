import React from 'react';
import moment from 'moment';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import useProcessData from '../../../../database/useProcessData';
import { tables } from '../../../../database/dbConfig';
import { isEmpty, uuid } from '../../../../helpers';
import { useUserId } from '../../../layout/hooks';
import Switch from '../../DialogField/Switch';
import DateTimePicker from '../../DialogField/DateTimePicker';
import { useTheme } from '@material-ui/core';
import Select from '../../DialogField/Select';
import DatePicker from '../../DialogField/DatePicker';
import TextLink from '../../DialogField/TextLink';

export const title = 'Add Event';
const Model = tables.events;

const frequencyItems = [
  { label: 'Single Event', value: 'Once' },
  { label: 'Create Event Every Day', value: 'Daily' },
  { label: 'Create Event Every Week', value: 'Weekly' },
  { label: 'Create Event Every Other Week (Bi-Weekly)', value: 'BiWeekly' },
  { label: 'Create Event Every Month', value: 'Monthly' }
];

export default function EventDialog({ id = title, onClose }) {
  const userId = useUserId(); // Only instructors can currently create events, so grab the user id

  const [, setState] = useDialogState(id);
  const handleClose = React.useCallback(
    (props = undefined) => {
      setState(prev => ({ ...prev, open: false, loading: false }));
      onClose && onClose();
    },
    [onClose, setState]
  );

  const processData = useProcessData();
  const { palette } = useTheme();
  const color = palette.primary.light;

  const submitData = React.useCallback(
    ({ values, OnSuccess }) => {
      const Data = { ...values, color };
      setState(prev => ({ ...prev, loading: true }));

      const { frequency } = values;

      const onSuccess = ({ data }) => {
        // Determine if additionl children events need to be created
        const { start, end, frequencyEnd } = data;
        var nextStart;
        var nextEnd;
        if (frequency === 'Daily') {
          // Create an event for each day within the timespan
          nextStart = moment(start).add(1, 'days');
          nextEnd = moment(end).add(1, 'days');
        } else if (frequency === 'Weekly') {
          // Create an event for each week within the timespan
          nextStart = moment(start).add(1, 'weeks');
          nextEnd = moment(end).add(1, 'weeks');
        } else if (frequency === 'BiWeekly') {
          // Create an event for each week within the timespan
          nextStart = moment(start).add(2, 'weeks');
          nextEnd = moment(end).add(2, 'weeks');
        } else if (frequency === 'Monthly') {
          // Create an event for each day within the timespan
          nextStart = moment(start).add(1, 'months');
          nextEnd = moment(end).add(1, 'months');
        } else {
          return OnSuccess(Data);
        }

        if (nextStart.toDate() <= moment(frequencyEnd).add(1, 'days').toDate()) {
          const nextData = { ...data, id: uuid(), start: nextStart.toDate().toISOString(), end: nextEnd.toDate().toISOString(), parentId: Data.id };
          console.log({ status: 'Creating child event', nextData });
          processData({
            Model,
            Action: 'c',
            Data: nextData,
            onError: () => setState(prev => ({ ...prev, loading: false, error: 'Error submitting values' })),
            onSuccess: () => onSuccess({ data: nextData })
          });
        } else {
          console.log('Done creating child events');
          OnSuccess(Data);
        }
      };

      processData({
        Model,
        Action: 'c',
        Data,
        onError: () => setState(prev => ({ ...prev, loading: false, error: 'Error submitting values' })),
        onSuccess: () => onSuccess({ data: Data })
      });
    },
    [setState, processData, color]
  );

  const onError = React.useCallback(() => {
    handleClose({ open: true, variant: 'error', message: 'Error' });
  }, [handleClose]);

  const onSuccess = React.useCallback(() => {
    handleClose({ open: true, variant: 'success', message: 'Success' });
  }, [handleClose]);

  const handleSubmit = React.useCallback(values => submitData({ values, OnSuccess: onSuccess, OnError: onError }), [submitData, onSuccess, onError]);

  return (
    <GenericDialog
      initialValues={{
        id: uuid(),
        userId
      }}
      id={id}
      title={id}
      onSubmit={handleSubmit}
      submitLabel='Add'
      onClose={onClose}
      fields={[
        {
          id: 'id',
          hidden: true
        },
        {
          id: 'title',
          label: 'Title',
          required: true
        },
        {
          id: 'description',
          label: 'Description',
          multiline: true,
          rows: 4
        },        
        {
          id: 'link',
          label: 'Link',
          Field: TextLink,
        },
        {
          id: 'allDay',
          label: 'All day',
          Field: Switch
        },
        {
          id: 'start',
          label: 'Start',
          Field: DateTimePicker
        },
        {
          id: 'end',
          label: 'End',
          Field: DateTimePicker
        },
        {
          id: 'frequency',
          label: 'Event Frequency',
          Field: Select,
          items: frequencyItems,
          disableClearable: true,
          required: true,
          fullWidth: true
        },
        {
          id: 'frequencyEnd',
          label: 'Until',
          Field: DatePicker,
          hidden: ({ frequency }) => isEmpty(frequency) || frequency === 'Once',
          fullWidth: true,
          validate: values => {
            const { frequency, frequencyEnd, end } = values;

            const fe = moment(frequencyEnd);
            const e = moment(end);
            var isInvalid = fe < e;

            var error = isInvalid ? 'Must be after event end date' : undefined;
            if (!error) {
              if (frequency === 'Daily') {
                const dailyMax = e.add(2, 'months').toDate();
                var dailyError = fe.toDate() > dailyMax;
                if (dailyError) {
                  error = 'Timespan must be 2 months or less';
                }
              } else if (frequency === 'Weekly') {
                const weeklyMinEnd = moment(e).add(1, 'weeks').subtract(1, 'days').toDate();
                const weeklyMax = moment(e).add(6, 'months').toDate();
                if (weeklyMinEnd > fe.toDate()) {
                  error = 'Timespan must be at least 1 week from the event end date';
                } else {
                  var weeklyError = fe.toDate() > weeklyMax;
                  if (weeklyError) {
                    error = 'Timespan must be 6 months or less';
                  }
                }
              } else if (frequency === 'BiWeekly') {
                const biWeeklyMinEnd = moment(e).add(2, 'weeks').subtract(1, 'days').toDate();
                const biWeeklyMax = moment(e).add(6, 'months').toDate();
                if (biWeeklyMinEnd > fe.toDate()) {
                  error = 'Timespan must be at least 2 weeks from the event end date';
                } else {
                  var biWeeklyError = fe.toDate() > biWeeklyMax;
                  if (biWeeklyError) {
                    error = 'Timespan must be 6 months or less';
                  }
                }
              } else if (frequency === 'Monthly') {
                const monthlyMinEnd = moment(e).add(1, 'months').subtract(1, 'days').toDate();
                const monthlyMax = moment(e).add(12, 'months').toDate();
                if (monthlyMinEnd > fe.toDate()) {
                  error = 'Timespan must be at least 1 month from the event end date';
                } else {
                  var monthlyError = fe.toDate() > monthlyMax;
                  if (monthlyError) {
                    error = 'Timespan must be 12 months or less';
                  }
                }
              } else {
                error = 'Unknown Frequency';
              }
            }
            return error;
          }
        }
      ]}
    />
  );
}
