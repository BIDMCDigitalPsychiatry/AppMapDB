import { AppState } from '../../../../store';
import { GenericTableContainerProps } from '../GenericTableContainer';
import Application from '../../../../database/models/Application';
import { name } from './table';
import { isEmpty } from '../../../../helpers';
import { tableFilter } from '../tablehelpers';

const isMatch = (filters, value) => filters.reduce((t, c) => (t = t && value.includes(c)), true);

export const from_database = (state: AppState, props: GenericTableContainerProps) => {
  const DB = state.database;
  var data = DB
    ? Object.keys(DB).map(k => {
        const app: Application = DB[k];
        return {
          name: app.name,
          company: app.company,
          costs: app.costs.join(''),
          platforms: app.platforms.join(' '), // for searching
          features: app.features.join(' '), // for searching
          functionalities: app.functionalities.join(' '),
          conditions: app.conditions.join(' '),
          privicies: app.privicies.join(' '),
          clinicalFoundation: app.clincialFoundation,
          getValues: () => app
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
