import React from 'react';
import { Reducer } from 'redux';
import { evalFunc } from '../../../helpers';
import { AppState } from '../../../store';
import { SortComparator, updateState, setDefaults } from './helpers';
import { useDispatch, useSelector } from 'react-redux';

export type State = Table[];
const defaultValues: Table[] = [];

export interface Table {
  id?: string;
  tab?: string; //indicates the current tab we are viewing from the tab selector
  searchtext?: string;
  columnfiltervalue?: string | boolean;
  columnfiltercolumn?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  sortComparator?: SortComparator;
  filters?: [];
}

// Actions
const tableUpdate = (table: Table) => ({ type: 'TABLE_UPDATE', table });
const tableFilterUpdate = (id: string, filters) => (dispatch, getState) =>
  dispatch({ type: 'TABLE_UPDATE', table: { id, filters: evalFunc(filters, (getState().table[id] || {}).filters || {}) } });

// Reducer
export const reducer: Reducer<State> = (state: State, action): State => {
  switch (action.type) {
    case 'TABLE_UPDATE':
      return updateState(state, action.table);
    case 'persist/REHYDRATE':
      const payload: AppState = action && (action as any).payload;
      const hydratestate: State = payload && payload.table;
      return setDefaults(hydratestate ? hydratestate : [], defaultValues);
    default:
  }
  return setDefaults(state ? { ...state } : [], defaultValues);
};

// Hooks
export const useTableUpdate = () => {
  const dispatch = useDispatch();
  return React.useCallback((t: Table) => dispatch(tableUpdate(t)), [dispatch]);
};

export const useTableFilterUpdate = () => {
  const dispatch = useDispatch();
  return React.useCallback((id, filters) => dispatch(tableFilterUpdate(id, filters)), [dispatch]);
};

export const useTable = name => useSelector((state: AppState) => state.table[name] ?? ({ id: name } as any));

export function useTableValues(name): any {
  const values = useTable(name);
  const values_str = JSON.stringify(values);
  const tableUpdate = useTableUpdate();
  const setTableValues = React.useCallback(
    values =>
      tableUpdate({
        id: name,
        ...evalFunc(values, JSON.parse(values_str))
      }),
    [name, tableUpdate, values_str]
  );

  return [values, setTableValues];
}

export function useTableFilterValues(name): any {
  const values = useSelector((state: AppState) => {
    const table = state.table[name] ?? { id: name, filters: {} };
    return table?.filters ?? {};
  });
  const tableFilterUpdate = useTableFilterUpdate();
  const setValues = React.useCallback(
    values => {
      tableFilterUpdate(name, values);
    },
    [name, tableFilterUpdate]
  );
  return [values, setValues];
}

export function useTableSearchText(id): any {
  const searchText = useSelector((state: AppState) => {
    const table = state.table[id] ?? { id, searchtext: '' };
    return table?.searchtext;
  });

  const tableUpdate = useTableUpdate();
  const setSearchText = React.useCallback(searchtext => tableUpdate({ id, searchtext }), [id, tableUpdate]);
  return [searchText, setSearchText];
}

export function useHandleTableReset(id) {
  const tableUpdate = useTableUpdate();
  return React.useCallback(() => tableUpdate({ id, searchtext: '', filters: [] }), [id, tableUpdate]);
}
