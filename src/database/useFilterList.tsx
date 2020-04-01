import * as React from 'react';
import { useFilters } from './useFilters';
import DB from './dbConfig';
import { useSignedIn } from '../hooks';
import { useSelector } from 'react-redux';

export const useGetFilters = () => {
  const [, setFilters] = useFilters();
  const signedIn = useSignedIn();
  const uid = useSelector((s: any) => s.firebase.auth.uid);

  // Load data from the database
  const getFilters = React.useCallback(() => {
    if (signedIn) {
      DB.filters.list({ include_docs: true }).then(body => {
        const documents = body.rows.map(r => r.doc);
        var result = documents
          .filter((d: any) => d.uid === uid && d.delete !== true)
          .reduce((f, c: any) => {
            f[c._id] = c;
            return f;
          }, {});
        setFilters(result);
      });
    }
  }, [uid, signedIn, setFilters]);

  return getFilters;
};

export default function useFilterList() {
  const signedIn = useSignedIn();
  const uid = useSelector((s: any) => s.firebase.auth.uid);
  const getFilters = useGetFilters();
  React.useEffect(() => {
    getFilters();
  }, [uid, signedIn, getFilters]);
}
