import { AppState } from '../../../../store';
import Application from '../../../../database/models/Application';
import { isEmpty, getDayTimeFromTimestamp, onlyUnique } from '../../../../helpers';
import { useTableFilter } from '../helpers';
import { tables } from '../../../../database/dbConfig';
import { AndroidStoreProps } from '../../DialogField/AndroidStore';
import { AppleStoreProps } from '../../DialogField/AppleStore';
import logo from '../../../../images/default_app_icon.png';
import { useSelector } from 'react-redux';
import { useAdminMode } from '../../../layout/store';

const isMatch = (filters, value) => filters.reduce((t, c) => (t = t && value?.includes(c)), true);

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

export const useAppData = table => {
  const apps = useSelector((s: AppState) => s.database[tables.applications] ?? {});
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

  return useTableFilter(filteredData, table, customFilter);
};

export const useNewerMemberCount = (groupId, created) => {
  const apps = useSelector((state: AppState) => state.database[tables.applications] ?? {});
  return Object.keys(apps).filter(k => (apps[k]._id === groupId || apps[k].groupId === groupId) && apps[k].created > created).length;
};

export const usePendingAppData = (table, showDeleted = false, email = undefined, includeDrafts = false, includeApproved = false) => {
  const apps = useSelector((s: AppState) => s.database[tables.applications] ?? {});
  var data = apps
    ? Object.keys(apps)
        .filter(
          k =>
            (includeDrafts ? true : apps[k].draft !== true) &&
            (email !== undefined ? (apps[k]?.email ?? '').toLowerCase() === email.toLowerCase() : true) &&
            (showDeleted ? apps[k].delete === true : apps[k].delete !== true) &&
            (showDeleted || (includeApproved ? true : apps[k].approved !== true)) // show archived items regardles of approved status
        )
        .map(k => {
          const app: Application = apps[k];

          const appSearchable = {
            email: app.email,
            name: getAppName(app),
            app: getAppName(app), // For sorting application column
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
            created: app.created,
            approved: app.approved,
            groupId: isEmpty(app.groupId) ? app._id : app.groupId
          };
        })
    : [];

  // For public, show only the most recent with a status of approved == true (or ignore if includeDrafts is set)
  // For admin, show only the most recent approved, or if no approvals then show the most recent

  var groupIds = data.map(r => r.groupId).filter(onlyUnique);
  var filteredData = groupIds.map(gId => {
    // For each group id find the most recently created
    var groupMembers = data.filter(r => r.groupId === gId);
    var sortedAsc = groupMembers.sort(({ getValues: a }, { getValues: b }) => (b() as any).created - (a() as any).created); // Create a sorted ascending list

    var newest = sortedAsc[0]; // Set the newest record, regardless of approval status

    for (var i = 0; i < sortedAsc.length; i++) {
      // Now search all records from newest down to find the newest approved entry.  If no approved entry is found then newest will be the first entry above
      if (includeDrafts || sortedAsc[i].approved === true) {
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

  return useTableFilter(filteredData, table, customFilter);
};
