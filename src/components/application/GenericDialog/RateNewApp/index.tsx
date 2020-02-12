import React from 'react';
import GenericStepperDialog from '../GenericStepperDialog';
import { useDialogState } from '../useDialogState';
import MultiSelectCheck from '../../DialogField/MultiSelectCheck';
import Radio from '../../DialogField/Radio';
import Application, {
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
import { tables } from '../../../../database/dbConfig';
import { useProcessData } from '../../../../database/useProcessData';
import { uuid } from '../../../../helpers';
import AutoCompleteSelect from '../../DialogField/AutoCompleteSelect';

export const title = 'Rate New Application';

export interface ComponentProps {
  id?: string;
  onClose?: () => any;
}

export default function RateNewAppDialog({ id = title, onClose }: ComponentProps) {
  const [{ type }, setDialogState] = useDialogState(id);

  const processData = useProcessData();

  const handleProcessData = (values, Action) => {
    const application: Application = values[tables.applications];

    if (Action === 'c') {
      application._id = uuid(); // If creating a new, generate the id client side so it can be linked to the rating    }
    }

    const rating: Application = { ...values[tables.ratings], appId: application._id }; // Inject appId for document linkage

    processData({ Model: tables.applications, Action, Data: application }); // Submit application row
    processData({ Model: tables.ratings, Action, Data: { ...rating, time: new Date().getTime() } }); // Inject appId and submit rating row

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
          id: 'name',
          label: 'Application Name',
          required: true
        },
        {
          id: 'company',
          label: 'Application Company',
          required: true
        },
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
          http: true,
          active: values => Array.isArray(values[tables.applications]?.platforms) && values[tables.applications]?.platforms.includes('Android')
        },
        {
          id: 'iosLink',
          label: 'Enter link to app on the Apple App store',
          required: true,
          http: true,
          active: values => Array.isArray(values[tables.applications]?.platforms) && values[tables.applications]?.platforms.includes('iOS')
        },
        {
          id: 'webLink',
          label: 'Enter web link to app',
          required: true,
          http: true,
          active: values => Array.isArray(values[tables.applications]?.platforms) && values[tables.applications]?.platforms.includes('Web')
        }
      ].map(f => ({ ...f, container: tables.applications }))
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
      ].map(f => ({ ...f, container: tables.applications }))
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
      ].map(f => ({ ...f, container: tables.applications }))
    },
    {
      label: 'Select clinical foundation conditions',
      fields: [
        {
          id: 'clinicalFoundation',
          label: 'Clinical Foundation',
          Field: AutoCompleteSelect,
          items: ClinicalFoundations,
          required: true,
          initialValue: ClinicalFoundations[0]
        },
        {
          id: 'conditions',
          label: 'Supported Conditions',
          Field: MultiSelectCheck,
          items: Conditions.map(value => ({ value, label: value }))
        }
      ].map(f => ({ ...f, container: tables.applications }))
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
      ].map(f => ({ ...f, container: tables.applications }))
    },
    {
      label: 'Enter rating and review',
      fields: [
        { id: 'name', label: 'Enter name of reviewer', xs: 8, initialValue: 'Anonymous', required: true, container: tables.ratings },
        { id: 'rating', label: 'Select Rating', Field: Rating, xs: 4, required: true, container: tables.ratings },
        {
          id: 'review',
          label: 'Enter Review',
          multiline: true,
          rows: 10,
          xs: 12,
          required: true,
          autoFocus: true
        }
      ].map(f => ({ ...f, container: tables.ratings }))
    }
  ];

  return <GenericStepperDialog id={id} title={title} onSubmit={handleSubmit} onDelete={handleDelete} steps={steps} onClose={onClose} />;
}
