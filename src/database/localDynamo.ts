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
import { computeCurrentFlags } from './currentFlags';

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

// Minimal FilterExpression support: clauses like `#field = :value` joined by
// AND (the only shapes this codebase uses). Unsupported expressions return
// rows unfiltered rather than throwing.
const applyFilter = (rows: any[], params: any): any[] => {
  const fe = params?.FilterExpression;
  if (!fe) return rows;
  const names = params.ExpressionAttributeNames ?? {};
  const values = params.ExpressionAttributeValues ?? {};
  const clauses = String(fe)
    .split(/\s+AND\s+/i)
    .map(c => c.match(/^\s*(#?[\w.]+)\s*(=|<>|>=|<=|>|<)\s*(:[\w.]+)\s*$/))
    .filter(Boolean) as RegExpMatchArray[];
  if (clauses.length === 0) {
    console.warn('[local-data] Unsupported FilterExpression ignored:', fe);
    return rows;
  }
  return rows.filter(r =>
    clauses.every(([, name, op, valKey]) => {
      const field = name.startsWith('#') ? names[name] : name;
      const v = values[valKey];
      const a = r?.[field];
      switch (op) {
        case '=':
          return a === v;
        case '<>':
          return a !== v;
        case '>':
          return a > v;
        case '<':
          return a < v;
        case '>=':
          return a >= v;
        default:
          return a <= v;
      }
    })
  );
};

// Minimal Query support for the three applications GSIs (see dbConfig.ts).
// Local snapshots predate the migration scripts, so index semantics are
// EMULATED from the raw rows rather than read from attributes that may not
// exist yet in the seed data:
//   current-index -> cur flags computed on the fly (same rules as production)
//   group-index   -> groupId match, with the legacy `_id` fallback
//   email-index   -> case-insensitive email match (post-migration behavior)
const applyQuery = (rows: any[], params: any): any[] => {
  // These queries only ever use a single partition-key equality condition, so
  // the partition value is the lone entry in ExpressionAttributeValues.
  const value = Object.values(params?.ExpressionAttributeValues ?? {})[0];
  const index = params?.IndexName;
  let matched: any[];
  if (index === 'current-index') {
    const flags = computeCurrentFlags(rows);
    matched = rows.filter(r => flags.get(r._id) === value);
  } else if (index === 'group-index') {
    matched = rows.filter(r => (r.groupId && r.groupId !== '' ? r.groupId : r._id) === value);
  } else if (index === 'email-index') {
    matched = rows.filter(r => typeof r.email === 'string' && r.email.toLowerCase() === String(value ?? '').toLowerCase());
  } else {
    console.warn('[local-data] Unsupported query index:', index);
    matched = [];
  }
  const asc = params?.ScanIndexForward !== false;
  return [...matched].sort((a, b) => (asc ? Number(a.created) - Number(b.created) : Number(b.created) - Number(a.created)));
};

// The real DocumentClient supports BOTH `client.op(params).promise()` and
// `client.op(params, callback)` — this codebase uses both styles.
const result = <T>(value: Promise<T>, callback?: any): DynamoResult<T> => {
  if (typeof callback === 'function') {
    value.then(v => callback(null, v)).catch(e => callback(e));
  }
  return { promise: () => value };
};

export const createLocalDynamo = () => {
  console.info('[local-data] Using local table snapshots instead of DynamoDB. Writes live in memory for this session only.');
  return {
    scan: (params: any, callback?: any): DynamoResult<{ Items: any[]; LastEvaluatedKey?: undefined }> =>
      result(
        currentRows(params?.TableName).then(rows => ({ Items: applyFilter(rows, params) })),
        callback
      ),
    get: (params: any, callback?: any): DynamoResult<{ Item?: any }> =>
      result(
        currentRows(params?.TableName).then(rows => ({ Item: rows.find(r => r._id === params?.Key?._id) })),
        callback
      ),
    put: (params: any, callback?: any): DynamoResult<{}> => {
      const table = params?.TableName;
      const item = params?.Item;
      if (table && item?._id) {
        wmap(table).set(item._id, item);
        tset(table).delete(item._id);
        console.info('[local-data] In-memory write to', table, item._id);
      }
      return result(Promise.resolve({}), callback);
    },
    query: (params: any, callback?: any): DynamoResult<{ Items: any[]; LastEvaluatedKey?: undefined }> =>
      result(
        currentRows(params?.TableName).then(rows => ({ Items: applyQuery(rows, params) })),
        callback
      ),
    update: (params: any, callback?: any): DynamoResult<{}> => {
      // Supports the single-attribute shapes this codebase writes
      // (`SET <attr> = :val` / `REMOVE <attr>`), enough for cur-flag and
      // groupId maintenance to behave like production during local dev.
      const table = params?.TableName;
      const id = params?.Key?._id;
      const expr = String(params?.UpdateExpression ?? '');
      const names = params?.ExpressionAttributeNames ?? {};
      const resolve = (n: string) => (n.startsWith('#') ? names[n] : n);
      const m = expr.match(/^\s*(SET|REMOVE)\s+(#?\w+)(?:\s*=\s*(:\w+))?\s*$/i);
      if (table && id && m) {
        const promise = currentRows(table).then(rows => {
          const row = rows.find(r => r._id === id);
          if (row) {
            const updated = { ...row };
            const field = resolve(m[2]);
            if (m[1].toUpperCase() === 'SET') updated[field] = params?.ExpressionAttributeValues?.[m[3]];
            else delete updated[field];
            wmap(table).set(id, updated);
            console.info('[local-data] In-memory update on', table, id, expr);
          }
          return {};
        });
        return result(promise, callback);
      }
      console.info('[local-data] Ignoring unsupported update expression on', table, expr);
      return result(Promise.resolve({}), callback);
    },
    delete: (params: any, callback?: any): DynamoResult<{}> => {
      const table = params?.TableName;
      const id = params?.Key?._id;
      if (table && id) {
        wmap(table).delete(id);
        tset(table).add(id);
        console.info('[local-data] In-memory delete on', table, id);
      }
      return result(Promise.resolve({}), callback);
    }
  };
};
