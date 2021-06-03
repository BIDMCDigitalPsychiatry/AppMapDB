import * as React from 'react';
import { dynamo } from './dbConfig';

export default function useTable({ TableName, idKey = 'id' }) {
  const [state, setState] = React.useState({ data: [], loading: false, success: false });

  const handleRequest = React.useCallback(
    ({ FilterExpression = undefined, ExpressionAttributeNames = undefined, ExpressionAttributeValues = undefined } = {}) => {
      const getRows = async () => {
        let scanResults = [];
        let items;
        var params = {
          TableName,
          ExclusiveStartKey: undefined,
          FilterExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues
        };
        do {
          items = await dynamo.scan(params).promise();
          items.Items.forEach(i => scanResults.push(i));
          params.ExclusiveStartKey = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey != 'undefined');
        setState(prev => ({
          ...prev,
          loading: false,
          success: true,
          data: scanResults.reduce((f, c: any) => {
            f[c[idKey]] = c;
            return f;
          }, {})
        }));
      };
      setState(prev => ({ ...prev, data: [], loading: true, success: false }));
      getRows();
    },
    [idKey, TableName, setState]
  );

  return { state, setState, handleRequest };
}
