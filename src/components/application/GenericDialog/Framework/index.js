import React from 'react';
import GenericDialog from '../GenericDialog';
import Framework from '../../../pages/Framework';
import { DialogContent } from '@mui/material';

export const title = 'APA App Evaluation Model';

export default function FrameworkDialog({ id = title }) {
  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel='Close' maxWidth='lg'>
      <DialogContent dividers>
        <Framework />
      </DialogContent>
    </GenericDialog>
  );
}
