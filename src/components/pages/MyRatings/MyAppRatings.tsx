import * as React from 'react';
import { dynamo, tables } from '../../../database/dbConfig';
import { useApplications } from '../../../database/useApplications';
import * as ApplicationHistoryDialogV2 from '../../application/GenericDialog/ApplicationHistoryDialogV2';
import * as ApplicationDialog from '../../application/GenericDialog/ApplicationDialog';
import { renderDialogModule } from '../../application/GenericDialog/DialogButton';
import { MyApplicationsPending } from '../../application/GenericTable/MyApplicationsPending/table';
import { useSelector } from 'react-redux';

export default function MyAppRatings({ height = undefined, showArchived = false }) {
  const [, setApps] = useApplications();
  const handleRefresh = React.useCallback(() => {
    const getItems = async () => {
      let scanResults = [];
      let items;
      var params = {
        TableName: tables.applications,
        ExclusiveStartKey: undefined
      };
      do {
        items = await dynamo.scan(params).promise();
        items.Items.forEach(i => scanResults.push(i));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
      } while (typeof items.LastEvaluatedKey != 'undefined');
      setApps(
        scanResults.reduce((f, c: any) => {
          f[c._id] = c;
          return f;
        }, {})
      );
    };
    getItems();
  }, [setApps]);

  // Load data from the database
  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const email = useSelector((s: any) => s.layout.user?.signInUserSession?.idToken?.payload?.email);

  return (
    <>
      {renderDialogModule({ ...ApplicationHistoryDialogV2, onClose: handleRefresh })}
      {renderDialogModule({ ...ApplicationDialog, onClose: handleRefresh })}
      <MyApplicationsPending height={height} showArchived={showArchived} email={email} />
    </>
  );
}
