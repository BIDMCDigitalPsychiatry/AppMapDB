import * as React from 'react';
import { useTableFilter } from '../components/application/GenericTable/helpers';
import { tables } from './dbConfig';
import useTable from './useTable';

export const useTableData = ({ TableName = tables.events, loadOnMount = true, table = undefined, tab = undefined, requestParams = undefined }) => {
  const { state, handleRequest } = useTable({ TableName });
  const { data, loading, success } = state as any;

  const handleRefresh = React.useCallback(() => {
    handleRequest(requestParams);
    // eslint-disable-next-line
  }, [JSON.stringify(requestParams), handleRequest]);

  React.useEffect(() => {
    loadOnMount && handleRefresh();
  }, [handleRefresh, loadOnMount, table, tab]);

  const rows = Object.keys(data).map(k => ({ ...data[k] }));

  return {
    data: useTableFilter(rows, table),
    handleRefresh,
    loading,
    success
  };
};
