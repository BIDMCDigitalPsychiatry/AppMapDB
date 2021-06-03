import * as React from 'react';
import useTable from '../../../database/useTable';
import { tables } from '../../../database/dbConfig';

const Model = tables.events;

export default function useEvents({ requestParams = undefined } = {}) {
  const { state, handleRequest } = useTable({ TableName: Model });
  const { data, loading, success } = state as any;

  const handleRefresh = React.useCallback(() => {
    handleRequest(requestParams);
    // eslint-disable-next-line
  }, [JSON.stringify(requestParams), handleRequest]);

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const rows = Object.keys(data).map(k => ({ ...data[k] }));

  return {
    data: rows,
    handleRefresh,
    loading,
    success
  };
}

export const useEventsByUserId = ({ userId }) => {
  return useEvents({
    requestParams: {
      FilterExpression: '#userId = :userId',
      ExpressionAttributeNames: {
        '#userId': 'userId'
      },
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }
  });
};
