import React from 'react';
import { useSelector } from 'react-redux';
import { tables } from '../../../../database/dbConfig';
import { useFilters } from '../../../../database/useFilters';
import useProcessData from '../../../../database/useProcessData';
import { isEmpty, uuid } from '../../../../helpers';
import Label from '../../DialogField/Label';
import YesNo from '../../DialogField/YesNo';
import { useTableFilterValues } from '../../GenericTable/store';
import GenericDialog from '../GenericDialog';
import { useDialogState } from '../useDialogState';

export const title = 'Save Filter';

export default function SaveFilter({ id = title }) {
  const [, setState] = useDialogState(id);
  const processData = useProcessData();
  const [values] = useTableFilterValues('Applications');
  const uid = useSelector((s: any) => s.layout.user?.username);
  const [filters] = useFilters();
  const items = Object.keys(filters).map(k => ({ label: filters[k].name, value: filters[k] }));

  const { SavedFilter } = values;

  const filterName = SavedFilter ? SavedFilter.name : '';

  const handleSubmit = ({ name, isPublic }) => {
    if (name) {
      var Data = { ...values, uid, isPublic, name, time: new Date().getTime() };
      if (name !== filterName) {
        // If we are creating a new filter, then remove the id and rev so we don't update the old one
        const { _id, _rev, ...other } = Data;
        Data = other;
      }

      if (isEmpty(Data?._id)) {
        Data._id = uuid();
      }

      processData({ Model: tables.filters, Data });
    }

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
          label: 'Please enter a filter name to save the current filters.'
        },
        {
          id: 'name',
          label: 'Filter Name',
          items,
          required: true
        },
        {
          id: 'isPublic',
          label: 'Visible to the public?',
          Field: YesNo,
          initialValue: false
        }
      ]}
    />
  );
}
