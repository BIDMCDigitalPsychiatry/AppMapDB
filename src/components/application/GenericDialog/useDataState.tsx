import React from 'react';
import { useProcessData } from '../../layout/LayoutStore';
import useFetchDataState from './useFetchDataState';

export default function useDataState({ pdi, state = {}, setState = undefined, onClose = undefined }) {
  const processData = useProcessData();
  const { Model } = pdi;

  const createPdi = React.useCallback(
    ({ Data, Action = 'r', ...other }) => {
      return {
        Model,
        Action,
        Data,
        Snackbar: true,
        ...other,
      };
    },
    [Model]
  );

  const { data, handleRefresh } = useFetchDataState({
    pdi: createPdi(pdi),
    trigger: pdi,
    state,
    setState,
  });

  const handleClose = React.useCallback(() => {
    setState && setState(prev => ({ ...prev, open: false, submitting: false, errors: {} }));
    onClose && onClose();
  }, [onClose, setState]);

  const pdi_s = pdi ? JSON.stringify(pdi) : pdi;
  const handleSubmit = React.useCallback(
    values => {
      processData(createPdi({ ...JSON.parse(pdi_s), Data: values, Action: 'u', onSuccess: handleRefresh }));
      handleClose();
    },
    [handleRefresh, createPdi, processData, handleClose, pdi_s]
  );

  const handleDelete = React.useCallback(
    values => {
      processData(createPdi({ Data: values, Action: 'd' }));
      handleClose();
    },
    [createPdi, processData, handleClose]
  );

  return { data, handleSubmit, handleDelete, handleRefresh };
}
