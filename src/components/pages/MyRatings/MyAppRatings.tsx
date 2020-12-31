import * as React from 'react';
import { dynamo, tables } from '../../../database/dbConfig';
import { useApplications } from '../../../database/useApplications';
import * as ApplicationHistoryDialogV2 from '../../application/GenericDialog/ApplicationHistoryDialogV2';
import * as ApplicationDialog from '../../application/GenericDialog/ApplicationDialog';
import { renderDialogModule } from '../../application/GenericDialog/DialogButton';
import { MyApplicationsPending } from '../../application/GenericTable/MyApplicationsPending/table';

export default function MyAppRatings({ height = undefined, showArchived = false }) {
  const [, setApps] = useApplications();

  // Load data from the database
  React.useEffect(() => {
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

  const email = 'slagan@bidmc.harvard.edu';

  return (
    <>
      {renderDialogModule(ApplicationHistoryDialogV2)}
      {renderDialogModule(ApplicationDialog)}
      <MyApplicationsPending height={height} showArchived={showArchived} email={email} />
    </>
  );
}
