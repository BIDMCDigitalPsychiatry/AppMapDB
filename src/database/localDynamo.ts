/*
 * Local-data mode: a minimal stand-in for the DynamoDB DocumentClient, backed
 * by table snapshots served from public/local-data/.
 *
 * Enabled only when REACT_APP_USE_LOCAL_DATA === 'true' (see dbConfig.ts).
 *   - applications:      node scripts/dumpApplications.js  (live snapshot)
 *   - posts, comments:   node scripts/seedLocalCommunity.js (sample data)
 * Any table without a seed file reads as empty.
 *
 * Writes are held in memory for the session (created posts/comments appear
 * in lists immediately) and are NOT persisted anywhere.
 */

type DynamoResult<T> = { promise: () => Promise<T> };

const seedCache: Record<string, Promise<any[]>> = {};
const written: Record<string, Map<string, any>> = {};
const tombstones: Record<string, Set<string>> = {};

const wmap = (table: string) => (written[table] = written[table] ?? new Map());
const tset = (table: string) => (tombstones[table] = tombstones[table] ?? new Set());

const loadSeed = (table: string): Promise<any[]> => {
  if (!seedCache[table]) {
    seedCache[table] = fetch(`${process.env.PUBLIC_URL || ''}/local-data/${table}.json`)
      .then(res => {
        if (!res.ok) {
          if (table === 'applications') {
            throw new Error(
              `Local-data mode: failed to load /local-data/applications.json (${res.status}). ` +
                'Run `node scripts/dumpApplications.js` to generate it.'
            );
          }
          return [];
        }
        return res.json();
      })
      .catch(err => {
        if (table === 'applications') throw err;
        return [];
      });
  }
  return seedCache[table];
};

const currentRows = (table: string) =>
  loadSeed(table).then(rows => [
    ...rows.filter(r => !wmap(table).has(r._id) && !tset(table).has(r._id)),
    ...Array.from(wmap(table).values())
  ]);

const result = <T>(value: Promise<T>): DynamoResult<T> => ({ promise: () => value });

export const createLocalDynamo = () => {
  console.info('[local-data] Using local table snapshots instead of DynamoDB. Writes live in memory for this session only.');
  return {
    scan: (params: any): DynamoResult<{ Items: any[]; LastEvaluatedKey?: undefined }> =>
      result(currentRows(params?.TableName).then(rows => ({ Items: rows }))),
    get: (params: any): DynamoResult<{ Item?: any }> =>
      result(currentRows(params?.TableName).then(rows => ({ Item: rows.find(r => r._id === params?.Key?._id) }))),
    put: (params: any): DynamoResult<{}> => {
      const table = params?.TableName;
      const item = params?.Item;
      if (table && item?._id) {
        wmap(table).set(item._id, item);
        tset(table).delete(item._id);
        console.info('[local-data] In-memory write to', table, item._id);
      }
      return result(Promise.resolve({}));
    },
    update: (params: any): DynamoResult<{}> => {
      console.info('[local-data] Ignoring update expression on', params?.TableName, '(unsupported in local mode)');
      return result(Promise.resolve({}));
    },
    delete: (params: any): DynamoResult<{}> => {
      const table = params?.TableName;
      const id = params?.Key?._id;
      if (table && id) {
        wmap(table).delete(id);
        tset(table).add(id);
        console.info('[local-data] In-memory delete on', table, id);
      }
      return result(Promise.resolve({}));
    }
  };
};
