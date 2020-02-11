import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../store';
import { defaultState, updateSelector } from './store';

const useTabSelector = id => {
  const dispatch = useDispatch();
  const state = useSelector((state: AppState) => state.selector[id] || defaultState);
  const setState = React.useCallback(payload => dispatch(updateSelector(id, payload)), [id, dispatch]);
  return [state, setState];
};

export default useTabSelector;
