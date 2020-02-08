import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store';

const updateDatabase = (id, payload) => ({ type: 'UPDATE_DATABASE', id, payload });
const setDatabase = payload => ({ type: 'SET_DATABASE', payload });

export const useDatabaseState = () => {
  const dispatch = useDispatch();
  const databaseState = useSelector((state: AppState) => state.database || {});
  const setDatabaseState = React.useCallback(payload => dispatch(setDatabase(payload)), [dispatch]);
  return [databaseState, setDatabaseState];
};

export const useDatabaseRow = id => {
  const dispatch = useDispatch();
  const row = useSelector((state: AppState) => state.database[id] || {});
  const updateRow = React.useCallback(payload => dispatch(updateDatabase(id, payload)), [id, dispatch]);
  const setRow = React.useCallback(payload => dispatch(setDatabase(payload)), [dispatch]);
  return [row, setRow, updateRow];
};
