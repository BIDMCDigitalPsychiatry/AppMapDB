import React from 'react';
import { useFilters } from '../../../../database/useFilters';
import AutoCompleteSelect from '../../DialogField/AutoCompleteSelect';
import Label from '../../DialogField/Label';
import { useTableFilterValues } from '../../GenericTable/store';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';

export const title = 'Load Filter';

export default function LoadFilter({ id = title }) {
  const [, setState] = useDialogState(id);  
  const [, setValues] = useTableFilterValues('Applications');
  const [filters] = useFilters();
  const items = Object.keys(filters).map(k => ({ label: filters[k].name, value: filters[k] }));

  const handleSubmit = values => {
    setValues(prev => ({ ...prev, SavedFilter: values?.SavedFilter }));
    setState(prev => ({ ...prev, open: false, showErrors: true, loading: false }));
  };

  return (
    <GenericDialog
      id={id}
      title={id}
      submitLabel={id}
      onSubmit={handleSubmit}
      fields={[
        {
          id: 'label1',
          Field: Label,
          label: 'Select a filter to load:'
        },
        {
          id: 'SavedFilter',
          label: 'Filter',
          items,
          Field: AutoCompleteSelect
        }
      ]}
    />
  );
}
