import * as React from 'react';
import { useDispatch } from 'react-redux';
import { exportDatabase } from './store';

export const useExportDatabase = () => {
  const dispatch = useDispatch();
  return React.useCallback(({ table, ids }) => dispatch(exportDatabase(table, ids)), [dispatch]);
};
