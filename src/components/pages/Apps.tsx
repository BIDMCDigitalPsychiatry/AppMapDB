import * as React from 'react';
import * as Tables from '../application/GenericTable';
import { useViewMode } from '../layout/LayoutStore';
import { useDatabaseState } from '../../database/actions';
import { db } from '../../database/dbConfig';

export default function Apps() {
  const [viewMode] = useViewMode() as any;
  const [, setDatabase] = useDatabaseState();

  // Load data from the database
  React.useEffect(() => {
    db.list({ include_docs: true }).then(body => {
      const documents = body.rows.map(r => r.doc);
      var result = documents.reduce((f, c: any) => {
        f[c._id] = c;
        return f;
      }, {});
      setDatabase(result);
    });
  }, [setDatabase]);

  return viewMode === 'table' ? <Tables.Applications /> : <Tables.ApplicationsList />;
}
