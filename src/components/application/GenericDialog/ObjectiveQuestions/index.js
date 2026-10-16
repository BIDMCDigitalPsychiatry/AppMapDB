import React from 'react';
import GenericDialog from '../GenericDialog';
import { tx } from '../../../../i18n';
import { DialogContent } from '@mui/material';
import ObjectiveQuestions from '../../../pages/ObjectiveQuestions';

export const title = tx('Why 105 Objective Questions?'); // also the dialog-state id: tx keeps it English

export default function ObjectiveQuestionsDialog({ id = title }) {
  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel={tx('Close')} maxWidth='lg'>
      <DialogContent dividers>
        <ObjectiveQuestions />
      </DialogContent>
    </GenericDialog>
  );
}
