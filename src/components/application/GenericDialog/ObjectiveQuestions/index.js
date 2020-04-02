import React from 'react';
import GenericDialog from '../GenericDialog';
import { DialogContent } from '@material-ui/core';
import ObjectiveQuestions from '../../../pages/ObjectiveQuestions';

export const title = 'Why 105 Objective Questions?';

export default function ObjectiveQuestionsDialog({ id = title }) {
  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel='Close' maxWidth='lg'>
      <DialogContent dividers>
        <ObjectiveQuestions />
      </DialogContent>
    </GenericDialog>
  );
}
