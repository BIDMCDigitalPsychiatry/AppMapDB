import React from 'react';
import { tables } from '../../../../database/dbConfig';
import { useGetFilters } from '../../../../database/useFilterList';
import { useFilters } from '../../../../database/useFilters';
import useProcessData from '../../../../database/useProcessData';
import AutoCompleteSelect from '../../DialogField/AutoCompleteSelect';
import Label from '../../DialogField/Label';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';

export const title = 'Delete Filter';

export default function DeleteFilter({ id = title }) {
  const [, setState] = useDialogState(id);

  const getFilters = useGetFilters();
  const processData = useProcessData();

  const handleSubmit = ({ SavedFilter }) => {
    if (SavedFilter) {
      processData({ Action: 'd', Model: tables.filters, Data: { ...SavedFilter, time: new Date().getTime() }, onSuccess: getFilters });
    }
    setState(prev => ({ ...prev, open: false, showErrors: true, loading: false }));
  };

  const [filters] = useFilters();

  const items = Object.keys(filters).map(k => ({ label: filters[k].name, value: filters[k] }));

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
          label: 'Select filter to delete:'
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
