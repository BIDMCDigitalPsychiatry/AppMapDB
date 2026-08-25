import * as React from 'react';
import * as ApplicationHistoryDialogV2WithDrafts from '../../application/GenericDialog/ApplicationHistoryDialogV2WithDrafts';
import * as ApplicationDialog from '../../application/GenericDialog/ApplicationDialog';
import { renderDialogModule } from '../../application/GenericDialog/DialogButton';
import { MyApplicationsPending } from '../../application/GenericTable/MyApplicationsPending/table';
import { useSelector } from 'react-redux';
import useAppTableData, { useMyRatingsData } from '../useAppTableData';

export default function MyAppRatings({ height = undefined, showArchived = false }) {
  const { handleRefresh } = useAppTableData();

  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email);

  // The rater's own rows (drafts and superseded ratings included) aren't in
  // the current-index — load their complete personal history via email-index.
  useMyRatingsData(email);

  return (
    <>
      {renderDialogModule({ ...ApplicationHistoryDialogV2WithDrafts, onClose: handleRefresh })}
      {renderDialogModule({ ...ApplicationDialog, onClose: handleRefresh })}
      <MyApplicationsPending height={height} showArchived={showArchived} email={email} />
    </>
  );
}
