import * as React from 'react';
import { useDispatch } from 'react-redux';
import DB, { DataModel, TableName } from './dbConfig';
import { updateSnackBar } from '../components/application/SnackBar/store';

export interface ProcessDataInfo {
  Model: TableName;
  Data: DataModel;
  Action: 'r' | 'u' | 'd';
  Snackbar?: boolean;
  onSuccess?: (response, data: DataModel) => void;
  onError?: (response, data: DataModel) => void;
}

export const useProcessData = () => {
  const dispatch = useDispatch();
  return React.useCallback((pdi: ProcessDataInfo) => dispatch(processData(pdi)), [dispatch]);
};

export const useProcessDataHandle = () => {
  const dispatch = useDispatch();
  return React.useCallback((pdi: ProcessDataInfo) => () => dispatch(processData(pdi)), [dispatch]);
};

const processData = ({ Model: Table, Data, Action = 'r', Snackbar = undefined, onSuccess = undefined, onError = undefined }: ProcessDataInfo) => async (
  dispatch: any,
  getState: any
) => {
  const response = await DB[Table].insert(Data);

  if (response && response.ok === true) {
    Snackbar && dispatch(updateSnackBar({ open: true, variant: 'success', message: 'Success' }));
    onSuccess && onSuccess(response, Data);
    // write data to state
  } else {
    var message = `(Error processing data.  Table: ${Table}$`;
    Snackbar && dispatch(updateSnackBar({ open: true, variant: 'error', message }));
    onError && onError(response, Data);
    console.error({ message, response });
  }
};
