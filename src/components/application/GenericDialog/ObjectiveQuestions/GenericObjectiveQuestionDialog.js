import React from 'react';
import GenericDialog from '../GenericDialog';
import GenericDialogContent from '../GenericDialogContent';

export default function GenericObjectiveQuestionDialog({ id, img = undefined, questions = [] }) {
  return (
    <GenericDialog id={id} title={null} submitLabel={null} cancelLabel='Close' maxWidth='md'>
      <GenericDialogContent title={id} img={img} questions={questions} />
    </GenericDialog>
  );
}
