import { AppState } from '../../../../store';
import { GenericTableContainerProps } from '../GenericTableContainer';
import Application from '../../../../database/models/Application';
import { name } from './table';
import { isEmpty, decimalsum } from '../../../../helpers';
import { tableFilter } from '../helpers';
import { tables } from '../../../../database/dbConfig';
import Decimal from 'decimal.js-light';

const isMatch = (filters, value) => filters.reduce((t, c) => (t = t && value.includes(c)), true);

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

        return {
          _id: app._id,
          name: app.name,
          rating,
          company: app.company,
          costs: app.costs.join(''),
          platforms: app.platforms.join(' '), // for searching
          features: app.features.join(' '), // for searching
          functionalities: app.functionalities.join(' '),
          conditions: app.conditions.join(' '),
          privicies: app.privicies.join(' '),
          clinicalFoundation: app.clincialFoundation,
          getValues: () => ({ ...app, rating, ratingIds })
        };
      })
    : [];

  const { filters = {} } = state.table[name] || {};
  const { Features = [], Conditions = [], Platforms = [], Cost = [], Privacy = [], 'Clinical Foundation': ClinicalFoundation } = filters;

  data = data.filter(r => {
    return (
      isMatch(Features, r.features) &&
      isMatch(Conditions, r.conditions) &&
      isMatch(Platforms, r.platforms) &&
      isMatch(Cost, r.costs) &&
      isMatch(Privacy, r.privicies) &&
      (isEmpty(ClinicalFoundation) || ClinicalFoundation === r.clinicalFoundation)
    );
  });

  return tableFilter(data, state, props);
};
