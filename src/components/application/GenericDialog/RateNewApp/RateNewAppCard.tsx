import React from 'react';
import { useDialogState } from '../useDialogState';
import Application from '../../../../database/models/Application';
import { tables } from '../../../../database/dbConfig';
import { useProcessData } from '../../../../database/useProcessData';
import { uuid } from '../../../../helpers';
import GenericStepperCard from '../GenericCardStepper';
import steps from './steps';

export const title = 'Rate New App';

export interface ComponentProps {
  id?: string;
  onClose?: () => any;
}

export default function RateNewAppCard({ id = title, onClose }: ComponentProps) {
  const [{ type }, setDialogState] = useDialogState(id);

  const processData = useProcessData();

  const handleProcessData = (values, Action) => {
    const application: Application = values[tables.applications];

    if (Action === 'c') {
      application._id = uuid(); // If creating a new, generate the id client side so it can be linked to the rating    }
    }

    const rating: Application = { ...values[tables.ratings], appId: application._id }; // Inject appId for document linkage

    processData({ Model: tables.applications, Action, Data: application }); // Submit application row
    processData({ Model: tables.ratings, Action, Data: { ...rating, time: new Date().getTime() } }); // Inject appId and submit rating row

    handleClose();
  };

  const handleSubmit = (values, handleReset) => {
    handleProcessData(values, type === 'Edit' ? 'u' : 'c');
    handleReset();
  };
  const handleDelete = values => handleProcessData(values, 'd');

  const handleClose = React.useCallback(() => {
    setDialogState(prev => ({ ...prev, open: false, submitting: false, errors: {} }));
    onClose && onClose();
  }, [setDialogState, onClose]);

  return <GenericStepperCard id={id} title={title} onSubmit={handleSubmit} onDelete={handleDelete} steps={steps} onClose={onClose} open={true} />;
}
