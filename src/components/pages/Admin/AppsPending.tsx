import * as React from 'react';
import * as ApplicationHistoryDialogV2 from '../../application/GenericDialog/ApplicationHistoryDialogV2';
import * as ApplicationDialog from '../../application/GenericDialog/ApplicationDialog';
import { renderDialogModule } from '../../application/GenericDialog/DialogButton';
import { ApplicationsPending } from '../../application/GenericTable/ApplicationsPending/table';
import useAppTableData from '../useAppTableData';

export default function AppsPending({ height = undefined, showArchived = false }) {
  const { handleRefresh } = useAppTableData();

  return (
    <>
      {renderDialogModule({ ...ApplicationHistoryDialogV2, onClose: handleRefresh })}
      {renderDialogModule({ ...ApplicationDialog, onClose: handleRefresh })}
      <ApplicationsPending height={height} showArchived={showArchived} />
    </>
  );
}
