import * as React from 'react';
import * as ApplicationHistoryDialogV2 from '../../application/GenericDialog/ApplicationHistoryDialogV2';
import * as ApplicationDialog from '../../application/GenericDialog/ApplicationDialog';
import { renderDialogModule } from '../../application/GenericDialog/DialogButton';
import { MyApplicationsPending } from '../../application/GenericTable/MyApplicationsPending/table';
import { useSelector } from 'react-redux';
import useAppTableData from '../useAppTableData';

export default function MyAppRatings({ height = undefined, showArchived = false }) {
  const { handleRefresh } = useAppTableData();

  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email);

  return (
    <>
      {renderDialogModule({ ...ApplicationHistoryDialogV2, onClose: handleRefresh })}
      {renderDialogModule({ ...ApplicationDialog, onClose: handleRefresh })}
      <MyApplicationsPending height={height} showArchived={showArchived} email={email} />
    </>
  );
}
