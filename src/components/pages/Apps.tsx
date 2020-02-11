import * as React from 'react';
import * as Tables from '../application/GenericTable';
import { useViewMode } from '../layout/store';
import DB from '../../database/dbConfig';
import { useApplications } from '../../database/useApplications';
import { useRatings, useAutoBuildIndex } from '../../database/useRatings';

export default function Apps() {
  const [viewMode] = useViewMode() as any;
  const [, setApps] = useApplications();
  const [, setRatings] = useRatings();

  useAutoBuildIndex(); // Rebuild index as needed

  // Load data from the database
  React.useEffect(() => {
    DB.applications.list({ include_docs: true }).then(body => {
      const documents = body.rows.map(r => r.doc);
      var result = documents.reduce((f, c: any) => {
        f[c._id] = c;
        return f;
      }, {});
      setApps(result);
    });
    DB.ratings.list({ include_docs: true }).then(body => {
      const documents = body.rows.map(r => r.doc);
      var result = documents.reduce((f, c: any) => {
        f[c._id] = c;
        return f;
      }, {});
      setRatings(result);
    });
  }, [setRatings, setApps]);

  return viewMode === 'table' ? <Tables.Applications /> : <Tables.ApplicationsList />;
}
