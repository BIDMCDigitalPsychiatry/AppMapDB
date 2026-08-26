import * as React from 'react';
import { useSelector } from 'react-redux';
import { dynamo, tables, indexes } from '../../database/dbConfig';
import Application from '../../database/models/Application';
import { useApplications } from '../../database/useApplications';
import { getDayTimeFromTimestamp, isEmpty, EMPTY_OBJECT } from '../../helpers';
import { termMatchesTag } from '../../database/tagHierarchy';
import { AppState } from '../../store';
import { getAppCompany, getAppName } from '../application/GenericTable/Applications/selectors';
import { getPwaFilterMatches, useTableFilter } from '../application/GenericTable/helpers';
import { useAdminMode } from '../layout/store';
import { getDescription } from '../application/GenericTable/ApplicationsGrid/ExpandableDescription';
import fuzzysort from 'fuzzysort';

const table = 'Applications';

/* ---------------------------------------------------------------------------
 * Data loading: query the current-index GSI instead of scanning the table.
 *
 * The old full-table scan pulled every historical review row (~70 MB, ~71
 * sequential 1 MB pages) on every visit, and painted from the first page —
 * which is why users saw years-old superseded versions ("apps from 2020")
 * until the scan finished. The current-index holds ONLY each app's current
 * rows (newest approved / newest deleted / newest pending — flags maintained
 * in useProcessData, backfilled by scripts/db-migration/), so:
 *   - the whole load is ~13 MB across three partitions, and
 *   - progressive painting is safe: historical rows aren't in the index at
 *     all, so a partially loaded view is only ever missing apps, never
 *     showing stale versions of them.
 * History / a rater's own superseded rows load on demand via group-index and
 * email-index (see useGroupHistory / useMyRatingsData below).
 * ------------------------------------------------------------------------- */
const CURRENT_PARTITIONS = ['approved', 'pending', 'deleted'];

const mergeRows = (setApps, items: any[]) =>
  items.length &&
  setApps(prev => ({
    ...prev,
    ...items.reduce((f, c: any) => {
      f[c._id] = c;
      return f;
    }, {})
  }));

const queryIndexPaged = async (params: any, setApps) => {
  let page;
  do {
    page = await dynamo.query(params).promise();
    mergeRows(setApps, page.Items ?? []);
    params.ExclusiveStartKey = page.LastEvaluatedKey;
  } while (page.LastEvaluatedKey);
};

const fetchCurrentRows = async (setApps, setLoading, requestParams = undefined) => {
  setLoading(true);
  try {
    await Promise.all(
      CURRENT_PARTITIONS.map(cur =>
        queryIndexPaged(
          {
            TableName: tables.applications,
            IndexName: indexes.current,
            KeyConditionExpression: '#c = :v',
            ExpressionAttributeNames: { '#c': 'cur' },
            ExpressionAttributeValues: { ':v': cur },
            ScanIndexForward: false, // newest first
            ExclusiveStartKey: undefined,
            ...(requestParams as any)
          },
          setApps
        )
      )
    );
  } catch (err) {
    console.error('Error querying current-index:', err);
  }
  setLoading(false);
};

/* ---------------------------------------------------------------------------
 * Structured filter matching — exact membership, not substring containment.
 *
 * The original isMatch/isMatchAny tested filter terms against a single
 * space-joined string built from each app's tag array (e.g.
 * app.conditions.join(' ')) using String.prototype.includes(), which is a
 * substring test. A filter term that happened to be a substring of an
 * unrelated, longer label could match spuriously (e.g. 'Anxiety' matching
 * an app whose actual label was 'Stress & Anxiety'). Below, tags are kept
 * as real arrays and tested with exact membership.
 * ------------------------------------------------------------------------- */

const toArray = (v: unknown): string[] => (Array.isArray(v) ? v : isEmpty(v) ? [] : [String(v)]);

// A term is satisfied when any of the row's tags equals it or one of its
// child labels (see tagHierarchy.ts).
const termMatchesValues = (term: string, values: unknown): boolean => toArray(values).some(tag => termMatchesTag(term, tag));

// AND semantics: every selected value must be present (exact match). Empty selection => no constraint.
export const matchesAll = (selected: string[], values: unknown): boolean => selected.every(term => termMatchesValues(term, values));

// OR semantics: at least one selected value must be present (exact match). Empty selection => no constraint.
export const matchesAny = (selected: string[], values: unknown): boolean =>
  selected.length === 0 ? true : selected.some(term => termMatchesValues(term, values));

/* ---------------------------------------------------------------------------
 * Per-category join semantics — single source of truth.
 *
 * Normal/admin mode has always used AND-within-category for every category,
 * including Features. (Only PWA quiz mode treats Features as OR.) This table
 * preserves those per-category defaults — changing a join mode is a product
 * decision, not a code decision. Flip an entry to switch its
 * within-category join mode.
 * ------------------------------------------------------------------------- */

export type JoinMode = 'and' | 'or';

export const FILTER_CATEGORY_JOIN_MODE: Record<string, JoinMode> = {
  Platforms: 'and',
  Functionalities: 'and',
  Cost: 'and',
  TreatmentApproaches: 'and',
  Features: 'and', // AND in normal/admin mode (always was); OR only in PWA mode
  Engagements: 'and',
  Inputs: 'and',
  Outputs: 'and',
  Conditions: 'and',
  Privacy: 'and',
  Uses: 'and',
  ClinicalFoundations: 'and',
  DeveloperTypes: 'and'
};

// Maps a filter-category name to the corresponding field name on the per-row `tags` object.
export const CATEGORY_TO_TAG_FIELD: Record<string, string> = {
  Platforms: 'platforms',
  Functionalities: 'functionalities',
  Cost: 'costs',
  TreatmentApproaches: 'treatmentApproaches',
  Features: 'features',
  Engagements: 'engagements',
  Inputs: 'inputs',
  Outputs: 'outputs',
  Conditions: 'conditions',
  Privacy: 'privacies',
  Uses: 'uses',
  ClinicalFoundations: 'clinicalFoundations',
  DeveloperTypes: 'developerTypes'
};

export const matchesCategory = (mode: JoinMode, selected: string[], values: unknown): boolean =>
  mode === 'or' ? matchesAny(selected, values) : matchesAll(selected, values);

// Normal/admin mode: AND across categories; within a category see FILTER_CATEGORY_JOIN_MODE.
// `tags` is the per-row tag-arrays object; `selections` is the raw filters object from Redux state.
export const passesNormalModeFilters = (tags: Record<string, unknown>, selections: Record<string, string[] | undefined>): boolean =>
  Object.keys(FILTER_CATEGORY_JOIN_MODE).every(name =>
    matchesCategory(FILTER_CATEGORY_JOIN_MODE[name], selections[name] ?? [], tags[CATEGORY_TO_TAG_FIELD[name]])
  );

/* ---------------------------------------------------------------------------
 * PWA quiz mode: soft recommendation engine, not a hard filter.
 *
 * Fixed: the original used a hard cliff — exact match required at <=4
 * selected criteria, then ">half" once a 5th was added. Adding one more
 * quiz answer could silently relax the matching rule with no documented
 * reason for the discontinuity at exactly 4. Replaced with one proportional
 * rule: match at least half of whatever was selected.
 *
 * Note: getPwaFilterMatches counts per matched VALUE (one push per value
 * hit, not per category), and filterCount is also a count of individual
 * selected values — both sides of the comparison are on the same scale.
 * ------------------------------------------------------------------------- */
export const passesPwaModeThreshold = (matchCount: number, filterCount: number): boolean => (filterCount === 0 ? true : matchCount >= filterCount / 2);

/* ---------------------------------------------------------------------------
 * Collapse historical review rows down to one "current" record per app:
 * most-recently-created APPROVED version wins; falls back to the
 * most-recently-created row of any status if no approved version exists.
 *
 * Fixed: the original was O(distinct apps × total rows) — every group
 * re-scanned the entire row list — plus a .sort() comparator that called
 * getValues() (an object spread) purely to read `.created`, which was
 * already a top-level field. Below is a single O(n) pass.
 *
 * The fallback branch (no approved row in a group) is effectively dead in
 * public mode because unapproved rows are filtered out upstream; it only
 * fires in admin mode.
 * ------------------------------------------------------------------------- */
export const dedupeByGroupId = <T extends { groupId: string; created: number; approved?: boolean }>(rows: T[]): T[] => {
  const newestOverall = new Map<string, T>();
  const newestApproved = new Map<string, T>();
  for (const row of rows) {
    const gId = row.groupId;
    const curOverall = newestOverall.get(gId);
    if (!curOverall || row.created > curOverall.created) newestOverall.set(gId, row);
    if (row.approved === true) {
      const curApproved = newestApproved.get(gId);
      if (!curApproved || row.created > curApproved.created) newestApproved.set(gId, row);
    }
  }
  return Array.from(newestOverall.keys()).map(gId => newestApproved.get(gId) ?? (newestOverall.get(gId) as T));
};

export const fuzzySortFilter = (data: any[], filtered: any[], searchtext: string, customFilter?: (row: any) => boolean) => {
  if (filtered?.length < 10) {
    // Only perform fuzzy filtering if there are < 10 exact match results
    const fuzzyResults = fuzzysort.go(searchtext, data, { key: 'name', limit: 20 }) as any;
    let combined = [...filtered];
    fuzzyResults?.forEach((fr: any) => {
      if (!combined.find(r => r._id === fr?.obj?._id)) {
        // If no custom filter or custom filters (platform tags) match, then add fuzzy results
        // This prevents non matching platform tags from showing in the results
        if (!customFilter || customFilter(fr.obj)) {
          combined = combined.concat(fr.obj);
        }
      }
    });
    return combined;
  } else {
    return filtered;
  }
};

export const useAreFiltersActive = ({ table = 'Applications' } = {}) => {
  return useSelector((s: AppState) => {
    const t = s.table[table] || { filters: {} };
    const filters = t?.filters || {};
    var filterCount = 0;
    if (filters && typeof filters === 'object') {
      Object.keys(filters).forEach(k => {
        filterCount = filterCount + (filters[k]?.length || 0);
      });
    }
    return filterCount > 0;
  }) as any;
};

export default function useAppTableData({ trigger = true, triggerWhenEmpty = false, mode = 'normal' } = {}) {
  const [apps, setApps] = useApplications();
  const [loading, setLoading] = React.useState(false);
  const count = Object.keys(apps).length;

  // The index queries can outlive the component (e.g. switching admin tabs
  // mid-load) — guard the local loading state so React doesn't warn about
  // updates on an unmounted component. (setApps is a redux dispatch: safe.)
  const mounted = React.useRef(true);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const safeSetLoading = React.useCallback(v => mounted.current && setLoading(v), []);

  const filters = useSelector((s: AppState) => s.table[table]?.filters ?? EMPTY_OBJECT) as any;

  const handleGetRow = React.useCallback(
    id => {
      const getRow = async id => {
        var params = {
          TableName: tables.applications,
          Key: { _id: id }
        };
        try {
          setLoading(true);
          var row = await dynamo.get(params).promise();
        } catch (err) {
          console.error('Error querying row id: ' + id);
          setLoading(false);
          return;
        }
        if (row?.Item && row?.Item._id) {
          setApps(prev => ({
            ...prev,
            [row.Item?._id]: row.Item
          }));
        }
        setLoading(false);
      };
      getRow(id);
    },
    [setApps]
  );

  const handleRefresh = React.useCallback(
    ({ requestParams = undefined } = {}) => {
      fetchCurrentRows(setApps, safeSetLoading, requestParams);
    },
    [setApps, safeSetLoading]
  );

  // Load data from the database
  React.useEffect(() => {
    trigger && handleRefresh();
  }, [trigger, handleRefresh]);

  React.useEffect(() => {
    if (triggerWhenEmpty && !trigger) {
      if (count === 0) {
        console.log('Pre-loading database cache...');
        handleRefresh();
      }
    }
  }, [trigger, count, triggerWhenEmpty, handleRefresh]);

  const [adminMode] = useAdminMode();

  /* -------------------------------------------------------------------------
   * Map raw rows -> searchable/filterable view rows. Memoized: previously
   * this entire pipeline re-ran on every render of the hook, including
   * renders triggered by toggling a single filter checkbox or typing a
   * character into the search box. Given `apps` holds every historical
   * review row (not just current ones), this was the largest contributor to
   * the "table view slowness" flagged in the team's own backlog (#116).
   * ---------------------------------------------------------------------- */
  const data = React.useMemo(() => {
    if (!apps) return [];
    return Object.keys(apps)
      .filter(k => apps[k].draft !== true && apps[k].delete !== true && ((!adminMode && apps[k].approved === true) || adminMode)) // only show approved for public mode, show all for admin
      .map(k => {
        const app: Application = apps[k];
        const filterMatches = getPwaFilterMatches({ filters, app });

        // Raw arrays for structured (exact-match) filtering — kept separate
        // from the flattened strings below, which exist only for free-text search.
        const tags = {
          platforms: app.platforms ?? [],
          treatmentApproaches: app.treatmentApproaches ?? [],
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
          costs: toArray(tags.costs).join(' '),
          platforms: toArray(tags.platforms).join(' '),
          treatmentApproaches: toArray(tags.treatmentApproaches).join(' '),
          features: toArray(tags.features).join(' '),
          functionalities: toArray(tags.functionalities).join(' '),
          engagements: toArray(tags.engagements).join(' '),
          inputs: toArray(tags.inputs).join(' '),
          outputs: toArray(tags.outputs).join(' '),
          conditions: toArray(tags.conditions).join(' '),
          privacies: toArray(tags.privacies).join(' '),
          uses: toArray(tags.uses).join(' '),
          clinicalFoundations: toArray(tags.clinicalFoundations).join(' '),
          developerTypes: toArray(tags.developerTypes).join(' ')
        };

        // Computed once per row (this mapping is memoized); getSearchValues is
        // called for every row on every search, so it must not re-join fields.
        const searchValues = Object.keys(appSearchable).reduce((f, c) => (f = [f, appSearchable[c]].join(' ')), '');

        return {
          _id: app._id,
          parent: app.parent,
          filterMatches: mode === 'pwa' ? filterMatches : undefined,
          ...appSearchable,
          tags,
          getSearchValues: () => searchValues,
          getValues: () => (mode === 'pwa' ? { ...app, filterMatches } : app),
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
          groupId: isEmpty(app.groupId) ? app._id : app.groupId
        };
      });
  }, [apps, adminMode, mode, filters]);

  // For public, show only the most recent with a status of approved == true
  // For admin, show only the most recent approved, or if no approvals then show the most recent
  const filteredData = React.useMemo(() => dedupeByGroupId(data), [data]);

  const filterCount = React.useMemo(() => {
    if (mode !== 'pwa') return 0;
    return Object.keys(filters).reduce((sum, k) => sum + (filters[k]?.length || 0), 0);
  }, [filters, mode]);

  const customFilter = React.useCallback(
    (r: any) => {
      if (mode === 'pwa') {
        // The old per-category OR chain that followed the threshold here was a
        // no-op in practice: any category with nothing selected matched every
        // row, making the whole OR true whenever at least one category was
        // unselected. The threshold below is the real PWA matching rule.
        return passesPwaModeThreshold(r.filterMatches?.length ?? 0, filterCount);
      }
      return passesNormalModeFilters(r.tags ?? {}, filters);
    },
    [mode, filterCount, filters]
  );

  var filtered = useTableFilter(filteredData, table, customFilter, fuzzySortFilter, mode);

  if (mode === 'pwa' && filterCount > 0) {
    // Show the 5 BEST matches, not the first 5 that cleared the threshold.
    filtered = [...filtered].sort((a: any, b: any) => (b.filterMatches?.length ?? 0) - (a.filterMatches?.length ?? 0));
    if (filtered.length > 5) filtered = filtered.slice(0, 5);
  }

  return { filtered, loading, apps, setApps, handleRefresh, handleGetRow };
}

export function useAppTableDataInit({ trigger = true } = {}) {
  const [, setApps] = useApplications();

  const handleRefresh = React.useCallback(
    ({ requestParams = undefined } = {}) => {
      fetchCurrentRows(setApps, () => undefined, requestParams); // no local loading state to track here
    },
    [setApps]
  );

  // Load data from the database
  React.useEffect(() => {
    trigger && handleRefresh();
  }, [trigger, handleRefresh]);

  return { handleRefresh };
}

/* ---------------------------------------------------------------------------
 * On-demand loaders for rows that are NOT in the current-index.
 * ------------------------------------------------------------------------- */

// Loads an app's complete rating history (every row, every status) into the
// store via the group-index. Used by the History dialogs and ViewApp's review
// pager — the selectors that filter the store by groupId then see everything,
// exactly as they did when the full table was scanned.
export function useGroupHistoryByGroupId(groupId) {
  const [, setApps] = useApplications();
  React.useEffect(() => {
    if (isEmpty(groupId)) return;
    queryIndexPaged(
      {
        TableName: tables.applications,
        IndexName: indexes.group,
        KeyConditionExpression: 'groupId = :g',
        ExpressionAttributeValues: { ':g': groupId },
        ExclusiveStartKey: undefined
      },
      setApps
    ).catch(err => console.error('Error querying group-index:', err));
  }, [groupId, setApps]);
}

export function useGroupHistory(id) {
  const [apps] = useApplications();
  const node = (id && apps[id]) || {};
  useGroupHistoryByGroupId(isEmpty(node.groupId) ? node._id : node.groupId);
}

// Loads every row the signed-in rater has ever submitted (drafts, pending,
// approved, superseded) into the store via the email-index, so MyRatings
// keeps showing their contributions even when a newer rating by someone else
// is the app's current record.
export function useMyRatingsData(email) {
  const [, setApps] = useApplications();
  const normalized = typeof email === 'string' ? email.toLowerCase() : undefined;

  React.useEffect(() => {
    if (isEmpty(normalized)) return;
    queryIndexPaged(
      {
        TableName: tables.applications,
        IndexName: indexes.email,
        KeyConditionExpression: 'email = :e',
        ExpressionAttributeValues: { ':e': normalized },
        ExclusiveStartKey: undefined
      },
      setApps
    ).catch(err => console.error('Error querying email-index:', err));
  }, [normalized, setApps]);
}
