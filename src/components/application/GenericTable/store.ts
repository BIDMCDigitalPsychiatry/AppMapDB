import React from 'react';
import { Reducer } from 'redux';
import { evalFunc, stringifyEqual } from '../../../helpers';
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
  filters?: {};
}

const tableFilterUpdate = (id: string, filters) => (dispatch, getState) =>
  dispatch({ type: 'TABLE_UPDATE', table: { id, filters: evalFunc(filters, (getState().table[id] || {}).filters || {}) } });

const getTable = (state, id) => state[id] ?? { id, searchtext: '', filters: {} };
export const reducer: Reducer<State> = (state: State, action): State => {
  switch (action.type) {
    case 'TABLE_UPDATE':
      return updateState(state, action.table);
    case 'TABLE_SEARCH_TEXT_UPDATE':
      return {
        ...state,
        [action.id]: {
          ...getTable(state, action.id),
          searchtext: action.searchtext
        }
      };
    case 'TABLE_FILTER_UPDATE':
      const { tableId, filterId, value } = action;
      const prevTable = getTable(state, tableId);
      const prevFilters = prevTable?.filters ?? {};
      return {
        ...state,
        [tableId]: {
          ...prevTable,
          filters: {
            ...prevFilters,
            [filterId]: value
          }
        }
      };
    case 'persist/REHYDRATE':
      const payload: AppState = action && (action as any).payload;
      const hydratestate: State = payload && payload.table;
      return setDefaults(hydratestate ? hydratestate : [], defaultValues);
    default:
  }
  return setDefaults(state ? { ...state } : [], defaultValues);
};

export const useTableUpdate = () => {
  const dispatch = useDispatch();
  return React.useCallback((table: Table) => dispatch({ type: 'TABLE_UPDATE', table }), [dispatch]);
};

export const useTableFilterUpdate = () => {
  const dispatch = useDispatch();
  return React.useCallback((id, filters) => dispatch(tableFilterUpdate(id, filters)), [dispatch]);
};

export const useTableFilterValue = (tableId, filterId) => {
  const dispatch = useDispatch();
  const value = useSelector((state: AppState) => {
    const table = state.table[tableId] ?? { id: tableId, filters: {} };
    const filters = table?.filters ?? {};
    return filters[filterId] ?? [];
  }, stringifyEqual);
  const setValue = React.useCallback(value => dispatch({ type: 'TABLE_FILTER_UPDATE', tableId, filterId, value }), [tableId, filterId, dispatch]);
  return [value, setValue];
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
  const searchText = useSelector((state: AppState) => getTable(state.table, id).searchtext);
  const dispatch = useDispatch();
  const setSearchText = React.useCallback(searchtext => dispatch({ type: 'TABLE_SEARCH_TEXT_UPDATE', id, searchtext }), [id, dispatch]);
  return [searchText, setSearchText];
}

export function useHandleTableReset(id) {
  const tableUpdate = useTableUpdate();
  return React.useCallback(() => tableUpdate({ id, searchtext: '', filters: {} }), [id, tableUpdate]);
}
