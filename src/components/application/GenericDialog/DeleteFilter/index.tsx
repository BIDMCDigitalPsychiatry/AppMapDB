import React from 'react';
import { useSelector } from 'react-redux';
import { tables } from '../../../../database/dbConfig';
import { useGetFilters } from '../../../../database/useFilterList';
import { useFilters } from '../../../../database/useFilters';
import useProcessData from '../../../../database/useProcessData';
import { useIsAdmin } from '../../../../hooks';
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

  const isAdmin = useIsAdmin();
  const uid = useSelector((s: any) => s.layout.user?.username);

  const items = Object.keys(filters)
    .filter(k => (isAdmin ? true : filters[k].uid === uid)) // Only show public filters for deltion if the user is an admin or the managing user
    .map(k => ({ label: filters[k].isPublic ? `Public Filter | ${filters[k].name}` : filters[k].name, value: filters[k] }));

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
