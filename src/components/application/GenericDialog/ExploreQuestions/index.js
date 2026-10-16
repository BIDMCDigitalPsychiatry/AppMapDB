import React from 'react';
import GenericDialog from '../GenericDialog';
import { tx } from '../../../../i18n';
import { DialogContent } from '@mui/material';
import ExploreQuestions from '../../../pages/ExploreQuestions';

export const title = tx('Explore Questions'); // also the dialog-state id: tx keeps it English

export default function ExploreQuestionsDialog({ id = title }) {
  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel={tx('Close')} maxWidth='lg'>
      <DialogContent dividers>
        <ExploreQuestions />
      </DialogContent>
    </GenericDialog>
  );
}
