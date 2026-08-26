import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Auth } from 'aws-amplify';
import { dynamo, DataModel, TableName, tables, indexes } from './dbConfig';
import { updateSnackBar } from '../components/application/SnackBar/store';
import { useUpdateDatabase } from './useUpdateDatabase';
import { diffCurrentFlags, groupOf } from './currentFlags';
import { normalizeEmailFields } from './normalize';

export interface ProcessDataInfo {
  Model: TableName | 'users';
  Data: DataModel;
  Action?: 'c' | 'r' | 'u' | 'd';
  Snackbar?: boolean;
  onSuccess?: (response, data: DataModel) => void;
  onError?: (response, data: DataModel) => void;
}

/* ---------------------------------------------------------------------------
 * Write transport (PLAN_MODERNIZATION.md §1).
 *
 * When REACT_APP_WRITE_API_URL is set and the caller is signed in, writes to
 * the authenticated models go through the write-API Lambda, which verifies
 * the Cognito token, enforces roles server-side (approve/archive = admin
 * only; authorship from the token), normalizes emails, and maintains the
 * current-index flags. The Lambda's response carries the finalized row and
 * the flag changes so the local store updates without a refetch.
 *
 * Anonymous flows (public surveys, sign-up surveys, visitor tracking) cannot
 * carry a token and keep writing directly — their tables are not served by
 * the API. Unsetting REACT_APP_WRITE_API_URL reverts ALL writes to the
 * legacy direct path (instant rollback). Local-data dev mode always writes
 * to its in-memory store via the direct path.
 * ------------------------------------------------------------------------- */
export const WRITE_API_URL = process.env.REACT_APP_WRITE_API_URL;
const API_MODELS = new Set(['applications', 'users', 'posts', 'comments', 'events', 'team', 'filters']);
const useLocalData = process.env.NODE_ENV !== 'production' && process.env.REACT_APP_USE_LOCAL_DATA === 'true';

const getIdToken = async (): Promise<string | undefined> => {
  try {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
  } catch {
    return undefined; // not signed in
  }
};

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

// After any applications write on the DIRECT path, bring the group's `cur`
// flags in line so the current-index GSI keeps serving the correct rows.
// (On the API path the Lambda does this server-side.) Failures only log —
// the reconcile script repairs any drift.
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
    const merged = [...rows.filter(r => r._id !== written._id), written];
    for (const change of diffCurrentFlags(merged)) {
      await dynamo
        .update({
          TableName: tables.applications,
          Key: { _id: change._id },
          ...(change.cur
            ? { UpdateExpression: 'SET #c = :v', ExpressionAttributeNames: { '#c': 'cur' }, ExpressionAttributeValues: { ':v': change.cur } }
            : { UpdateExpression: 'REMOVE #c', ExpressionAttributeNames: { '#c': 'cur' } })
        })
        .promise();
      updateDatabase({ table: tables.applications, id: change._id, payload: prev => (prev ? { ...prev, cur: change.cur } : prev) });
    }
  } catch (err) {
    console.error('Error recomputing current-index flags (reconcile script will repair):', err);
  }
};

// Rapid successive writes to the same row (e.g. double-clicking an approve
// toggle) need two protections:
//  - opSeq: only the NEWEST operation may reconcile/roll back the row, so a
//    stale server response can't flip the UI back over a newer click.
//  - opChain: requests for the same row are serialized, so the server applies
//    them in click order and the final response reflects the final state.
const opSeq = new Map<string, number>();
const opChain = new Map<string, Promise<void>>();

async function executeViaApi(pdi: ProcessDataInfo, Data, token: string, updateDatabase, dispatch) {
  const { Model: Table, Action = 'c', Snackbar = true, onSuccess = undefined, onError = undefined } = pdi;

  const key = `${Table}:${Data._id}`;
  const seq = (opSeq.get(key) ?? 0) + 1;
  opSeq.set(key, seq);
  const isLatest = () => opSeq.get(key) === seq;

  // Optimistic update: apply the change to the local store immediately so the
  // UI responds on click (an admin toggle otherwise waits out the full API
  // round trip). The server response reconciles the finalized row + flag
  // changes; a rejection rolls the row back.
  let previousRow: any;
  let hadPreviousRow = false;
  updateDatabase({
    table: Table as string,
    id: Data._id,
    payload: prev => {
      previousRow = prev;
      hadPreviousRow = prev !== undefined;
      return { ...Data };
    }
  });
  const rollback = () =>
    isLatest() && updateDatabase({ table: Table as string, id: Data._id, payload: () => (hadPreviousRow ? previousRow : undefined) });

  const run = async () => {
    try {
      const res = await fetch(WRITE_API_URL as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ Model: Table, Action, Data })
      });
      const json: any = await res.json().catch(() => ({}));
      if (!res.ok || json.ok !== true) {
        rollback();
        const message = json?.error ?? `Error processing data. Table: ${Table}`;
        Snackbar && dispatch(updateSnackBar({ open: true, variant: 'error', message }));
        onError && onError(json, Data);
        console.error({ message, status: res.status, Data });
        return;
      }
      const finalized = json.data ?? Data;
      Snackbar && dispatch(updateSnackBar({ open: true, variant: 'success', message: 'Success' }));
      onSuccess && onSuccess(json, finalized);
      if (isLatest()) {
        updateDatabase({ table: Table as string, id: finalized._id, payload: { ...finalized, _rev: finalized._rev } });
        if (Array.isArray(json.flagChanges)) {
          for (const change of json.flagChanges) {
            if (change._id !== finalized._id)
              updateDatabase({ table: tables.applications, id: change._id, payload: prev => (prev ? { ...prev, cur: change.cur } : prev) });
          }
        }
      }
    } catch (err) {
      rollback();
      const message = `Error processing data. Table: ${Table}`;
      Snackbar && dispatch(updateSnackBar({ open: true, variant: 'error', message }));
      onError && onError(err, Data);
      console.error({ message, err, Data });
    }
  };

  const chained = (opChain.get(key) ?? Promise.resolve()).then(run);
  opChain.set(
    key,
    chained.catch(() => {})
  );
  await chained;
}

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
    // Route writable actions for authenticated models through the write API
    // when it is configured and the user has a session.
    if (WRITE_API_URL && !useLocalData && Action !== 'r' && API_MODELS.has(Table as string)) {
      const token = await getIdToken();
      if (token) {
        await executeViaApi(pdi, Data, token, updateDatabase, dispatch);
        return;
      }
    }
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
