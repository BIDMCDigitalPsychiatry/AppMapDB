import React from 'react';
import GenericDialog from '../GenericDialog';
import DialogTableContent from '../DialogTableContent';
import * as Tables from '../../GenericTable';
import { useViewMode, useAdminMode } from '../../../layout/store';
import { useDialogState } from '../useDialogState';
import { tx, useT } from '../../../../i18n';

// Dialog id (stays English); translated for display.
export const title = tx('Application History');

const Content = props => {
  const [viewMode] = useViewMode();
  const t = useT();
  return (
    <DialogTableContent
      Table={viewMode === 'grid' ? Tables.ApplicationListHistory : Tables.ApplicationHistory}
      buttonPosition='bottom'
      title={t(title)}
      {...props}
    />
  );
};

export default function ApplicationHistoryDialog({ id = title, onClose, ...other }) {
  const [{ initialValues }] = useDialogState(id);
  const [adminMode, setAdminMode] = useAdminMode() as any;
  const t = useT();

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
      cancelLabel={t('Close')}
      submitLabel={null}
      Content={Content}
      ContentProps={{ initialValues }}
      onClose={handleClose}
      {...other}
    />
  );
}
