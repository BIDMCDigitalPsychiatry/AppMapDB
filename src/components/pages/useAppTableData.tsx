import * as React from 'react';
import { useSelector } from 'react-redux';
import { dynamo, tables } from '../../database/dbConfig';
import Application from '../../database/models/Application';
import { useApplications } from '../../database/useApplications';
import { getDayTimeFromTimestamp, isEmpty } from '../../helpers';
import { AppState } from '../../store';
import { getAppCompany, getAppName } from '../application/GenericTable/Applications/selectors';
import { getPwaFilterMatches, useTableFilter } from '../application/GenericTable/helpers';
import { useAdminMode } from '../layout/store';
import { getDescription } from '../application/GenericTable/ApplicationsGrid/ExpandableDescription';
import fuzzysort from 'fuzzysort';

const table = 'Applications';

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

// AND semantics: every selected value must be present (exact match). Empty selection => no constraint.
export const matchesAll = (selected: string[], values: unknown): boolean => selected.every(term => toArray(values).includes(term));

// OR semantics: at least one selected value must be present (exact match). Empty selection => no constraint.
export const matchesAny = (selected: string[], values: unknown): boolean => (selected.length === 0 ? true : selected.some(term => toArray(values).includes(term)));

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
  (mode === 'or' ? matchesAny(selected, values) : matchesAll(selected, values));

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
export const passesPwaModeThreshold = (matchCount: number, filterCount: number): boolean =>
  (filterCount === 0 ? true : matchCount >= filterCount / 2);

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

export const fuzzySortFilter = (data, filtered, searchtext, customFilter) => {
  if (filtered?.length < 10) {
    // Only perform fuzzy filtering if there are < 10 exact match results
    const fuzzyResults = fuzzysort.go(searchtext, data, { key: 'name', limit: 20 }) as any;
    var combined = [...filtered];
    fuzzyResults?.forEach(fr => {
      if (!combined.find(r => r._id === fr?.obj?._id)) {
        // If no custom filter or custom filters (platform tags) match, then add fuzzy results
        // This prevents non matching platform tags from showing in the results
        if (!customFilter || customFilter(fr.obj, searchtext)) {
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

  const { filters = {} } = useSelector((s: AppState) => s.table[table] || {}) as any;

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
      const getItems = async () => {
        let scanResults = [];
        let items;
        var params = {
          TableName: tables.applications,
          ExclusiveStartKey: undefined,
          ...requestParams
        };
        var firstPass = true;
        setLoading(true);
        do {
          items = await dynamo.scan(params).promise();
          items.Items.forEach(i => scanResults.push(i));
          params.ExclusiveStartKey = items.LastEvaluatedKey;
          if (firstPass) {
            firstPass = false; // Show the first results so the user doesn't see an empty screen
            setApps(prev => ({
              ...prev,
              ...scanResults.reduce((f, c: any) => {
                f[c._id] = c;
                return f;
              }, {})
            }));
          }
        } while (typeof items.LastEvaluatedKey != 'undefined');
        setApps(prev => ({
          ...prev,
          ...scanResults.reduce((f, c: any) => {
            f[c._id] = c;
            return f;
          }, {})
        }));
        setLoading(false);
      };
      getItems();
    },
    [setApps]
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
  var data = apps
    ? Object.keys(apps)
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

          return {
            _id: app._id,
            parent: app.parent,
            filterMatches: mode === 'pwa' ? filterMatches : undefined,
            ...appSearchable,
            tags,
            getSearchValues: () => {
              return Object.keys(appSearchable).reduce((f, c) => (f = [f, appSearchable[c]].join(' ')), ''); // Optimize search performance
            },
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
        })
    : [];

  // For public, show only the most recent with a status of approved == true
  // For admin, show only the most recent approved, or if no approvals then show the most recent
  var filteredData = dedupeByGroupId(data);

  var filterCount = 0;
  if (mode === 'pwa') {
    Object.keys(filters).forEach(k => {
      filterCount = filterCount + filters[k]?.length;
    });
  }

  const customFilter = r => {
    if (mode === 'pwa') {
      // The old per-category OR chain that followed the threshold here was a
      // no-op in practice: any category with nothing selected matched every
      // row, making the whole OR true whenever at least one category was
      // unselected. The threshold below is the real PWA matching rule.
      return passesPwaModeThreshold(r.filterMatches?.length ?? 0, filterCount);
    } else {
      return passesNormalModeFilters(r.tags ?? {}, filters);
    }
  };

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
  const [, setLoading] = React.useState(false);

  const handleRefresh = React.useCallback(
    ({ requestParams = undefined } = {}) => {
      const getItems = async () => {
        let scanResults = [];
        let items;
        var params = {
          TableName: tables.applications,
          ExclusiveStartKey: undefined,
          ...requestParams
        };
        var firstPass = true;
        setLoading(true);
        do {
          items = await dynamo.scan(params).promise();
          items.Items.forEach(i => scanResults.push(i));
          params.ExclusiveStartKey = items.LastEvaluatedKey;
          if (firstPass) {
            firstPass = false; // Show the first results so the user doesn't see an empty screen
            setApps(prev => ({
              ...prev,
              ...scanResults.reduce((f, c: any) => {
                f[c._id] = c;
                return f;
              }, {})
            }));
          }
        } while (typeof items.LastEvaluatedKey != 'undefined');
        setApps(prev => ({
          ...prev,
          ...scanResults.reduce((f, c: any) => {
            f[c._id] = c;
            return f;
          }, {})
        }));
        setLoading(false);
      };
      getItems();
    },
    [setApps]
  );

  // Load data from the database
  React.useEffect(() => {
    trigger && handleRefresh();
  }, [trigger, handleRefresh]);

  return { handleRefresh };
}
