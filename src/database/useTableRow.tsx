import * as React from 'react';
import { tables } from './dbConfig';
import { isEmpty } from '../helpers';
import useProcessData from './useProcessData';

export default function useTableRow({
  Model = tables.events,
  id: Id = undefined,
  state: externalState = undefined,
  setState: setExternalState = undefined,
  active = true,
  onSuccess: OnSuccess = undefined
}) {
  const [internalState, setInternalState] = React.useState();
  const state = externalState ? externalState : internalState;
  const setState = setExternalState ? setExternalState : setInternalState;
  const { open } = state ?? { open: undefined };
  const processData = useProcessData();
  const row = state?.response?.Item;
  const row_str = JSON.stringify(row) ?? '{}'; // Default to empty object string if undefined

  const handleRefresh = React.useCallback(
    ({ id: _Id = undefined, onSuccess = undefined } = {}) => {
      const id = _Id ? _Id : Id;
      if (!isEmpty(id)) {
        setState(prev => ({ ...prev, loading: true, error: undefined, response: undefined }));
        processData({
          Model,
          Action: 'r',
          Data: { id },
          onError: response => setState(prev => ({ ...prev, loading: false, error: 'Error reading values', response })),
          onSuccess: response => {
            setState(prev => ({ ...prev, loading: false, error: undefined, response }));
            onSuccess && onSuccess(response);
            OnSuccess && OnSuccess(response);
          }
        });
      }
    },
    [Id, Model, processData, OnSuccess, setState]
  );

  React.useEffect(() => {
    if (open !== undefined) {
      active && open && handleRefresh(); // For use with dialogs, so we only request data on open
    } else {
      active && handleRefresh();
    }
  }, [handleRefresh, open, active]);

  const setRow = React.useCallback(
    ({ id: _Id = undefined, values, prev = undefined, onSuccess = undefined, onError = undefined }) => {
      // If an id is provided via the function call, use that over Id
      const id = _Id ? _Id : Id;
      if (!isEmpty(id)) {
        const prevValues = prev === undefined ? JSON.parse(row_str) : prev; // If user provides previous value, use that, otherwise use the values stored in local state
        setState(prev => ({ ...prev, loading: true, error: undefined, response: undefined }));
        processData({
          Model,
          Action: 'u',
          Data: { ...prevValues, id, ...values },
          onError: response => {
            setState(prev => ({ ...prev, loading: false, error: 'Error reading values', response }));
            onError && onError(response);
          },
          onSuccess: response => {
            setState(prev => ({ ...prev, loading: false, error: undefined, response }));
            onSuccess && onSuccess(response);
            OnSuccess && OnSuccess(response);
          }
        });
      }
    },
    [Id, Model, setState, processData, row_str, OnSuccess]
  );

  // Provide previous value via function parameter to prevent multiple re-renders in useEffect hooks
  const setRowPrev = React.useCallback(
    ({ id: _Id = undefined, values, prev = undefined, onSuccess = undefined, onError = undefined }) => {
      // If an id is provided via the function call, use that over Id
      const id = _Id ? _Id : Id;
      if (!isEmpty(id)) {
        setState(prev => ({ ...prev, loading: true, error: undefined, response: undefined }));
        processData({
          Model,
          Action: 'u',
          Data: { ...prev, id, ...values },
          onError: response => {
            setState(prev => ({ ...prev, loading: false, error: 'Error reading values', response }));
            onError && onError(response);
          },
          onSuccess: response => {
            setState(prev => ({ ...prev, loading: false, error: undefined, response }));
            onSuccess && onSuccess(response);
            OnSuccess && OnSuccess(response);
          }
        });
      }
    },
    [Id, Model, setState, processData, OnSuccess]
  );

  // Reads the row from the database first, and then merges the new values into the existing data before saving back to the database
  const readSetRow = React.useCallback(
    ({ id = undefined, values, ...other }) => {
      handleRefresh({ id, onSuccess: response => setRowPrev({ id: id, values, prev: response?.Item, ...other }) });
    },
    [setRowPrev, handleRefresh]
  );

  return { row, setRow, readSetRow, handleRefresh, loading: state?.loading };
}
