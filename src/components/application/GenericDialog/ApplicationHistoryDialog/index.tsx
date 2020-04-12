import React from 'react';
import GenericDialog from '../GenericDialog';
import DialogTableContent from '../DialogTableContent';
import * as Tables from '../../GenericTable';
import { useViewMode, useAdminMode } from '../../../layout/store';
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

export default function ApplicationHistoryDialog({ id = title, onClose, ...other }) {
  const [{ initialValues }] = useDialogState(id);
  const [adminMode, setAdminMode] = useAdminMode() as any;

  // This hack forces a refresh of the data if the admin may have closed something
  const handleClose = React.useCallback(() => {
    if (adminMode) {
      setAdminMode(false);
      setAdminMode(true);
    }
    onClose && onClose();
  }, [adminMode, setAdminMode, onClose]);
  return (
    <GenericDialog
      id={id}
      title={null}
      maxWidth='xl'
      cancelLabel='Close'
      submitLabel={null}
      Content={Content}
      ContentProps={{ initialValues }}
      onClose={handleClose}
      {...other}
    />
  );
}
