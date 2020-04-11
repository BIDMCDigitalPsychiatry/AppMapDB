import React from 'react';
import GenericDialog from '../GenericDialog';
import DialogTableContent from '../DialogTableContent';
import * as Tables from '../../GenericTable';
import { useViewMode } from '../../../layout/store';
import { useDialogState } from '../useDialogState';

export const title = 'Application History';

const Content = props => {
  const [viewMode] = useViewMode();
  return (
    <DialogTableContent
      Table={viewMode === 'list' ? Tables.ApplicationListHistory : Tables.ApplicationHistory}
      buttonPosition='bottom'
      title={title}
      {...props}
    />
  );
};

export default function ApplicationHistoryDialog({ id = title, ...other }) {
  const [{ initialValues }] = useDialogState(id);
  return (
    <GenericDialog
      id={id}
      title={null}
      isFullScreen={true}
      maxWidth='xl'
      cancelLabel='Close'
      submitLabel={null}
      Content={Content}
      ContentProps={{ initialValues }}
      {...other}
    />
  );
}
