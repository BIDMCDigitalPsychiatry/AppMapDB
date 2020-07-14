import * as React from 'react';
import { useDispatch } from 'react-redux';
import { dynamo, DataModel, TableName } from './dbConfig';
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

async function executeTransaction(pdi, Data, updateDatabase, dispatch) {
  const { Model: Table, Action = 'c', Snackbar = true, onSuccess = undefined, onError = undefined } = pdi;

  if (Action === 'c' || Action === 'u' || Action === 'd') {
    dynamo.put({ TableName: Table, Item: Data }, function (err, data) {
      if (err) {
        var message = `(Error processing data.  Table: ${Table}`;
        Snackbar && dispatch(updateSnackBar({ open: true, variant: 'error', message }));
        onError && onError(err, Data);
        console.error({ message, err, Data });
      } else {
        Snackbar && dispatch(updateSnackBar({ open: true, variant: 'success', message: 'Success' }));
        onSuccess && onSuccess(data, Data);
        (Action === 'c' || Action === 'u' || Action === 'd') && updateDatabase({ table: Table, id: Data._id, payload: { ...Data, _rev: Data._rev } }); // write data to local state, make sure to update the revision as well so subsequent writes won't throw a document conflict error
      }
    });
  } else {
    dynamo.get({ TableName: Table, Key: Data }, function (err, data) {
      if (err) {
        var message = `(Error processing data.  Table: ${Table}`;
        Snackbar && dispatch(updateSnackBar({ open: true, variant: 'error', message }));
        onError && onError(err, Data);
        console.error({ message, err, Data });
      } else {
        Snackbar && dispatch(updateSnackBar({ open: true, variant: 'success', message: 'Success' }));
        onSuccess && onSuccess(data, Data);
      }
    });
  }
}

const processData = (pdi: ProcessDataInfo, updateDatabase) => async (dispatch: any, getState: any) => {
  const { Model: Table, Data: DataProp, Action = 'c', Snackbar = true, onError = undefined } = pdi;
  const Data = { ...DataProp, delete: Action === 'c' ? false : Action === 'd' ? true : (DataProp as any).delete };
  try {
    executeTransaction(pdi, Data, updateDatabase, dispatch);
  } catch (error) {
    if (error.statusCode === 409) {
      //Document update conflict.  This can happen if someone updated the document at the server while another user's browser is editing an earlier revision
      //Just show an error for now, as the applications will rarely be edited and the tables are constantly refreshed with new data.
      //The correct logic would get the most recent document from the database, inform the user that the document is out of date, update the revision number and allow the user to review changes or force the update.
    }
    var message = `(Caught Error processing data.  Table: ${Table}`;
    Snackbar && dispatch(updateSnackBar({ open: true, variant: 'error', message }));
    onError && onError(error, Data);
    console.error({ message, error, Data });
  }
};

export default useProcessData;
