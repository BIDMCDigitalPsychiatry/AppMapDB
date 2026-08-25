import * as React from 'react';
import { AppState } from '../../../../store';
import Application from '../../../../database/models/Application';
import { isEmpty, getDayTimeFromTimestamp, EMPTY_OBJECT } from '../../../../helpers';
import { useTableFilter } from '../helpers';
import { tables } from '../../../../database/dbConfig';
import { AndroidStoreProps } from '../../DialogField/AndroidStore';
import { AppleStoreProps } from '../../DialogField/AppleStore';
import logo from '../../../../images/default_app_icon.png';
import { useSelector } from 'react-redux';
import { useAdminMode } from '../../../layout/store';
import { getDescription } from '../ApplicationsGrid/ExpandableDescription';
import { fuzzySortFilter, dedupeByGroupId, passesNormalModeFilters } from '../../../pages/useAppTableData';

/*
 * PLAN_MODERNIZATION.md §3: this file previously carried its own copy of the
 * legacy data pipeline — an unmemoized map re-running on every render, an
 * O(groups × rows) dedupe, and substring-based filter matching (the 'Anxiety'
 * vs 'Stress & Anxiety' bug fixed for the main library in July). Both hooks
 * now memoize, dedupe in a single pass, and use the same exact-match filter
 * logic as the main library (useAppTableData).
 */

export const getAppName = app => {
  const androidStore: AndroidStoreProps = app?.androidStore;
  const appleStore: AppleStoreProps = app?.appleStore;
  return !isEmpty(app?.name)
    ? app.name
    : androidStore && !isEmpty(androidStore.title)
    ? androidStore.title
    : appleStore && !isEmpty(appleStore.title)
    ? appleStore.title
    : app?.name;
};

export const getAppCompany = app => {
  const androidStore: AndroidStoreProps = app.androidStore;
  const appleStore: AppleStoreProps = app.appleStore;
  return !isEmpty(app.company)
    ? app.company
    : androidStore && !isEmpty(androidStore.developer)
    ? androidStore.developer
    : appleStore && !isEmpty(appleStore.developer)
    ? appleStore.developer
    : app.company;
};

export const getAppIcon = (app: Application) => {
  const androidStore: AndroidStoreProps = app.androidStore;
  const appleStore: AppleStoreProps = app.appleStore;
  return !isEmpty(app.icon)
    ? app.icon
    : androidStore && !isEmpty(androidStore.icon)
    ? androidStore.icon
    : appleStore && !isEmpty(appleStore.icon)
    ? appleStore.icon
    : logo;
};

// Map a raw application row to the searchable/filterable table row shape.
// includeEmailInSearch: only the pending/My-Ratings tables have ever exposed
// the rater's email to free-text search — keep it that way.
const toRow = (app: Application, includeEmailInSearch = false) => {
  // Raw arrays for structured (exact-match) filtering; the joined strings
  // below exist only for free-text search.
  const tags = {
    platforms: app.platforms ?? [],
    treatmentApproaches: (app as any).treatmentApproaches ?? [],
    features: app.features ?? [],
    functionalities: app.functionalities ?? [],
    engagements: app.engagements ?? [],
    inputs: app.inputs ?? [],
    outputs: app.outputs ?? [],
    conditions: app.conditions ?? [],
    privacies: app.privacies ?? [],
    uses: app.uses ?? [],
    costs: app.costs ?? [],
    clinicalFoundations: app.clinicalFoundations ?? [],
    developerTypes: app.developerTypes ?? []
  };

  const appSearchable = {
    name: getAppName(app),
    app: getAppName(app), // For sorting application column by text
    updated: app.updated ? getDayTimeFromTimestamp(app.updated) : undefined,
    company: getAppCompany(app),
    costs: app.costs?.join(' '),
    platforms: app.platforms?.join(' '), // for searching
    features: app.features?.join(' '), // for searching
    functionalities: app.functionalities?.join(' '),
    engagements: app.engagements?.join(' '),
    inputs: app.inputs?.join(' '),
    outputs: app.outputs?.join(' '),
    conditions: app.conditions?.join(' '),
    privacies: app.privacies?.join(' '),
    uses: app.uses?.join(' '),
    clinicalFoundations: app.clinicalFoundations,
    developerTypes: app.developerTypes
  };

  // Computed once per row (the mapping is memoized); getSearchValues is
  // called for every row on every keystroke, so it must not re-join fields.
  const searchValues =
    Object.keys(appSearchable).reduce((f, c) => (f = [f, appSearchable[c]].join(' ')), '') + (includeEmailInSearch ? ` ${(app as any).email ?? ''}` : '');

  return {
    _id: app._id,
    parent: app.parent,
    email: (app as any).email,
    ...appSearchable,
    tags,
    getSearchValues: () => searchValues,
    getValues: () => app,
    getExportValues: () => ({
      _id: app._id,
      ...appSearchable,
      app: appSearchable.name,
      cost: appSearchable.costs,
      functionality: appSearchable.functionalities,
      developerType: appSearchable.developerTypes,
      description: getDescription(app),
      iosLink: app.iosLink,
      androidLink: app.androidLink,
      webLink: app.webLink
    }),
    created: app.created,
    approved: app.approved,
    draft: (app as any).draft,
    groupId: isEmpty(app.groupId) ? app._id : app.groupId
  };
};

// Newest row per group regardless of status (legacy includeDrafts semantics).
const newestPerGroup = <T extends { groupId: string; created: number }>(rows: T[]): T[] => {
  const newest = new Map<string, T>();
  for (const r of rows) {
    const cur = newest.get(r.groupId);
    if (!cur || r.created > cur.created) newest.set(r.groupId, r);
  }
  return Array.from(newest.values());
};

const useStructuredFilter = table => {
  const filters = useSelector((s: AppState) => s.table[table]?.filters ?? EMPTY_OBJECT) as any;
  return React.useCallback(r => passesNormalModeFilters(r.tags ?? EMPTY_OBJECT, filters), [filters]);
};

export const useAppData = table => {
  const apps = useSelector((s: AppState) => s.database[tables.applications] ?? {});
  const [adminMode] = useAdminMode();

  const filteredData = React.useMemo(() => {
    const data = Object.keys(apps)
      .filter(k => apps[k].draft !== true && apps[k].delete !== true && ((!adminMode && apps[k].approved === true) || adminMode)) // only show approved for public mode, show all for admin
      .map(k => toRow(apps[k]));
    // For public, show only the most recent with a status of approved == true
    // For admin, show only the most recent approved, or if no approvals then show the most recent
    return dedupeByGroupId(data);
  }, [apps, adminMode]);

  const customFilter = useStructuredFilter(table);
  return useTableFilter(filteredData, table, customFilter, fuzzySortFilter);
};

export const useNewerMemberCount = (groupId, created) => {
  const apps = useSelector((state: AppState) => state.database[tables.applications] ?? {});
  return React.useMemo(
    () => Object.keys(apps).filter(k => (apps[k]._id === groupId || apps[k].groupId === groupId) && apps[k].created > created).length,
    [apps, groupId, created]
  );
};

export const usePendingAppData = (table, showDeleted = false, email = undefined, includeDrafts = false, includeApproved = false) => {
  const apps = useSelector((s: AppState) => s.database[tables.applications] ?? {});

  const filteredData = React.useMemo(() => {
    const emailLower = email !== undefined ? String(email).toLowerCase() : undefined;
    const data = Object.keys(apps)
      .filter(
        k =>
          (includeDrafts ? true : apps[k].draft !== true) &&
          (emailLower !== undefined ? (apps[k]?.email ?? '').toLowerCase() === emailLower : true) &&
          (showDeleted ? apps[k].delete === true : apps[k].delete !== true) &&
          (showDeleted || (includeApproved ? true : apps[k].approved !== true)) // show archived items regardless of approved status
      )
      .map(k => toRow(apps[k], true));
    // includeDrafts (My Ratings): the user's newest row of any status.
    // Otherwise: newest approved per group, else newest (legacy semantics).
    return includeDrafts ? newestPerGroup(data) : dedupeByGroupId(data);
  }, [apps, showDeleted, email, includeDrafts, includeApproved]);

  const customFilter = useStructuredFilter(table);
  return useTableFilter(filteredData, table, customFilter, fuzzySortFilter);
};
