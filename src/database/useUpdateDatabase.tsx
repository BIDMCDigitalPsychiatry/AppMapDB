import * as React from 'react';
import { useDispatch } from 'react-redux';
import { updateDatabase } from './store';

export const useUpdateDatabase = () => {
  const dispatch = useDispatch();
  return React.useCallback(({ table, id, payload }) => dispatch(updateDatabase(table, id, payload)), [dispatch]);
};
