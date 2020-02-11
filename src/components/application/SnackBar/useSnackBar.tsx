import * as React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { AppState } from '../../../store';
import { updateSnackBar, SnackBarState } from './store';

export const useSnackBar = (): [SnackBarState, (SnackBarProps) => void] => {
  const dispatch = useDispatch();
  const state: SnackBarState = useSelector((state: AppState) => state.snackBar, shallowEqual);
  const setState = React.useCallback((payload: SnackBarState) => dispatch(updateSnackBar(payload)), [dispatch]);
  return [state, setState];
};
