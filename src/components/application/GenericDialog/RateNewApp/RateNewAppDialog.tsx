import React from 'react';
import { useDialogState } from '../useDialogState';
import Application from '../../../../database/models/Application';
import { tables } from '../../../../database/dbConfig';
import { useProcessData } from '../../../../database/useProcessData';
import { uuid, publicUrl } from '../../../../helpers';
import steps from './steps';
import { useChangeRoute } from '../../../layout/hooks';
import GenericStepperDialog from '../GenericStepperDialog';

export const title = 'View/Edit App';

export interface ComponentProps {
  id?: string;
  onClose?: () => any;
}

export default function RateNewAppDialog({ id = title, onClose }: ComponentProps) {
  const [{ type }, setDialogState] = useDialogState(id);
  const [_steps, setSteps] = React.useState(steps(type));
  React.useEffect(() => {
    setSteps(steps(type));
  }, [type]);

  const processData = useProcessData();
  const changeRoute = useChangeRoute();

  const handleProcessData = (values, Action, handleReset = undefined) => {
    const application: Application = values[tables.applications];
    const timestamp = new Date().getTime();

    if (Action === 'c') {
      application._id = uuid(); // If creating a new, generate the id client side so it can be linked to the rating    }
      application.created = timestamp;
    }

    application.updated = timestamp;

    setDialogState(prev => ({ ...prev, loading: true }));

    processData({
      Model: tables.applications,
      Action,
      Data: application,
      onError: () => setDialogState(prev => ({ ...prev, loading: false, error: 'Error submitting values' })),
      onSuccess: () => {
        handleReset && handleReset();
        changeRoute(publicUrl('/Apps'));
        handleClose();
      }
    });
  };

  const handleSubmit = (values, handleReset) => {
    handleProcessData(values, type === 'Edit' ? 'u' : 'c', handleReset);
  };
  const handleDelete = values => handleProcessData(values, 'd');

  const handleClose = React.useCallback(() => {
    setDialogState(prev => ({ ...prev, open: false, submitting: false, errors: {} }));
    onClose && onClose();
  }, [setDialogState, onClose]);

  return (
    <GenericStepperDialog
      id={id}
      maxWidth='lg'
      submitLabel='Save'
      title={title}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      steps={_steps}
      onClose={onClose}
      timeout={0}
    />
  );
}
