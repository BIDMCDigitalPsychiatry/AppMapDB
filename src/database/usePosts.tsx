import React from 'react';
import { dynamo, tables } from './dbConfig';
import { useTableState } from './useTableState';

export const usePosts = () => {
  const [posts = [], setPosts] = useTableState(tables.posts);

  const handleRefresh = React.useCallback(() => {
    const getItems = async () => {
      let scanResults = [];
      let items;
      var params = {
        TableName: tables.posts,
        ExclusiveStartKey: undefined
      };
      do {
        items = await dynamo.scan(params).promise();
        items.Items.forEach(i => scanResults.push(i));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
      } while (typeof items.LastEvaluatedKey != 'undefined');
      setPosts(
        scanResults.reduce((f, c: any) => {
          f[c._id] = c;
          return f;
        }, {})
      );
    };
    getItems();
  }, [setPosts]);

  return { posts, setPosts, handleRefresh };
};
