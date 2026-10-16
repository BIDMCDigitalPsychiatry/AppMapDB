import React from 'react';
import GenericDialog from '../GenericDialog';
import { tx } from '../../../../i18n';
import Framework from '../../../pages/Framework';
import { DialogContent } from '@mui/material';

export const title = tx('APA App Evaluation Model'); // also the dialog-state id: tx keeps it English

export default function FrameworkDialog({ id = title }) {
  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel={tx('Close')} maxWidth='lg'>
      <DialogContent dividers>
        <Framework />
      </DialogContent>
    </GenericDialog>
  );
}
