import React from 'react';
import { useFilters } from '../../../../database/useFilters';
import AutoCompleteSelect from '../../DialogField/AutoCompleteSelect';
import Label from '../../DialogField/Label';
import { useTableFilterValues } from '../../GenericTable/store';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';
import { useT, tx } from '../../../../i18n';

export const title = tx('Load Filter');

export default function LoadFilter({ id = title }) {
  const [, setState] = useDialogState(id);
  const [, setValues] = useTableFilterValues('Applications');
  const [filters] = useFilters();
  const t = useT();
  const items = Object.keys(filters).map(k => ({ label: filters[k].isPublic ? t('Public Filter | {{name}}', { name: filters[k].name }) : filters[k].name, value: filters[k] }));

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
          label: tx('Select a filter to load:')
        },
        {
          id: 'SavedFilter',
          label: tx('Filter'),
          items,
          Field: AutoCompleteSelect
        }
      ]}
    />
  );
}
