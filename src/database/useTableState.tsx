import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store';
import { setDatabaseTable, updateDatabase } from './store';

export const useTableState = table => {
  const dispatch = useDispatch();
  const tableState = useSelector((state: AppState) => state.database[table] ?? {});
  const setTableState = React.useCallback(payload => dispatch(setDatabaseTable(table, payload)), [table, dispatch]);
  return [tableState, setTableState];
};

export const useTableLength = table => useSelector((state: AppState) => Object.keys(state.database[table] ?? {}).length);

export const useDatabaseRow = (table, id) => {
  const dispatch = useDispatch();
  const row = useSelector((state: AppState) => (state.database[table] ?? {})[id] || {});
  const updateRow = React.useCallback(payload => dispatch(updateDatabase(table, id, payload)), [table, id, dispatch]);
  return [row, updateRow];
};
