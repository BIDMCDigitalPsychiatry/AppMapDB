import * as React from 'react';
import * as Tables from '../application/GenericTable';
import { useViewMode } from '../layout/store';
import { dynamo, tables } from '../../database/dbConfig';
import { useApplications } from '../../database/useApplications';
import * as ApplicationHistoryDialog from '../application/GenericDialog/ApplicationHistoryDialog';
import * as SuggestEditDialog from '../application/GenericDialog/SuggestEdit';
import * as ApplicationDialog from '../application/GenericDialog/ApplicationDialog';
import { renderDialogModule } from '../application/GenericDialog/DialogButton';

export default function Apps() {
  const [viewMode] = useViewMode() as any;
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

  return (
    <>
      {renderDialogModule(ApplicationHistoryDialog)}
      {renderDialogModule(SuggestEditDialog)}
      {renderDialogModule(ApplicationDialog)}
      {viewMode === 'table' ? <Tables.Applications /> : <Tables.ApplicationsList />}
    </>
  );
}
