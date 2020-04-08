import React from 'react';
import { useDialogState } from '../useDialogState';
import Application from '../../../../database/models/Application';
import { tables } from '../../../../database/dbConfig';
import { useProcessData } from '../../../../database/useProcessData';
import { uuid, publicUrl } from '../../../../helpers';
import steps from './steps';
import { useChangeRoute } from '../../../layout/hooks';
import GenericStepperDialog from '../GenericStepperDialog';
import { useSelector } from 'react-redux';

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

  const email = useSelector((s: any) => s.firebase.auth.email);
  const uid = useSelector((s: any) => s.firebase.auth.uid);

  const handleProcessData = (values, Action, handleReset = undefined) => {
    const application: Application = values[tables.applications];
    const timestamp = new Date().getTime();

    if (Action === 'c') {
      application._id = uuid(); // If creating a new, generate the id client side so it can be linked to the rating    }
      application.created = timestamp;
    } else if (Action === 'u') {
      // If we are updating an existing entry, we actually create a new row with  link back to the parent
      application.parent = { _id: application._id, _rev: application._rev };
      application._id = uuid(); // Create new id so a new row is created
      application._rev = undefined; // reset revision
      application.created = timestamp;
      Action = 'c'; // Switch action to create for political correctness
    }

    application.updated = timestamp;

    setDialogState(prev => ({ ...prev, loading: true }));

    processData({
      Model: tables.applications,
      Action,
      Data: { ...application, email, uid },
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

  const handleClose = React.useCallback(() => {
    setDialogState(prev => ({ ...prev, open: false, submitting: false, errors: {} }));
    onClose && onClose();
  }, [setDialogState, onClose]);

  return <GenericStepperDialog id={id} maxWidth='lg' submitLabel='Save' title={title} onSubmit={handleSubmit} steps={_steps} onClose={onClose} timeout={0} />;
}
