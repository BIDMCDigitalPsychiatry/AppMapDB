import * as React from 'react';
import { useSelector } from 'react-redux';
import { dynamo, tables } from '../../database/dbConfig';
import Application from '../../database/models/Application';
import { useApplications } from '../../database/useApplications';
import { getDayTimeFromTimestamp, isEmpty, onlyUnique } from '../../helpers';
import { AppState } from '../../store';
import { getAppCompany, getAppName } from '../application/GenericTable/Applications/selectors';
import { useTableFilter } from '../application/GenericTable/helpers';
import { useAdminMode } from '../layout/store';

const table = 'Applications';
const isMatch = (filters, value) => filters.reduce((t, c) => (t = t && value?.includes(c)), true);

export default function useAppTableData() {
  const [apps, setApps] = useApplications();
  const handleRefresh = React.useCallback(() => {
    const getItems = async () => {
      let items;
      var params = {
        TableName: tables.applications,
        ExclusiveStartKey: undefined
      };
      do {
        let scanResults = [];
        items = await dynamo.scan(params).promise();
        items.Items.forEach(i => scanResults.push(i));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
        setApps(prev => ({
          ...prev,
          ...scanResults.reduce((f, c: any) => {
            f[c._id] = c;
            return f;
          }, {})
        }));
      } while (typeof items.LastEvaluatedKey != 'undefined');
    };
    getItems();
  }, [setApps]);

  // Load data from the database
  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const [adminMode] = useAdminMode();
  var data = apps
    ? Object.keys(apps)
        .filter(k => apps[k].draft !== true && apps[k].delete !== true && ((!adminMode && apps[k].approved === true) || adminMode)) // only show approved for public mode, show all for admin
        .map(k => {
          const app: Application = apps[k];

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

          return {
            _id: app._id,
            parent: app.parent,
            ...appSearchable,
            getSearchValues: () => {
              return Object.keys(appSearchable).reduce((f, c) => (f = [f, appSearchable[c]].join(' ')), ''); // Optimize search performance
            },
            getValues: () => app,
            getExportValues: () => ({
              _id: app._id,
              ...appSearchable,
              app: appSearchable.name,
              cost: appSearchable.costs,
              functionality: appSearchable.functionalities,
              developerType: appSearchable.developerTypes
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

  const { filters = {} } = useSelector((s: AppState) => s.table[table] || {}) as any;
  const {
    Platforms = [],
    Functionalities = [],
    Cost = [],
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

  const customFilter = r =>
    isMatch(Platforms, r.platforms) &&
    isMatch(Functionalities, r.functionalities) &&
    isMatch(Cost, r.costs) &&
    isMatch(Features, r.features) &&
    isMatch(Engagements, r.engagements) &&
    isMatch(Inputs, r.inputs) &&
    isMatch(Outputs, r.outputs) &&
    isMatch(Conditions, r.conditions) &&
    isMatch(Privacy, r.privacies) &&
    isMatch(Uses, r.uses) &&
    isMatch(ClinicalFoundations, r.clinicalFoundations) &&
    isMatch(DeveloperTypes, r.developerTypes);

  var filtered = useTableFilter(filteredData, table, customFilter);

  return { filtered, apps, setApps, handleRefresh };
}
