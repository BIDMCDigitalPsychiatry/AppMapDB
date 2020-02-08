import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../actions';
import MultiChip from '../../DialogField/MultiChip';
import Select from '../../DialogField/Select';
import { Costs, Platforms, Features, Conditions, ClinicalFoundations, Privacies } from '../../../../database/models/Application';

export const title = 'Filters';

export default function FilterDialog({ id = title, onClose, ...other }) {
  const [, setDialogState] = useDialogState(id);

  const handleEdit = React.useCallback(
    values => {
      setDialogState(prev => ({ ...prev, open: false, submitting: false, errors: {} }));
      onClose && onClose();
    },
    [setDialogState, onClose]
  );

  const handleValidation = (values, dialogState) => {
    var errors = { ...dialogState.errors };
    return errors;
  };

  return (
    <GenericDialog
      id={id}
      title={`Apply ${title}`}
      onSubmit={handleEdit}
      onClose={onClose}
      validate={handleValidation}
      initialValues={{}}
      submitLabel='Apply'
      fields={[
        {
          id: 'Features',
          Field: MultiChip,
          items: Features.map(label => ({ value: label, label }))
        },
        {
          id: 'Conditions',
          Field: MultiChip,
          items: Conditions.map(label => ({ value: label, label }))
        },
        {
          id: 'Platforms',
          Field: MultiChip,
          items: Platforms.map(label => ({ value: label, label }))
        },
        {
          id: 'Cost',
          Field: MultiChip,
          items: Costs.map(label => ({ value: label, label }))
        },
        {
          xs: 5
        },
        {
          id: 'Clinical Foundation',
          Field: Select,
          xs: 7,
          items: ClinicalFoundations.map(label => ({ value: label, label })),
          initialValue: 'All'
        },
        {
          xs: 5
        },
        {
          id: 'Privacy',
          Field: Select,
          xs: 7,
          items: Privacies.map(label => ({ value: label, label })),
          initialValue: 'All'
        }
      ]}
      {...other}
    />
  );
}
