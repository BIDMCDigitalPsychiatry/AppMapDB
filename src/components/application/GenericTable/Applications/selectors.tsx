import { AppState } from '../../../../store';
import { GenericTableContainerProps } from '../GenericTableContainer';
import Application from '../../../../database/models/Application';
import { name } from './table';
import { isEmpty, decimalsum, bool, getDayTimeFromTimestamp } from '../../../../helpers';
import { tableFilter } from '../helpers';
import { tables } from '../../../../database/dbConfig';
import Decimal from 'decimal.js-light';
import { AndroidStoreProps } from '../../DialogField/AndroidStore';
import { AppleStoreProps } from '../../DialogField/AppleStore';
import logo from '../../../../images/default_app_icon.png';

const isMatch = (filters, value) => filters.reduce((t, c) => (t = t && value?.includes(c)), true);
const isBoolFilter = (filterValue, value) => isEmpty(filterValue) || bool(filterValue) === bool(value);

export const getAppName = app => {
  const androidStore: AndroidStoreProps = app.androidStore;
  const appleStore: AppleStoreProps = app.appleStore;
  return !isEmpty(app.name)
    ? app.name
    : androidStore && !isEmpty(androidStore.title)
    ? androidStore.title
    : appleStore && !isEmpty(appleStore.title)
    ? appleStore.title
    : app.name;
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

export const from_database = (state: AppState, props: GenericTableContainerProps) => {
  const apps = state.database[tables.applications] ?? {};
  const ratings = state.database[tables.ratings] ?? {};
  const ix_app_ratings = state.database[tables.ix_app_ratings] ?? {};

  var data = apps
    ? Object.keys(apps).map(k => {
        const app: Application = apps[k];
        const ratingIds = ix_app_ratings[app._id] ?? [];
        const rating = ratingIds
          .map(k => new Decimal(ratings[k].rating))
          .reduce(decimalsum, new Decimal(0))
          .dividedBy(ratingIds.length)
          .toPrecision(2);

        const appSearchable = {
          name: getAppName(app),
          updated: app.updated ? getDayTimeFromTimestamp(app.updated) : undefined,
          rating,
          company: getAppCompany(app),
          costs: app.costs?.join(''),
          platforms: app.platforms?.join(' '), // for searching
          features: app.features?.join(' '), // for searching
          functionalities: app.functionalities?.join(' '),
          engagements: app.engagements?.join(' '),
          inputs: app.inputs?.join(' '),
          outputs: app.outputs?.join(' '),
          conditions: app.conditions?.join(' '),
          privacies: app.privacies?.join(' '),
          clinicalFoundation: app.clinicalFoundation,
          developerType: app.developerType
        };

        const unsearchableFilters = {
          selfHelp: app.selfHelp,
          hybridUse: app.hybridUse,
          referenceApp: app.referenceApp,
          correctContent: app.correctContent
        };

        return {
          _id: app._id,
          ...appSearchable,
          ...unsearchableFilters,
          getSearchValues: () => {
            return Object.keys(appSearchable).reduce((f, c) => (f = [f, appSearchable[c]].join(' ')), ''); // Optimize search performance
          },
          getValues: () => ({ ...app, rating, ratingIds })
        };
      })
    : [];

  const { filters = {} } = state.table[name] || {};
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
    'Clinical Foundation': ClinicalFoundation,
    'Developer Type': DeveloperType,
    selfHelp,
    hybridUse,
    referenceApp,
    correctContent
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
    (isEmpty(ClinicalFoundation) || ClinicalFoundation === r.clinicalFoundation) &&
    (isEmpty(DeveloperType) || DeveloperType === r.developerType) &&
    isBoolFilter(selfHelp, r.selfHelp) &&
    isBoolFilter(hybridUse, r.hybridUse) &&
    isBoolFilter(referenceApp, r.referenceApp) &&
    isBoolFilter(correctContent, r.correctContent);

  return tableFilter(data, state, props, customFilter);
};
