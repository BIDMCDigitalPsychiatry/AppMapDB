import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../store';
import { updateSelector } from './store';

const useTabSelectorValue = (id, defaultValue) => {
  const dispatch = useDispatch();
  const state = useSelector((state: AppState) => state.selector[id]?.value ?? defaultValue);
  const setState = React.useCallback(payload => dispatch(updateSelector(id, payload)), [id, dispatch]);
  return [state, setState];
};

export default useTabSelectorValue;
