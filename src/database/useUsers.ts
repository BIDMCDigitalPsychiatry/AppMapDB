/*
 * Roster access (PLAN_MODERNIZATION.md §2): the `users` table is the source
 * of truth for admin / tester / notify roles, with the legacy package.json
 * lists as fallback until the table has earned trust and the lists are
 * retired. These hooks only provide UI hints — real enforcement happens
 * server-side in the write API.
 */
import * as React from 'react';
import { useSelector } from 'react-redux';
import { dynamo, tables } from './dbConfig';
import { useUpdateDatabase } from './useUpdateDatabase';
import { AppState } from '../store';

export interface RosterUser {
  email: string;
  roles: string[];
  active?: boolean;
  created?: number;
  updated?: number;
  updatedBy?: string;
}

// One roster load per session, shared by every component that asks.
let rosterRequested = false;

export const useLoadRoster = (enabled: boolean) => {
  const updateDatabase = useUpdateDatabase();
  React.useEffect(() => {
    if (!enabled || rosterRequested) return;
    rosterRequested = true;
    const load = async () => {
      try {
        const rows: RosterUser[] = [];
        const params: any = { TableName: tables.users, ExclusiveStartKey: undefined };
        let page;
        do {
          page = await dynamo.scan(params).promise();
          rows.push(...(page.Items ?? []));
          params.ExclusiveStartKey = page.LastEvaluatedKey;
        } while (page.LastEvaluatedKey);
        rows.forEach(u => updateDatabase({ table: tables.users, id: (u.email ?? '').toLowerCase(), payload: u }));
      } catch (err) {
        rosterRequested = false; // allow a retry on the next mount
        console.warn('Roster load failed — falling back to package.json lists:', err);
      }
    };
    load();
  }, [enabled, updateDatabase]);
};

const EMPTY = {};

export const useRoster = (): Record<string, RosterUser> => useSelector((s: AppState) => (s as any).database?.[tables.users] ?? EMPTY);

// Role check with fallback semantics matching the write API's:
//  - roster entry exists  -> it decides (deactivated users lose access even
//    if still listed in package.json)
//  - no entry (or roster not loaded) -> caller applies the legacy list
export const useRosterRole = (email: string | undefined, role: 'admin' | 'tester' | 'notify'): boolean | undefined => {
  const entry = useRoster()[(email ?? '').trim().toLowerCase()];
  if (!entry) return undefined;
  return entry.active !== false && Array.isArray(entry.roles) && entry.roles.includes(role);
};
