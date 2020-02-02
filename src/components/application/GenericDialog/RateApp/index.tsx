import React from 'react';
import * as LayoutStore from '../../../layout/LayoutStore';
import GenericStepperDialog from '../GenericStepperDialog';
import { useDialogState } from '../actions';
import Check from '../../DialogField/Check';
import Radio from '../../DialogField/Radio';

export const title = 'Rate an App';

export interface ComponentProps {
  id?: string;
  onClose?: () => any;
}

function RateAppDialog({ id = title, onClose }: ComponentProps) {
  const [{ type }, setDialogState] = useDialogState(id);

  const processData = LayoutStore.useProcessData();

  const handleProcessData = (values, Action) => {
    processData({}); // To be completed
    handleClose();
  };

  const handleSubmit = values => handleProcessData(values, type === 'Edit' ? 'u' : 'c');
  const handleDelete = values => handleProcessData(values, 'd');

  const handleClose = React.useCallback(() => {
    setDialogState(prev => ({ ...prev, open: false, submitting: false, errors: {} }));
    onClose && onClose();
  }, [setDialogState, onClose]);

  const steps = [
    {
      label: 'Application Link',
      fields: [
        {
          id: 'link',
          label: 'Enter link to app on app store or Google Play store',
          required: true,
        },
      ],
    },
    {
      label: 'Who is the App Developer',
      fields: [
        {
          id: 'government',
          label: 'Government?',
          Field: Check,
        },
        {
          id: 'profit',
          label: 'For Profit Company?',
          Field: Check,
        },
        {
          id: 'academic',
          label: 'Academic Institution?',
          Field: Check,
        },
      ],
    },
    {
      label: 'Is there a Privacy Policy?',
      fields: [
        {
          id: 'privacy',
          label: null,
          Field: Radio,
          xs: 2,
          items: [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
          ],
          initialValue: false,
          required: true,
        },
        {
          xs: 1,
        },
        {
          id: 'policy',
          label: 'Enter Privacy Policy',
          multiline: true,
          rows: 10,
          xs: 9,
          active: values => values.privacy === 'Yes',
        },
      ],
    },
  ];

  return (
    <GenericStepperDialog
      id={id}
      title={title}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      steps={steps}
      onClose={onClose}
    />
  );
}

export default RateAppDialog;
