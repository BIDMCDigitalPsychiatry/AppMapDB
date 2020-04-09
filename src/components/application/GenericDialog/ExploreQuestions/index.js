import React from 'react';
import GenericDialog from '../GenericDialog';
import { DialogContent } from '@material-ui/core';
import ExploreQuestions from '../../../pages/ExploreQuestions';

export const title = 'Explore Questions';

export default function ExploreQuestionsDialog({ id = title }) {
  return (
    <GenericDialog id={id} title={id} submitLabel={null} cancelLabel='Close' maxWidth='lg'>
      <DialogContent dividers>
        <ExploreQuestions />
      </DialogContent>
    </GenericDialog>
  );
}
