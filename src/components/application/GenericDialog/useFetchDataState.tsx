import React from 'react';
import useFetchData from '../../layout/useFetchData';

export default function useFetchDataState({ pdi, trigger = undefined, state, setState }) {
  const onSuccess = React.useCallback(data => setState(prev => ({ ...prev, loading: false })), [setState]);

  const { open } = state;

  const onError = React.useCallback(
    error =>
      setState(prev => ({
        ...prev,
        loading: false,
        showErrors: true,
        errors: { ...prev.errors, loading: error }, // Store the error in the dialog state under loading key
      })),
    [setState]
  );

  const { fetchData, data } = useFetchData({ onError, onSuccess });

  const fetchDialogData = React.useCallback(
    pdi => {
      setState(prev => ({ ...prev, loading: true, errors: {} })); // Set loading and clear any previous errors
      fetchData(pdi);
    },
    [fetchData, setState]
  );

  const pdi_s = JSON.stringify(pdi); // Prevents triggering a refresh when the object ref changes. The refresh should be triggered only when the actual value changes
  const trigger_s = trigger ? JSON.stringify(trigger) : true;
  React.useEffect(() => {
    open && trigger_s && fetchDialogData(JSON.parse(pdi_s));
  }, [pdi_s, trigger_s, open, fetchDialogData]);

  const handleRefresh = React.useCallback(() => fetchDialogData(JSON.parse(pdi_s)), [fetchDialogData, pdi_s]);

  return { data, handleRefresh };
}
