import * as React from 'react';
import { useDispatch } from 'react-redux';
import DB, { DataModel, TableName } from './dbConfig';
import { updateSnackBar } from '../components/application/SnackBar/store';
import { useUpdateDatabase } from './useUpdateDatabase';

export interface ProcessDataInfo {
  Model: TableName;
  Data: DataModel;
  Action?: 'c' | 'r' | 'u' | 'd';
  Snackbar?: boolean;
  onSuccess?: (response, data: DataModel) => void;
  onError?: (response, data: DataModel) => void;
}

export const useProcessData = () => {
  const dispatch = useDispatch();
  const updateDatabase = useUpdateDatabase();
  return React.useCallback((pdi: ProcessDataInfo) => dispatch(processData(pdi, updateDatabase)), [dispatch, updateDatabase]);
};

export const useProcessDataHandle = () => {
  const dispatch = useDispatch();
  const updateDatabase = useUpdateDatabase();
  return React.useCallback((pdi: ProcessDataInfo) => () => dispatch(processData(pdi, updateDatabase)), [dispatch, updateDatabase]);
};

const processData = (
  { Model: Table, Data, Action = 'c', Snackbar = undefined, onSuccess = undefined, onError = undefined }: ProcessDataInfo,
  updateDatabase
) => async (dispatch: any, getState: any) => {
  const { _id } = Data;
  const response = Action === 'c' || Action === 'u' ? await DB[Table].insert(Data) : Action === 'd' ? DB[Table].destory(_id) : DB[Table].get(_id);
  if (response && response.ok === true) {
    Snackbar && dispatch(updateSnackBar({ open: true, variant: 'success', message: 'Success' }));
    onSuccess && onSuccess(response, Data);
    (Action === 'c' || Action === 'u') && updateDatabase({ table: Table, id: response.id, payload: Data }); // write data to local state
    //(Action === 'd') && // TODO: Remove id from database
  } else {
    var message = `(Error processing data.  Table: ${Table}$`;
    Snackbar && dispatch(updateSnackBar({ open: true, variant: 'error', message }));
    onError && onError(response, Data);
    console.error({ message, response });
  }
};
