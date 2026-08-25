import * as React from 'react';
import { useDispatch } from 'react-redux';
import { dynamo, DataModel, TableName, tables, indexes } from './dbConfig';
import { updateSnackBar } from '../components/application/SnackBar/store';
import { useUpdateDatabase } from './useUpdateDatabase';
import { diffCurrentFlags, groupOf } from './currentFlags';
import { normalizeEmailFields } from './normalize';

// After any applications write, bring the group's `cur` flags in line so the
// current-index GSI keeps serving the correct rows (newest approved / deleted
// / pending per app — src/database/currentFlags.ts). Runs client-side until
// Phase 2 moves writes behind the Lambda; failures only log, they never block
// the user's save (the reconcile script repairs any drift).
export const recomputeCurrentFlags = async (written: any, updateDatabase: (u: { table: string; id: string; payload: any }) => void) => {
  try {
    const gId = groupOf(written);
    const rows: any[] = [];
    const params: any = {
      TableName: tables.applications,
      IndexName: indexes.group,
      KeyConditionExpression: 'groupId = :g',
      ExpressionAttributeValues: { ':g': gId },
      ExclusiveStartKey: undefined
    };
    let page;
    do {
      page = await dynamo.query(params).promise();
      rows.push(...(page.Items ?? []));
      params.ExclusiveStartKey = page.LastEvaluatedKey;
    } while (page.LastEvaluatedKey);
    // The GSI is eventually consistent — make sure the row just written (and
    // its latest field values) participate in the computation.
    const merged = [...rows.filter(r => r._id !== written._id), written];
    for (const change of diffCurrentFlags(merged)) {
      const row = merged.find(r => r._id === change._id);
      await dynamo
        .update({
          TableName: tables.applications,
          Key: { _id: change._id },
          ...(change.cur
            ? { UpdateExpression: 'SET #c = :v', ExpressionAttributeNames: { '#c': 'cur' }, ExpressionAttributeValues: { ':v': change.cur } }
            : { UpdateExpression: 'REMOVE #c', ExpressionAttributeNames: { '#c': 'cur' } })
        })
        .promise();
      row && updateDatabase({ table: tables.applications, id: change._id, payload: { ...row, cur: change.cur } });
    }
  } catch (err) {
    console.error('Error recomputing current-index flags (reconcile script will repair):', err);
  }
};

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
        var message = `Error processing data.  Table: ${Table}`;
        Snackbar && dispatch(updateSnackBar({ open: true, variant: 'error', message }));
        onError && onError(err, Data);
        console.error({ message, err, Data });
      } else {
        Snackbar && dispatch(updateSnackBar({ open: true, variant: 'success', message: 'Success' }));
        onSuccess && onSuccess(data, Data);
        (Action === 'c' || Action === 'u' || Action === 'd') && updateDatabase({ table: Table, id: Data._id, payload: { ...Data, _rev: Data._rev } }); // write data to local state, make sure to update the revision as well so subsequent writes won't throw a document conflict error
        Table === tables.applications && recomputeCurrentFlags(Data, updateDatabase); // fire-and-forget: keep the current-index flags in sync
      }
    });
  } else {
    dynamo.get({ TableName: Table, Key: Data }, function (err, data) {
      if (err) {
        var message = `Error processing data.  Table: ${Table}`;
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
  const Data = normalizeEmailFields({ ...DataProp, delete: Action === 'c' ? false : Action === 'd' ? true : (DataProp as any).delete });
  try {
    executeTransaction(pdi, Data, updateDatabase, dispatch);
  } catch (error: any) {
    if (error?.statusCode === 409) {
      //Document update conflict.  This can happen if someone updated the document at the server while another user's browser is editing an earlier revision
      //Just show an error for now, as the applications will rarely be edited and the tables are constantly refreshed with new data.
      //The correct logic would get the most recent document from the database, inform the user that the document is out of date, update the revision number and allow the user to review changes or force the update.
    }
    var message = `Caught Error processing data.  Table: ${Table}`;
    Snackbar && dispatch(updateSnackBar({ open: true, variant: 'error', message }));
    onError && onError(error, Data);
    console.error({ message, error, Data });
  }
};

export default useProcessData;
