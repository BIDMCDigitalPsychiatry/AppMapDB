import * as React from 'react';
import { useSelector } from 'react-redux';
import { dynamo, tables } from '../../database/dbConfig';
import Application from '../../database/models/Application';
import { useApplications } from '../../database/useApplications';
import { getDayTimeFromTimestamp, isEmpty, onlyUnique } from '../../helpers';
import { AppState } from '../../store';
import { getAppCompany, getAppName } from '../application/GenericTable/Applications/selectors';
import { getPwaFilterMatches, useTableFilter } from '../application/GenericTable/helpers';
import { useAdminMode } from '../layout/store';
import { getDescription } from '../application/GenericTable/ApplicationsGrid/ExpandableDescription';
import fuzzysort from 'fuzzysort';

const table = 'Applications';
const isMatch = (filters, value) => filters.reduce((t, c) => (t = t && value?.includes(c)), true);
const isMatchAny = (filters, value) => (filters?.length > 0 ? filters.reduce((t, c) => (t = t || value?.includes(c)), false) : true);

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
    const filters = t?.filters;
    var filterCount = 0;
    Object.keys(filters).forEach(k => {
      filterCount = filterCount + filters[k]?.length;
    });
    return filterCount > 0;
  }) as any;
};

export default function useAppTableData({ trigger = true, triggerWhenEmpty = false, mode = 'normal' } = {}) {
  const [apps, setApps] = useApplications();
  const [loading, setLoading] = React.useState(false);
  const count = Object.keys(apps).length;

  const { filters = {} } = useSelector((s: AppState) => s.table[table] || {}) as any;
  const {
    Platforms = [],
    Functionalities = [],
    Cost = [],
    TreatmentApproaches = [],
    Features = [],
    Inputs = [],
    Outputs = [],
    Engagements = [],
    Conditions = [],
    Privacy = [],
    Uses = [],
    ClinicalFoundations = [],
    DeveloperTypes = []
  } = filters;

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

          const appSearchable = {
            name: getAppName(app),
            app: getAppName(app), // For sorting application column by text
            updated: app.updated ? getDayTimeFromTimestamp(app.updated) : undefined,
            company: getAppCompany(app),
            costs: app.costs?.join(' '),
            platforms: app.platforms?.join(' '), // for searching
            treatmentApproaches: app.treatmentApproaches?.join(' '), // for searching
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

          return {
            _id: app._id,
            parent: app.parent,
            filterMatches: mode === 'pwa' ? filterMatches : undefined,
            ...appSearchable,
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

  var groupIds = data.map(r => r.groupId).filter(onlyUnique);
  var filteredData = groupIds.map(gId => {
    // For each group id find the most recently created
    var groupMembers = data.filter(r => r.groupId === gId);
    var sortedAsc = groupMembers.sort(({ getValues: a }, { getValues: b }) => (b() as any).created - (a() as any).created); // Create a sorted ascending list

    var newest = sortedAsc[0]; // Set the newest record, regardless of approval status

    for (var i = 0; i < sortedAsc.length; i++) {
      // Now search all records from newest down to find the newest approved entry.  If no approved entry is found then newest will be the first entry above
      if (sortedAsc[i].approved === true) {
        newest = sortedAsc[i];
        break;
      }
    }
    return newest;
  });

  var filterCount = 0;
  if (mode === 'pwa') {
    Object.keys(filters).forEach(k => {
      filterCount = filterCount + filters[k]?.length;
    });
  }

  const customFilter = r => {
    if (mode === 'pwa') {
      return (
        (filterCount > 0 && filterCount <= 4 ? r.filterMatches?.length === filterCount : true) &&
        (filterCount > 4 ? r.filterMatches?.length > filterCount / 2 : true) && // Only show results that match at least half the filter count
        (isMatch(Platforms, r.platforms) ||
          isMatch(Functionalities, r.functionalities) ||
          isMatch(Cost, r.costs) ||
          isMatch(TreatmentApproaches, r.treatmentApproaches) ||
          isMatchAny(Features, r.features) ||
          isMatch(Engagements, r.engagements) ||
          isMatch(Inputs, r.inputs) ||
          isMatch(Outputs, r.outputs) ||
          isMatch(Conditions, r.conditions) ||
          isMatch(Privacy, r.privacies) ||
          isMatch(Uses, r.uses) ||
          isMatch(ClinicalFoundations, r.clinicalFoundations) ||
          isMatch(DeveloperTypes, r.developerTypes))
        /*isMatch(Platforms, r.platforms) &&
        isMatch(Functionalities, r.functionalities) &&
        isMatch(Cost, r.costs) &&
        isMatch(TreatmentApproaches, r.treatmentApproaches) &&
        isMatchAny(Features, r.features) &&
        isMatch(Engagements, r.engagements) &&
        isMatch(Inputs, r.inputs) &&
        isMatch(Outputs, r.outputs) &&
        isMatch(Conditions, r.conditions) &&
        isMatch(Privacy, r.privacies) &&
        isMatch(Uses, r.uses) &&
        isMatch(ClinicalFoundations, r.clinicalFoundations) &&
        isMatch(DeveloperTypes, r.developerTypes)*/
      );
    } else {
      return (
        isMatch(Platforms, r.platforms) &&
        isMatch(Functionalities, r.functionalities) &&
        isMatch(Cost, r.costs) &&
        isMatch(TreatmentApproaches, r.treatmentApproaches) &&
        isMatch(Features, r.features) &&
        isMatch(Engagements, r.engagements) &&
        isMatch(Inputs, r.inputs) &&
        isMatch(Outputs, r.outputs) &&
        isMatch(Conditions, r.conditions) &&
        isMatch(Privacy, r.privacies) &&
        isMatch(Uses, r.uses) &&
        isMatch(ClinicalFoundations, r.clinicalFoundations) &&
        isMatch(DeveloperTypes, r.developerTypes)
      );
    }
  };

  var filtered = useTableFilter(filteredData, table, customFilter, fuzzySortFilter, mode);

  if (mode === 'pwa' && filtered.length > 5 && filterCount > 0) {
    // Only show 5 results for PWA when filters are applied
    filtered = filtered.slice(0, 5);
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
