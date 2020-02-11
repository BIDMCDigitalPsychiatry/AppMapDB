import React from 'react';
import useFetchData from '../../layout/useFetchData';

export default function useFetchDialogData({ pdi, trigger = undefined, dialogState, setDialogState }) {
  const onSuccess = React.useCallback(data => setDialogState(prev => ({ ...prev, loading: false })), [setDialogState]);

  const { open, type } = dialogState;

  const onError = React.useCallback(
    error =>
      setDialogState(prev => ({
        ...prev,
        loading: false,
        showErrors: true,
        errors: { ...prev.errors, loading: error } // Store the error in the dialog state under loading key
      })),
    [setDialogState]
  );

  const { fetchData, data } = useFetchData({ onError, onSuccess });

  const fetchDialogData = React.useCallback(
    pdi => {
      setDialogState(prev => ({ ...prev, loading: true, errors: {} })); // Set loading and clear any previous errors
      fetchData(pdi);
    },
    [fetchData, setDialogState]
  );

  const pdi_s = JSON.stringify(pdi); // Prevents triggering a refresh when the object ref changes. The refresh should be triggered only when the actual value changes
  React.useEffect(() => {
    open && type === 'Edit' && trigger && fetchDialogData(JSON.parse(pdi_s));
  }, [pdi_s, trigger, open, type, fetchDialogData]);

  return type !== 'Add' ? data : undefined; // Only return values if we are editing
}
