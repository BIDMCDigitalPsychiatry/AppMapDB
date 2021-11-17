import * as React from 'react';
import { dynamo, tables } from '../../database/dbConfig';
import { useApplications } from '../../database/useApplications';

export default function useAppTableData() {
  const [apps, setApps] = useApplications();
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
        setApps(prev => ({
          ...prev,
          ...scanResults.reduce((f, c: any) => {
            f[c._id] = c;
            return f;
          }, {})
        }));
      } while (typeof items.LastEvaluatedKey != 'undefined');
    };
    getItems();
  }, [setApps]);

  // Load data from the database
  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return { apps, setApps, handleRefresh };
}
