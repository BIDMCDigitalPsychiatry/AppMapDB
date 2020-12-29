import React from 'react';
import GenericDialog from '../GenericDialog';
import DialogTableContent from '../DialogTableContent';
import { useAdminMode } from '../../../layout/store';
import { useDialogState } from '../useDialogState';
import * as tables from '../../GenericTable';

export const title = 'App History';

const Content = props => {
  return <DialogTableContent Table={tables.ApplicationListHistoryV2} buttonPosition='bottom' title={title} {...props} />;
};

export default function ApplicationHistoryDialogV2({ id = title, onClose, ...other }) {
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
