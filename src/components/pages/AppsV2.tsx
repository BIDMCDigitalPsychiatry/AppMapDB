import * as React from 'react';
import * as Tables from '../application/GenericTable';
import { useFooterHeight, useHeaderHeight, useHeight, useViewMode } from '../layout/store';
import { dynamo, tables } from '../../database/dbConfig';
import { useApplications } from '../../database/useApplications';
import * as ApplicationHistoryDialog from '../application/GenericDialog/ApplicationHistoryDialog';
import * as SuggestEditDialog from '../application/GenericDialog/SuggestEdit';
import * as ApplicationDialog from '../application/GenericDialog/ApplicationDialog';
import { renderDialogModule } from '../application/GenericDialog/DialogButton';
import SearchHeaderRedux from './SearchHeaderRedux';

export default function AppsV2() {
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

  const headerHeight = useHeaderHeight();
  const footerHeight = useFooterHeight();

  const height = useHeight();

  const tableHeight = height - footerHeight - headerHeight + 7;

  return (
    <>
      {renderDialogModule(ApplicationHistoryDialog)}
      {renderDialogModule(SuggestEditDialog)}
      {renderDialogModule(ApplicationDialog)}
      <SearchHeaderRedux />
      {viewMode === 'table' ? <Tables.Applications height={tableHeight} /> : <Tables.ApplicationsList height={tableHeight} />}
    </>
  );
}
