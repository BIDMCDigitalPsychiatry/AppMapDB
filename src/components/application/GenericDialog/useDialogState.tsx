import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../store';
import { defaultDialogState, updateDialog } from './store';

export const useDialogState = id => {
  const dispatch = useDispatch();
  const dialogState = useSelector((state: AppState) => state.dialog[id] || defaultDialogState);
  const setDialogState = React.useCallback(payload => dispatch(updateDialog(id, payload)), [id, dispatch]);
  return [dialogState, setDialogState];
};
