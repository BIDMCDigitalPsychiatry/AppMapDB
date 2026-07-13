/*
 * Local-data mode: a minimal stand-in for the DynamoDB DocumentClient, backed
 * by a snapshot of the `applications` table served from public/local-data/.
 *
 * Enabled only when REACT_APP_USE_LOCAL_DATA === 'true' (see dbConfig.ts).
 * Generate/refresh the snapshot with: node scripts/dumpApplications.js
 *
 * Scope: read-only review of the public app. `scan`/`get` serve the
 * applications snapshot; every other table returns empty; writes are
 * accepted and discarded (logged to the console). Scan parameters such as
 * FilterExpression are ignored.
 */

type DynamoResult<T> = { promise: () => Promise<T> };

let applicationsPromise: Promise<any[]> | undefined;

const loadApplications = (): Promise<any[]> => {
  if (!applicationsPromise) {
    applicationsPromise = fetch(`${process.env.PUBLIC_URL || ''}/local-data/applications.json`).then(res => {
      if (!res.ok) {
        throw new Error(
          `Local-data mode: failed to load /local-data/applications.json (${res.status}). ` +
            'Run `node scripts/dumpApplications.js` to generate it.'
        );
      }
      return res.json();
    });
  }
  return applicationsPromise;
};

const result = <T>(value: Promise<T>): DynamoResult<T> => ({ promise: () => value });

export const createLocalDynamo = () => {
  console.info('[local-data] Using local applications snapshot instead of DynamoDB. Writes are discarded.');
  return {
    scan: (params: any): DynamoResult<{ Items: any[]; LastEvaluatedKey?: undefined }> =>
      result(
        params?.TableName === 'applications'
          ? loadApplications().then(rows => ({ Items: rows }))
          : Promise.resolve({ Items: [] })
      ),
    get: (params: any): DynamoResult<{ Item?: any }> =>
      result(
        params?.TableName === 'applications'
          ? loadApplications().then(rows => ({ Item: rows.find(r => r._id === params?.Key?._id) }))
          : Promise.resolve({})
      ),
    put: (params: any): DynamoResult<{}> => {
      console.info('[local-data] Discarding write to', params?.TableName, params?.Item?._id ?? '');
      return result(Promise.resolve({}));
    },
    update: (params: any): DynamoResult<{}> => {
      console.info('[local-data] Discarding update to', params?.TableName);
      return result(Promise.resolve({}));
    },
    delete: (params: any): DynamoResult<{}> => {
      console.info('[local-data] Discarding delete on', params?.TableName);
      return result(Promise.resolve({}));
    }
  };
};
