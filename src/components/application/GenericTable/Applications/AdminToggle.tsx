import React from 'react';
import * as Icons from '@material-ui/icons';
import { useAdminMode } from '../../../layout/store';
import DialogButton from '../../GenericDialog/DialogButton';
import { useFullScreen } from '../../../../hooks';

export default function AdminToggle() {
  const [adminMode, setAdminMode] = useAdminMode() as any;
  const handleClick = React.useCallback(() => setAdminMode(adminMode === true ? false : true), [adminMode, setAdminMode]);
  const fullScreen = useFullScreen();
  return (
    <DialogButton
      Icon={adminMode === true ? Icons.PermIdentity : Icons.PeopleAlt}
      tooltip={`Switch to ${adminMode === true ? 'public mode' : 'admin mode'}`}
      onClick={handleClick}
    >
      {!fullScreen && <div style={{ width: fullScreen ? undefined : 130 }}> {adminMode === true ? 'Viewing Admin' : 'Viewing Public'}</div>}
    </DialogButton>
  );
}
