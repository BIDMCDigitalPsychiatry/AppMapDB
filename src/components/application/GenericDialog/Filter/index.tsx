import React from 'react';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../actions';
import MultiChip from '../../DialogField/MultiChip';
import Select from '../../DialogField/Select';

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
          items: [
            'Symptom Tracking',
            'Chatbot/AI',
            'Assessments/Screenings',
            'CBT',
            'Mindfulness',
            'Journaling',
            'Productivity',
            'Peer Support',
            'Physical Health'
          ].map(label => ({ value: label, label }))
        },
        {
          id: 'Conditions',
          Field: MultiChip,
          items: [
            'Mood Disorders',
            'Stress & Anxiety',
            'Sleep',
            'Phobias',
            'OCD',
            'Schizophrenia',
            'Eating Disorders',
            'Personality Disorders'
          ].map(label => ({ value: label, label }))
        },
        {
          id: 'Platforms',
          Field: MultiChip,
          items: ['Android', 'iOS', 'Web Browser'].map(label => ({ value: label, label }))
        },
        {
          id: 'Cost',
          Field: MultiChip,
          items: ['Free', 'Free w/in-app purchase', 'Payment'].map(label => ({ value: label, label }))
        },
        {
          xs: 5
        },
        {
          id: 'Clinical Foundation',
          Field: Select,
          xs: 7,
          items: ['All', 'Supporting Studies', 'No Supporting Studies'].map(label => ({ value: label, label })),
          initialValue: 'All'
        },
        {
          xs: 5
        },
        {
          id: 'Privacy',
          Field: Select,
          xs: 7,
          items: ['All', 'Has Privacy Policy', 'No Privacy Policy'].map(label => ({ value: label, label })),
          initialValue: 'All'
        }
      ]}
      {...other}
    />
  );
}
