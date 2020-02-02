import React from 'react';
import { Reducer } from 'redux';
import { spread } from '../../../helpers';
import { AppState, AppThunkAction } from '../../../store';
import { SortComparator } from './tablehelpers';
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
}

export interface IRehydrate {
  type: 'persist/REHYDRATE';
}

interface ITableUpdate {
  type: 'TABLE_UPDATE';
  table: Table;
}
type KnownAction = ITableUpdate | IRehydrate;

export const useTableUpdate = () => {
  const dispatch = useDispatch();
  return React.useCallback((t: Table) => dispatch(actionCreators.ATableUpdate(t)), [dispatch]);
};

export const useTable = name => useSelector((state: AppState) => state.table[name] || {});

export const actionCreators = {
  ATableUpdate: (table: Table): AppThunkAction<KnownAction> => (dispatch, getState) => {
    dispatch({ type: 'TABLE_UPDATE', table });
  },
};

function setDefaults(state: State, tables: Table[]): State {
  //If default table doesnt exist in state, then populate the values, then combine state with upated state
  return tables
    .filter(t => !state[t.id])
    .map(t => updateState(state, t))
    .reduce(spread, { ...state });
}

function updateState(state: State, table: Table) {
  var newState = { ...state };
  newState[table.id] = table;
  if (state && state[table.id]) {
    //If table already exists, keep any other existing props
    newState[table.id] = {
      ...state[table.id],
      ...table,
    };
  }
  return newState;
}

export const reducer: Reducer<State> = (state: State, action: KnownAction): State => {
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
