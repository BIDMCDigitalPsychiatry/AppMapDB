import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store';
import { tables } from './dbConfig';

const updateDatabase = (table, id, payload) => ({ type: 'UPDATE_DATABASE', table, id, payload });
const setDatabaseTable = (table, payload) => ({ type: 'SET_DATABASE_TABLE', table, payload });

const useTableState = table => {
  const dispatch = useDispatch();
  const tableState = useSelector((state: AppState) => state.database[table] ?? {});
  const setTableState = React.useCallback(payload => dispatch(setDatabaseTable(table, payload)), [table, dispatch]);
  return [tableState, setTableState];
};

const useTableLength = table => useSelector((state: AppState) => Object.keys(state.database[table] ?? {}).length);

export const useApplications = () => useTableState(tables.applications);
export const useRatings = () => useTableState(tables.ratings);
export const useRatingsLength = () => useTableLength(tables.ratings);

const useIndexAppRatings = () => {
  const [ratings] = useRatings();
  const [applications] = useApplications();
  const [index, setIndex] = useTableState(tables.ix_app_ratings);
  const buildIndex = React.useCallback(() => {
    console.log('Rebuilding index');
    setIndex(
      Object.keys(applications).reduce((f, c: any) => {
        f[applications[c]._id] = Object.keys(ratings).filter(k => ratings[k].appId === applications[c]._id);
        return f;
      }, {})
    );
  }, [applications, ratings, setIndex]);

  return [index, buildIndex];
};

export const useAutoBuildIndex = () => {
  const [, buildIndex] = useIndexAppRatings();
  const ratingsCount = useRatingsLength();
  React.useEffect(() => buildIndex(), [ratingsCount, buildIndex]);
};

export const useDatabaseRow = (table, id) => {
  const dispatch = useDispatch();
  const row = useSelector((state: AppState) => (state.database[table] || {})[id] || {});
  const updateRow = React.useCallback(payload => dispatch(updateDatabase(table, id, payload)), [table, id, dispatch]);
  return [row, updateRow];
};
