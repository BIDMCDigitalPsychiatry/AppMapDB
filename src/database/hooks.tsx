import React from 'react';
import { tables } from './dbConfig';
import { exportTableCsv } from './store';
import { useExportDatabase } from './useExportDatabase';

export const useHandleExport = (data, columns) => {
  const exportDatabase = useExportDatabase();
  return React.useCallback(
    (isTableData = false, table = tables.applications) => {
      if (isTableData) {
        console.log('Exporting table data...');
        exportTableCsv(data, columns);
      } else {
        const ids = data.map(d => d._id);
        console.log('Exporting database...');
        exportDatabase({ table, ids });
      }
    },
    [exportDatabase, data, columns]
  );
};
