import { AppState } from '../../../../store';
import { GenericTableContainerProps } from '../GenericTableContainer';
import Application from '../../../../database/models/Application';
import { name } from './table';
import { isEmpty, decimalsum } from '../../../../helpers';
import { tableFilter } from '../helpers';
import { tables } from '../../../../database/dbConfig';
import Decimal from 'decimal.js-light';

const isMatch = (filters, value) => filters.reduce((t, c) => (t = t && value?.includes(c)), true);

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
          name: app.name,
          rating,
          company: app.company,
          costs: app.costs?.join(''),
          platforms: app.platforms?.join(' '), // for searching
          features: app.features?.join(' '), // for searching
          functionalities: app.functionalities?.join(' '),
          conditions: app.conditions?.join(' '),
          privacies: app.privacies?.join(' '),
          clinicalFoundation: app.clinicalFoundation,
          developerType: app.developerType
        };

        return {
          _id: app._id,
          ...appSearchable,
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
    Conditions = [],
    Privacy = [],
    'Clinical Foundation': ClinicalFoundation,
    'Developer Type': DeveloperType
  } = filters;

  const customFilter = r =>
    isMatch(Platforms, r.platforms) &&
    isMatch(Functionalities, r.functionalities) &&
    isMatch(Cost, r.costs) &&
    isMatch(Features, r.features) &&
    isMatch(Conditions, r.conditions) &&
    isMatch(Privacy, r.privacies) &&
    (isEmpty(ClinicalFoundation) || ClinicalFoundation === r.clinicalFoundation) &&
    (isEmpty(DeveloperType) || DeveloperType === r.developerType);

  return tableFilter(data, state, props, customFilter);
};
