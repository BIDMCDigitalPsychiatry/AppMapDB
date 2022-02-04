import React from 'react';
import { useDialogState } from '../useDialogState';
import Application from '../../../../database/models/Application';
import { tables } from '../../../../database/dbConfig';
import { useProcessData } from '../../../../database/useProcessData';
import { uuid, publicUrl } from '../../../../helpers';
import GenericStepper from '../GenericStepper';
import steps from './steps';
import { useChangeRoute } from '../../../layout/hooks';
import { useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { useAppData } from '../../GenericTable/Applications/selectors';

export const title = 'Rate an App V2';

export interface ComponentProps {
  id?: string;
  onClose?: () => any;
}

export default function RateNewAppCard({ id = title, onClose }: ComponentProps) {
  const [{ type }, setDialogState] = useDialogState(id);
  const data = useAppData('');
  const [_steps, setSteps] = React.useState(steps(type, data));
  React.useEffect(() => {
    setSteps(steps(type, data));
    // eslint-disable-next-line
  }, [type, JSON.stringify(data)]);

  const processData = useProcessData();
  const changeRoute = useChangeRoute();

  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email);
  const uid = useSelector((s: any) => s.layout.user?.username);

  const handleProcessData = (values, Action, handleReset = undefined, draft = undefined) => {
    const application: Application = values[tables.applications];
    const timestamp = new Date().getTime();

    if (Action === 'c') {
      application._id = uuid(); // If creating a new, generate the id client side so it can be linked to the rating
      application.groupId = uuid(); // Also create a group id so we can keep track of the history more easily
      application.created = timestamp;
    }

    application.updated = timestamp;

    setDialogState(prev => ({ ...prev, loading: true }));

    processData({
      Model: tables.applications,
      Action,
      Data: { ...application, email, uid, draft },
      onError: () => setDialogState(prev => ({ ...prev, loading: false, error: 'Error submitting values' })),
      onSuccess: () => {
        handleReset && handleReset();
        changeRoute(publicUrl('/MyRatings'));
        handleClose();
      }
    });
  };

  const handleSubmit = (values, handleReset, draft) => {
    handleProcessData(values, type === 'Edit' ? 'u' : 'c', handleReset, draft);
  };
  const handleDelete = values => handleProcessData(values, 'd');

  const handleClose = React.useCallback(() => {
    setDialogState(prev => ({ ...prev, open: false, submitting: false, errors: {} }));
    onClose && onClose();
  }, [setDialogState, onClose]);

  return (
    <Box mb={1}>
      <GenericStepper id={id} title={title} onSubmit={handleSubmit} onDelete={handleDelete} steps={_steps} onClose={onClose} open={true} />;
    </Box>
  );
}
