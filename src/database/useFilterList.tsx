import * as React from 'react';
import { useFilters } from './useFilters';
import { dynamo, tables } from './dbConfig';
import { useSignedIn } from '../hooks';
import { useSelector } from 'react-redux';
import { isEmpty } from '../helpers';

export const useGetFilters = () => {
  const [, setFilters] = useFilters();
  const signedIn = useSignedIn();
  const uid = useSelector((s: any) => s.layout.user?.username);

  // Load data from the database
  const getFilters = React.useCallback(() => {
    const getItems = async () => {
      let scanResults = [];
      let items;
      var params = {
        TableName: tables.filters,
        ExclusiveStartKey: undefined
      };
      do {
        items = await dynamo.scan(params).promise();
        items.Items.forEach(i => scanResults.push(i));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
      } while (typeof items.LastEvaluatedKey != 'undefined');
      setFilters(
        scanResults
          .filter((d: any) => d.uid === uid && d.delete !== true)
          .reduce((f, c: any) => {
            f[c._id] = c;
            return f;
          }, {})
      );
    };

    if (signedIn) {
      getItems();
    }
  }, [uid, signedIn, setFilters]);

  return getFilters;
};

export default function useFilterList() {
  const signedIn = useSignedIn();
  const uid = useSelector((s: any) => s.layout.user?.username);
  const getFilters = useGetFilters();
  React.useEffect(() => {
    signedIn && !isEmpty(uid) && getFilters();
  }, [uid, signedIn, getFilters]);
}
