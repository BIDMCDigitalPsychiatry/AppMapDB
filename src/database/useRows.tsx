import React from 'react';
import { dynamo } from './dbConfig';
import { useTableState } from './useTableState';

export const useRows = ({ table }) => {
  const [rows = [], setRows] = useTableState(table);

  const handleRefresh = React.useCallback(() => {
    const getItems = async () => {
      let scanResults = [];
      let items;
      var params = {
        TableName: table,
        ExclusiveStartKey: undefined
      };
      do {
        items = await dynamo.scan(params).promise();
        items.Items.forEach(i => scanResults.push(i));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
      } while (typeof items.LastEvaluatedKey != 'undefined');
      setRows(
        scanResults.reduce((f, c: any) => {
          f[c._id] = c;
          return f;
        }, {})
      );
    };
    getItems();
  }, [table, setRows]);

  return { rows, setRows, handleRefresh };
};
