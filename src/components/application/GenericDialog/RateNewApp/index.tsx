import React from 'react';
import GenericStepperDialog from '../GenericStepperDialog';
import { useDialogState } from '../useDialogState';
import MultiSelectCheck from '../../DialogField/MultiSelectCheck';
import Radio from '../../DialogField/Radio';
import {
  Platforms,
  DeveloperTypes,
  Features,
  Conditions,
  Privacies,
  Functionalities,
  Costs,
  ClinicalFoundations
} from '../../../../database/models/Application';
import Rating from '../../DialogField/Rating';
import Select from '../../DialogField/Select';
import { tables } from '../../../../database/dbConfig';
import { useProcessData } from '../../../../database/useProcessData';

export const title = 'Rate New Application';

export interface ComponentProps {
  id?: string;
  onClose?: () => any;
}

export default function RateNewAppDialog({ id = title, onClose }: ComponentProps) {
  const [{ type }, setDialogState] = useDialogState(id);

  const processData = useProcessData();

  const handleProcessData = (values, Action) => {
    processData({ Model: tables.applications, Data: values, Action }); // To be completed
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
      label: 'Select supported platforms',
      fields: [
        {
          id: 'platforms',
          label: 'Platforms',
          Field: MultiSelectCheck,
          items: Platforms.map(label => ({ value: label, label })),
          required: true,
          disableCloseOnSelect: false
        },
        {
          id: 'androidLink',
          label: 'Enter link to app on Google Play store',
          required: true,
          active: values => Array.isArray(values.platforms) && values.platforms.includes('Android')
        },
        {
          id: 'iosLink',
          label: 'Enter link to app on the Apple App store',
          required: true,
          active: values => Array.isArray(values.platforms) && values.platforms.includes('iOS')
        },
        {
          id: 'webLink',
          label: 'Enter web link to app',
          required: true,
          active: values => Array.isArray(values.platforms) && values.platforms.includes('Web')
        }
      ]
    },
    {
      label: 'Application costs and type of developer',
      fields: [
        {
          id: 'costs',
          label: 'Costs Associated with Application',
          Field: MultiSelectCheck,
          items: Costs.map(value => ({ value, label: value })),
          disableCloseOnSelect: false,
          required: true
        },
        {
          id: 'developerType',
          label: 'Developer Type',
          Field: Radio,
          items: DeveloperTypes.map(dt => ({ value: dt, label: dt }))
        }
      ]
    },
    {
      label: 'Select available features',
      fields: [
        {
          id: 'features',
          label: 'Features',
          Field: MultiSelectCheck,
          items: Features.map(value => ({ value, label: value }))
        }
      ]
    },
    {
      label: 'Select clinical foundation conditions',
      fields: [
        {
          id: 'clinicalFoundation',
          label: 'Clinical Foundation',
          Field: Select,
          items: ClinicalFoundations.map(value => ({ value, label: value })),
          required: true,
          initialValue: ClinicalFoundations[0]
        },
        {
          id: 'conditions',
          label: 'Supported Conditions',
          Field: MultiSelectCheck,
          items: Conditions.map(value => ({ value, label: value }))
        }
      ]
    },
    {
      label: 'Select functionality and privacy options',
      fields: [
        {
          id: 'functionalities',
          label: 'Functionality',
          Field: MultiSelectCheck,
          items: Functionalities.map(value => ({ value, label: value }))
        },
        {
          id: 'privacies',
          label: 'Privacy Options',
          Field: MultiSelectCheck,
          items: Privacies.map(value => ({ value, label: value }))
        }
      ]
    },
    {
      label: 'Enter rating and review',
      fields: [
        { id: 'name', label: 'Enter name of reviewer', xs: 8, initialValue: 'Anonymous', required: true },
        { id: 'rating', label: 'Select Rating', Field: Rating, xs: 4, required: true },
        {
          id: 'review',
          label: 'Enter Review',
          multiline: true,
          rows: 10,
          xs: 12,
          required: true,
          autoFocus: true
        }
      ]
    }
  ];

  return <GenericStepperDialog id={id} title={title} onSubmit={handleSubmit} onDelete={handleDelete} steps={steps} onClose={onClose} />;
}
