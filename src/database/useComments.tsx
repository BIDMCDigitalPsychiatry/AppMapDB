import * as React from 'react';
import { tables } from './dbConfig';
import useTable from './useTable';

const Model = tables.comments;

export default function useComments({ requestParams = undefined } = {}) {
  const { state, handleRequest } = useTable({ TableName: Model, idKey: '_id' });
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

export const useCommentsByPostId = ({ postId }) => {
  return useComments({
    requestParams: {
      FilterExpression: '#postId = :postId',
      ExpressionAttributeNames: {
        '#postId': 'postId'
      },
      ExpressionAttributeValues: {
        ':postId': postId
      }
    }
  });
};
